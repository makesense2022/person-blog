# 栖简 QIJIAN

一个适合长期写作的 Next.js 个人博客，采用「山间书桌」编辑主义设计。文章以 Markdown 保存，公开阅读页为静态优先的 SEO 页面，写作入口支持从网页富文本粘贴及 `.md`、`.txt`、`.docx` 导入。

## 本地运行

```bash
npm install
npm run dev
```

开发时文章写入 `src/content/posts/`，每篇文章都包含 Front Matter：标题、摘要、日期、标签、发布状态（来自知乎的文章另有 `externalUrl` 指向原文）。

## 同步知乎内容

首页文章与笔记流可以从知乎拉取自己的近半年创作：

```bash
node scripts/sync-zhihu.mjs
```

前置条件：本机已安装并授权 [zhihu-cli](https://github.com/NNNNzs/zhihu-cli)（或设置 `ZHIHU_CLI` 环境变量指向其二进制）。脚本会：

- 分页拉取 `me contents`，筛选最近半年内的创作；
- 将「专栏 + 回答」按内容去重（专栏优先），生成为 `src/content/posts/zhihu-*.md`，`externalUrl` 指向知乎原文；
- 将「想法」写入 `src/content/pins.json`，渲染为首页笔记流。

字体为自托管（`src/app/fonts/`），不依赖 Google Fonts，境内可正常加载。

## 部署到 Vercel

1. 将此目录推送至 GitHub，并在 Vercel 导入项目。
2. 在 Vercel Storage 创建并连接一个 Blob store。
3. 在 Vercel 项目环境变量中设置：
   - `BLOB_READ_WRITE_TOKEN`：由已连接的 Blob store 提供，用于跨部署持久保存文章。
   - `BLOG_ADMIN_PASSWORD`：一个长随机密码，用于保护文章写入 API。
   - `NEXT_PUBLIC_SITE_URL`：正式地址，例如 `https://blog.example.com`。
4. 重新部署。之后从 `/admin` 写入的文章会存到 Blob，而非部署文件系统。

## SEO 与 AI 检索

- 每篇文章输出 canonical URL、Open Graph、Twitter card 与 `BlogPosting` JSON-LD。
- 提供 `/sitemap.xml`、`/robots.txt`、`/rss.xml`，并禁止搜索引擎收录 `/admin` 与 API。
- `/llms.txt` 生成一份包含文章标题、摘要、日期、标签和原文链接的机器可读目录，方便 AI 检索工具发现内容。

`llms.txt` 和结构化数据能提高内容被机器理解与发现的机会，但不能保证任一搜索引擎或 AI 产品一定收录；提交站点地图到 Google Search Console / Bing Webmaster Tools 仍是推荐步骤。
