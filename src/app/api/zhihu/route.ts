import { NextRequest, NextResponse } from "next/server";
import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";

/**
 * 知乎全量同步桥接层:页面 AJAX → 本路由 → scripts/sync-zhihu.mjs → 本机 zhihu-cli。
 * 仅本机开发环境有意义(生产环境的 Vercel 容器里没有 zhihu-cli 二进制),
 * 因此沿用 /api/posts 的 BLOG_ADMIN_PASSWORD 鉴权规则。
 */

function isAuthorized(request: NextRequest) {
  const expected = process.env.BLOG_ADMIN_PASSWORD;
  // Local first-run convenience. Vercel deployments must set a password.
  return (process.env.NODE_ENV !== "production" && !expected) || request.headers.get("x-blog-admin-password") === expected;
}

async function currentStats() {
  const postsDir = path.join(process.cwd(), "src/content/posts");
  const files = await readdir(postsDir).catch(() => [] as string[]);
  const zhihuPosts = files.filter((file) => file.startsWith("zhihu-") && file.endsWith(".md")).length;
  let pins = 0;
  let lastSync: string | null = null;
  try {
    const pinsFile = path.join(process.cwd(), "src/content/pins.json");
    pins = (JSON.parse(await readFile(pinsFile, "utf8")) as unknown[]).length;
    lastSync = (await stat(pinsFile)).mtime.toISOString();
  } catch {
    // 尚未同步过,返回零值即可
  }
  return { zhihuPosts, pins, lastSync };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "未授权：请输入管理员密码。" }, { status: 401 });
  try {
    return NextResponse.json(await currentStats());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "读取同步状态失败。" }, { status: 500 });
  }
}

let syncing = false;

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "未授权：请输入管理员密码。" }, { status: 401 });
  if (syncing) return NextResponse.json({ error: "正在同步中，请稍候。" }, { status: 409 });
  syncing = true;
  try {
    const script = path.join(process.cwd(), "scripts/sync-zhihu.mjs");
    const out = execFileSync("node", [script], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
      timeout: 10 * 60 * 1000,
    });
    const lines = out.trim().split("\n").filter(Boolean);
    const sync = JSON.parse(lines[lines.length - 1] ?? "{}") as Record<string, unknown>;
    revalidatePath("/", "layout");
    return NextResponse.json({ ...(await currentStats()), sync, ok: sync.ok === true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `同步失败：${message}` }, { status: 500 });
  } finally {
    syncing = false;
  }
}
