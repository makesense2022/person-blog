export const siteName = "Junnan's Garden";
export const siteDescription = "一个记录学习、构建与思考的个人博客。";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
