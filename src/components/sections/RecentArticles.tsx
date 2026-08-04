import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import type { Post } from "@/types/content";
import { fetchRecentPosts } from "@/lib/posts";
import { blogPostUrl, BLOG_URL } from "@/lib/blog-links";
import ThemeBanner from "@/components/ThemeBanner";

export default function RecentArticles() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRecentPosts(3).then(setPosts).catch(() => setError(true));
  }, []);

  if (error || (posts && posts.length === 0)) return null;

  return (
    <section className="mt-16 border-t border-line pt-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recent articles</h2>
          <p className="mt-1 text-sm text-ink/60">Writing on Android dev, AI, and whatever I'm building.</p>
        </div>
        <a
          href={BLOG_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1 text-sm font-medium text-accent sm:inline-flex"
        >
          Visit blog <ArrowUpRight size={14} />
        </a>
      </div>

      {!posts && (
        <p className="mt-8 flex items-center gap-2 text-sm text-ink/40">
          <Loader2 size={14} className="animate-spin" /> Loading articles…
        </p>
      )}

      {posts && posts.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={blogPostUrl(post.slug)}
              target="_blank"
              rel="noreferrer"
              className="card group block overflow-hidden hover:border-ink/20"
            >
              {post.cover && (
                <div className="aspect-[16/9] overflow-hidden bg-ink/5">
                  <img
                    src={post.cover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <ThemeBanner theme={post.theme} className="p-4">
                <p className="text-xs opacity-60">
                  {new Date(post.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-1 font-display font-semibold group-hover:text-accent">{post.title}</h3>
                {post.excerpt && <p className="mt-1.5 line-clamp-2 text-sm opacity-70">{post.excerpt}</p>}
              </ThemeBanner>
            </a>
          ))}
        </div>
      )}

      <a
        href={BLOG_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent sm:hidden"
      >
        Visit blog <ArrowUpRight size={14} />
      </a>
    </section>
  );
}
