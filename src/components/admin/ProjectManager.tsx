import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import ProjectForm from "@/components/admin/ProjectForm";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import ProjectCard from "@/components/sections/ProjectCard";
import { api, ApiError } from "@/lib/api";
import { fetchProjects } from "@/lib/projects";
import { slugify } from "@/lib/drafts";
import type { Project, Skill } from "@/types/content";

const EMPTY: Project = {
  slug: "", title: "", description: "", notes: "", images: [], tags: [], repoUrl: "", playStoreUrl: "", featured: false,
};

type Screen = "list" | "view" | "new" | "edit";

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("list");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [draft, setDraft] = useState<Project>({ ...EMPTY });
  const [draftSkills, setDraftSkills] = useState<Skill[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  function openView(p: Project) {
    setActiveProject(p);
    setScreen("view");
  }

  function startNew() {
    setDraft({ ...EMPTY });
    setDraftSkills([]);
    setError(null);
    setScreen("new");
  }

  function startEdit(p: Project) {
    setDraft({ ...p });
    setDraftSkills(p.skills || []);
    setActiveProject(p);
    setError(null);
    setScreen("edit");
  }

  function backToList() {
    setScreen("list");
    setActiveProject(null);
  }

  async function save(onDone: () => void) {
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const slug = draft.slug || slugify(draft.title);
      const payload = { ...draft, slug, skillIds: draftSkills.map((s) => s.id) };
      await api.publishProject(payload);
      const updated = await fetchProjects();
      setProjects(updated);
      const saved = updated.find((p) => p.slug === slug) || null;
      setActiveProject(saved);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(deleteMedia: boolean) {
    if (!confirmingDelete) return;
    await api.deleteProject(confirmingDelete.slug, deleteMedia);
    setProjects(await fetchProjects());
    setConfirmingDelete(null);
    if (activeProject?.slug === confirmingDelete.slug) backToList();
  }

  if (loading) return <p className="py-8 text-sm text-ink/40">Loading…</p>;

  if (screen === "new" || screen === "edit") {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => (screen === "edit" && activeProject ? openView(activeProject) : backToList())}
          className="mb-4 flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink"
        >
          <ArrowLeft size={14} /> {screen === "edit" ? "Back to project" : "Back to projects"}
        </button>
        <h2 className="mb-4 font-display text-lg font-semibold">{screen === "edit" ? "Edit project" : "New project"}</h2>
        <ProjectForm
          value={draft}
          onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          skills={draftSkills}
          onSkillsChange={setDraftSkills}
          saving={saving}
          error={error}
          submitLabel={screen === "edit" ? "Save changes" : "Publish project"}
          onSave={() => save(() => setScreen(screen === "edit" ? "view" : "list"))}
        />
      </div>
    );
  }

  if (screen === "view" && activeProject) {
    return (
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={backToList} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
            <ArrowLeft size={14} /> Back to projects
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => startEdit(activeProject)}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-ink/5"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => setConfirmingDelete(activeProject)}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
        <ProjectCard project={activeProject} />

        {confirmingDelete && (
          <DeleteConfirmDialog
            itemName={confirmingDelete.slug}
            extraOption="Also delete its uploaded images"
            onCancel={() => setConfirmingDelete(null)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Projects</h2>
        <button
          onClick={startNew}
          className="flex items-center gap-1.5 rounded-xl bg-ink px-3 py-1.5 text-sm text-paper hover:opacity-90"
        >
          <Plus size={14} /> Add project
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {projects.map((p) => (
          <button
            key={p.slug}
            onClick={() => openView(p)}
            className="card flex w-full items-center gap-3 p-3 text-left hover:border-ink/20"
          >
            {p.images?.[0] && <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.title}</p>
              <p className="truncate text-sm text-ink/50">{p.description}</p>
            </div>
          </button>
        ))}
        {projects.length === 0 && <p className="text-sm text-ink/40">No projects yet.</p>}
      </div>
    </div>
  );
}
