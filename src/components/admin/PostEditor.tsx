import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Send, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import DraftsPanel from "@/components/admin/DraftsPanel";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { deleteDraft, getDraft, listDrafts, newDraft, saveDraft, slugify, type Draft } from "@/lib/drafts";
import { getPostBySlug } from "@/lib/posts";

export default function PostEditor() {
  const [drafts, setDrafts] = useState<Draft[]>(listDrafts());
  const [activeId, setActiveId] = useState<string | null>(drafts[0]?.id ?? null);
  const [draft, setDraft] = useState<Draft>(() => (activeId ? getDraft(activeId)! : newDraft()));
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "error">("idle");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!activeId) {
      const d = newDraft();
      setDraft(d);
      saveDraft(d);
      setActiveId(d.id);
      setDrafts(listDrafts());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(patch: Partial<Draft>) {
    const updated = { ...draft, ...patch };
    setDraft(updated);
    setSaveState("idle");
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveDraft(updated);
      setDrafts(listDrafts());
      setSaveState("saved");
    }, 600);
  }

  function selectDraft(id: string) {
    const d = getDraft(id);
    if (d) {
      setActiveId(id);
      setDraft(d);
    }
  }

  function createDraft() {
    const d = newDraft();
    saveDraft(d);
    setDrafts(listDrafts());
    setActiveId(d.id);
    setDraft(d);
  }

  function removeDraft(id: string) {
    deleteDraft(id);
    const remaining = listDrafts();
    setDrafts(remaining);
    if (id === activeId) {
      if (remaining[0]) selectDraft(remaining[0].id);
      else createDraft();
    }
  }

  function openPublished(slug: string) {
    const post = getPostBySlug(slug);
    if (!post) return;
    const d: Draft = {
      id: crypto.randomUUID(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      tags: (post.tags || []).join(", "),
      cover: post.cover || "",
      body: post.body,
      format: post.format,
      updatedAt: Date.now(),
      publishedSlug: post.slug,
    };
    saveDraft(d);
    setDrafts(listDrafts());
    setActiveId(d.id);
    setDraft(d);
  }

  async function handlePublish() {
    if (!draft.title.trim() || !draft.body.trim()) {
      setPublishError("Title and body are required.");
      setPublishState("error");
      return;
    }
    setPublishState("publishing");
    setPublishError(null);
    try {
      const slug = draft.publishedSlug || slugify(draft.title);
      await api.publishPost({
        slug,
        title: draft.title,
        body: draft.body,
        format: "html", // TipTap always outputs HTML
        excerpt: draft.excerpt || undefined,
        tags: draft.tags ? draft.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        cover: draft.cover || undefined,
        isNew: !draft.publishedSlug,
      });
      const updated = { ...draft, publishedSlug: slug, slug };
      saveDraft(updated);
      setDraft(updated);
      setDrafts(listDrafts());
      setPublishState("idle");
    } catch (err) {
      setPublishError(err instanceof ApiError ? err.message : "Publish failed.");
      setPublishState("error");
    }
  }

  async function handleDelete(deleteMedia: boolean) {
    if (!draft.publishedSlug) return;
    await api.deletePost(draft.publishedSlug, deleteMedia);
    setConfirmingDelete(false);
    removeDraft(draft.id);
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <DraftsPanel
        drafts={drafts}
        activeId={activeId}
        onSelect={selectDraft}
        onNew={createDraft}
        onDelete={removeDraft}
        onOpenPublished={openPublished}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs text-ink/40">
            {saveState === "saved" ? (
              <>
                <Check size={12} /> Saved locally
              </>
            ) : (
              "Editing…"
            )}
            {draft.publishedSlug && (
              <span className="rounded-full bg-teal-soft px-2 py-0.5 text-teal">Published</span>
            )}
          </p>
          <div className="flex gap-2">
            {draft.publishedSlug && (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
            <button
              onClick={handlePublish}
              disabled={publishState === "publishing"}
              className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-1.5 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
            >
              {publishState === "publishing" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {draft.publishedSlug ? "Update" : "Publish"}
            </button>
          </div>
        </div>

        {publishError && <p className="mt-2 text-sm text-red-600">{publishError}</p>}

        <input
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Post title"
          className="mt-4 w-full border-none bg-transparent font-display text-3xl font-semibold outline-none placeholder:text-ink/25"
        />
        <input
          value={draft.slug || slugify(draft.title)}
          onChange={(e) => update({ slug: slugify(e.target.value) })}
          placeholder="url-slug"
          className="mt-1 w-full border-none bg-transparent font-mono text-sm text-ink/40 outline-none"
        />

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={draft.excerpt}
            onChange={(e) => update({ excerpt: e.target.value })}
            placeholder="Short excerpt (optional)"
            className="rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            value={draft.tags}
            onChange={(e) => update({ tags: e.target.value })}
            placeholder="Tags, comma-separated"
            className="rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mt-4">
          <RichTextEditor
            content={draft.body}
            slug={draft.slug || slugify(draft.title) || draft.id}
            onChange={(body) => update({ body })}
          />
        </div>
      </div>

      {confirmingDelete && (
        <DeleteConfirmDialog
          itemName={draft.publishedSlug!}
          extraOption="Also delete its uploaded media"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
