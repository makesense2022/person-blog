import type { Metadata } from "next";
import { SearchPosts } from "@/components/search-posts";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "搜索", description: "搜索个人博客中的文章与笔记。", alternates: { canonical: "/search" } };
export const revalidate = 300;

export default async function SearchPage() { return <SearchPosts posts={await getPosts()} />; }
