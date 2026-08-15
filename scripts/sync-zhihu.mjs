#!/usr/bin/env node
/**
 * 全量同步知乎创作到本地博客:
 *   - 文章(article)与回答(answer):全部写入 src/content/posts/zhihu-*.md,不按时间窗口截断、不去重;
 *   - 想法(pin):全部写入 src/content/pins.json,首页只展示最新 8 条(由首页组件截取)。
 *
 * 用法:
 *   node scripts/sync-zhihu.mjs
 *   或从页面触发:POST /api/zhihu(见 src/app/api/zhihu/route.ts,页面 AJAX → API → 本脚本 → zhihu-cli)
 *
 * 依赖: 已安装并授权 zhihu-cli(见 ~/.codex/skills/zhihu),或通过 ZHIHU_CLI 环境变量指向二进制。
 * 输出: 最后一行是 JSON 统计(供 API 解析),其余为人类可读日志。
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const PAGE_SIZE = 50;
const CONTENT_DIR = path.resolve("src/content/posts");
const PINS_FILE = path.resolve("src/content/pins.json");
const CLIENT_TIMEOUT_MS = 120_000;

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

function fetchPage(cli, type, offset, limit) {
  const out = execFileSync(
    cli,
    ["me", "contents", "--type", type, "--sort", "ts", "--order", "desc", "--limit", String(limit), "--offset", String(offset)],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024, timeout: CLIENT_TIMEOUT_MS },
  );
  const parsed = JSON.parse(out);
  if (parsed.Code !== 0) throw new Error(`zhihu-cli 返回错误: ${parsed.Message}`);
  return parsed.Data;
}

/**
 * 翻页拉取某类型的全部内容。
 * 注意: 服务端分页并不老实——limit=50 的首个请求可能提前返回 IsEnd=true,
 * 各页 Totals 会漂移,大页宽在尾部还会偶发漏条目。可靠策略: 用 limit=1
 * 探测声明总数,按实际返回条数推进 offset,直到某页返回空;再用小页宽在
 * 结束点附近做一次尾部清扫;全程按 Url 去重防御窗口重叠。
 */
function fetchAll(cli, type) {
  const probe = fetchPage(cli, type, 0, 1);
  const declared = Number((probe.Paging || {}).Totals);
  const target = Number.isFinite(declared) && declared > 0 ? declared : Number.POSITIVE_INFINITY;

  const seen = new Set();
  const items = [];
  const merge = (batch) => {
    const fresh = batch.filter((item) => item.Url && !seen.has(item.Url));
    for (const item of fresh) seen.add(item.Url);
    items.push(...fresh);
    return fresh.length;
  };

  let offset = 0;
  while (items.length < target && offset < 10000) {
    const data = fetchPage(cli, type, offset, PAGE_SIZE);
    const batch = Array.isArray(data.Items) ? data.Items : [];
    const added = merge(batch);
    console.log(`  ${type} offset=${offset}: +${added} 条(返回 ${batch.length}),累计 ${items.length}/${declared}`);
    if (batch.length === 0) break;
    offset += batch.length;
  }

  // 尾部清扫: 服务端分页窗口偶发漂移,结束点附近用小页宽补拉
  const end = offset;
  for (const extra of [end - 2, end - 1, end, end + 1]) {
    if (extra < 0 || items.length >= target) continue;
    const data = fetchPage(cli, type, extra, 20);
    const added = merge(Array.isArray(data.Items) ? data.Items : []);
    console.log(`  ${type} 尾部清扫 offset=${extra}: +${added} 条`);
  }

  return { items, declared };
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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
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

/** 从知乎 URL 提取稳定数字 ID 作 slug 后缀,保证 ASCII 且跨同步稳定 */
function asciiSlug(item) {
  const id = (item.Url || "").match(/(\d+)\/?$/);
  if (id) {
    const type = item.ContentType === "article" ? "p" : "a";
    return `zhihu-${type}-${id[1]}`;
  }
  return `zhihu-${slugify(item.Title)}`;
}

async function sync() {
  const cli = resolveCli();
  console.log(`使用 zhihu-cli: ${cli}`);

  console.log("全量拉取: article(文章)");
  const articleResult = fetchAll(cli, "article");
  console.log("全量拉取: answer(回答)");
  const answerResult = fetchAll(cli, "answer");
  console.log("全量拉取: pin(想法)");
  const pinResult = fetchAll(cli, "pin");

  const articles = articleResult.items;
  const answers = answerResult.items;
  const pins = pinResult.items;

  const notes = pins.map((item) => ({
    title: clean(item.Title || item.Summary),
    date: toDate(item.CreatedAt),
    url: item.Url,
  }));

  // 文章与回答全部保留,仅按创建时间倒序
  const posts = [...articles, ...answers].sort((a, b) => b.CreatedAt - a.CreatedAt);

  // 清空旧的 zhihu-*.md(保留手写文章)
  await mkdir(CONTENT_DIR, { recursive: true });
  let removed = 0;
  for (const file of await readdir(CONTENT_DIR).catch(() => [])) {
    if (file.startsWith("zhihu-") && file.endsWith(".md")) {
      await rm(path.join(CONTENT_DIR, file), { force: true });
      removed++;
    }
  }

  for (const item of posts) {
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

  await writeFile(PINS_FILE, `${JSON.stringify(notes, null, 2)}\n`, "utf8");

  const stats = {
    ok: true,
    articles: articles.length,
    answers: answers.length,
    pins: notes.length,
    posts: posts.length,
    removed,
    declared: { articles: articleResult.declared, answers: answerResult.declared, pins: pinResult.declared },
  };
  console.log(`同步完成: 文章 ${articles.length}/${articleResult.declared} 篇、回答 ${answers.length}/${answerResult.declared} 篇(写入 ${posts.length} 个文件,清理旧文件 ${removed} 个)、想法 ${notes.length}/${pinResult.declared} 条。`);
  // 最后一行固定为 JSON 统计,供 /api/zhihu 解析
  console.log(JSON.stringify(stats));
}

sync().catch((error) => {
  console.error(`同步失败: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
