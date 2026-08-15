#!/usr/bin/env node
/**
 * 同步知乎「最近半年」创作到本地博客,供首页文章区块与笔记流使用。
 *
 * 用法: node scripts/sync-zhihu.mjs
 * 依赖: 已安装并授权 zhihu-cli(见 ~/.codex/skills/zhihu),或通过 ZHIHU_CLI 环境变量指向二进制。
 *
 * 产物:
 *   - src/content/posts/zhihu-<slug>.md   知乎专栏/回答(按内容去重,专栏优先)
 *   - src/content/pins.json                知乎「想法」,渲染为首页的笔记流
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const WINDOW_DAYS = 183; // 最近半年
const MAX_PAGES = 5;
const PAGE_SIZE = 50;
const MAX_NOTES = 8; // 笔记流最多展示条数
const CONTENT_DIR = path.resolve("src/content/posts");
const PINS_FILE = path.resolve("src/content/pins.json");

function resolveCli() {
  if (process.env.ZHIHU_CLI && existsSync(process.env.ZHIHU_CLI)) return process.env.ZHIHU_CLI;
  const skill = path.join(os.homedir(), ".codex/skills/zhihu");
  const run = path.join(skill, "scripts/run.sh");
  if (existsSync(run)) {
    try {
      const out = execFileSync("bash", [run, "status"], { encoding: "utf8" });
      const bin = JSON.parse(out)?.cli?.binary_path;
      if (bin && existsSync(bin)) return bin;
    } catch {
      // 状态检查失败,继续尝试回退路径
    }
  }
  const fallback = path.join(os.homedir(), "Library/Application Support/zhihu-cli/current/zhihu-cli");
  if (existsSync(fallback)) return fallback;
  throw new Error("未找到 zhihu-cli。请安装 zhihu-cli skill,或设置 ZHIHU_CLI 指向其二进制。");
}

function fetchPage(cli, offset) {
  const out = execFileSync(
    cli,
    ["me", "contents", "--type", "all", "--sort", "ts", "--order", "desc", "--limit", String(PAGE_SIZE), "--offset", String(offset)],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out);
  if (parsed.Code !== 0) throw new Error(`zhihu-cli 返回错误: ${parsed.Message}`);
  return parsed.Data;
}

function clean(text = "") {
  return text.replace(/\[(图片|视频|文章):?[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function slugify(value) {
  const cleanSlug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleanSlug || `note-${Date.now()}`;
}

function toDate(unix) {
  const d = new Date(unix * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function category(title, summary) {
  const text = `${title} ${summary}`;
  if (/书|读|潜能|思维|思考|复利|课程|学习|《/.test(text)) return "阅读";
  if (/AI|人工智能|编程|前端|全栈|代码|模型|Claude|Codex|DeepSeek|浏览器|工具|软件|开发/.test(text)) return "技术";
  if (/孩子|亲子|遛娃|公园|鸟巢|厨房|周末|睡眠|健身房|杂事|杂谈|感悟|世界公园/.test(text)) return "生活";
  return "随笔";
}

function dedupKey(item) {
  return `${clean(item.Title).slice(0, 14)}|${clean(item.Summary).slice(0, 24)}`;
}

const cli = resolveCli();
const cutoff = Date.now() / 1000 - WINDOW_DAYS * 86400;

// 分页拉取,遇到早于窗口的内容即停止
const items = [];
for (let page = 0; page < MAX_PAGES; page++) {
  const data = fetchPage(cli, page * PAGE_SIZE);
  const batch = data.Items.filter((item) => item.CreatedAt >= cutoff);
  items.push(...batch);
  if (data.Items.length < PAGE_SIZE || batch.length < data.Items.length) break;
}

const notes = [];
const candidates = [];
for (const item of items) {
  if (item.ContentType === "pin") {
    notes.push({ title: clean(item.Title || item.Summary), date: toDate(item.CreatedAt), url: item.Url });
  } else if (item.ContentType === "article" || item.ContentType === "answer") {
    candidates.push(item);
  }
}

// 去重:专栏(article)优先于回答(answer)
const seen = new Map();
for (const item of candidates) {
  const key = dedupKey(item);
  const rank = item.ContentType === "article" ? 0 : 1;
  const prev = seen.get(key);
  if (!prev || rank < prev.rank) seen.set(key, { rank, item });
}
const articles = [...seen.values()].map((entry) => entry.item).sort((a, b) => b.CreatedAt - a.CreatedAt);

// 清空旧的 zhihu-*.md(保留手写文章)
await mkdir(CONTENT_DIR, { recursive: true });
for (const file of await readdir(CONTENT_DIR).catch(() => [])) {
  if (file.startsWith("zhihu-") && file.endsWith(".md")) await rm(path.join(CONTENT_DIR, file), { force: true });
}

/** 从知乎 URL 提取稳定数字 ID 作 slug 后缀,保证 ASCII 且跨同步稳定 */
function asciiSlug(item) {
  const id = (item.Url || "").match(/(\d+)\/?$/);
  if (id) {
    const type = item.ContentType === "article" ? "p" : "a";
    return `zhihu-${type}-${id[1]}`;
  }
  return `zhihu-${slugify(item.Title)}`;
}

for (const item of articles) {
  const summary = clean(item.Summary || item.Title);
  const cat = category(item.Title, summary);
  const slug = asciiSlug(item);
  const front = [
    "---",
    `title: ${JSON.stringify(clean(item.Title))}`,
    `description: ${JSON.stringify(truncate(summary, 180))}`,
    `date: ${JSON.stringify(toDate(item.CreatedAt))}`,
    `tags: [${JSON.stringify(cat)}, ${JSON.stringify("知乎")}]`,
    "published: true",
    `externalUrl: ${JSON.stringify(item.Url)}`,
    "---",
    "",
    summary,
    "",
  ].join("\n");
  await writeFile(path.join(CONTENT_DIR, `${slug}.md`), front, "utf8");
}

const pins = notes.slice(0, MAX_NOTES);
await writeFile(PINS_FILE, `${JSON.stringify(pins, null, 2)}\n`, "utf8");

console.log(`同步完成:${articles.length} 篇文章、${notes.length} 条想法(笔记流展示 ${pins.length} 条),已写入 ${CONTENT_DIR} 与 ${PINS_FILE}`);
