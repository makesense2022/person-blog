"use client";

import { useState } from "react";
import Link from "next/link";
import { AtSign, Close, Menu } from "@/components/icons";

/** 栖简山形书签标志:墨绿圆底 + 象牙色山峦 + 陶土橙晨阳 */
function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 35 35" width="35" height="35">
        <circle cx="17.5" cy="17.5" r="17.5" fill="#18322b" />
        <path d="M7 25 13 13l4.5 7.5 2.5-4.5 8 9z" fill="#f7f4ec" />
        <circle cx="24" cy="9.5" r="2.4" fill="#d56b48" />
      </svg>
    </span>
  );
}

const links = [
  { href: "/", label: "文章" },
  { href: "/about", label: "关于" },
  { href: "/search", label: "搜索" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="栖简首页">
        <BrandMark />
        <span className="brand-word">栖简<span>/</span> QIJIAN</span>
      </Link>
      <nav className="desktop-nav" aria-label="主导航">
        {links.map((link) => (
          <Link key={link.href} className="nav-link" href={link.href}>{link.label}</Link>
        ))}
        <Link className="nav-link" href="/admin">写一篇</Link>
        <Link className="round-icon" href="/rss.xml" aria-label="订阅 RSS">
          <AtSign size={17} />
        </Link>
      </nav>
      <button className="mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "关闭导航" : "打开导航"} aria-expanded={menuOpen}>
        {menuOpen ? <Close size={23} /> : <Menu size={23} />}
      </button>
      {menuOpen && (
        <nav className="mobile-nav" aria-label="移动端主导航">
          {links.map((link) => (
            <Link key={link.href} className="nav-link" href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
          <Link className="nav-link" href="/admin" onClick={() => setMenuOpen(false)}>写一篇</Link>
          <Link className="nav-link" href="/rss.xml" onClick={() => setMenuOpen(false)}>订阅 RSS</Link>
        </nav>
      )}
    </header>
  );
}
