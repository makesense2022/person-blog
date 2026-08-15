import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ChevronDown } from "@/components/icons";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";

/** 自托管字体:Google Fonts 在境内不可达,字体文件已从 fontsource CDN 下载到 src/app/fonts/ */
const manrope = localFont({
  src: [
    { path: "./fonts/manrope-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/manrope-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/manrope-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/manrope-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/manrope-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});
const dmSerif = localFont({
  src: [
    { path: "./fonts/dm-serif-display-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-serif-display-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: siteName, template: `%s · ${siteName}` },
  description: siteDescription,
  alternates: { types: { "application/rss+xml": `${getSiteUrl()}/rss.xml` } },
  openGraph: { type: "website", locale: "zh_CN", siteName, title: siteName, description: siteDescription },
  twitter: { card: "summary_large_image", title: siteName, description: siteDescription },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${manrope.variable} ${dmSerif.variable}`}>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <span>© {new Date().getFullYear()} 栖简 QIJIAN</span>
          <span>在缓慢里，保持清醒。</span>
          <a href="/rss.xml">订阅 RSS <ChevronDown size={16} /></a>
        </footer>
      </body>
    </html>
  );
}
