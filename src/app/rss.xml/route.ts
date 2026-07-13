import { getPosts } from "@/lib/posts";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] || char);

export async function GET() {
  const base = getSiteUrl(); const posts = await getPosts();
  const items = posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${base}/posts/${post.slug}</link><guid>${base}/posts/${post.slug}</guid><description>${escapeXml(post.description)}</description><pubDate>${new Date(post.date).toUTCString()}</pubDate></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteName)}</title><link>${base}</link><description>${escapeXml(siteDescription)}</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } });
}
