import { useState } from "react";
import { Loader2, Plus, Send, Trash2, X } from "lucide-react";
import MediaUploader from "@/components/admin/MediaUploader";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { allProjects } from "@/lib/projects";
import { slugify } from "@/lib/drafts";
import type { Project } from "@/types/content";

const EMPTY: Project = {
  slug: "", title: "", description: "", images: [], tags: [], repoUrl: "", playStoreUrl: "", featured: false,
};

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>(allProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Project | null>(null);

  function startNew() {
    setEditing({ ...EMPTY });
    setTagsInput("");
    setIsNew(true);
    setError(null);
  }

  function startEdit(p: Project) {
    setEditing({ ...p });
    setTagsInput((p.tags || []).join(", "));
    setIsNew(false);
    setError(null);
  }

  async function handleSave() {
    if (!editing || !editing.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const slug = editing.slug || slugify(editing.title);
      const payload = {
        ...editing,
        slug,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        isNew,
      };
      await api.publishProject(payload);
      const saved = { ...payload };
      setProjects((prev) => {
        const idx = prev.findIndex((p) => p.slug === slug);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(deleteMedia: boolean) {
    if (!confirmingDelete) return;
    await api.deleteProject(confirmingDelete.slug, deleteMedia);
    setProjects((prev) => prev.filter((p) => p.slug !== confirmingDelete.slug));
    setConfirmingDelete(null);
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
            <h3 className="font-medium">{isNew ? "New project" : "Edit project"}</h3>
            <button onClick={() => setEditing(null)} className="text-ink/30 hover:text-ink">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Title"
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
            />
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Description"
              rows={3}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags, comma-separated"
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              value={editing.repoUrl}
              onChange={(e) => setEditing({ ...editing, repoUrl: e.target.value })}
              placeholder="Repo URL (optional)"
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              value={editing.playStoreUrl}
              onChange={(e) => setEditing({ ...editing, playStoreUrl: e.target.value })}
              placeholder="Play Store URL (optional)"
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
            />

            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={!!editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              />
              Feature at top of grid
            </label>

            <div className="flex flex-wrap gap-2">
              {editing.images.map((img) => (
                <div key={img} className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setEditing({ ...editing, images: editing.images.filter((i) => i !== img) })}
                    className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-paper"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <MediaUploader
              folder="projects"
              slug={editing.slug || slugify(editing.title)}
              onUploaded={(url) => setEditing((prev) => prev && { ...prev, images: [...prev.images, url] })}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isNew ? "Publish project" : "Save changes"}
            </button>
          </div>
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
