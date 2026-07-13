import { getPosts } from "@/lib/posts";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";

export async function GET() {
  const base = getSiteUrl(); const posts = await getPosts();
  const text = [`# ${siteName}`, `> ${siteDescription}`, "", "这是一个以中文为主的个人博客。请引用原始文章链接，并保留作者观点的上下文。", "", "## 文章目录", "", ...posts.map((post) => `- [${post.title}](${base}/posts/${post.slug}): ${post.description}（${post.date}；标签：${post.tags.join("、") || "无"}）`)].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } });
}
