#!/usr/bin/env node
/**
 * 全量同步知乎创作到本地博客(CLI 入口,逻辑见 src/lib/zhihu-sync.mjs)。
 *
 * 用法:
 *   node scripts/sync-zhihu.mjs
 *   或从页面触发:POST /api/zhihu(见 src/app/api/zhihu/route.ts)
 *
 * 依赖: 已安装并授权 zhihu-cli(见 ~/.codex/skills/zhihu),或通过 ZHIHU_CLI 环境变量指向二进制。
 */
import { syncZhihu } from "../src/lib/zhihu-sync.mjs";

syncZhihu().catch((error) => {
  console.error(`同步失败: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
