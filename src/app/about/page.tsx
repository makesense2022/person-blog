import type { Metadata } from "next";

export const metadata: Metadata = { title: "关于", description: "关于这座栖简写作档案。", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <main className="narrow-page">
      <p className="eyebrow"><span className="signal-dot" />ABOUT QIJIAN</p>
      <h1>为自己而写，<br />也为未来的<em>相遇</em>而写。</h1>
      <p>栖简是一处由 Markdown 驱动的个人写作档案。文章优先保存原始内容，方便迁移、备份与长期维护；写作入口支持从网页富文本粘贴，以及导入 `.md`、`.txt`、`.docx` 文档。</p>
      <p>每篇文章提供清晰的语义标题、摘要、RSS、站点地图与结构化数据，让读者、搜索引擎与 AI 都能更准确地理解内容。</p>
    </main>
  );
}
