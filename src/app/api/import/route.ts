import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "请选择文件。" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "文件不能超过 10 MB。" }, { status: 400 });
  const name = file.name.toLowerCase();
  if (name.endsWith(".md") || name.endsWith(".markdown") || name.endsWith(".txt")) return NextResponse.json({ content: await file.text() });
  if (!name.endsWith(".docx")) return NextResponse.json({ error: "目前支持 .md、.txt 和 .docx。" }, { status: 400 });
  const result = await mammoth.extractRawText({ buffer: Buffer.from(await file.arrayBuffer()) });
  return NextResponse.json({ content: result.value.trim() });
}
