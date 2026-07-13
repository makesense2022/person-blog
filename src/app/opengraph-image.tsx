import { ImageResponse } from "next/og";
import { siteName } from "@/lib/site";

export const runtime = "edge";
export const alt = `${siteName} — 个人知识花园`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px", background: "#f4f1ea", color: "#20251f" }}><div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#6e7657" }}>JUNNAN&apos;S GARDEN</div><div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", fontSize: 82, fontWeight: 700, letterSpacing: -4 }}>把正在生长的思考</div><div style={{ display: "flex", fontSize: 82, fontWeight: 700, fontStyle: "italic", color: "#8e4c30" }}>留在这里。</div></div><div style={{ display: "flex", fontSize: 22, color: "#5c645b" }}>Personal knowledge base · Markdown · SEO ready</div></div>, size);
}
