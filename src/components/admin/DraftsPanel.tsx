import { FileText, Globe, Plus, Trash2 } from "lucide-react";
import type { Draft } from "@/lib/drafts";
import { allPosts } from "@/lib/posts";

export default function DraftsPanel({
  drafts,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onOpenPublished,
}: {
  drafts: Draft[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenPublished: (slug: string) => void;
}) {
  const localSlugs = new Set(drafts.map((d) => d.publishedSlug).filter(Boolean));
  const otherPublished = allPosts.filter((p) => !localSlugs.has(p.slug));

  return (
    <div className="w-full shrink-0 border-b border-line pb-4 sm:w-64 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
      <button
        onClick={onNew}
        className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2 text-sm text-ink/60 hover:border-ink/30 hover:text-ink"
      >
        <Plus size={14} /> New draft
      </button>

      <div className="space-y-1">
        {drafts.map((d) => (
          <div
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
              activeId === d.id ? "bg-ink/5" : "hover:bg-ink/5"
            }`}
          >
            <FileText size={14} className="shrink-0 text-ink/30" />
            <span className="flex-1 truncate">{d.title || "Untitled draft"}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(d.id);
              }}
              className="hidden text-ink/30 hover:text-red-600 group-hover:block"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {drafts.length === 0 && <p className="px-2.5 text-xs text-ink/30">No drafts yet.</p>}
      </div>

      {otherPublished.length > 0 && (
        <>
          <p className="mb-2 mt-6 px-2.5 text-xs font-medium uppercase tracking-wide text-ink/30">
            Published (from last build)
          </p>
          <div className="space-y-1">
            {otherPublished.map((p) => (
              <div
                key={p.slug}
                onClick={() => onOpenPublished(p.slug)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-ink/5"
              >
                <Globe size={14} className="shrink-0 text-ink/30" />
                <span className="flex-1 truncate">{p.title}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
