import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="返回首页">
        <span className="wordmark-mark">J</span>
        <span>Junnan&apos;s Garden</span>
      </Link>
      <nav aria-label="主导航">
        <Link href="/">文章</Link>
        <Link href="/about">关于</Link>
        <Link className="nav-search" href="/search">搜索</Link>
        <Link className="write-link" href="/admin">写一篇</Link>
      </nav>
    </header>
  );
}
