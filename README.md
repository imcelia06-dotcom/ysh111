# 拾序 · 截图自动整理助手

用于 GitHub → Cloudflare Pages 的静态展示网页代码包。根据已完成的 Demo 整理，保留原有页面与交互。

## 快速部署

1. 解压代码包。
2. 在 GitHub 新建仓库，例如 `shixu-demo`。
3. 把解压后的**文件和 `dist` 文件夹**上传到仓库根目录。不要只上传 ZIP；不要额外套一层 `拾序-Cloudflare-Pages` 文件夹。
4. 提交到 `main` 分支；如果你的默认分支不同，后续选择实际分支。
5. 在 Cloudflare 控制台进入 **Workers & Pages → Create application → Pages → Connect to Git / Import an existing Git repository**，连接该 GitHub 仓库。
6. 按下表填写并部署。页面入口名称可能随控制台界面调整，选择 **Pages 的 Git 集成**即可。

| 配置项 | 填写值 |
| --- | --- |
| Project name / 项目名称 | 自定，例如 `shixu-demo`；以控制台可用名称为准 |
| Production branch / 生产分支 | `main`，或实际上传代码的分支 |
| Framework preset / 框架预设 | `None` |
| Root directory / 根目录 | 留空，使用仓库根目录 |
| Build command / 构建命令 | `exit 0` |
| Build output directory / 构建输出目录 | `dist` |
| Environment variables / 环境变量 | **留空，不需要添加任何变量** |

部署成功后，使用 Cloudflare 返回的 `https://你的项目名.pages.dev` 地址访问。后续向生产分支提交修改，Git 集成会触发更新。

本包没有构建依赖，`dist` 本身就是部署产物；不需要运行 `npm install`、`npm run build`，也不需要配置部署命令或 API Token。若控制台强制要求填写 Workers 的部署命令，请返回 Pages 的创建入口。

## 仓库结构

上传后应当看到以下结构：

```text
仓库根目录/
├── README.md
├── 部署配置与变量表.md
├── 验证说明.md
├── .gitignore
└── dist/
    ├── index.html       # 展示页结构
    ├── styles.css       # 响应式样式
    ├── app.js           # 原型交互逻辑与虚构素材
    └── 需求文档.md      # 网页内的 PRD 下载文件
```

四个 `dist` 文件与原 Demo 保持一致。代码包不包含原 Sites 的站点标识、Git 历史或账号凭据。

## 环境变量

**当前版本必需环境变量数量为 0。** Production 和 Preview 的环境变量列表均可留空。

此 Demo 不请求模型接口、后端 API 或数据库。Cloudflare 控制台中随意新增变量不会自动让浏览器读取它，也不会启用 AI 功能。完整说明见 [部署配置与变量表](./部署配置与变量表.md)。

## 本地浏览和修改

- 双击 `dist/index.html`，用普通浏览器打开即可。
- 修改文案与结构：编辑 `dist/index.html`。
- 修改颜色、排版与响应式布局：编辑 `dist/styles.css`。
- 修改虚构截图、需求条目与交互：编辑 `dist/app.js`。
- 更新完整需求文档：编辑 `dist/需求文档.md`。
- 同步网页需求条目和 PRD 时，请保持 FR-01 至 FR-08 编号一致。

需要本地 HTTP 预览时，可在仓库目录运行以下命令（需要本机已有 Python）：

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

随后访问 `http://127.0.0.1:4173/`，关闭时在终端按 Ctrl+C。

## 功能范围

- 产品概览、行为画像、用户旅程、需求与验收、验证规划。
- 8 张虚构素材的导入、分组、选择、批量保留、模拟删除、详情改类、批量改类、保留库搜索、撤销最近一次删留和重置。
- 演示状态仅保存在当前页面内，刷新即重置。
- 真实相册、OCR、AI、系统删除与恢复、账号登录和跨设备保存尚未接入。

## 部署后检查

1. 首页、侧边/移动导航、样式和中文内容正常。
2. 点击“体验交互原型”，导入 8 张示例。
3. 分组全选后保留，检查待整理与保留库数量。
4. 模拟删除前取消，确认状态未改变；再确认并测试撤销。
5. 修改分类、搜索保留内容，检查空结果和清空条件。
6. 下载完整 PRD，确认中文文件可正常获取。
7. 在手机浏览器打开，检查导航与原型布局。

## 常见问题

**首页 404 或输出目录不存在：** 检查 GitHub 根目录下是否直接存在 `dist/index.html`，输出目录是否填 `dist`。如果多套了一层文件夹，优先把该层中的内容移到仓库根目录。

**样式或交互缺失：** 确认 `styles.css`、`app.js` 与 `index.html` 位于同一个 `dist` 目录，并已全部上传。

**文档下载失败：** 确认 `dist/需求文档.md` 存在且文件名未改变。

**找不到 `package.json`：** 本项目是直接部署的静态文件，按表中参数配置即可。

## 官方参考

部署参数按 2026-10-25 查阅的 Cloudflare 官方文档整理：

- [Static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
