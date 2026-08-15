// 类型壳: 实现在 zhihu-sync.mjs(纯 ESM),这里仅为 TypeScript 消费方提供类型。
// 该 .mjs 由 Node 直接运行或经 Next 打包,不做类型检查。

export type SyncDeclared = { articles: number; answers: number; pins: number };

export type SyncStats = {
  ok: boolean;
  articles: number;
  answers: number;
  pins: number;
  posts: number;
  removed: number;
  declared: SyncDeclared;
};

// @ts-ignore -- .mjs 无类型声明,实现与签名由本文件手工维护
import { syncZhihu as syncZhihuImpl } from "./zhihu-sync.mjs";

export const syncZhihu: () => Promise<SyncStats> = syncZhihuImpl;
