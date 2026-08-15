"use client";

import { useMemo, useState } from "react";
import { PostCard, CATEGORIES, categoryOf } from "@/components/post-card";
import { ArrowUpRight } from "@/components/icons";
import type { Post } from "@/lib/posts";

const FILTERS = ["全部", ...CATEGORIES] as const;

export function PostGrid({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("全部");
  const visible = useMemo(
    () => (active === "全部" ? posts : posts.filter((post) => categoryOf(post) === active)),
    [posts, active],
  );
  return (
    <section className="articles-section" id="articles">
      <div className="articles-topline">
        <div>
          <p className="eyebrow"><span className="signal-dot" />文字目录</p>
          <h2>最近更新</h2>
        </div>
        <div className="filter-wrap" aria-label="文章分类筛选">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              className={`filter-button ${active === filter ? "is-active" : ""}`}
              onClick={() => setActive(filter)}
              aria-pressed={active === filter}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="article-grid">
        {visible.map((post, index) => <PostCard key={post.slug} post={post} number={String(index + 1).padStart(2, "0")} />)}
      </div>
      <div className="all-stories-row">
        <span>共 {visible.length} 篇文字</span>
        <a href="/search">找到某一段思考 <ArrowUpRight size={17} /></a>
      </div>
    </section>
  );
}
