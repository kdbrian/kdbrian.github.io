# kdbrian.github.io — portfolio + blog studio

Vite + React + Tailwind rebuild of the portfolio, with a self-hosted blog and
project CMS at `/admin/studio`. No database — posts and projects are files in
`src/content/`, committed to this repo through a handful of Supabase Edge
Functions.

## What changed from the old site

- Old: static `index.html` + `index.js`, projects loaded from `projects/*/project.json`.
- New: Vite + React SPA. `About`/`Education` on `/`, `/projects`, `/activity`, `/blog`.
  The two existing projects (Sage, Farm Connect) were migrated into
  `src/content/projects/*.json` and their art into `public/projects/`.
- New: `/admin/studio` — password-gated editor for posts and projects that
  commits straight to this repo.

## Project layout

```
src/content/posts/       .md or .html + frontmatter — one file per post
src/content/projects/    one .json per project
src/content/activity/    updates.json — manually curated milestones
public/blog-images/      uploaded post media (created on first upload)
public/projects/         project images
supabase/functions/      the backend: auth, publish/delete for posts + projects, media upload
.github/workflows/       builds with Vite, deploys to GitHub Pages
```

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in the two VITE_ vars below
npm run dev
```

## Deploying

1. **GitHub Pages**: Settings → Pages → Source → "GitHub Actions". The
   included workflow (`.github/workflows/deploy.yml`) builds with Vite and
   deploys on every push to `master`. No `gh-pages` branch needed.
2. **Supabase**: create a free project, then deploy the five functions in
   `supabase/functions/` (`supabase functions deploy auth`, etc. — see
   [Supabase's Edge Functions docs](https://supabase.com/docs/guides/functions)
   for the CLI setup, since exact CLI flags can change).
3. Set the function secrets and repo secrets below, then visit
   `https://kdbrian.github.io/admin/studio`.

## Secrets checklist

**Supabase Edge Function secrets** (`supabase secrets set NAME=value` — never
committed, never in the client bundle):

| Secret | Purpose |
|---|---|
| `ADMIN_SECRET` | The Studio login password. Pick something long; this is the only thing standing between the public and repo write access. |
| `JWT_SECRET` | Signs the short-lived session token. Generate with `openssl rand -base64 32`. |
| `GITHUB_TOKEN` | A **fine-grained** PAT scoped to *only* this repo, with Contents: Read & Write. Not a classic PAT with full `repo` scope — if this leaks, you want the blast radius limited to this one repo. |
| `GITHUB_OWNER` | `kdbrian` |
| `GITHUB_REPO` | `kdbrian.github.io` |
| `GITHUB_BRANCH` | `master` |

**GitHub Actions repo secrets** (Settings → Secrets and variables → Actions —
these are *public-safe* values the client needs, not real secrets, but GitHub
Actions is a convenient place to inject them at build time without hardcoding):

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your project's anon/public key |

**Client `.env.local`** (for local dev only, gitignored) — see `.env.example`.

## Notes on the design choices

- **New posts are saved as HTML** (TipTap's native output); **old/imported
  posts can stay Markdown** — `PostRenderer` auto-detects by file extension
  and content shape, and DOMPurify sanitizes either way before render. The
  publish function also strips `<script>` tags and inline event handlers
  server-side as defense-in-depth, since the sanitized-at-render approach
  still means unsanitized HTML sits in git history otherwise.
- **Media is scoped per post/project slug** (`public/blog-images/<slug>/…`),
  so "also delete media" on the delete dialog can safely remove exactly one
  post's or project's uploads without touching anyone else's.
- **The Studio's "Published" list reflects the last deployed build**, not a
  live database — same as the rest of the site. If you publish from a second
  device, give the page a refresh after the Actions build finishes before
  editing that post again.
- **Direct links to `/blog/some-post` work after a hard refresh** via a small
  `404.html` redirect trick, since GitHub Pages has no server-side rewrites
  for a single-page app.
