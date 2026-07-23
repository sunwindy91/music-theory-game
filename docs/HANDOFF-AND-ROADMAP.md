# 乐理小达人 · 交接与路线图

> **用途**：新 Cursor 对话 / 新协作者快速接手。用户会基于实际上线情况把关，本文档为「计划 + 现状」参考，非硬性合同。  
> **最后更新**：2026-07-23 · 代码版本 **v1.7.14**（Boss 预警统一 + 进化池/地形挂钩）

---

## 1. 项目一句话

浏览器端乐理 **学练一体** 小游戏：学习路径（先教后练）+ 练习中心（自由刷题）+ 灵气星图（奖励层）。纯静态站，无构建步骤。


| 项    | 值                                                                                        |
| ---- | ---------------------------------------------------------------------------------------- |
| 本地目录 | `C:\Users\23017\music-theory-game`                                                       |
| 国内镜像 | [https://music-theory-game-br5.pages.dev/](https://music-theory-game-br5.pages.dev/)     |
| 海外备用 | [https://music-theory-game.vercel.app/](https://music-theory-game.vercel.app/)           |
| 代码备份 | [https://gitee.com/chunny/music-theory-game](https://gitee.com/chunny/music-theory-game) |
| 版本号  | `core/features.js` → `APP_VERSION`                                                       |


---

## 2. 用户协作偏好（请新对话遵守）

- **大功能**：先短计划 → 用户确认 → 再写代码（v1.0 已验证此节奏）
- **Git**：除非用户明确说 commit，否则 **不要提交**
- **部署**：用户本地执行 Cloudflare；指令见 `docs/DEPLOY-CLOUDFLARE.md`
- **本地预览**：双击 `start-local.bat` 或 `python -m http.server 8080`（勿用 `file://`）
- **测试加速**：URL 加 `?dev=1` 可 **解锁整条学习路径**（正式规则仍为顺序通关）
- **反馈**：问卷 / 后端 ** intentionally 放最后**，不要提前做

---



## 3. 版本历程（已落地）


| 版本       | 主题    | 要点                                        |
| -------- | ----- | ----------------------------------------- |
| v0.5     | 内容    | 识谱 5 课、节奏 5 关                             |
| v0.6     | 演奏    | 钢琴弹题挑战、八度 2–6                             |
| v0.7     | 学练分离  | 学习中心 / 练习中心、`LessonEngine`、乐理 3 单元、题库 85+ |
| v0.8     | 学练联动  | `topicId` 专题练、钢琴/吉他引导课、学练推荐               |
| v0.9     | 学习路径  | 纵向节点 UI、CSS 预加载修闪烁 bug                    |
| v1.0     | 路径闭环  | 乐理 5 单元、识谱 7 课、识谱快练、节奏 7 关+引导、120 题、灵气进度  |
| **v1.1** | 玩+听+测 | 灵气星图 WASD MVP、WebAudioFont 钢琴、`?dev=1`    |


---



## 4. 当前产品形态（v1.1）



### 4.1 学习中心 · 学习路径

**文件**：`core/learning-path.js`、`core/learning-path.css`

路径节点（顺序解锁，除非 `?dev=1`）：

1. 音名与谱表 → 🎯 音名巩固
2. 音程入门 → 🎯 音程巩固
3. 和弦构成 → 🎯 和弦巩固
4. 调号入门 → 🎯 调号巩固
5. 拍号时值 → 🎯 拍号巩固
6. 钢琴入门 → 吉他入门
7. 识谱教学（7 课 hub）→ ⚡ 识谱快练
8. 🥁 节奏闯关（支线，拍号单元后）
9. ✨ 灵气星图（**识谱 7 课全部完成后**解锁）

顶栏显示：`x/8 完成 · ✨ 灵气/30`

**练习中心不受路径锁定**：综合练习 / 听音 / 错题本 / 每日等随时可用。

### 4.2 模块与关键文件


| 模块      | 路径                              | 说明                                 |
| ------- | ------------------------------- | ---------------------------------- |
| 壳层 / 答题 | `index.html`                    | 综合练习、听音、AppShell 路由                |
| 题库      | `core/quiz-bank.js`             | 120 题，`topicId` 链回单元               |
| 乐理课     | `modules/theory-learn/`         | 5 单元 MCQ                           |
| 识谱      | `modules/sight-reading/`        | 7 课 + **识谱快练**（家人推荐：见谱点音）          |
| 钢琴/吉他课  | `modules/instrument-intro/`     | 各 1 课 MCQ                          |
| 节奏      | `modules/rhythm-game/`          | 7 关，关前「本关学什么」                      |
| 演奏      | `modules/perform/`              | 钢琴 WebAudioFont + 吉他/鼓；弹题挑战        |
| 灵气      | `modules/spirit-journey/`       | iframe 内 WASD 小游戏                  |
| 灵气进度    | `core/spirit-progress.js`       | localStorage，与路径顶栏同步               |
| 学练桥     | `core/learn-practice-bridge.js` | 专题练、首页推荐                           |
| 课程引擎    | `core/lesson-engine.js`         | MCQ 课通用流程                          |
| 功能开关    | `core/features.js`              | `multiTrack` / `midiInput` 仍 false |




### 4.3 灵气星图（v1.1 现状）

- **操作**：WASD / 方向键移动，捡 **C/D/E** 播放唱名，躲暗影敌人  
- **进度**：与 `SpiritProgressStore` 同步，目标 30 灵气  
- **入口**：学习路径末端 + 页脚（均受识谱解锁约束）  
- **尚未做**：双人、开枪交火、像素怪兽、星区与单元一一对应



### 4.4 演奏（v1.1 现状）

- 钢琴：**WebAudioFont** 懒加载，失败回退合成音  
- 白键扩至 **K**（高八度 C）  
- **尚未做**：3–4 八度横滚、吉他采样、贝斯、自动挡跟弹

---



## 5. 已知设计决策


| 决策                       | 理由                                     |
| ------------------------ | -------------------------------------- |
| 路径 **硬解锁**               | 保证「完整走一圈」可测；用户认可测试慢但测得全                |
| 练习中心 **不锁**              | 自由刷题与系统学习并行                            |
| 借鉴多邻国 **模式** 不抄 **视觉**   | 技能树/ streak / 小单元；自有 Fredoka 紫橙 + 灵气星图 |
| 识谱课内嵌 `LessonEngine` 未全迁 | Canvas 点击逻辑仍独立，仅进度存储共用                 |
| Gitee Pages 不可用          | 国内以 Cloudflare 为主                      |


---



## 6. 下一里程碑建议（v1.2 起）

> 用户已确认 **按顺序** 推进；v1.1 三项（星图 MVP / 钢琴采样 / dev 模式）代码库中 **已有初版**，v1.2 以 **打磨 + 扩展** 为主。



### 6.1 v1.2 · 灵气星图 2.0（优先）


| 项   | 内容                        | 状态  |
| --- | ------------------------- | --- |
| P0  | 星图视觉 polish（像素资源、UI 不潦草）  | 未做  |
| P1  | **射击/交火** 简化版（音符子弹打「错音怪」） | 未做  |
| P2  | 星区对应学习模块（音名区/识谱区…）        | 未做  |
| P3  | 双人模式                      | 远期  |
| 联动  | 完课自动提示「去星图领灵气」            | 可加强 |


**参考文件**：`modules/spirit-journey/spirit-journey.html`（内联 Canvas 游戏）

### 6.2 v1.2 · 演奏深化


| 项    | 内容                        |
| ---- | ------------------------- |
| 宽键盘  | 3–4 八度 + 横向滚动（v0.6 P3 欠账） |
| 吉他/鼓 | WebAudioFont 或采样升级        |
| 课内键盘 | 钢琴入门单元内嵌简化 perform 键盘     |
| 贝斯   | perform 新 tab 或低音区        |




### 6.3 v1.3 · 内容与引导


| 项   | 内容                              |
| --- | ------------------------------- |
| 识谱  | 低音谱号入门（需扩展 `staff-renderer.js`） |
| 乐理  | 进阶单元（转位、调式简介等）                  |
| 节奏  | 8–10 关；与拍号单元题池对齐                |
| 题库  | 150+，专业人士反馈「讲不清」处加引导链           |




### 6.4 v2.0 · 创作向（愿景，未细设）

用户原始灵感，**产品级大工程**，需拆分验证：

- 自动挡吉他、变调、**导入歌曲**（MIDI/JSON 跟弹）
- 架子鼓真实场景交互、贝斯线
- **迷你多轨**：叠录 → mute/solo → 类轻量编曲器
- 识谱 / 节奏 **小游戏化**（接音符、节奏捕星）

**建议路径**：`段落叠录 localStorage` → 简易 JSON 谱面跟弹 → 再谈导入 MIDI。

### 6.5 基础设施（最后）


| 阶段  | 方案                                           |
| --- | -------------------------------------------- |
| 0   | 外链问卷（Tally / 金数据）                            |
| 1   | Cloudflare Workers + D1 或 Supabase：匿名进度、事件埋点 |
| 2   | 账号、跨设备                                       |
| 3   | 个性化推荐、A/B                                    |


---



## 7. 未做 / 欠账清单（对照早期规划）


| 项                          | 说明                          |
| -------------------------- | --------------------------- |
| `instrument-stub/`         | 已被 `instrument-intro` 替代，可删 |
| `multiTrack` / `midiInput` | flags 关                     |
| 扩展演奏 chip                  | index 里仍 hidden             |
| 识谱 → 全量 LessonEngine UI    | 仅进度共用                       |
| 路径上「节奏/演奏」主节点              | 现为支线 / 练习中心                 |
| 低音谱号                       | renderer 仅高音                |
| UX/Persona 模拟器             | 默认关，`?sim=1`                |
| Open Graph / 传播素材          | 用户自行推文时可做                   |
| README 与 APP_VERSION       | 部署后核对页脚一致                   |


---



## 8. 部署与验证

```powershell
Set-Location C:\Users\23017\music-theory-game
npx wrangler pages deploy . --project-name=music-theory-game --branch=master
```

**冒烟测试**（约 15 分钟完整 / 3 分钟快速）：


| 快速 `?dev=1` | 完整（无 dev）   |
| ----------- | ----------- |
| 路径任意节点可进    | 仅「音名与谱表」可继续 |
| 星图 WASD 捡音  | 识谱 7 课后星图解锁 |
| 演奏钢琴有采样     | 调号/拍号单元顺序解锁 |
| 识谱快练无限刷     | 灵气顶栏随完课增加   |


---



## 9. 新对话开场模板（复制即用）

```
请阅读 docs/HANDOFF-AND-ROADMAP.md 和 README.md。

项目：C:\Users\23017\music-theory-game
当前：v1.1 已落地（路径、120 题、识谱快练、灵气 WASD、WebAudioFont、?dev=1）

下一步请按文档 §6 从 v1.2 开始：
1. 灵气星图 2.0（射击/像素/星区）— 优先
2. 演奏宽键盘 + 吉他/鼓采样
3. 内容与低音谱号

约束：先短计划等我确认再改代码；不要 git commit 除非我要求。
我可能会基于实际上线体验调整优先级。
```

**建议 @ 文件**：`docs/HANDOFF-AND-ROADMAP.md`、`core/learning-path.js`、`modules/spirit-journey/spirit-journey.html`、`core/spirit-progress.js`

---



## 10. 架构示意（长期）

```
┌─────────────────────────────────────────────────────────┐
│  学习中心 · 路径（教）                                    │
│  乐理 → 巩固 → 乐器课 → 识谱 → 快练 → [支线节奏] → 星图   │
└───────────────────────────┬─────────────────────────────┘
                            │ topicId / 灵气
┌───────────────────────────▼─────────────────────────────┐
│  练习中心（练）· 不受路径锁                               │
│  120 题 · 听音 · 错题本 · 每日 · 演奏 · 节奏               │
└───────────────────────────┬─────────────────────────────┘
                            │ v2.0+
┌───────────────────────────▼─────────────────────────────┐
│  创作层（愿景）· 叠轨 / 跟弹 / 小编曲                       │
└─────────────────────────────────────────────────────────┘
                            │ 最后
┌───────────────────────────▼─────────────────────────────┐
│  数据层 · 埋点 / 问卷 / 反馈驱动迭代                        │
└─────────────────────────────────────────────────────────┘
```

---



## 11. 致谢与备注

本项目从「练习向 demo」演进到「学练一体 + 路径 + 灵气奖励」，经历了用户与家人（识谱快练）、乐理专业人士（讲清楚）等多方反馈。  

**新对话请延续**：小步交付、路径可测、愿景写入文档但不一次做完。

如有冲突，以 **用户当次消息** 为准；本文档为交接参考，可随时增删章节。

---

## 12. 产品哲学与当前断点（2026-07-21）

**哲学**：学习路径 + 可玩世界是**有意的双核**，不是做歪。开源/问卷/求职展示/Agent 飞轮见 `.cursor/skills/music-theory-game/SKILL.md` 与 `docs/IDEA-BACKLOG.md`。

**当前代码**：v1.7.14 —
- **Boss telegraph 统一**：弹幕改 `pendingBoltsAt` 前摇锥线；重砸预警圈 `drawSkillTelegraphs`；击杀轻顿帧 `hitStopUntil`。
- **进化池加厚**：`SpiritEvo` 六选池 `pickThree`（生命/偷取/合弦/弹药/刚盾/流光步伐）；`traitSwiftStacks` 入远征局快照。
- **地形挂钩**：晶石/碎柱给弹药；开波 `objectiveHint` toast（柱/晶/雾/坑）。

**前作**：v1.7.13 —
- **闪步可读化**：暗涌/流曜改前摇 telegraph → `dashVx/Vy` dt 插值；draw 预警虚线；回前台重置 `lastTs`。
- **I66 远征局**：`campaignRunSnap` 跨节点保留生命/弹药/背包/进化性状/突变/僚机卫星；清场开 `#nodeSettlePanel`（继续清剿本关 / 回星图并升级）；首次通关强制成长三选一；已通可反复刷；败北「重试本关」保留养成，「返回菜单」才 `clearCampaignRun`。

**前作**：v1.7.12 —
- **I61 壳双核入口 MVP**：首页 setup 顶栏「学 ‖ 玩」双卡（`#dualGate`）：学→聚焦学习路径+脉冲；玩→`showSpiritModule()`。窄屏单列；儿童/标准密度字号区分。
- **战役星门点击**：`#campaignPanel` z-index 25（高于 `#overlay`）；`#overlay.hidden` 加 `visibility:hidden`；节点 y 上移避开贴底与「返回」热区；`.cmap-node` `z-index:2` + `touch-action:manipulation`。

**前作**：v1.7.11 — 演奏 `perform.js` 语法修复（`playDrum`）+ cache-bust，儿童/标准入口空白页。

**前作**：v1.7.10 —
- **面板假死修复**：根因=灵气已达标时 `syncSpiritFromStore→openVictory` 在进关弹出「星图已成」冻住世界，且 `victoryOpen`/进化/收编等可叠层。现：`forceCloseAllPanels()`（进关/`startNodeBattle`/清场回星图/`openCampaign` 必调）；达标同步**静默**只记 `goalShown`；运行中达标若有其他模态则 `pendingVictory` 延后；Esc 紧急关面板；君主奖励空选项有兜底按钮。

**前作**：v1.7.9 —
- **I60 终局叙事** `spirit-data.js` `FINALE_PAGES`（前尘→醒悟→女神寄语）；`spirit-journey.html` `#finalePanel`：仅 `isMega` 击破触发 `openFinale()`（不再直接 `openMegaReward`）；多页「继续」→末页「去演奏」（`mtg-spirit-open` perform）/「回战役星图」或「收下成长」；循环守卫加 `finaleOpen`。`spirit-journey.js` 接 `mtg-spirit-open`→点演奏芯片。

**前作**：v1.7.8 —
- **I55 卫星进化 + 血量阶梯** `spirit-drones.js`：`DRONE_MAX` 2→6（多僚机槽）；`commitRecruit` 后 `tryEvolveSatellite`——同型僚机满 `DRONE_SAT_NEED`(3) 消耗合成一颗**卫星**（`satellites[]`，`SAT_ORBIT_RADIUS`(74) 大轨道 + `SAT_ORBIT_SPEED`(0.42) 规则慢速公转 + 火力 ×`SAT_DAMAGE_MUL`(2.1)+穿透 + 更大弹，专名 磐卫·守心/幽卫·凝霜/流卫·迅光/暗卫·涌沙）；`update/draw/reset` 已含卫星分支，`satCount()`。`spirit-journey.html`：战役血量阶梯 `player.maxLives += currentSectorIdx`（Boss HP 随 wave 天然递增，星区越深越硬）。

**前作**：v1.7.7 —
- **I65 台词交互** `spirit-journey.html`：`#bossReply` 非模态回应钮（`pointer-events` 仅在钮上，5.5s 自动消失，不冻结主 loop）。Boss 出场（teach 路径 `flushBossSpawnDeferred` + 直出路径）与阶段3（`justStagedTo>=3`）台词时弹出 挑衅/安抚/沉默：挑衅→`swiftUntil` 提速；安抚→推迟全 Boss `skillCdUntil/beamCdUntil`、清 `pendingSlamAt`；沉默→+1 刚盾。`openDefeat/openCampaign` 收起。

**前作**：v1.7.6 —
- **I62 深化·多星区** `spirit-campaign.js`：新增「次星区」(wave 7–12 六节点) + `isSectorUnlocked/firstOpenSector/isSectorCleared`；`spirit-journey.html` 地图渲染由 `currentSectorIdx` 驱动（去掉死写的 0），加星区切换条 `#campaignNav`（前区全清才解锁后区），领主/君主节点通关弹知识卡（取 `WAVE_STAGES[wave].lesson`）。**Auto 续航手册**写入 SKILL：弱模型可照配方续推。

**前作**：v1.7.5 —
- **I64 君主多阶段** `spirit-boss.js`：`boss.megaStage`（hp>0.66=1 弹幕 / >0.33=2 弹幕+蓄力重装+吞音加速 / else=3 解锁聚能激光）；进阶 `justStagedTo`→主循环浮字+`BOSS_LINES.stage2/stage3` 台词；激光触发加 `megaStage>=3` 门槛。
- **I62 战役星图 MVP** `spirit-campaign.js`（首星区 6 节点 + 解锁进度 localStorage）+ `#campaignPanel` DOM 地图（星门 lock/unlock/cleared + SVG 连线）：远征入口改为 `openCampaign()`；选节点→`startNodeBattle()`（`pendingStartWave` 从指定 wave 起）；`campaignMode` 清场→`onNodeCleared()` 回星图、`markCleared` 解锁下一处，**不再自动刷新**；循环守卫 + update 守卫加 `campaignOpen`。

**前作**：v1.7.4 —
- **I63 命名体系统一**：小怪 影刺→暗涌 / 闪鼠→流曜（刚石·雾灵保留=「克刚石/冻雾灵」教学锚点）；领主/君主专名 **磐岳·刚石领主 / 幽岚·雾灵领主 / 噬律·失谐君主**。改名点：`spirit-data`(ENEMY_TYPES+WAVE_STAGES lesson)、`spirit-boss`(beginAnnounce/buildBoss)、`spirit-waves`(fallback)、`spirit-drones`(label/默认名)、`bossTeachBody`。

**前作**：v1.7.3 —
- **死亡卡死修复（P0）** `spirit-journey.html`：旧逻辑靠 `startBreath` 静默复活，但它在 `spawnStaggerTimer`/`pendingSpawns` 存在时会提前 return → 死在 Boss 波时留下不一致状态（整备横幅 0.0s + 场上有 Boss）卡死。改为 `openDefeat()`：`clearSpawnStagger`+清 `enemies/bullets/pendingSpawns`+`SpiritBoss.reset()`+`waveLive=false`+关所有 Boss 面板 → 弹「灵光消散」面板（`重新开始`=`restartRun`、`返回菜单`=回模式选择+`requestExit`）。循环守卫加 `defeatOpen`。**已浏览器端跑通**。
- **Boss 层级校正（P0）** `spirit-boss.js`：聚能激光**仅 `isMega`（终局君主）**专属，领主是附庸；`刚石领主` 无弹幕 → 改「**蓄力重装·重砸**」（`pendingSlamAt` 预警脉动→更大范围/击退的重砸）；`tip`/`bossTeachBody` 按元素校正。
- 前作 v1.7.2：I54-B 人格台词；v1.7.1：I54-A 聚能激光名场面。
- **I54-A 名场面** `spirit-boss.js`：Boss 吞掉附近掉落音符→`beamCharge` 蓄能；满值触发**聚能**：长后摇 `telegraph`（虚线随蓄能变亮、末段锁定转实线）→ 发射**又远又细又快的白热激光**。命中走现有 `onHurt`（尊重 `invulnUntil`/`ramming`），故 **Shift 闪避与 E 撞击的 i-frames 都能躲**（天然实现「E 闪避」而不动 E=撞击）。聚能瞬间 toast+浮字预警；Boss 击破/`reset` 自动 `clearBeam`。配置见 `spirit-data.js` `BOSS_BEAM_*`。
- **I54-B 人格台词** `spirit-data.js` `BOSS_LINES` + `spirit-boss.js pickLine()`：出场画面渲染狂妄台词（桀桀桀…），狂暴/聚能时 Boss 头顶浮字。纯氛围，与捡音/伤害解耦。
- 前作 v1.7.0：I57 引导修复 / I58 节奏型扫弦 / I59 提琴简易点奏 / 喘息→整备。

**两天冲刺** Day1 手感 + Day2 名场面/台词/死亡修复/Boss 层级校正 + I63 命名 + I64 君主多阶段 + I62 战役星图 MVP 已落地。

**下一刀（可照抄配方 · 详见 SKILL「Auto 续航手册」）**：
1. ~~闪步 + I66 远征局~~ v1.7.13；~~Boss telegraph / 进化池 / 地形挂钩~~ **已落地·v1.7.14**
2. 演奏最痛手感；I61 分端 UX 穿插；卫星能力再分化
3. A/B / 问卷 / 部署 — **后置，须用户点名**

**Auto 续航**：切 Auto 后每刀独立可验收；避坑见 SKILL「Auto 模式续航手册」。

**愿景后置**：黑神话式章节深度（更多回刷奖励分层）可继续加厚。

**部署**：用户点名再发。

**双端 UX 原则（用户 2026-07-22 指定 · 强制）**：每个乐器/模块都要 **PC 与手机都好用**——鼠标能点/拖，手机能点/滑；避免只为鼠标设计的交互。任何来源（自测/家人/问卷/他人）反馈的体验问题一律先记入 `IDEA-BACKLOG` 审校表再排期。
