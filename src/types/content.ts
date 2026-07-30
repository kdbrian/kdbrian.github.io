export type Theme = {
  type: "color" | "gradient" | "image";
  value: string; // hex color, CSS gradient() value, or image URL
};

export interface Skill {
  id: string;
  name: string;
  dateAdded: string; // ISO date
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  title: string;
  summary?: string;
  description: string;
  notes?: string;
  images: string[];
  tags?: string[];
  theme?: Theme | null;
  repoUrl: string;
  playStoreUrl?: string;
  links?: ProjectLink[];
  featured?: boolean;
  skills?: Skill[];
}

export interface SocialLink {
  id: string;
  label?: string;
  url: string;
  sortOrder: number;
}

export interface BlobShape {
  seed: number;
  points: number;
  irregularity: number;
}

export type HistoryKind = "education" | "experience";

export interface HistoryEntry {
  id: string;
  kind: HistoryKind;
  title: string;
  org: string;
  startDate: string; // ISO date
  endDate?: string; // ISO date, absent = ongoing/"Present"
  description?: string;
  url?: string;
  sortOrder: number;
}

export interface Profile {
  headline: string;
  tagline: string;
  bio: string;
  location: string;
  imageUrl?: string;
  shape: BlobShape;
}
