export const siteName = "栖简 QIJIAN";
export const siteDescription = "在城市与代码之间，记录技术、阅读与生活的长期笔记。没有算法催促，只有值得反复回看的内容。";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
