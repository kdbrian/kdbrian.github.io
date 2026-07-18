import { useMemo } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import type { Post } from "@/types/content";

const SANITIZE_CONFIG = {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
};

export default function PostRenderer({ post }: { post: Post }) {
  const html = useMemo(() => {
    const raw = post.format === "markdown" ? (marked.parse(post.body) as string) : post.body;
    return DOMPurify.sanitize(raw, SANITIZE_CONFIG);
  }, [post.body, post.format]);

  return <div className="prose-post" dangerouslySetInnerHTML={{ __html: html }} />;
}
