# VEEGN Blog

VEEGN 的个人技术博客，基于 [Hexo](https://hexo.io/) 框架构建，深度定制了 [NexT](https://theme-next.js.org/) 主题，并集成了自研的 SEO 自动化流程。

## 🚀 技术栈

- **框架**: Hexo v5.4.0
- **主题**: NexT (位于 `themes/next`)
- **部署**: GitHub Actions + GitHub Pages
- **SEO**: 自研 Node.js 脚本 (位于 `scripts/seo/`)
- **内容规范**: 强制 front-matter 元数据，AI 辅助生成摘要

## 🛠️ 常用指令

### 本地开发
```bash
# 安装依赖
npm install

# 启动本地服务器
npm run server

# 清理缓存并生成静态文件
npm run clean && npm run build
```

### 部署
项目配置了 GitHub Actions 自动化部署，推送到 `master` 分支后将自动触发：
1. 清理并构建静态 HTML。
2. 运行 SEO 优化脚本（描述注入、Sitemap 剪裁）。
3. 提交 IndexNow (Bing/Google)。
4. 推送到部署分支。

## 📂 目录结构

- `source/_posts/`: 文章源码 (Markdown)。
- `scripts/seo/`: SEO 增强脚本，包括 Sitemap 过滤和首页描述注入。
- `source/_data/`: NexT 主题的站点级配置文件（推荐修改处，而非直接修改主题目录）。
- `scaffolds/`: 文章和页面的模板。

## 🔍 SEO 维护规范

本项目遵循严格的 SEO 维护流程，详见 `.codex/skills/veegn-blog-maintenance/SKILL.md`：
1. **文章层级**: 必须包含 `description`、`abbrlink` 和 `tags`。
2. **生成层级**: `npm run build` 后会运行 `prune-sitemap.js` 移除无索引价值的页面。
3. **收录层级**: 每次部署后通过 `submit-indexnow.js` 主动推送到搜索引擎。

## 📜 许可证

本项目内容部分遵循 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议，代码部分遵循 [MIT](LICENSE) 协议。
