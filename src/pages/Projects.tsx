import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import type { Project } from "@/types/content";
import { fetchProjects } from "@/lib/projects";
import { blogProjectsUrl } from "@/lib/blog-links";
import ProjectCard from "@/components/sections/ProjectCard";
import RecentArticles from "@/components/sections/RecentArticles";

// A condensed preview: pinned projects only, so the portfolio stays a
// highlight reel rather than the full archive (that's what the blog's
// /projects is for). Falls back to the most recent few so the page is
// never empty before anything's been pinned.
const FALLBACK_COUNT = 3;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => setError(true));
  }, []);

  const pinned = projects?.filter((p) => p.featured) ?? [];
  const shown = projects ? (pinned.length > 0 ? pinned : projects.slice(0, FALLBACK_COUNT)) : [];

  return (
    <section className="animate-fade-up py-14">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="mt-2 max-w-xl text-ink/60">
            Android apps I've designed, built, and shipped — mostly Kotlin and Jetpack Compose.
          </p>
        </div>
        <a
          href={blogProjectsUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent"
        >
          See all projects <ArrowUpRight size={14} />
        </a>
      </div>

      {error && <p className="mt-10 text-sm text-red-600">Couldn't load projects right now.</p>}
      {!error && !projects && (
        <p className="mt-10 flex items-center gap-2 text-sm text-ink/40">
          <Loader2 size={14} className="animate-spin" /> Loading projects…
        </p>
      )}
      {projects && shown.length === 0 && <p className="mt-10 text-ink/50">No projects published yet.</p>}
      {shown.length > 0 && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}

      <RecentArticles />
    </section>
  );
}
