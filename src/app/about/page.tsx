import type { Metadata } from "next";

export const metadata: Metadata = { title: "关于", description: "关于这座个人数字花园。", alternates: { canonical: "/about" } };

export default function About() {
  return <main className="narrow-page"><p className="eyebrow">ABOUT THIS GARDEN</p><h1>为自己而写，也为未来的相遇而写。</h1><p>这是一个由 Markdown 驱动的个人博客。它优先保存原始内容，方便迁移、备份和长期维护。</p><p>文章提供清晰的语义标题、摘要、RSS、站点地图与结构化数据，让读者、搜索引擎与 AI 都能更准确地理解内容。</p></main>;
}
