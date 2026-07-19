import { useEffect, useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { Extension, InputRule } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import {
  Bold, Italic, Strikethrough, Link as LinkIcon, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Image as ImageIcon, Film, Smile,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon, Palette,
} from "lucide-react";
import MediaUploader from "@/components/admin/MediaUploader";

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Orange", value: "#EA580C" },
  { label: "Teal", value: "#0F766E" },
  { label: "Red", value: "#DC2626" },
  { label: "Blue", value: "#2563EB" },
  { label: "Purple", value: "#7C3AED" },
  { label: "Gray", value: "#78716C" },
];

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
const VIMEO_RE = /vimeo\.com\/(\d+)/;

const EMOJI_MAP: Record<string, string> = {
  smile: "😄", laughing: "😆", wink: "😉", heart: "❤️", thumbsup: "👍", thumbsdown: "👎",
  fire: "🔥", rocket: "🚀", tada: "🎉", eyes: "👀", thinking: "🤔", clap: "👏",
  100: "💯", check: "✅", x: "❌", warning: "⚠️", bug: "🐛", sparkles: "✨",
  wave: "👋", pray: "🙏", muscle: "💪", star: "⭐", bulb: "💡", coffee: "☕",
};
const EMOJI_PICKS = Object.values(EMOJI_MAP);

const EmojiShortcodes = Extension.create({
  name: "emojiShortcodes",
  addInputRules() {
    return [
      new InputRule({
        find: /:([a-z0-9_+-]+):$/,
        handler: ({ state, range, match }) => {
          const emoji = EMOJI_MAP[match[1]];
          if (!emoji) return;
          state.tr.insertText(emoji, range.from, range.to);
        },
      }),
    ];
  },
});

export default function RichTextEditor({
  content,
  slug,
  onChange,
}: {
  content: string;
  slug: string;
  onChange: (html: string) => void;
}) {
  const [showMedia, setShowMedia] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Youtube.configure({ nocookie: true }),
      Placeholder.configure({ placeholder: "Start writing… (try typing :fire:)" }),
      EmojiShortcodes,
      Subscript,
      Superscript,
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep editor in sync when switching between drafts.
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  function insertEmbed() {
    if (!embedUrl.trim()) return;
    const yt = embedUrl.match(YOUTUBE_RE);
    const vimeo = embedUrl.match(VIMEO_RE);

    if (yt) {
      editor!.chain().focus().setYoutubeVideo({ src: embedUrl }).run();
    } else if (vimeo) {
      editor!
        .chain()
        .focus()
        .insertContent(
          `<iframe src="https://player.vimeo.com/video/${vimeo[1]}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
        )
        .run();
    } else if (embedUrl.trim().startsWith("<iframe")) {
      editor!.chain().focus().insertContent(embedUrl).run();
    } else {
      editor!
        .chain()
        .focus()
        .insertContent(`<iframe src="${embedUrl}" allowfullscreen></iframe>`)
        .run();
    }
    setEmbedUrl("");
    setShowEmbed(false);
  }

  const btn = (active: boolean) =>
    `rounded-lg p-1.5 transition ${active ? "bg-ink text-paper" : "text-ink/60 hover:bg-ink/10"}`;

  return (
    <div className="rounded-xl border border-line bg-white text-ink">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, onHidden: () => setShowColors(false) }}
          shouldShow={({ from, to }) => from !== to}
        >
          <div className="flex gap-0.5 rounded-lg border border-line bg-white p-1 shadow-lg">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
              <Bold size={14} />
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
              <Italic size={14} />
            </button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}>
              <Strikethrough size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={btn(editor.isActive("subscript"))}
              aria-label="Subscript"
            >
              <SubscriptIcon size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={btn(editor.isActive("superscript"))}
              aria-label="Superscript"
            >
              <SuperscriptIcon size={14} />
            </button>
            <button
              onClick={() => {
                const url = window.prompt("Link URL");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              className={btn(editor.isActive("link"))}
            >
              <LinkIcon size={14} />
            </button>
            <button onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive("code"))}>
              <Code size={14} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowColors((v) => !v)}
                className={btn(showColors || !!editor.getAttributes("textStyle").color)}
                aria-label="Text color"
              >
                <Palette size={14} />
              </button>
              {showColors && (
                <div className="absolute left-1/2 top-full z-10 mt-1.5 flex -translate-x-1/2 gap-1 rounded-lg border border-line bg-white p-1.5 shadow-lg">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.label}
                      title={c.label}
                      onClick={() => {
                        if (c.value) editor.chain().focus().setColor(c.value).run();
                        else editor.chain().focus().unsetColor().run();
                        setShowColors(false);
                      }}
                      className="h-5 w-5 rounded-full ring-1 ring-inset ring-line"
                      style={{ backgroundColor: c.value || "#FAFAF9" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </BubbleMenu>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line p-2">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
          <Heading2 size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>
          <Heading3 size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
          <List size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
          <ListOrdered size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>
          <Quote size={16} />
        </button>
        <div className="mx-1 h-5 w-px bg-line" />
        <button onClick={() => setShowMedia((v) => !v)} className={btn(showMedia)}>
          <ImageIcon size={16} />
        </button>
        <button onClick={() => setShowEmbed((v) => !v)} className={btn(showEmbed)}>
          <Film size={16} />
        </button>
        <button onClick={() => setShowEmoji((v) => !v)} className={btn(showEmoji)}>
          <Smile size={16} />
        </button>
      </div>

      {showEmoji && (
        <div className="grid grid-cols-8 gap-1 border-b border-line p-3">
          {EMOJI_PICKS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                editor.chain().focus().insertContent(emoji).run();
                setShowEmoji(false);
              }}
              className="rounded-lg p-1.5 text-lg hover:bg-ink/10"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {showMedia && (
        <div className="border-b border-line p-3">
          <MediaUploader
            folder="blog-images"
            slug={slug}
            onUploaded={(url) => {
              editor.chain().focus().setImage({ src: url }).run();
              setShowMedia(false);
            }}
          />
        </div>
      )}

      {showEmbed && (
        <div className="flex gap-2 border-b border-line p-3">
          <input
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="YouTube / Vimeo link, any https:// URL, or an <iframe> tag"
            className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-accent"
            onKeyDown={(e) => e.key === "Enter" && insertEmbed()}
          />
          <button onClick={insertEmbed} className="rounded-lg bg-ink px-3 py-1.5 text-sm text-paper">
            Embed
          </button>
        </div>
      )}

      <EditorContent editor={editor} className="prose-post min-h-[320px] px-4 py-3 outline-none [&_.ProseMirror]:outline-none" />
    </div>
  );
}
