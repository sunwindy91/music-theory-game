# 乐理小达人 · 项目交接与路线图

> 供新 Cursor 对话 / 协作者参考。最后更新：**v1.0 完成后**（2026-07）。  
> 仓库路径：`C:\Users\23017\music-theory-game`

---

## 1. 项目概览

**乐理小达人** — 浏览器端乐理学练小游戏，静态站，无构建步骤。

| 环境 | 地址 |
|------|------|
| 国内 Cloudflare | https://music-theory-game-br5.pages.dev/ |
| 海外 Vercel | https://music-theory-game.vercel.app/ |
| 代码备份 Gitee | https://gitee.com/chunny/music-theory-game |

**本地运行：** 双击 `start-local.bat`，或 `python -m http.server 8080` → http://localhost:8080  
**部署：**

```powershell
Set-Location C:\Users\23017\music-theory-game
npx wrangler pages deploy . --project-name=music-theory-game --branch=master
```

**版本号：** `core/features.js` → `APP_VERSION`（当前 **v1.0**）

**用户偏好：**
- 重大功能：先短计划 → 用户确认 → 再写代码
- 里程碑时说明改了什么、怎么测
- **不要擅自 git commit**（除非用户明确要求）
- 问卷 / 后端：**放最后**
- 路径 **硬解锁** 用户认可（测试慢但测得全）；可选后续加 `?dev=1` 预览

---

## 2. 当前产品形态（v1.0）

### 架构：学 + 练 双轨

```
首页
├── 📘 学习中心 · 学习路径（纵向节点，硬解锁）
├── 💡 学练推荐（继续学 / 专题巩固）
└── 🎯 练习中心（不受路径限制，随时可练）
    ├── 综合练习 / 听音 / 符号 / 演奏 / 节奏
    └── 复习巩固：错题本、每日挑战

页脚：✨ 灵气星图
```

### 学习路径节点（`core/learning-path.js`）

顺序：音名 → 巩固 → 音程 → 巩固 → 和弦 → 巩固 → **调号** → 巩固 → **拍号** → 巩固 → 钢琴 → 吉他 → 识谱(7课) → ⚡识谱快练 → 🥁节奏支线 → ✨灵气星图

| 规则 | 说明 |
|------|------|
| 主课/识谱 hub | 上一主节点完成后解锁下一主节点 |
| 🎯 巩固 | 对应单元完成后解锁 |
| ⚡ 快练 | 识谱 7 课全部完成后解锁 |
| 🥁 节奏支线 | 拍号单元完成后解锁 |
| ✨ 灵气星图 | **识谱 7 课全部完成**后解锁 |
| 进度显示 | `x/8 完成 · ✨ 灵气/30` |

**练习中心不锁：** 120 题综合练习、听音等随时可用。

### 内容量

| 模块 | 数量 |
|------|------|
| 乐理单元 | 5（音名、音程、和弦、调号、拍号） |
| 识谱课 | 7（含上加线、综合复习） |
| 识谱快练 | 无限刷题（C4–G5 自然音） |
| 综合题库 | **120** 道（`core/quiz-bank.js`，含 `topicId`） |
| 节奏关 | 7（每关关前「本关学什么」引导屏） |
| 钢琴/吉他入门 | 各 1 课 × 4 MCQ |

### 灵气进度（`core/spirit-progress.js`）

- localStorage：`mtg_spirit_progress_v1`
- 完课/闯关得灵气（理论课 4、识谱课 4、乐器课 3、节奏通关 5、快练连对 5 题 +2…）
- 目标 30（与旧 iframe 星图一致）
- **尚未**与星图玩法深度联动（仅数字 + 路径展示）

### 分享卡片

- 练习/每日/节奏/识谱/乐理结算后可选生成 PNG（`modules/share-card/`）
- 国内链接：`AppUrls.domestic` in `core/features.js`

---

## 3. 关键文件索引

```
index.html              主壳、练习中心、AppShell 路由
core/
  features.js           功能开关、版本、AppUrls
  lesson-engine.js      MCQ 课程引擎
  lesson-engine.css       引擎共用样式（须在 head 预加载）
  learning-path.js      学习路径 v1.0
  learning-path.css
  learn-practice-bridge.js  topicId ↔ 题库、推荐
  spirit-progress.js      灵气累计
  quiz-bank.js            120 题
modules/
  theory-learn/         乐理 5 单元（theory-data.js）
  sight-reading/        识谱 7 课 + 快练（staff-renderer.js）
  instrument-intro/     钢琴/吉他入门
  rhythm-game/          7 关 + 引导屏
  perform/              钢琴/吉他/鼓（振荡器，弹题挑战）
  spirit-journey/       灵气星图 iframe（旧版，待 v1.1 改造）
  wrong-book/ daily-challenge/ share-card/ symbol-match/ ...
start-local.bat         Windows 本地启动
docs/DEPLOY-CLOUDFLARE.md
```

### 功能开关（`AppFeatures`）

已开：quiz, audio, symbol, perform, spirit, wrongBook, dailyChallenge, shareCard, rhythmGame, sightReading, theoryLearn, instrumentIntro  
关闭：uxSimulator, personaSimulator, multiTrack, midiInput

---

## 4. 已解决的重要问题

| 问题 | 处理 |
|------|------|
| 吉他入门 UI 闪 1–2 秒裸卡片 | `lesson-engine.css` 等 CSS **head 预加载**，勿仅 JS 动态注入 |
| PowerShell `&&` 报错 | 用 `;` 或 `start-local.bat` |
| 线上仍是旧版 | 需 `wrangler pages deploy` |
| 名称 | 统一 **灵气星图**（非「灵光物语」） |

---

## 5. 用户反馈与产品方向

| 反馈 | 对策 |
|------|------|
| 题目太少 | 已扩到 120；后续继续按 topic 扩 |
| 乐理讲不清 | 引导式单元 + 路径；后续加进阶单元 |
| 家人：见谱点音 | ✅ 识谱快练 |
| 像多邻国 | ✅ 学习路径；避免抄 Duo 视觉/吉祥物 |
| 路径解锁 | ✅ 硬解锁，用户认可 |

---

## 6. 下一里程碑：v1.1（按顺序执行）

用户已确认 **「按顺序来」**。新对话请从此开始。

### P0 · 灵气星图 MVP（优先）

**目标：** 替换/升级潦草 iframe，与学习路径灵气打通。

| 项 | 说明 |
|----|------|
| 操作 | WASD 或方向键移动（鼠标可选） |
| 核心玩法 | 移动中捡音符「子弹」C/D/E…，捡起时播放唱名/音高 |
| 敌人 | 简单星系怪兽（初期 1–2 种即可；像素资源可后续） |
| 模式 | **先单人**；双人联机 v1.2+ |
| 进度 | 与 `SpiritProgressStore` 互通；路径解锁规则不变 |
| 主要改动 | `modules/spirit-journey/spirit-journey.html` + 壳 `spirit-journey.js` |

**不做进 v1.1：** 交火复杂化、双人、完整 roguelike。

### P1 · 演奏听感

| 项 | 说明 |
|----|------|
| WebAudioFont | 钢琴真实采样，懒加载 |
| 宽键盘 | v0.6 欠账：略扩 / 双八度横向滚动（择一或分步） |
| 文件 | `modules/perform/perform.js` |

### P2 · 测试便利（可选）

- URL `?dev=1` 或开关：**路径全解锁**，方便 QA，不影响正式用户
- 实现位置：`core/learning-path.js` 或 `features.js`

**v1.1 完成后：** 版本号 → `v1.1`，更新 README，提醒用户 deploy。

---

## 7. 中期路线图（v1.2 – v2.0）

### v1.2 · 星图 + 演奏深化

- 星图：像素怪兽 2–3 种、简单交火、得分与灵气挂钩
- 吉他：变调、和弦窗格优化
- 鼓/贝斯：采样升级、更真实交互
- 钢琴入门 **课内嵌键盘**（复用 perform，不必等完整 DAW）
- 路径：节奏/演奏可作明确支线节点
- 识谱：+课、低音谱号（需扩展 `staff-renderer.js` 低音谱表）
- 乐理：+单元（调式入门、和弦转位等）
- 题库 → 150+

### v2.0 · 创作向（大项，分步）

- 段落 **叠录**：钢琴 4 小节 → 再录鼓 → localStorage 回放
- 简易 **跟弹**：JSON / MIDI 谱面导入（自动挡吉他雏形）
- 星图 **星区** 对应学习模块（音名区、识谱区…）
- 灵气星图 2.0：完课点亮星区，而非纯独立小游戏

**明确不做一步跳到：** 完整 DAW、导入任意歌曲全自动和弦、双人实时对战。

---

## 8. 长期愿景（v2.5+，记录创意勿急于实现）

用户曾提出的 **灵感池**（需分期、需把关）：

| 创意 | 备注 |
|------|------|
| 星图射击 / 捡子弹 / 唱名 | → v1.1 MVP 已纳入 |
| 双人模式 | v1.2+ |
| 像素风怪兽 | 说有像素资源可用，待整理路径 |
| 多轨编曲 / 音轨合成 | 类迷你 GarageBand；从叠录渐进 |
| 导入歌曲键盘跟唱 | 需 MIDI/和弦推断，工作量大 |
| 贝斯声部 | perform 扩展第三乐器线 |
| 架子鼓真实场景 + 动作 | 采样 + 动画 |
| MIDI 输入 | `AppFeatures.midiInput` 已预留 |
| 问卷 + 后端 | **最后**；Cloudflare Workers + D1 或 Supabase；匿名事件 + 满意度 |

### 演奏升级 ladder（供参考）

```
振荡器钢琴/吉他/鼓（现状）
  → WebAudioFont + 宽键盘（v1.1）
  → 吉他变调 + 鼓/贝斯采样（v1.2）
  → 段落叠录（v2.0）
  → 跟弹 JSON/MIDI（v2.0）
  → 迷你多轨 mute/solo（v2.5+）
```

---

## 9. 多邻国借鉴原则（法务/产品）

**可借鉴：** 技能路径、小单元、即时反馈、streak/XP  metaphor、错后复习  
**避免：** Duo 猫头鹰、品牌色 1:1、专有动画台词  
**自有：** Fredoka 紫橙主题、**灵气星图**、中文乐理语境

---

## 10. 新对话开工模板（复制粘贴）

```
项目：C:\Users\23017\music-theory-game
请先读 docs/HANDOFF-ROADMAP.md

当前 v1.0 已完成。请按 v1.1 顺序实现：
P0 灵气星图 MVP（WASD、捡音符、唱名发音、简单敌人、SpiritProgressStore）
P1 WebAudioFont 钢琴 + 键盘略扩
P2 可选 ?dev=1 路径全解锁

路径规则不变。不要擅自 git commit。完成后说明如何测试与 deploy。
```

**建议 @ 文件：** `docs/HANDOFF-ROADMAP.md`、`core/learning-path.js`、`core/spirit-progress.js`、`modules/spirit-journey/`

---

## 11. 版本历史摘要

| 版本 | 要点 |
|------|------|
| v0.5 | 识谱/节奏内容扩容 |
| v0.6 | 演奏弹题、八度 2–6 |
| v0.7 | 学习中心、LessonEngine、3 乐理单元、85+ 题 |
| v0.8 | 学练 topicId 联动、钢琴/吉他课、97 题 |
| v0.9 | 学习路径 UI、CSS 预加载修复 |
| **v1.0** | +调号/拍号单元、7 识谱课、快练、7 节奏关、120 题、灵气进度、路径 8 节点 |
| **v1.1** | 待做：星图 MVP → 演奏音色 → dev 预览 |

---

## 12. 测试检查清单（v1.0 回归）

- [ ] 页脚 **v1.0**，路径 **0/8 · ✨ 0/30**
- [ ] 仅「音名与谱表」可继续，后续 🔒
- [ ] 练习中心综合练习无需解锁
- [ ] 识谱 → ⚡ 识谱快练
- [ ] 节奏 → 引导屏 → 闯关
- [ ] 吉他/钢琴入门无 CSS 闪烁
- [ ] 完课后灵气增加、路径 ✨ 更新

---

*文档维护：每完成一个 x.y 版本，更新第 6–7 节与第 11 节。*
