import { useState } from "react";
import { ExternalLink, Github, Smartphone, ChevronDown } from "lucide-react";
import type { Project } from "@/types/content";
import ThemeBanner from "@/components/ThemeBanner";
import CommitHistory from "@/components/CommitHistory";

export default function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

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
      <ThemeBanner theme={project.theme} className="p-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <h3 className="font-display font-semibold">{project.title}</h3>
          <ChevronDown size={16} className={`shrink-0 opacity-60 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        <p className={`mt-1.5 text-sm opacity-70 ${expanded ? "" : "line-clamp-2"}`}>{project.description}</p>

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
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
              >
                <Github size={14} /> Source
              </a>
            )}
            {project.playStoreUrl && (
              <a
                href={project.playStoreUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
              >
                <Smartphone size={14} /> Play Store <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {expanded && (
          <div className="mt-4 border-t border-line/50 pt-3" onClick={(e) => e.stopPropagation()}>
            {!!project.skills?.length && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {project.skills.map((skill) => (
                  <span key={skill.id} className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
            {project.repoUrl && (
              <>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide opacity-50">Commit history</p>
                <CommitHistory repoUrl={project.repoUrl} />
              </>
            )}
          </div>
        )}
      </ThemeBanner>
    </div>
  );
}
