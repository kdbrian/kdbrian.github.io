import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Send, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import DraftsPanel from "@/components/admin/DraftsPanel";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import TagInput from "@/components/admin/TagInput";
import SkillPicker from "@/components/admin/SkillPicker";
import ThemePicker from "@/components/admin/ThemePicker";
import { api, ApiError } from "@/lib/api";
import { deleteDraft, listDrafts, newDraft, saveDraft, slugify, type Draft } from "@/lib/drafts";
import { fetchPostBySlug, fetchPosts } from "@/lib/posts";
import type { Post, Skill, Theme } from "@/types/content";

export default function PostEditor() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(newDraft());
  const [skills, setSkills] = useState<Skill[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "error">("idle");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    Promise.all([listDrafts(), fetchPosts()]).then(async ([ds, posts]) => {
      setDrafts(ds);
      setPublishedPosts(posts);
      if (ds[0]) {
        setActiveId(ds[0].id);
        setDraft(ds[0]);
        if (ds[0].publishedSlug) {
          const p = posts.find((x) => x.slug === ds[0].publishedSlug);
          setSkills(p?.skills || []);
        }
      } else {
        const d = newDraft();
        await saveDraft(d);
        setDrafts([d]);
        setActiveId(d.id);
        setDraft(d);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(patch: Partial<Draft>) {
    const updated = { ...draft, ...patch };
    setDraft(updated);
    setSaveState("idle");
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      await saveDraft(updated);
      setDrafts(await listDrafts());
      setSaveState("saved");
    }, 600);
  }

  function selectDraft(id: string) {
    const d = drafts.find((x) => x.id === id);
    if (d) {
      setActiveId(id);
      setDraft(d);
    }
  }

  async function createDraft() {
    const d = newDraft();
    await saveDraft(d);
    setDrafts(await listDrafts());
    setActiveId(d.id);
    setDraft(d);
    setSkills([]);
  }

  async function removeDraft(id: string) {
    await deleteDraft(id);
    const remaining = await listDrafts();
    setDrafts(remaining);
    if (id === activeId) {
      if (remaining[0]) selectDraft(remaining[0].id);
      else createDraft();
    }
  }

  async function openPublished(slug: string) {
    const post = await fetchPostBySlug(slug);
    if (!post) return;
    const d: Draft = {
      id: crypto.randomUUID(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      tags: post.tags || [],
      cover: post.cover || "",
      body: post.body,
      format: post.format,
      updatedAt: Date.now(),
      publishedSlug: post.slug,
    };
    await saveDraft(d);
    setDrafts(await listDrafts());
    setActiveId(d.id);
    setDraft(d);
    setSkills(post.skills || []);
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
        format: "html",
        excerpt: draft.excerpt || undefined,
        tags: draft.tags,
        cover: draft.cover || undefined,
        theme,
        skillIds: skills.map((s) => s.id),
      });
      const updated = { ...draft, publishedSlug: slug, slug };
      await saveDraft(updated);
      setDraft(updated);
      setDrafts(await listDrafts());
      setPublishedPosts(await fetchPosts());
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
    setPublishedPosts(await fetchPosts());
    removeDraft(draft.id);
  }

  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    if (draft.publishedSlug) {
      fetchPostBySlug(draft.publishedSlug).then((p) => setTheme(p?.theme || null));
    } else {
      setTheme(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.publishedSlug]);

  if (loading) return <p className="py-8 text-sm text-ink/40">Loading…</p>;

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <DraftsPanel
        drafts={drafts}
        publishedPosts={publishedPosts}
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
                <Check size={12} /> Saved
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
          <textarea
            value={draft.excerpt}
            onChange={(e) => update({ excerpt: e.target.value })}
            placeholder="Short excerpt (optional, markdown supported)"
            rows={2}
            className="rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
          />
          <TagInput value={draft.tags} onChange={(tags) => update({ tags })} placeholder="Tags, press Enter to add" />
        </div>

        <div className="mt-3">
          <SkillPicker value={skills} onChange={setSkills} />
        </div>

        <div className="mt-3">
          <ThemePicker value={theme} onChange={setTheme} />
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
