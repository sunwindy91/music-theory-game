# 乐理小达人

面向音乐初学者的浏览器端乐理学练小游戏，无需安装，打开即玩。

**协作者 / 新对话**：请先读 [docs/HANDOFF-AND-ROADMAP.md](docs/HANDOFF-AND-ROADMAP.md)（现状、路线图、开场模板）。

## 本地运行

**Windows 最简单：** 双击项目根目录的 `start-local.bat`，浏览器打开 **http://localhost:8080**（不要用 `file://` 直接打开 html）。

PowerShell 注意：旧版不支持 `&&`，请用分号：

```powershell
Set-Location C:\Users\23017\music-theory-game
python -m http.server 8080
```

若 `python` 不可用，可试 `py -m http.server 8080`。

浏览器访问 `http://localhost:8080`，页脚应显示 **v1.1**，首页有学习路径与 ✨ 灵气计数。

## 功能

### 📘 学习中心
- **学习路径**（v1.1）— 8 主节点 + 巩固/快练/节奏支线 + **灵气星图**（识谱 7 课完成后解锁）
- **乐理入门** — **5** 个单元（音名、音程、和弦、调号、拍号）
- **识谱教学** — **7** 课 · **⚡ 识谱快练**（见谱点音，无限刷题）
- **钢琴 / 吉他入门** — 交互引导课
- **灵气进度** — 完课/闯关/星图捡音符获得灵气，路径顶栏显示 ✨

### 🎯 练习中心
- **综合练习** — **120** 道选择题（含专题题）
- **听音识名** — Web Audio 合成音高，三档难度
- **符号翻翻乐** — 乐理符号配对记忆
- **演奏练习** — 钢琴（WebAudioFont 采样）/ 吉他 / 架子鼓；白键扩至 **K**（高八度 C）
- **节奏闯关** — 跟拍 **7** 关，关前「本关学什么」引导
- **错题本** — 间隔复习（SRS），巩固薄弱题
- **每日挑战** — 每天 10 题打卡，连续 streak

### 其他
- **灵气星图** — WASD/方向键移动 · 捡 C/D/E 听唱名 · 简单敌人 · 与 `SpiritProgressStore` 同步（页脚入口亦受识谱解锁约束）
- **分享卡片** — 练习完成后生成 PNG 分享图

## 开发工具（默认关闭）

| 工具 | 启用方式 |
|------|----------|
| 路径全解锁（测试） | `?dev=1` |
| UX 模拟测评 | `?sim=1` 或 `AppFeatures.uxSimulator = true` |
| 人设模拟 | `?persona=1` 或 `AppFeatures.personaSimulator = true` |

人设模拟支持三种用户类型（小白 / 乐感型 / 乐理大师），可预估错题本增长与薄弱题型。

## 部署

### 国内镜像 · Cloudflare Pages（推荐）

Gitee Pages 目前多数账号已暂停，请用 Cloudflare：

```powershell
Set-Location C:\Users\23017\music-theory-game
npx wrangler login
npx wrangler pages deploy . --project-name=music-theory-game --branch=master
```

成功后可访问：**https://music-theory-game-br5.pages.dev/**（以终端输出为准）

### 海外 · Vercel

项目已含 `vercel.json`，使用个人 `VERCEL_TOKEN` 自行部署即可。

### Gitee（代码备份）

代码已推送至 https://gitee.com/chunny/music-theory-game ；Pages 静态托管暂不可用，仅作版本备份。

## 反馈

如有问题或建议，欢迎通过 Issue 或邮件反馈（待补充联系方式）。

---

*乐理小达人 · demo · 仅供学习娱乐 · v1.1*
