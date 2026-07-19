import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import ProjectForm from "@/components/admin/ProjectForm";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { fetchProjects } from "@/lib/projects";
import { slugify } from "@/lib/drafts";
import type { Project, Skill } from "@/types/content";

const EMPTY: Project = {
  slug: "", title: "", description: "", notes: "", images: [], tags: [], repoUrl: "", playStoreUrl: "", featured: false,
};

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "new">("list");
  const [newProject, setNewProject] = useState<Project>({ ...EMPTY });
  const [newSkills, setNewSkills] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [editingSkills, setEditingSkills] = useState<Skill[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  function startNew() {
    setNewProject({ ...EMPTY });
    setNewSkills([]);
    setError(null);
    setView("new");
  }

  function startEdit(p: Project) {
    setEditing({ ...p });
    setEditingSkills(p.skills || []);
    setError(null);
  }

  async function save(project: Project, skills: Skill[], onDone: () => void) {
    if (!project.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!project.repoUrl.trim()) {
      setError("A GitHub repo URL is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const slug = project.slug || slugify(project.title);
      const payload = { ...project, slug, skillIds: skills.map((s) => s.id) };
      await api.publishProject(payload);
      setProjects(await fetchProjects());
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
  }

  if (loading) return <p className="py-8 text-sm text-ink/40">Loading…</p>;

  if (view === "new") {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => setView("list")}
          className="mb-4 flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink"
        >
          <ArrowLeft size={14} /> Back to projects
        </button>
        <h2 className="mb-4 font-display text-lg font-semibold">New project</h2>
        <ProjectForm
          value={newProject}
          onChange={(patch) => setNewProject((prev) => ({ ...prev, ...patch }))}
          skills={newSkills}
          onSkillsChange={setNewSkills}
          saving={saving}
          error={error}
          submitLabel="Publish project"
          onSave={() => save(newProject, newSkills, () => setView("list"))}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
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
            <div key={p.slug} className="card flex items-center gap-3 p-3">
              {p.images?.[0] && (
                <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <p className="truncate text-sm text-ink/50">{p.description}</p>
              </div>
              <button onClick={() => startEdit(p)} className="text-sm text-ink/60 hover:text-ink">
                Edit
              </button>
              <button onClick={() => setConfirmingDelete(p)} className="text-ink/30 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {projects.length === 0 && <p className="text-sm text-ink/40">No projects yet.</p>}
        </div>
      </div>

      {editing && (
        <div className="card h-fit p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Edit project</h3>
            <button onClick={() => setEditing(null)} className="text-ink/30 hover:text-ink">
              <X size={16} />
            </button>
          </div>
          <ProjectForm
            value={editing}
            onChange={(patch) => setEditing((prev) => prev && { ...prev, ...patch })}
            skills={editingSkills}
            onSkillsChange={setEditingSkills}
            saving={saving}
            error={error}
            submitLabel="Save changes"
            onSave={() => save(editing, editingSkills, () => setEditing(null))}
          />
        </div>
      )}

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
