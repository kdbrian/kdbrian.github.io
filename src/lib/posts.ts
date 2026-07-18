import type { Post, PostFormat } from "@/types/content";
import { parseFrontmatter } from "@/lib/frontmatter";

// Vite inlines every matched file's raw text at build time — this is the
// entire "database". No runtime fetch, no server round-trip for readers.
const modules = import.meta.glob("/src/content/posts/*.{md,html}", {
  eager: true,
  query: "?raw",
  import: "default",
});

function detectFormat(path: string, content: string, explicit?: PostFormat): PostFormat {
  if (explicit) return explicit;
  if (path.endsWith(".html")) return "html";
  // Old posts imported as markdown but saved with an .md extension that
  // actually contains raw HTML — sniff for a leading tag just in case.
  return /^\s*</.test(content) ? "html" : "markdown";
}

function loadPosts(): Post[] {
  const posts: Post[] = [];

  for (const [path, raw] of Object.entries(modules)) {
    const { data, content } = parseFrontmatter(raw as string);
    const slug = (data.slug as string) || path.split("/").pop()!.replace(/\.(md|html)$/, "");

    posts.push({
      title: (data.title as string) || slug,
      slug,
      date: (data.date as string) || new Date(0).toISOString(),
      excerpt: data.excerpt as string | undefined,
      cover: data.cover as string | undefined,
      tags: (data.tags as string[]) || [],
      format: detectFormat(path, content, data.format as PostFormat | undefined),
      body: content,
    });
  }

  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export const allPosts = loadPosts();

export function getPostBySlug(slug: string): Post | undefined {
  return allPosts.find((p) => p.slug === slug);
}
