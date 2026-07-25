# 乐理小达人 · A2A 协议（项目原生 · 文件交换）

> **性质**：Cursor ↔ Codex（及未来顾问）之间的**轻量对等协议**，不是研究论文，也不是 Google A2A SDK。  
> **介质**：粘贴聊天 + 仓库内 Markdown 文件（今晚即可跑）。  
> **日期**：2026-07-23 · **版本锚点**：v1.7.18 · **IDEA**：I68  
> **相关**：`[ALIGNMENT-BRIEF-FOR-CODEX.md](ALIGNMENT-BRIEF-FOR-CODEX.md)` · `[A2A-HANDOFF-TEMPLATE.md](A2A-HANDOFF-TEMPLATE.md)` · `[A2A-DECISION-LOG.md](A2A-DECISION-LOG.md)`

---

## 0. 这里的 A2A 是什么


| 是                    | 不是                                |
| -------------------- | --------------------------------- |
| 角色分工 + 固定消息信封 + 回合礼仪 | 网络服务器 / OAuth / 全量 Google A2A SDK |
| 用户粘贴 / 提交文件即可闭环      | 自动跨模型 RPC                         |
| 战略顾问 ↔ 实现者对等协作       | 单 Agent 包办一切                      |


**日后映射（可选）**：信封字段可映射到正式 Agent Card / Task / Message；本周不实现。

---



## 1. 角色


| 角色                        | 谁            | 职责                                      | 默认不做什么                   |
| ------------------------- | ------------ | --------------------------------------- | ------------------------ |
| **Orchestrator**          | 用户           | 定目标、拍板、授权 commit/deploy、把文件在两端之间传递      | 不必自己写协议正文                |
| **Implementer**           | Cursor Agent | 读协议落地代码/文档；更新 HANDOFF/IDEA/Skill；按领地改文件 | 不擅自开源/部署；不重写已交付系统        |
| **Strategist / Reviewer** | Codex（或其它顾问） | 优先级、叙事、问卷后选型、审阅切片；挑战假设                  | 不直接改仓库（除非用户明确授权）；不重复交付清单 |


双轨领地仍以 Skill「总架构师模式」为准：图谱轨 / 星图轨 / 共享文档仅总架构写。

---



## 2. 消息信封（每条回合必填）

复制下面块；缺一项就视为半成品，对端可拒收并只问缺项。

```text
A2A-MSG
from: Orchestrator | Cursor | Codex
to: Orchestrator | Cursor | Codex
goal: <一句话目标>
layer: 当下 | 中期 | 长远
constraints: <硬约束，分号分隔>
decision_asked: <需要对方拍板/选边的问题；无则写「无」>
artifacts: <相关路径，逗号分隔>
DoD: <怎样算本回合完成>
body: |
  <正文：立场 / 切片计划 / 审阅意见>
```

**字段说明**

- **layer**：必须与 Skill 三层时间一致；提案不得混层却不标明。  
- **decision_asked**：有决策时，对端回复须先答决策，再展开。  
- **artifacts**：优先仓库相对路径（如 `docs/ALIGNMENT-BRIEF-FOR-CODEX.md`）。  
- **DoD**：可验收、可勾选；避免「再想想」。

---



## 3. 回合礼仪

1. **先读再写**：Codex 先读 ALIGNMENT-BRIEF → HANDOFF §12 → 本协议；Cursor 先跑稳态仪式。
2. **一小刀**：每回合只推一个可验收切片或一组决策；禁止「整盘重做」。
3. **回传闭环**：顾问结论 → 用户确认（或授权总架构代收）→ 写入 `[A2A-DECISION-LOG.md](A2A-DECISION-LOG.md)` → Implementer 执行。
4. **冲突**：意见不一致时，写进决策日志「争议」栏；**用户拍板**；未拍板前 Implementer 不改代码。
5. **口令触发**（用户说下列任一）：`A2A` / `让 Codex 看` / `双顾问` → 各方按本协议 + 模板运转，不再即兴发明格式。

---



## 4. 冲突解决（短）


| 冲突                  | 处理                                  |
| ------------------- | ----------------------------------- |
| 战略 vs 已交付事实         | 以 ALIGNMENT §1「硬现状」与 HANDOFF §12 为准 |
| 当下手感 vs 中期问卷        | 默认等问卷；用户点名「先修手感」才动代码大刀              |
| Cursor 与 Codex 方案互斥 | 各写 3 行利弊 → 用户选边 → 记入决策日志            |
| 文件互踩                | 遵守双轨领地；共享文档合并冲突由 Orchestrator/总架构裁决 |


---



## 5. 明确禁止

- 重复交付：v1.7.14–17 已封章节与职涯材料，勿再提案「从零做问卷/STAR/双核」。  
- 重写整个游戏 / 引入构建链 / 换紫橙壳为别的默认 AI 审美。  
- 未点名就 commit / push / deploy / 建 GitHub remote。  
- 玩家可见文案出现外部作品名。  
- 顾问侧臆造「已实现」而未对照 `APP_VERSION` / HANDOFF。

---



## 6. 今晚最小闭环（3 步）

1. 用户打开 `[A2A-HANDOFF-TEMPLATE.md](A2A-HANDOFF-TEMPLATE.md)` 复制 **模板 A**，把 `[ALIGNMENT-BRIEF-FOR-CODEX.md](ALIGNMENT-BRIEF-FOR-CODEX.md)` 一并贴给 Codex。
2. Codex 用信封回复 §6 八题立场；用户把回复贴回 Cursor，或写入决策日志草稿。
3. Cursor 按 **模板 D** 记入 `[A2A-DECISION-LOG.md](A2A-DECISION-LOG.md)`，再按拍板结果执行（或等你发问卷）。

---



## 7. 文件地图


| 路径                                          | 用途                    |
| ------------------------------------------- | --------------------- |
| `docs/A2A-PROTOCOL.md`                      | 本协议（角色 / 信封 / 礼仪）     |
| `docs/A2A-HANDOFF-TEMPLATE.md`              | 可复制模板 A–D             |
| `docs/A2A-DECISION-LOG.md`                  | 联合决策流水（真源；空栏/探测=通讯测试） |
| `docs/AGENT-LOG.md`                         | Agent 切换一行迹           |
| `docs/ALIGNMENT-BRIEF-FOR-CODEX.md`         | Codex 对齐入口            |
| `.cursor/skills/music-theory-game/SKILL.md` | 飞轮口令「A2A / 双顾问」       |


