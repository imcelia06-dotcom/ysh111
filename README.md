# 拾序 · V0.4 首页聚焦版

2026-10-30 更新：保留紫色，重新聚焦首页内容与排版。首屏讲清“存过的截图，需要时找得到”，下方依次展示三个产品优势、日常场景与可操作原型。需求说明和后续计划默认折叠，App 功能保持原样。

## 本地体验

- dist/index.html：新版产品首页与嵌入式原型。
- dist/原型.html：直接体验 App。
- dist/需求文档.md：完整需求文档。
- showcase.css 为首页样式，app-polish.css 为 App 样式；styles.css 为基础样式，三个文件都要保留。
- assets 内含项目图标及虚构示例插画，无远程图片或字体依赖。

首页点击“体验原型”，再选“用示例开始”；其他快捷体验在“更多体验”中。16 张示例进入待确认，其中 15 张有人工预设建议。个人图片仅在本页处理，可手动归类；未接入 AI / OCR，刷新会清空本次内容。

## 更新原 GitHub 仓库

1. 解压本代码包，进入原仓库生产分支的 dist 目录。
2. 上传本包 dist 内全部文件与 assets 文件夹，覆盖旧文件。共 7 个顶层文件和 assets 内 3 个 SVG，合计 10 个文件。
3. 保留 assets 层级，不要上传 ZIP 本身，也不要形成 dist/dist。
4. 提交更新，可填写“聚焦拾序首页内容与产品优势”。
5. 原 Cloudflare Pages 项目若已连接该分支并开启自动部署，等待本次部署完成。
6. 刷新线上页面，检查新版首屏、手机目录、示例体验、折叠需求和文档下载。

本次只更新本地文件与代码包，未替你提交 GitHub 或发布线上。

## 部署配置

| 配置 | 值 |
| --- | --- |
| Production branch | 原生产分支，例如 main |
| Framework preset | None |
| Root directory | 留空 |
| Build command | exit 0 |
| Build output directory | dist |
| Environment variables | 留空，必需变量为 0 |

配置与之前相同，无需安装依赖。

设计参考：[mymind](https://mymind.com/)、[Cosmos](https://www.cosmos.so/)、[Milanote](https://milanote.com/)。参考信息层级与展示方式，界面示意和素材来自本项目。