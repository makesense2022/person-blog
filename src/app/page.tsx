import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { getPosts } from "@/lib/posts";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const posts = await getPosts();
  const jsonLd = { "@context": "https://schema.org", "@type": "Blog", name: siteName, description: siteDescription, url: getSiteUrl(), inLanguage: "zh-CN" };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="hero">
      <p className="eyebrow">PERSONAL KNOWLEDGE BASE</p>
      <h1>把正在生长的<br /><em>思考</em>留在这里。</h1>
      <p className="hero-copy">有关技术、阅读、创作与生活的长期笔记。没有算法催促，只有值得反复回看的内容。</p>
      <div className="hero-actions"><a href="#articles">浏览文章</a><a className="muted-action" href="/admin">开始写作 ↗</a></div>
    </section>
    <section className="posts-section" id="articles">
      <div className="section-heading"><p className="eyebrow">LATEST NOTES</p><h2>最近文章</h2><span>{posts.length.toString().padStart(2, "0")} 篇记录</span></div>
      <div className="post-list">{posts.length ? posts.map((post) => <PostCard key={post.slug} post={post} />) : <p className="empty">还没有公开文章。去写下第一篇吧。</p>}</div>
    </section>
  </main>;
}
