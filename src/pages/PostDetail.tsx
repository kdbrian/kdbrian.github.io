import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/posts";
import PostRenderer from "@/components/blog/PostRenderer";

export default function PostDetailPage() {
  const { slug } = useParams();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <section className="py-14">
        <p className="text-ink/60">Post not found.</p>
        <Link to="/blog" className="mt-4 inline-flex items-center gap-1.5 text-accent">
          <ArrowLeft size={14} /> Back to blog
        </Link>
      </section>
    );
  }

  return (
    <article className="animate-fade-up py-14">
      <Link to="/blog" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft size={14} /> Back to blog
      </Link>

      {post.cover && <img src={post.cover} alt="" className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover" />}

      <p className="text-sm text-ink/40">
        {new Date(post.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
      </p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{post.title}</h1>

      {!!post.tags?.length && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8">
        <PostRenderer post={post} />
      </div>
    </article>
  );
}
