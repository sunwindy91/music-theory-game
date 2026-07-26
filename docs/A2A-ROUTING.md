# A2A · 三 Agent 协作路由约定

> 版本: v1.0 | 2026-07-26 | 协议依据: A2A-PROTOCOL.md
> 本文件定义三个 Agent 的读写目录与触发词。新增 Agent 接入前必须读本文件。

---

## 角色与领地

| Agent | 角色 | 读写目录 | 触发词（用户说任一句即激活） |
|-------|------|---------|---------------------------|
| **Codex (V4)** | Strategist / Reviewer | 读: 决策日志、HANDOFF §12、Skill、UX-LAZY-USER、问卷数据。写: docs/I##-CODEX-REVIEW.md | "Codex 审 I##" / "让 Codex 看" / "审阅" |
| **Cursor** | Implementer | 读: Codex 审阅文件、决策日志、Skill、HANDOFF §12、路由约定。写: 代码 + 执行后追加决策日志 | "Cursor 读 I## 执行" / "按审阅执行" / "部署" |
| **Copilot** | Narrative / 文案 | 读: 决策日志、Codex 审阅、问卷数据。写: 公众号文案、推广话术、对外文档 | "Copilot 写推广" / "写公众号" / "提炼叙事" |

---

## 共享上下文（所有 Agent 启动时必读）

1. docs/A2A-DECISION-LOG.md — 当前断点、已拍板决策、触发条件
2. .cursor/skills/music-theory-game/SKILL.md — 启动必读区、禁止项、约束体系
3. docs/A2A-PROTOCOL.md — 消息信封格式、冲突解决、授权粒度

---

## 写入规范

- Codex 审阅件：统一命名 docs/I##-CODEX-REVIEW.md，内含 A2A-MSG 信封 + verdict/MVP/禁区/DoD
- Cursor 执行后：追加一条到决策日志——layer/结果/未完成项/状态
- Copilot 文案：落到工作目录或 docs/ 下，文件名含日期与用途（如 公众号文案-产品发布-0726.md）
- 所有 Agent 写入后不 commit / push / deploy（必须等用户授权口令）

---

## 冲突规则（摘 A2A-PROTOCOL §4）

- 两 Agent 立场冲突 → 各写 3 行利弊 → 用户拍板 → 记入决策日志
- 文件互踩 → 共享文档只允许自己约定的文件名前缀写入；用户传入的引用文件默认只读
- Agent 越界 → 另一方引 A2A-PROTOCOL §5 叫停，记日志

---

## 用户角色

用户 (Orchestrator) 只做 Agent 替不了的五件事：
1. 说「我授权你 push」「我授权你部署 Pages」
2. 真人手机实测
3. 社交推广（发朋友圈/公众号/抖音/即刻）
4. 判断"够了"——何时停、何时发、何时睡
5. 拍板争议项
