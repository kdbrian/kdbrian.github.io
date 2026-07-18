import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth-guard.ts";
import { putFile } from "../_shared/github.ts";

const SLUG_RE = /^[a-z0-9-]+$/;

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const auth = await requireAuth(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  try {
    const { slug, title, description, images, tags, repoUrl, playStoreUrl, featured, isNew } =
      await req.json();

    if (!slug || !SLUG_RE.test(slug)) {
      return jsonResponse({ error: "Slug must be lowercase letters, numbers, and hyphens only." }, 400);
    }
    if (!title) {
      return jsonResponse({ error: "Title is required." }, 400);
    }

    const project = {
      slug,
      title,
      description: description || "",
      images: images || [],
      tags: tags || [],
      repoUrl: repoUrl || undefined,
      playStoreUrl: playStoreUrl || undefined,
      featured: !!featured,
    };

    const { commitUrl } = await putFile(
      `src/content/projects/${slug}.json`,
      JSON.stringify(project, null, 2),
      `${isNew ? "Add" : "Update"} project: ${title}`
    );

    return jsonResponse({ commitUrl });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
