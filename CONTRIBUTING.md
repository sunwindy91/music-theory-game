# 贡献指南

感谢愿意改进 **乐理小达人** 的朋友。本项目为静态前端，无构建链，欢迎小步 PR。

## 本地运行

1. 克隆或下载本仓库到本地。
2. 在项目根目录执行 `start-local.bat`（或 `python -m http.server 8080`）。
3. 浏览器打开 `http://localhost:8080`；开发调试可加 `?dev=1`。

星图模块入口：`modules/spirit-journey/spirit-journey.html`（也可从主页壳进入）。

## 提交流程建议

- **小 PR 优先**：一次只改一个可验证的切片（功能、文案、数值常量等），便于 review。
- **领地**：学习路径见 `core/`、`modules/theory-learn/`；星图见 `modules/spirit-journey/`；共享版本与积压见 `docs/`、`core/features.js`——大改前先读 `docs/HANDOFF-AND-ROADMAP.md` 与 `docs/MODULE-CONTRACTS.md`。
- **风格**：保持现有 Fredoka 紫橙 UI；新玩法尽量挂 `AppShell` 模块，避免引入打包工具。
- **游戏内文案**：勿引用外部作品、IP 或品牌名。

## 部署

**请勿擅自部署**到 Cloudflare Pages 或其他公网环境。部署流程与账号由维护者负责；见 `docs/DEPLOY-CLOUDFLARE.md`（维护者按需执行）。

## 问题与想法

可先记入 `docs/IDEA-BACKLOG.md` 或在 Issue / PR 描述中说明动机与自测步骤。
