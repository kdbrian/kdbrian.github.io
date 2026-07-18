import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth-guard.ts";
import { putFile } from "../_shared/github.ts";

const SLUG_RE = /^[a-z0-9-]+$/;
const MAX_BYTES = 15 * 1024 * 1024; // 15MB — Contents API tops out at 100MB but keep it sane

function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.\-]/g, "-").replace(/-+/g, "-");
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const auth = await requireAuth(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  try {
    const { filename, base64, folder, slug } = await req.json();

    if (!filename || !base64 || !folder || !slug) {
      return jsonResponse({ error: "filename, base64, folder, and slug are all required." }, 400);
    }
    if (!SLUG_RE.test(slug)) {
      return jsonResponse({ error: "Invalid slug." }, 400);
    }
    if (folder !== "blog-images" && folder !== "projects") {
      return jsonResponse({ error: "folder must be 'blog-images' or 'projects'." }, 400);
    }
    // Rough size check on the base64 payload (base64 is ~4/3 the byte size).
    if (base64.length * 0.75 > MAX_BYTES) {
      return jsonResponse({ error: "File too large (15MB limit)." }, 400);
    }

    const clean = sanitizeFilename(filename);
    const stamped = `${Date.now()}-${clean}`;
    const path = `public/${folder}/${slug}/${stamped}`;

    await putFile(path, base64, `Upload media: ${clean}`, true);

    // Vite serves everything under public/ from the site root.
    return jsonResponse({ path, url: `/${folder}/${slug}/${stamped}` });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
