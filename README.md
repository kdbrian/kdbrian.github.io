# kdbrian.github.io — portfolio + blog studio

Vite + React + Tailwind portfolio with a self-hosted blog/project/milestone
CMS at `/admin/studio`. All content — posts, projects, milestones, skills,
social links, drafts — lives in a Supabase Postgres database, edited from the
admin dashboard on any device (local or deployed), no git commits required to
publish. Media (images/video) lives in Supabase Storage.

## Project layout

```
src/lib/                 async fetchers (posts, projects, activity, skills, social, profile) against Supabase's PostgREST API
src/components/admin/    Studio editors: PostEditor, ProjectManager, MilestonesManager, SocialLinksManager,
                          ProfileManager, TagInput, SkillPicker, ThemePicker, RichTextEditor
supabase/migrations/      schema: posts, projects, milestones, drafts, skills (+ junction tables), social_links, profile
supabase/functions/       edge functions: auth, publish/delete for posts, projects, milestones, skills, social links,
                          profile, drafts CRUD, media upload — all write paths, gated by a custom password + JWT (auth-guard.ts)
.github/workflows/        builds with Vite, deploys the static SPA to GitHub Pages
```

Reads (public pages) call Supabase's REST API directly with the anon key,
gated by RLS (`select` policies only — see the migration). Writes go through
edge functions using the service-role key, after `requireAuth()` checks a
custom JWT signed with `JWT_SECRET` — this app does not use Supabase Auth.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in the two VITE_ vars below
npm run dev
```

## Deploying to a new repo / Supabase project

1. **GitHub Pages**: Settings → Pages → Build and deployment → Source →
   **"GitHub Actions"** (not "Deploy from a branch" — that classic mode
   serves raw source files instead of the Vite build output). The included
   workflow deploys on every push to your default branch.
2. **Supabase**: create a free project, link it, push the schema, deploy the
   functions:
   ```bash
   npx supabase login                              # or set SUPABASE_ACCESS_TOKEN
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   npx supabase functions deploy auth publish-blog delete-blog publish-project delete-project \
     upload-media publish-milestone delete-milestone publish-skill publish-social-link \
     delete-social-link publish-profile drafts-list drafts-save drafts-delete
   ```
   No local Supabase install or Docker needed — this only talks to your cloud
   project (`supabase start`/local dev emulation is unrelated and unused).
3. Set the secrets below, then visit `https://<your-username>.github.io/admin/studio`.

## Secrets checklist

**Supabase Edge Function secrets** — set with `npx supabase secrets set
NAME=value`. Write-only: there's no way to read a value back once set, so
save whatever you generate somewhere safe first.

| Secret | Purpose |
|---|---|
| `ADMIN_SECRET` | The Studio login password. Generate: `openssl rand -base64 32`. |
| `JWT_SECRET` | Signs the session token. Generate: `openssl rand -base64 32`. |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by
the platform — nothing to set for those.

**GitHub Actions repo secrets** (Settings → Secrets and variables → Actions —
public-safe values the client bundle needs at build time):

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your project's anon/public key |

Both are **required** — if either is missing, the build still succeeds, but
the client silently builds with an empty API base URL, so Studio requests go
to your own domain instead of Supabase and fail with a `405`.

**Client `.env.local`** (local dev only, gitignored) — same two `VITE_`
values, see `.env.example`.

## Troubleshooting

- **Page loads blank, console shows a MIME-type error on `main.tsx`**: Pages
  source is set to "Deploy from a branch" instead of "GitHub Actions". Fix
  the setting, then push a commit (an empty one is fine) to trigger a fresh
  deploy — the setting change alone doesn't retroactively republish.
- **Studio login (or any write) fails with `405` on a request to your own
  domain instead of Supabase**: `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
  Actions secrets aren't set.
- **Studio login fails with 401 no matter the password**: edge functions
  default to Supabase's own gateway-level JWT verification, which this app's
  custom auth doesn't satisfy. Every function needs `verify_jwt = false` in
  `supabase/config.toml` (already configured here) — if you add a new
  function, add its entry too, then redeploy.
- **"Live from GitHub" activity feed shows "Couldn't reach GitHub right
  now"**: the unauthenticated GitHub API allows only 60 requests/hour per IP.
  Self-clears within the hour.

## Notes on design choices

- **Skills vs. tags**: tags are free-text per post/project; skills are a
  separate, curated taxonomy (`skills` table with a `date_added`) shared
  across posts/projects/milestones and the About page's stack badges. The
  Playground page (`/playground`) picks a skill and shows a chronological
  history of everything tagged with it.
- **Theming**: posts/projects/milestones can carry an optional background
  (`theme: { type: color|gradient|image, value }`). Solid colors get a real
  luminance check for text contrast; gradients/images (can't be cheaply
  introspected) always get a dark scrim + light text.
- **New posts are saved as HTML** (TipTap's native output); DOMPurify
  sanitizes on render regardless of source. The publish function also strips
  `<script>` tags and inline event handlers server-side as defense-in-depth.
- **Media is scoped per post/project slug** in Supabase Storage
  (`blog-images/<slug>/…`, `projects/<slug>/…`), so "also delete media" on
  the delete dialog removes exactly one item's uploads.
- **Drafts sync across devices** via the `drafts` table (RLS blocks all
  public access — only edge functions using the service-role key can touch
  it), so starting a draft locally and finishing it on another device works.
