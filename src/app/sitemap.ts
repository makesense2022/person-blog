import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const posts = await getPosts();
  return [{ url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }, { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 }, ...posts.map((post) => ({ url: `${base}/posts/${post.slug}`, lastModified: new Date(post.date), changeFrequency: "monthly" as const, priority: 0.8 }))];
}
