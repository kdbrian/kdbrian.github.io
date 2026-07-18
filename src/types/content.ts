export type PostFormat = "html" | "markdown";

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string; // ISO date
  excerpt?: string;
  cover?: string;
  tags?: string[];
  format?: PostFormat; // explicit override; auto-detected if omitted
}

export interface Post extends PostFrontmatter {
  body: string;
  format: PostFormat;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  images: string[];
  tags?: string[];
  repoUrl?: string;
  playStoreUrl?: string;
  featured?: boolean;
}

export interface ActivityEntry {
  id: string;
  date: string; // ISO date
  title: string;
  description?: string;
  url?: string;
}
