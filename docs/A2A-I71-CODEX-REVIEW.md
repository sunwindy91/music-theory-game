# A2A · 请 Codex 审阅 I71（手机星图王者式操控）

> **用法**：把本文 + `docs/UX-LAZY-USER.md` §4–§5 粘给 Codex。  
> **角色**：Codex = Strategist/Reviewer；**不写代码**；Cursor 稍后实现。  
> **日期**：2026-07-25 · 产品版本锚点 **v1.7.24**（问卷中|EN 双链已接线；I71 **仍未实现**）

---

```text
A2A-MSG
from: Orchestrator / Cursor
to: Codex
goal: 审阅 I71 手机星图「横屏 + 左虚拟摇杆 + 右开火簇」方案，只出分区/风险/验收，不写代码
layer: 当下
constraints:
  - 勿重写整游戏；勿引入构建链
  - PC 保留 WASD/空格/1-4/R/Shift/E；手机走 InputAdapter
  - 玩家可见文案禁外部作品名（对标可写「王者式分区」在内部文档即可）
  - 对照 docs/UX-LAZY-USER.md §4–§5；HANDOFF §下一刀仍为 I71
  - 现状：spirit-journey 仍为键鼠 + 点画面开火；无虚拟摇杆 / InputAdapter / 横屏操控层
decision_asked:
  1) 分区布局是否够用（左摇杆 / 右开火·切弹·闪避）？缺什么？
  2) 竖屏进星图：强制横屏 vs 提示旋转，推荐哪种（含 iOS Safari 风险）？
  3) 「点画面开火」与右开火钮如何并存、避免误触？
  4) MVP 最小切片建议（1–2 刀可验收），哪些后置？
  5) 是否需要陀螺仪/多指手势？默认不要则说明理由
artifacts:
  - docs/UX-LAZY-USER.md
  - docs/HANDOFF-AND-ROADMAP.md（§12 下一刀）
  - docs/IDEA-BACKLOG.md（I71 积压·P0）
  - modules/spirit-journey/spirit-journey.html（现有键鼠与点按开火）
DoD:
  - verdict: 通过 / 需改（≤5 条）
  - 一页「操控分区草图」文字版（左/右/禁区）
  - MVP 切片列表（文件级暗示即可，不写补丁）
  - 风险清单（Safari 横屏、误触、与战役 UI 叠层）
body: |
  背景：首轮反馈指出手机无方向键，星图「玩」核半残。已定对标王者左右分区。
  壳层 I69/I70（三门+焦点卡）已落地 v1.7.21；问卷薄片与 EN URL 已至 v1.7.24。
  I71 代码侧仍为空：无 InputAdapter、无左摇杆、无右开火簇、无横屏锁/旋转提示实现。
  请只审 I71 操控与分期，不要提案重做关卡系统、排行榜或整站 i18n（I72）。
```

---

## 你期望 Codex 回传的格式

- **verdict**
- **分区草图**（文字）
- **MVP 1 / MVP 2**
- **风险**
- **不要做的清单**
