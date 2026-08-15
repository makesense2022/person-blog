import "server-only";

import { list, put, getDownloadUrl } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  published: boolean;
  content: string;
  /** 若来自知乎等外部平台,指向原文 URL;文章详情会以 canonical 引用并引导阅读原文 */
  externalUrl?: string;
};

type PostInput = Omit<Post, "slug"> & { slug?: string };

const contentDir = path.join(process.cwd(), "src/content/posts");
const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function parseScalar(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function slugify(value: string) {
  const clean = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || `note-${Date.now()}`;
}

export function parsePost(source: string, slug: string): Post {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const fields: Record<string, string> = {};
  if (match) {
    for (const line of match[1].split("\n")) {
      const separator = line.indexOf(":");
      if (separator > -1) fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    }
  }
  const tags = (fields.tags || "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map(parseScalar)
    .filter(Boolean);
  const content = match ? match[2].trim() : source.trim();
  const firstLine = content.split("\n").find((line) => line.trim())?.replace(/^#+\s*/, "") || "未命名文章";
  const externalUrlRaw = parseScalar(fields.externalUrl || "");
  return {
    slug,
    title: parseScalar(fields.title || firstLine),
    description: parseScalar(fields.description || content.replace(/[#>*_`]/g, "").slice(0, 150)),
    date: parseScalar(fields.date || new Date().toISOString().slice(0, 10)),
    tags,
    published: fields.published !== "false",
    content,
    externalUrl: externalUrlRaw.startsWith("http") ? externalUrlRaw : undefined,
  };
}

export function serializePost(post: PostInput) {
  const tags = post.tags.map((tag) => JSON.stringify(tag)).join(", ");
  const external = post.externalUrl ? `externalUrl: ${JSON.stringify(post.externalUrl)}\n` : "";
  return `---\ntitle: ${JSON.stringify(post.title)}\ndescription: ${JSON.stringify(post.description)}\ndate: ${JSON.stringify(post.date)}\ntags: [${tags}]\npublished: ${post.published}\n${external}---\n\n${post.content.trim()}\n`;
}

async function localPosts() {
  try {
    const files = await fs.readdir(contentDir);
    const posts = await Promise.all(
      files.filter((file) => file.endsWith(".md")).map(async (file) => {
        const source = await fs.readFile(path.join(contentDir, file), "utf8");
        return parsePost(source, file.replace(/\.md$/, ""));
      }),
    );
    return posts;
  } catch {
    return [] as Post[];
  }
}

async function blobPosts() {
  const { blobs } = await list({ prefix: "posts/" });
  const posts = await Promise.all(
    blobs.filter((blob) => blob.pathname.endsWith(".md")).map(async (blob) => {
      const source = await fetch(getDownloadUrl(blob.url)).then((response) => response.text());
      return parsePost(source, blob.pathname.replace(/^posts\//, "").replace(/\.md$/, ""));
    }),
  );
  return posts;
}

export async function getPosts(includeDrafts = false) {
  const posts = blobEnabled() ? await blobPosts() : await localPosts();
  return posts
    .filter((post) => includeDrafts || post.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string, includeDrafts = false) {
  const post = (await getPosts(includeDrafts)).find((item) => item.slug === slug);
  return post ?? null;
}

export async function savePost(input: PostInput) {
  const slug = slugify(input.slug || input.title);
  const source = serializePost(input);
  if (blobEnabled()) {
    // 草稿用 private 访问:URL 不可直接读取,只能通过服务端 getDownloadUrl 签名 URL 访问;
    // 正式文章保持 public,便于公开页面与 RSS 读取。
    const access = input.published ? "public" : "private";
    await put(`posts/${slug}.md`, source, { access, addRandomSuffix: false, allowOverwrite: true });
  } else {
    await fs.mkdir(contentDir, { recursive: true });
    await fs.writeFile(path.join(contentDir, `${slug}.md`), source, "utf8");
  }
  return slug;
}

export function allLocalSlugs() {
  return localPosts().then((posts) => posts.map((post) => ({ slug: post.slug })));
}
