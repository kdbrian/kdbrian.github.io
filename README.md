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

## Deploying to a new repo / Supabase project

These steps work whether you forked this repo as-is or are reusing it as a
template for a different personal site.

1. **GitHub Pages**: Settings → Pages → Build and deployment → Source →
   **"GitHub Actions"** (not "Deploy from a branch" — that classic mode
   serves your raw source files instead of the Vite build output, so the
   page loads blank / throws MIME-type errors on `main.tsx` even though the
   Actions build itself succeeds). The included workflow
   (`.github/workflows/deploy.yml`) builds with Vite and deploys on every
   push to your default branch. No `gh-pages` branch needed.
2. **Supabase**: create a free project at [supabase.com](https://supabase.com),
   then link and deploy the edge functions from `supabase/functions/`:
   ```bash
   npx supabase login                              # or set SUPABASE_ACCESS_TOKEN
   npx supabase link --project-ref <your-project-ref>
   npx supabase functions deploy auth publish-blog delete-blog publish-project delete-project upload-media
   ```
   (No local Supabase install or Docker needed — this only talks to your
   cloud project. `supabase start`/local dev emulation is a separate, unrelated
   thing this workflow doesn't use.)
3. Set the function secrets and repo secrets below, then visit
   `https://<your-username>.github.io/admin/studio`.

## Secrets checklist

**Supabase Edge Function secrets** — set with
`npx supabase secrets set NAME=value` (never committed, never in the client
bundle). These are **write-only**: once set, there's no `supabase secrets get`
to read a value back, so save whatever you generate somewhere safe (e.g. a
password manager) before you forget it.

| Secret | Purpose |
|---|---|
| `ADMIN_SECRET` | The Studio login password. Pick something long, or generate one: `openssl rand -base64 32`. This is the only thing standing between the public and repo write access. |
| `JWT_SECRET` | Signs the short-lived session token. Generate with `openssl rand -base64 32`. |
| `GITHUB_TOKEN` | A **fine-grained** PAT scoped to *only* this repo, with Contents: Read & Write. Not a classic PAT with full `repo` scope — if this leaks, you want the blast radius limited to this one repo. |
| `GITHUB_OWNER` | Your GitHub username/org, e.g. `<your-username>` |
| `GITHUB_REPO` | The repo name, e.g. `<your-username>.github.io` |
| `GITHUB_BRANCH` | Your default branch, e.g. `master` or `main` |

**GitHub Actions repo secrets** (repo Settings → Secrets and variables →
Actions — these are *public-safe* values the client needs, not real secrets,
but Actions is a convenient place to inject them at build time without
hardcoding). **Both are required** — if either is missing, the build still
succeeds, but the client silently builds with an empty API base URL, so
Studio login requests go to your own domain instead of Supabase and fail
with a 405:

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your project's anon/public key |

**Client `.env.local`** (for local dev only, gitignored) — see `.env.example`,
same two `VITE_` values as above.

## Troubleshooting

- **Page loads blank, console shows a MIME-type error on `main.tsx`**: GitHub
  Pages source is set to "Deploy from a branch" instead of "GitHub Actions"
  (see step 1 above). Switching it doesn't retroactively republish — push a
  commit (an empty one is fine) afterward to trigger a fresh deploy.
- **Studio login fails with `405` on a request to your own domain
  (`/functions/v1/auth`) instead of Supabase**: the `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` Actions repo secrets aren't set (see above). Add
  them and push to trigger a rebuild.
- **"Live from GitHub" activity feed shows "Couldn't reach GitHub right
  now"**: the unauthenticated GitHub API allows only 60 requests/hour per IP.
  Rapid reloads during dev (especially repeated Fast-Refresh-busting edits,
  which force a full page reload in every open tab) can burn through that
  quickly. It self-clears within the hour.

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
