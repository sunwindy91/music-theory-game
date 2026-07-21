---
name: music-theory-game
description: >-
  Develop and iterate 乐理小达人 — dual product (learn path + playable spirit world).
  Use for music-theory-game, 乐理小达人, LessonEngine, spirit map combat, HANDOFF,
  idea backlog, open-source handoff, questionnaire/PM portfolio mid-term, or
  flywheel/skill crystallization with this user.
---

# 乐理小达人 · 项目 Skill（含成长飞轮）

## 项目位置

| 项 | 路径 |
|----|------|
| **根目录** | `C:\Users\23017\music-theory-game` |
| **交接与路线图** | `docs/HANDOFF-AND-ROADMAP.md` |
| **想法积压** | `docs/IDEA-BACKLOG.md` |
| **部署** | `docs/DEPLOY-CLOUDFLARE.md` |
| **本地启动** | `start-local.bat` → `http://localhost:8080`（可用 `?dev=1`） |
| **版本** | `core/features.js` → `APP_VERSION` |
| **国内站** | https://music-theory-game-br5.pages.dev/ |
| **代码备份** | Gitee；可同步 GitHub 做开源社区 |

## 产品一句话（重要）

**故意是「两个游戏合成一个壳」**：学习路径（教）+ 可玩世界（星图/演奏等）。  
不是做歪了——用户要「能学会，也能玩儿」，后续还可挂更多玩法模块。  
Agent 不要用「别做成两个游戏」劝退；应帮用户 **分期交付、接口清晰、不烂尾**。

## 三层时间尺度（用户人生/求职对齐）

| 层 | 目标 | Agent 默认动作 |
|----|------|----------------|
| **当下** | 游戏可玩可学、星图战斗打磨 | 短计划 → 确认 → 小步代码；测法+版本号 |
| **中期** | 问卷/访谈 → 优化；沉淀为 DeepSeek harness / 产品经理求职展示 | 问卷方案、信息架构、案例叙事；**仍先计划后实现** |
| **长远** | Skill/Agent 飞轮、多 Agent、甚至自训模型；融入学习工作生活 | 把稳定流程写成 Skill；工具只在有明确痛点时引入 |

用户当次消息可覆盖优先级。

## 协作铁律

1. **大功能**：短计划 → 用户确认 → 再写代码（总架构师模式下：节点确认即可，不必每小步都问）  
2. **不要 git commit / push**，除非用户明确要求  
3. **问卷/后端**：不再「永远最后」——属中期；但 **仍须用户点名再开做**  
4. **最小 diff**：Fredoka 紫橙；无构建链；新玩法用 `AppShell` + 模块挂载  
5. **里程碑结束**：改了什么 +（用户要求测时）如何测 +（用户要求时）部署命令  
6. **新想法**：先记入 `docs/IDEA-BACKLOG.md`，再排期；不擅自开大坑  
7. **部署**：默认 **本地调稳后再** Cloudflare Pages；用户未点名不部署  
8. **用量有效性**：优先「可沉淀产出」（Skill/HANDOFF/积木接口），禁止空转重写与重复读盘  

## 总架构师模式（用户授权后启用）

用户说 **「授权总架构」** 或等价含义后：

| 角色 | 职责 |
|------|------|
| **用户** | 关键节点拍板；授权 commit/检查点；反馈手感；AD-X 等见闻按需写入积压 |
| **本 Agent（总架构）** | 拆轨、排期、开并行子 Agent、写接口约定、推进积木、更新飞轮文档 |

**双轨并行（防互踩）**

| 轨 | 范围 | 文件领地 |
|----|------|----------|
| **A 乐理图谱** | 路径、课、巩固、关卡解锁表 | `core/learning-path*`、`lesson-engine*`、`theory-*`、桥接 |
| **B 星图世界** | 波次/Boss/掉落/僚机/成长 | `modules/spirit-journey/`（优先拆成多 js 积木） |
| **共享** | 版本、积压、交接 | `features.js`、`IDEA-BACKLOG`、`HANDOFF` —— **仅总架构写** |

子 Agent 节点：做完切片 → 停问用户（或总架构代问）→ 不默认浏览器深测（用户说「暂不测」则跳过）。

**检查点备份**：用户允许 commit 时打 `checkpoint/vX.Y.Z`；坏了只换积木文件，不整盘重来。

**用量飞轮（Pro 周期内）**

```
授权 → 检查点 → 拆积木/双轨推进 → 节点确认 → 沉淀进 Skill+HANDOFF
         ↑_________________________________________|
```

省用量：复用本 Skill 接手清单；并行只按领地；少重复全文读取；产出写进文档而不是只留在聊天。  
烧用量要烧在「模块落地 + 飞轮变厚」，不是烧在反复推翻。

## 飞轮（防记忆丢失 · 防缺项 · 可迭代）

每轮对话默认循环：

```
体验/想法 → 记入 IDEA-BACKLOG → 选下一刀（确认）→ 实现小切片
    → 更新 HANDOFF 版本与「当前断点」→ 必要时提炼进本 Skill
```

**新对话接手清单**（按序）：

1. 读本 Skill（含总架构师模式是否已授权）  
2. 读 `HANDOFF-AND-ROADMAP.md` §4–§6 + 文末「当前断点」  
3. 扫 `IDEA-BACKLOG.md` 置顶 5 条  
4. 用用户当次消息覆盖优先级  

**沉淀规则**：同一流程被用 ≥2 次且稳定 → 写入本 Skill 或拆 `reference.md`；不要只留在聊天里。

**用户前置配合（最少集）**

1. 一句授权：「授权总架构」  
2. 一句备份：「可以 commit 打检查点」（否则只改文件不留 git 快照）  
3. 节点回复：继续 / 改方向 / 暂停（各一行即可）  
4. 部署：另说「可以部署」——默认不部署  
5. 可选：把 Copilot/他人审查结论贴回来，总架构消化进积压  

用户不必自己写代码、不必每小时在线；AD-X 见闻有则记、无则跳过。

## 文化引用怎么用

用户常以「像某游戏/动画」描述手感。Agent 应：

1. 记入 `docs/IDEA-BACKLOG.md`  
2. 用 `docs/REFERENCE-TO-MECHANICS.md` 拆成系统字段（爽点 / 乐理挂钩 / MVP 切片）  
3. **不要**去扒源码或全集；wiki 机制摘要可用，资源文件不可用  
4. 这不是机器学习训练，是**世界观架构 + 外化记忆飞轮**（见该文档）

## 星图战斗 · 设计锚点（已验证方向）

- **弹药双轨是对的**：大三包 / 小三包分槽 + 数量（合金弹头感）；平击保底  
- **前期**：凑成和弦自动入库、可自动切到刚获得的弹种  
- **教学债（高优先）**：凑成和弦时必须说清「为什么」（构成音高亮 + 大三/小三文案），用户反馈「不知道为什么凑成了」  
- **后期玩法池**（积压，勿一次做）：R 换弹、Shift 加速、闪避位移、回血、抗性怪、关卡 Boss、大小三合成超级弹  
- **和弦色彩（参考 LoL 慧 Hwei）**：大三/明快 → 干脆、可穿透；小三/阴郁 → 融化、冰冻、减速；与抗性怪（B3）同一张数值表设计（见 IDEA-BACKLOG I20）  
- **终局愿景**：女神角色 / 柔和编曲厅 / 大量音符驱动的引导学习；球→可换角色与能力图谱（球球大作战感）  

默认下一刀优先：**拆星图积木** → 双轨 A（路径关卡表）/ B（僚机）——总架构师已授权（2026-07-21）。  
检查点：`checkpoint/v1.4.0`。部署仍须用户点名。

## 技术模式（复用）

| 模式 | 位置 | 用途 |
|------|------|------|
| `AppShell` + `#*Root` | `index.html` | 模块切换 |
| `LessonEngine` | `core/lesson-engine.js` | MCQ 课 |
| `topicId` + Bridge | `core/learn-practice-bridge.js` | 学练联动 |
| `LearningPath` | `core/learning-path.js` | 路径；`?dev=1` |
| 星图 | `modules/spirit-journey/` | iframe Canvas 世界 |
| 灵气 | `core/spirit-progress.js` | localStorage + skills |
| 开关 | `core/features.js` | `AppFeatures.*` |

## 开源 / 分享

- 现网链接可直接分享试玩  
- GitHub：可从 Gitee 镜像或 `git remote` 双远程；开源前加 README 贡献说明、LICENSE、Issues 模板  
- **不要擅自创建公开仓库或 push**，等用户说「开源到 GitHub」

## 工具阶梯（按需，不预装全家桶）

| 阶段痛点 | 建议 | 暂不需要 |
|----------|------|----------|
| 对话失忆 / 缺项 | **本 Skill + HANDOFF + IDEA-BACKLOG** | — |
| 收集反馈 | Tally / 金数据外链问卷 | 先别上后端 |
| 问卷→表格自动归集 | 以后再 **n8n** | 现在手抄也行 |
| 女神/角色原画批量 | 以后再 **ComfyUI** / Meowa | MVP 用占位或单张 |
| 多 Agent 编排 | 中期以后；先把单 Agent 飞轮跑顺 | WorkBuddy 非必须 |

用户若主动提供 n8n/ComfyUI/自动化能力，Agent 可在对应里程碑接入，仍遵守「计划→确认→做」。

## 测试与部署

| 模式 | 操作 |
|------|------|
| 快测 | `http://localhost:8080/?dev=1` |
| 正式锁 | 无 `dev`，识谱 7 课后门禁星图 |
| 部署后 | Ctrl+F5，页脚 = `APP_VERSION` |

```powershell
Set-Location C:\Users\23017\music-theory-game
npx wrangler pages deploy . --project-name=music-theory-game --branch=master
```

## 路线图优先级（默认，可被当次消息覆盖）

1. 星图：和弦「为什么」反馈 → B3 抗性怪 → B4 关卡/Boss  
2. 教学：反刷题（先点谱/听再 MCQ）  
3. 双端壳（手机路径 / PC 泡泡）  
4. 问卷 + 求职案例叙事（中期）  
5. 开源 GitHub + 社区贡献指南  
6. 角色/女神/编曲厅（愿景，拆小步）  

## 详细参考

见 [docs/HANDOFF-AND-ROADMAP.md](../../docs/HANDOFF-AND-ROADMAP.md)、[docs/IDEA-BACKLOG.md](../../docs/IDEA-BACKLOG.md)。
