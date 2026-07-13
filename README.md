# Junnan's Garden

一个适合长期写作的 Next.js 个人博客。文章以 Markdown 保存，公开阅读页为静态优先的 SEO 页面，写作入口支持从网页富文本粘贴及 `.md`、`.txt`、`.docx` 导入。

## 本地运行

```bash
npm install
npm run dev
```

开发时文章写入 `src/content/posts/`，每篇文章都包含 Front Matter：标题、摘要、日期、标签与发布状态。

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
