import type { Metadata } from "next";
import { PostEditor } from "@/components/post-editor";

export const metadata: Metadata = { title: "写一篇", robots: { index: false, follow: false } };

export default function AdminPage() { return <main className="admin-page"><PostEditor /></main>; }
