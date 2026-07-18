export interface Draft {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string;
  cover: string;
  body: string;
  format: "html" | "markdown";
  updatedAt: number;
  publishedSlug?: string; // set once this draft has been published, for edit-in-place
}

const STORAGE_KEY = "studio.drafts";

function readAll(): Draft[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(drafts: Draft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function listDrafts(): Draft[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getDraft(id: string): Draft | undefined {
  return readAll().find((d) => d.id === id);
}

export function saveDraft(draft: Draft) {
  const drafts = readAll();
  const idx = drafts.findIndex((d) => d.id === draft.id);
  const updated = { ...draft, updatedAt: Date.now() };
  if (idx >= 0) drafts[idx] = updated;
  else drafts.push(updated);
  writeAll(drafts);
}

export function deleteDraft(id: string) {
  writeAll(readAll().filter((d) => d.id !== id));
}

export function newDraft(): Draft {
  return {
    id: crypto.randomUUID(),
    title: "",
    slug: "",
    excerpt: "",
    tags: "",
    cover: "",
    body: "",
    format: "html",
    updatedAt: Date.now(),
  };
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
