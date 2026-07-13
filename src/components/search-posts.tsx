"use client";

import { useMemo, useState } from "react";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/lib/posts";

export function SearchPosts({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const matched = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) => [post.title, post.description, post.tags.join(" "), post.content].join(" ").toLowerCase().includes(term));
  }, [posts, query]);
  return <main className="search-page"><p className="eyebrow">SEARCH THE GARDEN</p><h1>找回一段思考</h1><label className="search-input"><span aria-hidden>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、标签或正文" /></label><p className="search-result-count">{query ? `找到 ${matched.length} 篇相关文章` : `共 ${posts.length} 篇公开文章`}</p><div className="post-list">{matched.map((post) => <PostCard key={post.slug} post={post} />)}{!matched.length && <p className="empty">没有匹配结果。换个关键词试试？</p>}</div></main>;
}
