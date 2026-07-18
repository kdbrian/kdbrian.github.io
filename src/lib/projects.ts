import type { Project } from "@/types/content";

const modules = import.meta.glob("/src/content/projects/*.json", {
  eager: true,
  query: "?raw",
  import: "default",
});

function loadProjects(): Project[] {
  const projects: Project[] = [];

  for (const [path, raw] of Object.entries(modules)) {
    try {
      const data = JSON.parse(raw as string) as Project;
      if (!data.slug) data.slug = path.split("/").pop()!.replace(/\.json$/, "");
      projects.push(data);
    } catch (err) {
      console.warn(`Skipping malformed project file ${path}:`, err);
    }
  }

  return projects.sort((a, b) => Number(b.featured) - Number(a.featured));
}

export const allProjects = loadProjects();

export function getProjectBySlug(slug: string): Project | undefined {
  return allProjects.find((p) => p.slug === slug);
}
