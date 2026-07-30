# kdbrian.github.io — portfolio

Vite + React + Tailwind portfolio: About/skills, education & experience, and
projects. Read-only — all authoring (blog posts, milestones, project/profile
editing) happens in the separate
[`blog`](https://github.com/kdbrian/blog) repo, deployed at
`kdbrian.github.io/blog`.

Content (projects, skills, education/experience entries, social links,
profile) lives in a shared Supabase Postgres database, edited from that
repo's admin Studio. This app only ever reads it — directly against
Supabase's PostgREST API with the anon key, gated by RLS (`select` policies
only; writes require the service-role key and a custom JWT, which this repo
has no access to).

## Project layout

```
src/pages/               Home (About/Education), Projects, ProjectDetail
src/lib/                 async fetchers (projects, skills, social, profile, history) against Supabase's PostgREST API
.github/workflows/       builds with Vite, deploys the static SPA to GitHub Pages
```

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in the two VITE_ vars below — same
                              # Supabase project as the blog repo
npm run dev
```

## Deploying

1. **GitHub Pages**: Settings → Pages → Build and deployment → Source →
   **"GitHub Actions"** (not "Deploy from a branch" — that classic mode
   serves raw source files instead of the Vite build output). The included
   workflow deploys on every push to your default branch.
2. Set the secrets below.

## Secrets checklist

**GitHub Actions repo secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` — same value used in the blog repo |
| `VITE_SUPABASE_ANON_KEY` | Your project's anon/public key — same value used in the blog repo |

Both are **required** — if either is missing, the build still succeeds, but
the client silently builds with an empty API base URL and pages render empty.

**Client `.env.local`** (local dev only, gitignored) — same two `VITE_`
values, see `.env.example`.

## Troubleshooting

- **Page loads blank, console shows a MIME-type error on `main.tsx`**: Pages
  source is set to "Deploy from a branch" instead of "GitHub Actions". Fix
  the setting, then push a commit (an empty one is fine) to trigger a fresh
  deploy — the setting change alone doesn't retroactively republish.
- **Projects/skills/education sections stay empty**: `VITE_SUPABASE_URL`/
  `VITE_SUPABASE_ANON_KEY` Actions secrets aren't set, or don't match the
  project the blog repo's admin Studio is writing to.

## Notes on design choices

- **Skills vs. tags**: tags are free-text per project; skills are a separate,
  curated taxonomy (`skills` table) shared with the blog repo's posts and
  milestones — this app just displays them on the About page's stack badges.
- **Theming**: projects can carry an optional background
  (`theme: { type: color|gradient|image, value }`). Solid colors get a real
  luminance check for text contrast; gradients/images (can't be cheaply
  introspected) always get a dark scrim + light text.
