import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { allLocalSlugs, getPost } from "@/lib/posts";
import { getSiteUrl, siteName } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() { return allLocalSlugs(); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, tags: post.tags, url: `/posts/${post.slug}` },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post || !post.published) notFound();
  const canonical = `${getSiteUrl()}/posts/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.description,
    datePublished: post.date, dateModified: post.date, mainEntityOfPage: canonical, url: canonical,
    author: { "@type": "Person", name: siteName }, inLanguage: "zh-CN", keywords: post.tags.join(", "),
  };
  return <main className="article-wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <article className="article">
      <a className="back-link" href="/">← 全部文章</a>
      <div className="post-meta"><time dateTime={post.date}>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(new Date(post.date))}</time>{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      <h1>{post.title}</h1><p className="article-deck">{post.description}</p>
      <Markdown>{post.content}</Markdown>
    </article>
  </main>;
}
