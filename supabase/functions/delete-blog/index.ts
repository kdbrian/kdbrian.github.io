import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth-guard.ts";
import { deleteFile, deleteDir } from "../_shared/github.ts";

const SLUG_RE = /^[a-z0-9-]+$/;

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const auth = await requireAuth(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  try {
    const { slug, deleteMedia } = await req.json();
    if (!slug || !SLUG_RE.test(slug)) {
      return jsonResponse({ error: "Invalid slug." }, 400);
    }

    // Post may have been saved as .md or .html — try both.
    await deleteFile(`src/content/posts/${slug}.html`, `Delete post: ${slug}`);
    await deleteFile(`src/content/posts/${slug}.md`, `Delete post: ${slug}`);

    if (deleteMedia) {
      await deleteDir(`public/blog-images/${slug}`, `Delete media for post: ${slug}`);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
