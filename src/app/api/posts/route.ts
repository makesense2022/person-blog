import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { savePost } from "@/lib/posts";

function isAuthorized(request: NextRequest) {
  const expected = process.env.BLOG_ADMIN_PASSWORD;
  // Local first-run convenience. Vercel deployments must set a password.
  return process.env.NODE_ENV !== "production" && !expected || request.headers.get("x-blog-admin-password") === expected;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "未授权：请输入管理员密码。" }, { status: 401 });
  try {
    const data = await request.json();
    if (!data.title?.trim() || !data.content?.trim()) return NextResponse.json({ error: "标题和正文不能为空。" }, { status: 400 });
    const slug = await savePost({ title: data.title.trim(), description: data.description?.trim() || data.content.slice(0, 150), date: data.date || new Date().toISOString().slice(0, 10), tags: Array.isArray(data.tags) ? data.tags : [], published: Boolean(data.published), content: data.content, slug: data.slug });
    revalidatePath("/"); revalidatePath("/sitemap.xml"); revalidatePath(`/posts/${slug}`);
    return NextResponse.json({ slug, url: `/posts/${slug}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "保存失败，请检查 Vercel Blob 配置。" }, { status: 500 });
  }
}
