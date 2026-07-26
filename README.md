# 乐理小达人

**v1.7.36** · 一个文科生用 AI 从零搭的乐理学练游戏——学路径教你乐理，星图世界边打怪边练和弦。

## 在线试玩

https://music-theory-game-br5.pages.dev/

这个项目不仅是游戏——它背后运行着一套 A2A（Agent-to-Agent）协作协议：Codex 审方向、Cursor 写代码、Copilot 写文案，三个 Agent 在 Markdown 文件 + 决策日志的协议下协作，不互踩、不越界。协议的完整演化过程记录在 [a2a-starter-kit](https://github.com/sunwindy91/a2a-starter-kit) 中。

## 功能概览

- **学路径** — 音名 / 音程 / 和弦 / 调号 / 拍号 → 识谱与节奏；零基础三屏引导，完课攒灵气
- **玩** — 练习中心随时刷：综合题、听音识名、符号翻翻乐、错题本、每日挑战
- **星图** — 全屏灵气世界：横屏摇杆开火，移动探索、捡音符听唱名、小怪与 Boss；识谱通关后解锁
- **演奏** — 钢琴 / 吉他扫弦 / 架子鼓交互练习（Web Audio）

## 反馈

试玩后欢迎填问卷（约 2 分钟）：

- 中文：https://wj.qq.com/s2/27402422/a11b/
- English：https://wj.qq.com/s2/27402528/b2ad/

也可从站内页脚「试玩反馈」或 [survey.html](survey.html) 进入（中 | EN）。

## 技术栈

Vanilla JS · 零构建链 · 静态站部署于 Cloudflare Pages

## 本地运行

**Windows：** 双击根目录 `start-local.bat`，浏览器打开 http://localhost:8080（勿用 `file://`）。

或手动：

```powershell
python -m http.server 8080
```

（若无 `python`，可试 `py -m http.server 8080`。）页脚显示当前 `APP_VERSION`（见 `core/features.js`）。开发调试可加 `?dev=1` 解锁整条学习路径。

## 许可

[MIT](LICENSE)
