import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth-guard.ts";
import { putFile } from "../_shared/github.ts";

const SLUG_RE = /^[a-z0-9-]+$/;

function stringifyFrontmatter(data: Record<string, unknown>, body: string): string {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: [${v.map((x) => `"${x}"`).join(", ")}]`;
      if (typeof v === "string") return `${k}: "${v.replace(/"/g, '\\"')}"`;
      return `${k}: ${v}`;
    });
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}

/**
 * Defense-in-depth only — the site's renderer runs DOMPurify on every post
 * at render time regardless. This just keeps obviously hostile markup out
 * of the committed file itself.
 */
function stripDangerousHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const auth = await requireAuth(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  try {
    const { slug, title, body, format, excerpt, tags, cover, date, isNew } = await req.json();

    if (!slug || !SLUG_RE.test(slug)) {
      return jsonResponse({ error: "Slug must be lowercase letters, numbers, and hyphens only." }, 400);
    }
    if (!title || !body) {
      return jsonResponse({ error: "Title and body are required." }, 400);
    }

    const ext = format === "markdown" ? "md" : "html";
    const cleanBody = format === "html" ? stripDangerousHtml(body) : body;

    const file = stringifyFrontmatter(
      {
        title,
        slug,
        date: date || new Date().toISOString().slice(0, 10),
        excerpt,
        cover,
        tags,
      },
      cleanBody
    );

    const { commitUrl } = await putFile(
      `src/content/posts/${slug}.${ext}`,
      file,
      `${isNew ? "Publish" : "Update"} post: ${title}`
    );

    return jsonResponse({ commitUrl });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
