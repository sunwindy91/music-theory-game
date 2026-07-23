# A2A 交接模板（复制即用）

> 配合 [`A2A-PROTOCOL.md`](A2A-PROTOCOL.md)。四选一复制，填空后粘贴。

---

## A · User → Codex（战略问）

```text
A2A-MSG
from: Orchestrator
to: Codex
goal: 对齐中期优先级并回答 ALIGNMENT §6
layer: 中期
constraints: 勿重复 v1.7.14–17 已交付；勿建议重写整盘；方案标当下|中期|长远
decision_asked: 见 ALIGNMENT-BRIEF §6 八题；末附「若只做一件事」一句
artifacts: docs/ALIGNMENT-BRIEF-FOR-CODEX.md, docs/A2A-PROTOCOL.md, docs/HANDOFF-AND-ROADMAP.md
DoD: 八题各 2–4 行可执行立场 + 一层标签；无空话重做清单
body: |
  请先读 artifacts 再答。角色=Strategist。默认小切片。
  （可将 ALIGNMENT-BRIEF 全文附在本消息后。）
```

---

## B · Codex → Cursor（实现简报）

```text
A2A-MSG
from: Codex
to: Cursor
goal: <一句话：要落地的切片>
layer: 当下 | 中期 | 长远
constraints: <硬约束>
decision_asked: <需用户拍板则写清；已拍板写「已确认：…」>
artifacts: <要改/要读的路径>
DoD: <可勾选验收>
body: |
  背景：…
  建议切片（文件级）：…
  不要做：…
  风险：…
```

---

## C · Cursor → Codex（审阅请求）

```text
A2A-MSG
from: Cursor
to: Codex
goal: 审阅本切片是否符合中期/双核护栏
layer: 当下
constraints: 对照 HANDOFF §12 与 ALIGNMENT §1 硬现状；指出重复交付或越层
decision_asked: 通过 / 需改（列改点）/ 升级为中期议题
artifacts: <diff 摘要或文件路径>, docs/A2A-DECISION-LOG.md
DoD: 明确 verdict + ≤5 条可执行改点（若有）
body: |
  本轮改动摘要：…
  版本：vX.Y.Z
  自评 DoD：…
```

---

## D · 联合决策日志条目（写入 A2A-DECISION-LOG）

```text
### YYYY-MM-DD · <短标题>
- **layer**: 当下 | 中期 | 长远
- **问**：…
- **Codex**：…
- **Cursor**：…
- **用户拍板**：…
- **后续动作**：…
- **状态**：开放 | 已拍板 | 已执行
```
