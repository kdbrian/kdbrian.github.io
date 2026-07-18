import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth-guard.ts";
import { serviceClient } from "../_shared/supabase.ts";

const SLUG_RE = /^[a-z0-9-]+$/;
const GITHUB_URL_RE = /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/i;

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const auth = await requireAuth(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  try {
    const { slug, title, description, images, tags, theme, repoUrl, playStoreUrl, featured, skillIds } =
      await req.json();

    if (!slug || !SLUG_RE.test(slug)) {
      return jsonResponse({ error: "Slug must be lowercase letters, numbers, and hyphens only." }, 400);
    }
    if (!title) {
      return jsonResponse({ error: "Title is required." }, 400);
    }
    if (!repoUrl || !GITHUB_URL_RE.test(repoUrl)) {
      return jsonResponse(
        { error: "A GitHub repo URL is required, e.g. https://github.com/owner/repo" },
        400
      );
    }

    const supabase = serviceClient();

    const { error } = await supabase.from("projects").upsert(
      {
        slug,
        title,
        description: description || "",
        images: images || [],
        tags: tags || [],
        theme: theme || null,
        repo_url: repoUrl,
        play_store_url: playStoreUrl || null,
        featured: !!featured,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );
    if (error) throw error;

    await supabase.from("project_skills").delete().eq("project_slug", slug);
    if (Array.isArray(skillIds) && skillIds.length > 0) {
      const { error: skillErr } = await supabase
        .from("project_skills")
        .insert(skillIds.map((skill_id: string) => ({ project_slug: slug, skill_id })));
      if (skillErr) throw skillErr;
    }

    return jsonResponse({ ok: true, slug });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
