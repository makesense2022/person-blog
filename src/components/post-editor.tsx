"use client";

import { ChangeEvent, ClipboardEvent, useState } from "react";

type EditorState = { title: string; description: string; tags: string; date: string; content: string; password: string; published: boolean };

const initial: EditorState = { title: "", description: "", tags: "", date: new Date().toISOString().slice(0, 10), content: "", password: "", published: true };

function htmlToMarkdown(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (!(node instanceof HTMLElement)) return "";
    const text = Array.from(node.childNodes).map(walk).join("");
    const tag = node.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) return `\n${"#".repeat(Number(tag[1]))} ${text.trim()}\n\n`;
    if (tag === "p" || tag === "div") return `\n${text.trim()}\n`;
    if (tag === "br") return "\n";
    if (tag === "strong" || tag === "b") return `**${text.trim()}**`;
    if (tag === "em" || tag === "i") return `*${text.trim()}*`;
    if (tag === "code") return `\`${text.trim()}\``;
    if (tag === "pre") return `\n\`\`\`\n${node.textContent?.trim() || ""}\n\`\`\`\n`;
    if (tag === "blockquote") return `\n${text.split("\n").filter(Boolean).map((line) => `> ${line}`).join("\n")}\n`;
    if (tag === "li") return `- ${text.trim()}\n`;
    if (tag === "a") return `[${text.trim()}](${node.getAttribute("href") || ""})`;
    if (tag === "img") return `![${node.getAttribute("alt") || ""}](${node.getAttribute("src") || ""})`;
    return text;
  };
  return Array.from(document.body.childNodes).map(walk).join("").replace(/\n{3,}/g, "\n\n").trim();
}

export function PostEditor() {
  const [form, setForm] = useState(initial); const [status, setStatus] = useState<string>(""); const [busy, setBusy] = useState(false);
  const update = (key: keyof EditorState, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const html = event.clipboardData.getData("text/html");
    if (!html) return;
    event.preventDefault(); const markdown = htmlToMarkdown(html);
    setForm((current) => ({ ...current, content: `${current.content}${current.content ? "\n\n" : ""}${markdown}` }));
    setStatus("已将富文本粘贴内容转换为 Markdown，可继续润色。");
  };
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true); setStatus("正在读取文档…");
    const data = new FormData(); data.append("file", file);
    const response = await fetch("/api/import", { method: "POST", body: data }); const result = await response.json();
    setBusy(false);
    if (!response.ok) { setStatus(result.error || "导入失败。"); return; }
    setForm((current) => ({ ...current, title: current.title || file.name.replace(/\.[^.]+$/, ""), content: result.content })); setStatus("文档已导入，请检查格式后保存。");
  };
  const save = async () => {
    setBusy(true); setStatus("正在保存…");
    const response = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json", "x-blog-admin-password": form.password }, body: JSON.stringify({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }) });
    const result = await response.json(); setBusy(false);
    setStatus(response.ok ? `已保存。${form.published ? "文章将在几分钟内对外可见。" : "它仍是一篇草稿。"}` : result.error || "保存失败。");
    if (response.ok) window.open(result.url, "_blank", "noopener,noreferrer");
  };
  return <div className="editor-shell">
    <section className="editor-intro"><p className="eyebrow">WRITING DESK</p><h1>从任何地方，把想法带进来。</h1><p>直接粘贴知乎等网页的富文本，会自动转为 Markdown；也可以导入自己的 `.md`、`.txt` 或 `.docx` 文档。</p><label className="file-button">导入文档<input type="file" accept=".md,.markdown,.txt,.docx" onChange={importFile} /></label></section>
    <section className="editor-form" aria-label="文章编辑器">
      <div className="field-grid"><label>标题<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="这篇文章想说什么？" /></label><label>发布日期<input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></label></div>
      <label>摘要<input value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="一两句话，让人知道文章值得阅读" /></label>
      <label>标签 <span className="hint">用英文逗号分隔</span><input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="写作, AI, 产品" /></label>
      <label>正文 <span className="hint">支持 Markdown，也可直接粘贴富文本</span><textarea value={form.content} onPaste={onPaste} onChange={(e) => update("content", e.target.value)} placeholder={'# 从一个标题开始\n\n在这里写下你的思考…'} /></label>
      <div className="editor-bottom"><label className="toggle"><input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} />立即发布</label><label className="password">管理员密码<input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="本地开发可留空" /></label><button onClick={save} disabled={busy}>{busy ? "处理中…" : "保存文章"}</button></div>
      <p className="editor-status" role="status">{status}</p>
    </section>
  </div>;
}
