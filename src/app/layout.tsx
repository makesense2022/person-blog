import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: siteName, template: `%s · ${siteName}` },
  description: siteDescription,
  alternates: { types: { "application/rss+xml": `${getSiteUrl()}/rss.xml` } },
  openGraph: { type: "website", locale: "zh_CN", siteName, title: siteName, description: siteDescription },
  twitter: { card: "summary_large_image", title: siteName, description: siteDescription },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><div className="site-shell"><SiteHeader />{children}<footer>用 Markdown 写作，持续地留下思考。 <a href="/rss.xml">RSS</a></footer></div></body></html>;
}
