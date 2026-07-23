# 模块契约 · MODULE CONTRACTS

> 积木之间的「插头」。改积木不拆房子。  
> **检查点**：git `8238aed` · 产品 **v1.7.0**（2026-07-23）
> **双端 UX 原则**：每个乐器/模块 PC 点拖 + 手机点滑都要好用；拖动控件配 `touch-action`；弦乐可扫弦。

## 双轨领地

| 轨 | 可写 | 只读 |
|----|------|------|
| **A 乐理图谱** | `core/learning-path.*`、`lesson-engine.*`、`learn-practice-bridge.js`、`modules/theory-learn/`、`modules/sight-reading/`、`modules/instrument-intro/`、`modules/perform/` | 星图实现 |
| **B 星图世界** | `modules/spirit-journey/*` | 路径实现细节 |
| **总架构** | `core/features.js`、`core/ui-density.js`、`docs/*`、`.cursor/skills/**`、`index.html` 壳接线 | — |

## 共享插头

| 接口 | 位置 | 约定 |
|------|------|------|
| 版本号 | `core/features.js` → `APP_VERSION` | 仅总架构改；里程碑结束 bump |
| 显示密度 | `core/ui-density.js` → `UiDensity` | `kid`/`std`；`body[data-density]`；LS `mtg_ui_density_v1` |
| 星图跑法 | `spirit-journey.html` | `practice`/`expedition`；LS `mtg_spirit_run_mode_v1`；练习房封顶 `PRACTICE_WAVE_CAP` |
| 灵气/技能 | `core/spirit-progress.js` | `getSkills` / `setSkills` / `award`；星图 iframe 经 parent 调用 |
| 路径解锁星图 | `learning-path` + `?dev=1` | 正式：识谱 7 课后门禁；dev 可直进 |
| 退出星图 | `postMessage` `mtg-spirit-exit` | 壳监听后 `onBack` |
| 星图数据表 | `modules/spirit-journey/spirit-data.js` | `window.SpiritData`：怪谱/掉落/波次常量 |
| 采样库 | `modules/perform/perform.js` → `Audio` | `ensureSample`/`playSample`；`strumChord(...,voice)`；`startBow(midi,voice)` 采样优先+GainNode+再排队，回退 bowSynth；`playBowPreview` |
| 音色表 | 同文件 `TIMBRE_TABLE` | 乐器→label/sample(GM名)/fallback/interact；加乐器先补表再写播放器 |

## 星图积木（拆分目标）

| 积木 | 文件（目标） | 职责 |
|------|----------------|------|
| 数据 | `spirit-data.js` | ENEMY_TYPES、LOOT_META、波次常量 |
| 波次 | `spirit-waves.js` | plan(w) / breathMs — 出怪计划 |
| 掉落 | `spirit-loot.js` | shatter / rollKind — 击散掉落 |
| 成长 | `spirit-evo.js` | 三选一 / 阶位数值 / 合成产量 |
| 突变 | `spirit-mutation.js` | 变化音叠层 · 暴击/破甲/韧性三选一 |
| 星区 | `spirit-sectors.js` | 星区划分 / 君主奖励 / 区末回顾 |
| 探险 | `spirit-hazards.js` | 坑/雾/晶石/遗迹柱 |
| Boss | `spirit-boss.js` | 来袭 / 领主 / 君主(mega) / 小怪技能（闪步须前摇+插值）/ 敌弹 |
| 僚机 | `spirit-drones.js` | 听辨收编 + 炼化词条；`exportState`/`importState` 供 I66 远征局 |
| 战役 | `spirit-campaign.js` | 星区节点解锁；主循环持有 `campaignRunSnap` |
| 壳 | `spirit-journey.js` + `.html` | iframe、输入、主循环；`#nodeSettlePanel` 清场结算 |

## 节点协议

1. 切片做完 → 更新 `IDEA-BACKLOG` 状态 + 总架构汇总结论  
2. 用户未要求则不浏览器深测、不部署  
3. 坏了：对照 `8238aed` 只还原冲突积木文件  

## 回滚

```powershell
git show 8238aed:path/to/file > path/to/file   # 单文件回滚示例
git checkout 8238aed -- path/to/file
```
