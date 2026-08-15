import Link from "next/link";
import type { Post } from "@/lib/posts";
import { ArrowUpRight } from "@/components/icons";

export const CATEGORIES = ["技术", "阅读", "生活", "随笔"] as const;

/** 由标签推断文章分类;无匹配时归入「随笔」 */
export function categoryOf(post: Post): string {
  return CATEGORIES.find((category) => post.tags.includes(category)) ?? "随笔";
}

function cardDate(date: string) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function PostCard({ post, number }: { post: Post; number: string }) {
  const external = Boolean(post.externalUrl);
  const href = external ? post.externalUrl! : `/posts/${post.slug}`;
  return (
    <article className="article-card">
      <span className="text-card-number">{number}</span>
      <p className="article-category">{categoryOf(post)}</p>
      <h3>
        <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {post.title}
        </Link>
      </h3>
      <p className="article-excerpt">{post.description}</p>
      <div className="article-footer">
        <time dateTime={post.date}>{cardDate(post.date)}</time>
        <span>{post.tags[0] ?? "随笔"}</span>
        <ArrowUpRight size={18} />
      </div>
    </article>
  );
}
