import { Loader2, Send, X } from "lucide-react";
import MediaUploader from "@/components/admin/MediaUploader";
import TagInput from "@/components/admin/TagInput";
import SkillPicker from "@/components/admin/SkillPicker";
import ThemePicker from "@/components/admin/ThemePicker";
import RichTextEditor from "@/components/admin/RichTextEditor";
import GithubRepoPicker from "@/components/admin/GithubRepoPicker";
import { slugify } from "@/lib/drafts";
import type { Project, Skill } from "@/types/content";

export default function ProjectForm({
  value,
  onChange,
  skills,
  onSkillsChange,
  onSave,
  saving,
  error,
  submitLabel,
}: {
  value: Project;
  onChange: (patch: Partial<Project>) => void;
  skills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
  submitLabel: string;
}) {
  const slug = value.slug || slugify(value.title);

  return (
    <div className="space-y-3">
      <input
        value={value.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Title"
        className="w-full rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={value.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Short description"
        rows={3}
        className="w-full rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
      />
      <TagInput value={value.tags || []} onChange={(tags) => onChange({ tags })} />
      <SkillPicker value={skills} onChange={onSkillsChange} />
      <GithubRepoPicker value={value.repoUrl} onChange={(repoUrl) => onChange({ repoUrl })} />
      <input
        value={value.playStoreUrl || ""}
        onChange={(e) => onChange({ playStoreUrl: e.target.value })}
        placeholder="Play Store URL (optional)"
        className="w-full rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-accent"
      />

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={!!value.featured}
          onChange={(e) => onChange({ featured: e.target.checked })}
        />
        Feature at top of grid
      </label>

      <ThemePicker value={value.theme ?? null} onChange={(theme) => onChange({ theme })} />

      <div className="flex flex-wrap gap-2">
        {value.images.map((img) => (
          <div key={img} className="relative h-16 w-16 overflow-hidden rounded-lg">
            <img src={img} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => onChange({ images: value.images.filter((i) => i !== img) })}
              className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-paper"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
      <MediaUploader
        folder="projects"
        slug={slug}
        onUploaded={(url) => onChange({ images: [...value.images, url] })}
      />

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink/40">
          Notes (shown on the project's expanded card)
        </p>
        <RichTextEditor
          content={value.notes || ""}
          slug={slug}
          folder="projects"
          onChange={(notes) => onChange({ notes })}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={onSave}
        disabled={saving}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {submitLabel}
      </button>
    </div>
  );
}
