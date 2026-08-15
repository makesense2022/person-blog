import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PostGrid } from "@/components/post-grid";
import { ArrowDownRight, ArrowUpRight } from "@/components/icons";
import { getPosts } from "@/lib/posts";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = { alternates: { canonical: "/" } };

type Note = { title: string; date: string; url: string };

// pins.json 保存全部想法,首页笔记流只展示最新 8 条
const MAX_NOTES = 8;

async function getNotes(): Promise<Note[]> {
  try {
    const raw = await readFile(path.join(process.cwd(), "src/content/pins.json"), "utf8");
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

function noteDate(date: string) {
  const [, month, day] = date.split("-");
  return `${month}.${day}`;
}

export default async function Home() {
  const [posts, notes] = await Promise.all([getPosts(), getNotes()]);
  const recentNotes = notes.slice(0, MAX_NOTES);
  const jsonLd = { "@context": "https://schema.org", "@type": "Blog", name: siteName, description: siteDescription, url: getSiteUrl(), inLanguage: "zh-CN" };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero-section">
        <div className="hero-copy reveal-item">
          <p className="eyebrow"><span className="signal-dot" />写作档案 · {new Date().getFullYear()}</p>
          <h1>把正在生长的<br /><em>思考</em>留在这里。</h1>
          <p className="hero-intro">{siteDescription}</p>
          <a className="ink-link" href="#articles">从最近一篇开始 <ArrowDownRight size={20} /></a>
        </div>
        <div className="hero-side-note" aria-hidden="true"><span>驻足</span><span className="side-rule" /><span>书写</span></div>
      </section>

      <PostGrid posts={posts} />

      <section className="notes-section" id="notes">
        <div className="notes-heading">
          <p className="eyebrow"><span className="signal-dot" />零碎收藏</p>
          <h2>近期笔记</h2>
        </div>
        <div className="note-stream">
          {recentNotes.length ? recentNotes.map((note) => (
            <a className="note-item" key={note.url} href={note.url} target="_blank" rel="noopener noreferrer">
              <span className="note-date">{noteDate(note.date)}</span>
              <p>{note.title}</p>
              <span className="note-tag">想法</span>
            </a>
          )) : <p className="empty">还没有笔记。</p>}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-index"><span>ABOUT</span><span>02</span></div>
        <div className="about-copy">
          <p className="eyebrow"><span className="signal-dot" />关于作者</p>
          <h2>为自己而写，<br />也为未来的<em>相遇</em>而写。</h2>
          <p>一个长期在互联网一线的工程师，把技术、阅读与生活留在纸页上。这里没有正确答案，只有持续展开的观察。</p>
        </div>
        <a className="about-contact" href="/about">了解更多 <ArrowUpRight size={17} /></a>
      </section>
    </main>
  );
}
