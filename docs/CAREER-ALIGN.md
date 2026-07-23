# 求职叙事对齐 · 简历 / 体验报告 ↔ 本仓库

> **性质**：把桌面《邹翔-简历_更新版_20260723》与《体验报告 v2》里与本项目相关的主张，映射到**可指给面试官的仓库证据**。  
> **不修改** Desktop 原件；本文件与 `docs/resume-snippet.md` 可随版本更新后粘贴回简历。  
> **关联**：`docs/STAR-CASE-DRAFT.md` · `docs/resume-snippet.md` · `docs/MIDTERM-CAREER-AND-OPENSOURCE.md`

---

## 简历项目条 → 仓库证据（乐理小达人）

| 简历表述（2026-07-23 桌面版） | 建议校准 | 仓库证据 |
|------------------------------|----------|----------|
| 版本写 **v1.4.8** | 改为 **v1.7.x**（以页脚/`APP_VERSION` 为准） | `core/features.js`；线上 https://music-theory-game-br5.pages.dev/ |
| 学习路径→练习中心→灵气星图 | 可保留；补一句「学‖玩双核壳」 | `#dualGate`；`LearningPath`；星图 iframe |
| 16 学习节点 + 5 练习模块 | 仍可用（路径节点 + 乐理/识谱/钢琴/吉他/弦乐等） | `core/learning-path.js` + 各 `modules/*` |
| 时停学堂（P 暂停→对照抗性） | 保留为核心创新句 | 星图暂停/教学面板；I43 关卡教案 |
| 38+ Backlog + 7 份产品文档 | 可写「40+」；文档名对齐下表 | `IDEA-BACKLOG` + HANDOFF / MODULE-CONTRACTS / REFERENCE / STAR / CAREER / SPRINT / MIDTERM |
| 双域名 Pages + Vercel；Gitee 备份 | 保留；问卷入口已就绪 | Pages 主链；`vercel.json`；`survey.html` |
| 技术栈 Vanilla / Web Audio / Canvas / CF Pages | 保留 | 整仓无构建链 |

**一句话简历行（推荐替换桌面版项目首行后的摘要）**：见 `docs/resume-snippet.md`。

---

## 体验报告主张 → 证据

| 体验报告主张 | 仓库证据 |
|--------------|----------|
| 学→练→测→玩→分享闭环 | 学习路径 + LessonEngine + 星图/演奏 + `survey.html` / 分享卡 |
| 时停学堂式学练嵌入 | 战斗中教学/收编；关卡教案条（I43）；P 暂停对照抗性 |
| Backlog + 状态流转 | `docs/IDEA-BACKLOG.md`（审校表 / 置顶冲刺 / 已消化版本） |
| 双轨领地 + 模块契约 | Skill 双轨表；`docs/MODULE-CONTRACTS.md` |
| 部署双域名 + 问卷就绪 | Pages 国内链；Vercel 配置；`survey.html` |
| AI 协作 = Harness 承载层 | `.cursor/skills/music-theory-game/SKILL.md` + HANDOFF §12 + Auto 续航手册 |
| 文化引用 → 游戏规则 | `docs/REFERENCE-TO-MECHANICS.md`（UI 禁外部作品名） |
| 「吕布骑猪」：同模型不同承载 | 检查点 git + 飞轮文档 → 弱模型仍可按「下一刀配方」交付 |

---

## Harness 口述口径（与简历「核心能力」对齐）

- **不是**「会提示词写代码」；**是**定义场景、接口与反馈循环，让模型在可控承载层上稳定交付。  
- 证据三件套：**Skill 稳态仪式** · **HANDOFF 断点** · **IDEA 审校表→改版**。  
- 中期证明：「发现问题 → 短问卷 → Top3 回积压」——链在 `survey.html` + `SPRINT-0726.md`。

---

## 口述时注意

- 乐理小达人是 **产品全链路样本**，不是唯一作品；Resume Analyzer 迭代另表。  
- 讲 Harness 时落在「接口与场景定义」，避免听起来像「我只会提示词」。  
- **版本数字以 `core/features.js` `APP_VERSION` 与线上页脚为准**（桌面简历若滞后，口头用线上版）。
