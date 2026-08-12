export const BLOG_URL = "https://kdbrian.github.io/blog";

export function blogProjectsUrl(): string {
  return `${BLOG_URL}/projects`;
}

export function blogProjectUrl(slug: string): string {
  return `${BLOG_URL}/projects/${slug}`;
}

export function blogPostUrl(slug: string): string {
  return `${BLOG_URL}/${slug}`;
}
