import type { Post, PostFormat, Theme } from "@/types/content";
import { restGet } from "@/lib/supabase-rest";

type PostRow = {
  slug: string;
  title: string;
  body: string;
  format: PostFormat;
  excerpt: string | null;
  cover: string | null;
  tags: string[];
  theme: Theme | null;
  date: string;
};

function mapPost(row: PostRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    body: row.body,
    format: row.format,
    excerpt: row.excerpt ?? undefined,
    cover: row.cover ?? undefined,
    tags: row.tags || [],
    theme: row.theme,
    date: row.date,
  };
}

export async function fetchRecentPosts(limit = 3): Promise<Post[]> {
  const rows = await restGet<PostRow[]>(
    `posts?select=slug,title,body,format,excerpt,cover,tags,theme,date&order=date.desc&limit=${limit}`
  );
  return rows.map(mapPost);
}
