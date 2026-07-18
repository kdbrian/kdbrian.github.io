import { allProjects } from "@/lib/projects";
import ProjectCard from "@/components/sections/ProjectCard";

export default function ProjectsPage() {
  return (
    <section className="animate-fade-up py-14">
      <h1 className="text-3xl font-semibold">Projects</h1>
      <p className="mt-2 max-w-xl text-ink/60">
        Android apps I've designed, built, and shipped — mostly Kotlin and Jetpack Compose.
      </p>

      {allProjects.length === 0 ? (
        <p className="mt-10 text-ink/50">No projects published yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
