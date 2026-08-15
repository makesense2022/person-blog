"use client";

import { useEffect, useState } from "react";

type SyncStats = { zhihuPosts: number; pins: number; lastSync: string | null };
type SyncResult = {
  ok: boolean;
  articles: number;
  answers: number;
  pins: number;
  posts: number;
  removed: number;
  declared: { articles: number; answers: number; pins: number };
};

export function ZhihuSync() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState<SyncStats | null>(null);

  const refresh = async () => {
    try {
      const response = await fetch("/api/zhihu", { headers: { "x-blog-admin-password": password } });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || "读取状态失败。");
        return;
      }
      setStats(data);
      setStatus("");
    } catch {
      setStatus("读取状态失败，请确认开发服务器已启动。");
    }
  };

  // 首次进入页面时读取当前同步状态
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = async () => {
    setBusy(true);
    setStatus("正在全量同步知乎创作（翻页调用 zhihu-cli，约 10 次请求，请稍候）…");
    try {
      const response = await fetch("/api/zhihu", { method: "POST", headers: { "x-blog-admin-password": password } });
      const data = await response.json();
      setBusy(false);
      if (!response.ok) {
        setStatus(data.error || "同步失败。");
        return;
      }
      setStats(data);
      const syncResult = data.sync as SyncResult;
      const declared = syncResult.declared;
      const shortfall = declared.articles - syncResult.articles + declared.answers - syncResult.answers + declared.pins - syncResult.pins;
      setStatus(
        `同步完成：文章 ${syncResult.articles} 篇、回答 ${syncResult.answers} 篇（写入 ${syncResult.posts} 个文件，清理旧文件 ${syncResult.removed} 个）、想法 ${syncResult.pins} 条。` +
        (shortfall > 0 ? `知乎接口声明总数更多（文章 ${declared.articles}、回答 ${declared.answers}、想法 ${declared.pins}），差 ${shortfall} 条为已删除或隐藏的内容，接口不再返回。` : ""),
      );
    } catch {
      setBusy(false);
      setStatus("同步失败，请确认开发服务器已启动。");
    }
  };

  return (
    <section className="zhihu-sync">
      <p className="eyebrow"><span className="signal-dot" />ZHIHU SYNC</p>
      <h2>全量同步知乎创作</h2>
      <p className="zhihu-sync-intro">
        页面通过 <code>/api/zhihu</code> 调用本机 zhihu-cli，翻页拉取<b>全部</b>文章与回答写入博客，并把全部想法写入笔记流（首页只展示最新 8 条）。
        知乎接口只返回标题与摘要，正文需回原文阅读。
      </p>
      <div className="zhihu-sync-meta">
        <span>已同步文章/回答：{stats ? `${stats.zhihuPosts} 篇` : "…"}</span>
        <span>想法：{stats ? `${stats.pins} 条` : "…"}</span>
        <span>{stats?.lastSync ? `上次同步：${new Date(stats.lastSync).toLocaleString("zh-CN")}` : "尚未同步过"}</span>
      </div>
      <div className="zhihu-sync-actions">
        <label className="password">
          管理员密码 <span className="hint">本地开发可留空</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="off" />
        </label>
        <button onClick={sync} disabled={busy}>{busy ? "同步中，请勿关闭页面…" : "立即全量同步"}</button>
        <button className="secondary" onClick={refresh} disabled={busy}>刷新状态</button>
      </div>
      <p className="editor-status" role="status">{status}</p>
    </section>
  );
}
