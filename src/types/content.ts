export type PostFormat = "html" | "markdown";

export type Theme = {
  type: "color" | "gradient" | "image";
  value: string; // hex color, CSS gradient() value, or image URL
};

export interface Skill {
  id: string;
  name: string;
  dateAdded: string; // ISO date
}

export interface Post {
  title: string;
  slug: string;
  date: string; // ISO date
  excerpt?: string;
  cover?: string;
  tags?: string[];
  theme?: Theme | null;
  format: PostFormat;
  body: string;
  skills?: Skill[];
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  images: string[];
  tags?: string[];
  theme?: Theme | null;
  repoUrl: string;
  playStoreUrl?: string;
  featured?: boolean;
  skills?: Skill[];
}

export interface ActivityEntry {
  id: string;
  date: string; // ISO date
  title: string;
  description?: string;
  url?: string;
  theme?: Theme | null;
  skills?: Skill[];
}

export interface SocialLink {
  id: string;
  label?: string;
  url: string;
  sortOrder: number;
}
