-- ---------------------------------------------------------------------------
-- Shared Supabase schema: project status / priority / milestones model
-- ---------------------------------------------------------------------------
-- The portfolio frontend (src/lib/projects.ts, commit 671908f) queries:
--
--   projects?select=*,project_skills(skill:skills(...)),
--     project_milestones(completed,sort_order,
--       milestone:milestones(id,title,date,description,url))
--     &order=featured.desc,created_at.desc
--
-- The `milestones` / `project_milestones` tables were never created, so
-- PostgREST rejects the whole request with 400 PGRST200 ("Could not find a
-- relationship between 'projects' and 'project_milestones'") and the live
-- Projects page falls back to its error state.
--
-- This migration adds exactly what that query needs. It is idempotent —
-- safe to run more than once, and safe if the blog side already added some
-- of the scalar columns.
--
-- HOW TO APPLY
--   Supabase Dashboard -> SQL Editor -> paste -> Run.
--   (Or drop this into the blog repo's supabase/migrations/ and `supabase db push`.)
--
-- ASSUMPTION: public.projects has a uuid primary key named `id` — the same
-- key public.project_skills already references. If your projects PK differs,
-- adjust the two references in project_milestones below.
-- ---------------------------------------------------------------------------

begin;

-- 1. New scalar columns on projects ---------------------------------------
alter table public.projects
  add column if not exists status     text        not null default 'active',
  add column if not exists priority   text        not null default 'medium',
  add column if not exists due_date   date,
  add column if not exists client     text,
  add column if not exists engagement text;

-- Constrain status/priority to the values the frontend's TS unions allow,
-- but only when the column is plain text (skip if the blog already modelled
-- them as an enum type with the same labels).
do $$
begin
  if (select data_type from information_schema.columns
        where table_schema = 'public' and table_name = 'projects'
          and column_name = 'status') = 'text' then
    alter table public.projects drop constraint if exists projects_status_check;
    alter table public.projects add  constraint projects_status_check
      check (status in ('planned', 'active', 'paused', 'completed'));
  end if;

  if (select data_type from information_schema.columns
        where table_schema = 'public' and table_name = 'projects'
          and column_name = 'priority') = 'text' then
    alter table public.projects drop constraint if exists projects_priority_check;
    alter table public.projects add  constraint projects_priority_check
      check (priority in ('low', 'medium', 'high'));
  end if;
end $$;

-- 2. milestones ---------------------------------------------------------
create table if not exists public.milestones (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        date not null,
  description text,
  url         text,
  created_at  timestamptz not null default now()
);

-- 3. project_milestones — join carrying per-project completion + order --
create table if not exists public.project_milestones (
  project_id   uuid    not null references public.projects(id)   on delete cascade,
  milestone_id uuid    not null references public.milestones(id) on delete cascade,
  completed    boolean not null default false,
  sort_order   integer not null default 0,
  primary key (project_id, milestone_id)
);

create index if not exists project_milestones_project_id_idx
  on public.project_milestones (project_id);
create index if not exists project_milestones_milestone_id_idx
  on public.project_milestones (milestone_id);

-- 4. RLS — anonymous read only; writes stay with the blog's service role -
alter table public.milestones         enable row level security;
alter table public.project_milestones enable row level security;

drop policy if exists "public read" on public.milestones;
create policy "public read" on public.milestones
  for select to anon, authenticated using (true);

drop policy if exists "public read" on public.project_milestones;
create policy "public read" on public.project_milestones
  for select to anon, authenticated using (true);

grant select on public.milestones         to anon, authenticated;
grant select on public.project_milestones to anon, authenticated;

commit;

-- 5. Make PostgREST pick up the new tables / FKs immediately ------------
notify pgrst, 'reload schema';
