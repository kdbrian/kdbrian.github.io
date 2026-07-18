import { ExternalLink, Github, Smartphone } from "lucide-react";
import type { Project } from "@/types/content";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="card group overflow-hidden transition-shadow hover:shadow-lg hover:shadow-ink/5">
      {project.images?.[0] && (
        <div className="aspect-[4/3] overflow-hidden bg-ink/5">
          <img
            src={project.images[0]}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-display font-semibold">{project.title}</h3>
        <p className="mt-1.5 text-sm text-ink/60">{project.description}</p>

        {!!project.tags?.length && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-teal-soft px-2 py-0.5 text-xs text-teal">
                {tag}
              </span>
            ))}
          </div>
        )}

        {(project.repoUrl || project.playStoreUrl) && (
          <div className="mt-4 flex gap-3 text-sm">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-ink/60 hover:text-ink"
              >
                <Github size={14} /> Source
              </a>
            )}
            {project.playStoreUrl && (
              <a
                href={project.playStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-ink/60 hover:text-ink"
              >
                <Smartphone size={14} /> Play Store <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
