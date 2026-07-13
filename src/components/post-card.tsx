import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <div className="post-meta">
        <time dateTime={post.date}>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(post.date))}</time>
        {post.tags.map((tag) => <span key={tag}>#{tag}</span>)}
      </div>
      <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
      <p>{post.description}</p>
      <Link className="read-more" href={`/posts/${post.slug}`}>阅读全文 <span aria-hidden>→</span></Link>
    </article>
  );
}
