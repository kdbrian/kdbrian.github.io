import { allPosts } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";

export default function BlogListPage() {
  return (
    <section className="animate-fade-up py-14">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <p className="mt-2 max-w-xl text-ink/60">Notes on Android dev, AI, and whatever I'm building.</p>

      {allPosts.length === 0 ? (
        <p className="mt-10 text-ink/50">No posts published yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
