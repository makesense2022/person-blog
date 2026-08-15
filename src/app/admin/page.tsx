import type { Metadata } from "next";
import { PostEditor } from "@/components/post-editor";
import { ZhihuSync } from "@/components/zhihu-sync";

export const metadata: Metadata = { title: "写一篇", robots: { index: false, follow: false } };

export default function AdminPage() {
  // 知乎全量同步依赖本机 zhihu-cli,只在本地开发环境提供;生产(Nettlify 等平台)容器里没有该二进制。
  const showZhihuSync = process.env.NODE_ENV === "development";
  return (
    <main className="admin-page">
      <PostEditor />
      {showZhihuSync ? <ZhihuSync /> : null}
    </main>
  );
}
