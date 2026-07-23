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

**稳态仪式（强制 · 每轮动手前）**

1. 读本 Skill 本节 +「星图锚点」末尾当前版本/下一刀  
2. 读 `HANDOFF-AND-ROADMAP.md` 文末「当前断点」  
3. 扫 `IDEA-BACKLOG.md` 置顶与审校表最近 3 行  
4. 用户当次消息覆盖优先级  
5. **里程碑结束三件套**（不可省）：`APP_VERSION` bump · HANDOFF §12 · IDEA 状态行；玩家可见文案禁外部作品名（串台扫一遍）  
6. 同一流程用满 2 次 → 写入本 Skill，不把稳态只留在聊天  

**「继续」协议（已稳定 · 自动执行）**

用户只说「继续 / 接着做 / ok 继续」且未改方向时：

```
稳态仪式 → 取 HANDOFF「下一刀」第一条可落地项 → 小切片实现
  → 若用量与质量允许，同轮可再落 1 刀相邻项（勿堆半成品）
  → 三件套 bump → 本轮若有可复用流程/插头/禁令 → 自动写入本 Skill 或 MODULE-CONTRACTS
  → 不汇报空转；短中文状态即可
```

不另开计划征求确认（总架构已授权时）；部署/commit 仍须用户点名。

**自动提炼触发（做完刀就扫一遍）**

| 若本轮出现… | 写到 |
|-------------|------|
| 新积木/LS key/body 属性 | `MODULE-CONTRACTS` + Skill 技术表 |
| 稳定协作口令（如「继续」） | 本 Skill 飞轮节 |
| 设计锚点验证（节奏/星区/双肤） | Skill「星图锚点」或壳锚点 |
| 玩家可见串台词 | IDEA 审校表 + 立刻清 UI |

**双端 UX 原则（用户 2026-07-22 指定 · 强制）**

- 每个乐器/模块都要 **PC 与手机都好用**：鼠标能点/拖，手机能点/滑；不做只服务鼠标的交互。  
- 触屏手势用 Pointer Events（鼠标+触屏统一）；需要拖动的控件配好 `touch-action`（如指板 `pan-x` 兼顾横向看品与竖向扫弦）。  
- 弦乐必须可 **扫弦**（竖划多弦依次响，见 `attachStrum`）。  
- **任何来源**（自测/家人/问卷/他人）反馈的体验问题 → 先记 `IDEA-BACKLOG` 审校表，再排期；不要口头说完就丢。

**禁止**：只改代码不改飞轮；吉他/路径文案串用星图黑话；游戏内点名外部作品；新增只支持鼠标、手机点不动/滑不了的交互。

**新对话接手清单**（按序）：

1. 读本 Skill（含总架构师模式是否已授权、稳态仪式）  
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
5. **游戏内 UI 禁止出现外部作品名**（含进化描述、演奏旁注）

## 星图战斗 · 设计锚点（已验证方向）

- **弹药双轨是对的**：大三包 / 小三包分槽 + 数量；平击保底  
- **前期**：凑成和弦自动入库、可自动切到刚获得的弹种  
- **教学债**：凑成和弦时必须说清「为什么」；战斗中少弹窗，**星区结算再回顾**（I44）  
- **教学节奏（I43）**：偏慢；一波一主题怪；关卡条教案；错开刷怪；清场整备≠定身  
- **星区制（I44）**：每区 6 波（教→练→小领主→综合→加压→区末）；槽 3/6 领主，二区起槽 6 君主；领主回血；君主成长奖励；进新区满状态 + 区末知识卡  
- **探险层**：全屏世界；坑/雾/晶石/遗迹柱；听辨收编；Boss 来袭  
- **mewo（I38）**：待用户提供工具  

检查点：`8238aed`。部署仍须用户点名。版本见 `APP_VERSION`（以 `core/features.js` 为准，当前 **v1.7.14**）。
**死亡交互（v1.7.3）**：死亡→`openDefeat()` 清战场/计时/Boss 面板→「灵光消散」面板（重新开始/返回菜单）；勿再用 `startBreath` 静默复活（会在刷怪计时未清时卡死）。
**Boss 层级（v1.7.3）**：激光仅 `isMega`（终局君主）；领主是附庸，刚石=蓄力重装·重砸（`pendingSlamAt` 预警后重砸），雾灵=弹幕。命名/tip 按元素。
**Boss 台词（v1.7.2 · I54-B）**：`spirit-data.js` `BOSS_LINES{entrance/mega/laser/enrage}`；`spirit-boss.js` `pickLine()`；出场画面渲染 taunt，狂暴/聚能经回调在 Boss 头顶浮字。纯氛围，与捡音/伤害解耦。
**Boss 聚能激光（v1.7.1 · spirit-boss.js）**：吞音→`beamCharge`；满值→`beam`（charge 后摇 telegraph→fire 白热束）。命中调 `onHurt`（尊重 `invulnUntil`），Shift/E i-frames 均可躲。Boss 死/reset→`clearBeam`。参数 `spirit-data.js` `BOSS_BEAM_*`；三条范式主线见 `REFERENCE-TO-MECHANICS.md`。
**命名体系（v1.7.4）**：小怪 暗涌/刚石/雾灵/流曜（刚石·雾灵=教学锚点保留）；领主/君主专名 磐岳·刚石领主 / 幽岚·雾灵领主 / 噬律·失谐君主。改名走 spirit-data(ENEMY_TYPES+WAVE_STAGES)、spirit-boss(名)、spirit-waves(fallback)、spirit-drones(label)、teach 文案。
**君主多阶段（v1.7.5·I64）**：`boss.megaStage` 由 hp 比算（>0.66=1 弹幕 / >0.33=2 弹幕+蓄力重装 / else=3 解锁激光）；进阶 `justStagedTo`→主循环浮字+台词 `BOSS_LINES.stage2/stage3`。激光触发加 `megaStage>=3` 门槛。
**战役星图（v1.7.5·I62 MVP，v1.7.6 多星区）**：`spirit-campaign.js`（星区/节点 + 解锁进度 localStorage `mtg_spirit_campaign_v1`；`isSectorUnlocked/firstOpenSector`）；`#campaignPanel` DOM 地图 + `#campaignNav` 星区切换（`currentSectorIdx` 驱动）；远征→`openCampaign()`；选节点→`startNodeBattle()`（`pendingStartWave`）；`campaignMode` 清场→结算（见 I66）；循环守卫加 `campaignOpen`。
**台词交互（v1.7.7·I65）**：`#bossReply` 非模态回应钮（`pointer-events` 仅在钮上·5.5s 自动消失·不冻结主 loop）；出场（`flushBossSpawnDeferred` + 直出）与阶段3 弹 挑衅/安抚/沉默 → `swiftUntil` 提速 / 推迟 Boss `skillCdUntil+beamCdUntil` / +1 刚盾；`openDefeat/openCampaign` 收起。
**卫星进化（v1.7.8·I55）**：`spirit-drones.js` `DRONE_MAX` 6；`commitRecruit`→`tryEvolveSatellite`（同型满 `DRONE_SAT_NEED`3 消耗合成 `satellites[]`：`SAT_ORBIT_RADIUS/SPEED` 大轨道慢公转 + `SAT_DAMAGE_MUL` 强火力 + 穿透，专名 磐卫/幽卫/流卫/暗卫）；`update/draw/reset` 有卫星分支。血量阶梯 `player.maxLives += currentSectorIdx`（Boss HP 随 wave 天然涨）。
**终局叙事（v1.7.9·I60）**：`spirit-data.js` `FINALE_PAGES`；仅 `isMega` 击破→`openFinale()`（`#finalePanel` 多页）；末页「去演奏」（`mtg-spirit-open` perform）/「回战役星图|收下成长」；循环守卫 `finaleOpen`。勿与灵气达标 victory 混淆。
**面板假死（v1.7.10）**：进关勿对已达标灵气弹 `openVictory`（`syncSpiritFromStore` 静默 `goalShown`）；`forceCloseAllPanels` 在 `startGame`/`startNodeBattle`/`onNodeCleared`/`openCampaign`；叠层用 `pendingVictory`；Esc 紧急关。新增模态必须进 `forceCloseAllPanels` + `update`/波次两处守卫。
**壳双核 + 星门点击（v1.7.12·I61 MVP）**：首页 `#dualGate` 学‖玩；战役 `#campaignPanel` z>overlay；`#overlay.hidden` 须 `visibility:hidden`。
**闪步 + 远征局（v1.7.13）**：暗涌/流曜禁裸 `x+=`；前摇+dt 冲刺。I66：`campaignRunSnap` 跨节点保留养成；`#nodeSettlePanel` 继续清剿/回星图升级；`SpiritDrones.exportState/importState`；`nodeSettleOpen` 进守卫。
**Boss 预警 + 成长池 + 地形（v1.7.14）**：弹幕 `pendingBoltsAt` + `drawSkillTelegraphs`；击杀 `hitStopUntil`；`SpiritEvo.pickThree` 六选抽三；晶石/碎柱给弹 + `objectiveHint`。
**当前下一刀**：演奏手感；I61 分端 UX；卫星能力再分化。A/B 后置。

## 两天冲刺 + 终局愿景（2026-07-23）

- Day1 手感已落（引导/节奏型/点奏）；Day2 星图名场面（Boss/卫星/命名）  
- **I60 终局**：最终 Boss 一生回顾 → 醒悟 → 女神寄语（努力/优秀/可遇不可及→摘星）→ 回图谱演奏或导入想听的歌  
- **I61 壳**：理论‖游戏并行入口；PC/手机分 UX；更立体层次——穿插做，不阻塞可分享原型  
- 女神台词与终局叙事先记 IDEA，**落地时用结算演出**，勿过早塞进战斗 HUD

## 演奏 · 交互手感锚点（已验证）

- **单音/扫空弦**（吉他/尤克）：点单音；竖划多弦 = 扫空弦（`attachStrum`）  
- **和弦扫弦模式**（借鉴 GarageBand Smart Guitar · I52）：开关后指板=扫弦区，**单音静音**；数字键/和弦钮选和弦（左手），**任意位置上下滑 = 下/上扫**（右手）；`Audio.strumChord(notes, downstroke, velocity)` 按弦序 ~18–22ms 依次拨响、力度随滑速。真实乐器就是「左手按弦不出声、右手拨/扫才出声」。  
- **擦弦/运弓**（小提琴/大提琴）：选弦+指位定音高；**运弓区按住来回拉动**持续发声（`attachBow` + `Audio.startBow(midi, voice)`）；速度控音量、停手渐弱；点指位 `playBowPreview`  
- **音色打磨方向**：合成先做「不刺耳」（低通+高通+共振峰+暖层）；真实感靠采样（I53）——遇到「音色怪」优先降尖锐、加暖层，再考虑换采样  
- **采样库 + 音色表（v1.6.9）**：`TIMBRE_TABLE` 契约（乐器→GM采样名/回退/交互）；`ensureSample`/`playSample`；运弓采样经 GainNode + ~1.8s 再排队。现状：钢琴0000 / 钢弦0250 / 尼龙0240 / 贝斯0330 / 小提琴0400 / 大提琴0420；鼓合成。  
- 贝斯已可弹；大提琴已可弹（C G D A）；每加乐器都要问「PC 拖 + 手机滑 都顺吗」+「像不像真乐器的发声分工」  
- **双端触控**：点触类控件用 `touch-action: manipulation`；指板用 `pan-x`——别给指板 cell 单独设 touch-action（会破坏扫弦）

## 壳 · 显示密度（I46）

- **同一信息架构**，不做第二套 App  
- `UiDensity`：`kid` | `std` → `body[data-density]`；LS `mtg_ui_density_v1`  
- 儿童：大字、暖色、大按钮；隐藏 `.density-advanced`  
- 标准：清爽紧凑、略冷背景、方角芯片；默认档（避免幼龄单一）  
- 切换条在首页 header；模块内不改副标题

## 星图入口（I48）

- 开局选 **练习房**（`PRACTICE_WAVE_CAP`=首区 6 波，可再刷）或 **远征**（星区推进）  
- LS/session：`mtg_spirit_run_mode_v1`  
- 远征：首区末补 `openSectorReview(0)`；其后区末仍走君主奖励链

## 技术模式（复用）

| 模式 | 位置 | 用途 |
|------|------|------|
| `AppShell` + `#*Root` | `index.html` | 模块切换 |
| `UiDensity` | `core/ui-density.js` | 壳儿童/标准双肤 |
| `attachStrum` | `modules/perform/perform.js` | 弦乐扫空弦手势（Pointer，鼠标+触屏） |
| 和弦扫弦模式 / `Audio.strumChord` | `modules/perform/perform.js` | 选和弦+任意位置上下滑扫弦；单音静音 |
| `attachBow` / `Audio.*Bow` | `modules/perform/perform.js` | 小提琴运弓（按住来回拉动持续发声） |
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

## Auto 模式续航手册（弱模型接手也能干 · 2026-07-23 结晶）

> 背景：用户用 Opus/API 做深度协作，用量将尽后会切回 **Auto 模式**（较弱模型）。本节让 Auto 也能延续质量。**每刀独立、可验收、小 diff**；宁可一次只推一小步，也不要堆半成品。

**Auto 行为契约**

1. 先跑「稳态仪式」→ 取下面「下一刀配方」第一条未完成项 → 只做这一条。
2. 改代码前**先 Read 目标行**，`StrReplace` 的 `old_string` 从读到的原文逐字复制（含全角标点）；匹配失败就**加长上下文**或缩小范围，别猜。
3. 每刀收尾必做**三件套**：`core/features.js` `APP_VERSION` bump（+0.0.1）· HANDOFF §12 追加一行 · IDEA-BACKLOG 状态行；玩家可见文案别串外部作品名。
4. 能实机验就实机验：浏览器开 `start-local.bat`(:8080) 或已在跑的 `:8848` → 截图确认；不确定就只做代码 + 静态复核，并在回复里注明「未实机验」。

**避坑清单（本会话踩过的）**

- **本机 shell 不稳**：`node --check`/python 输出常被吞、`&&` 在 PowerShell 不通。**别依赖命令行验证**，用浏览器 + 截图 + CDP。
- **波次循环脆弱**（`spirit-journey.html` 主 loop）：清场推进的守卫顺序必须是 ① `xxxOpen` 结算面板 return → ② `campaignMode` 关卡完成 intercept → ③ 正常波次推进。**新增任何模态面板，都要同时加进 `update()` 守卫和主循环推进守卫两处**，否则世界不冻结。
- **闭包私有**：`enemies/bullets/wave/player` 在 IIFE 内，CDP `Runtime.evaluate` 打不到；要测战斗效果只能实机玩，或临时把变量挂到 `window` 做调试钩子（用完删）。
- **验 Boss 触发的 UI**（如 I65 回应钮）：静置玩家会在 Boss 波 1–2 秒内被打死→`openDefeat` 会立刻收起该 UI，截图常扑空。判「是否触发」看 DOM 文案是否更新（如 `bossReplyLine.textContent` 每次出场都换台词）；要**看外观**就 CDP 强制 `classList.add('show')` 单独截 UI，或先按 P 冻结再截。
- **面板假死（v1.7.10）**：灵气已满时禁止在 `startGame`/`sync` 弹胜利窗；进关/回星图必须 `forceCloseAllPanels`；Esc 可紧急关。新增任何 `*Open` 模态 → 同步写入 `forceCloseAllPanels` + `update()` 守卫 + 波次推进守卫。
- **战役星门被挡（v1.7.12）**：`#overlay` 在 DOM 上晚于 `#campaignPanel` 且曾同 z-index → 透明 overlay 仍可挡点击。修法：campaign z 更高 + `overlay.hidden` 加 `visibility:hidden`；节点 y 勿贴地图底边（与「返回」抢点）。
- **闪步≠缺帧（v1.7.13）**：暗涌/流曜曾裸 `x+=常数`，玩家读成掉帧。技能位移必须前摇+dt 插值；主循环追击在 `dashTelegraph/dashUntil` 期间要停。
- **远征勿静默踢出（v1.7.13·I66）**：`campaignMode` 清场禁止直接 `onNodeCleared→openCampaign`；开 `#nodeSettlePanel`；跨节点用 `campaignRunSnap` + `SpiritDrones.export/import`；`startGame({preserveRun})`；新增 `nodeSettleOpen` 进两处守卫。
- **浏览器点击工具的误判**：面板重叠时 `browser_click` 的包围盒启发式可能误报「被 X 拦截」，但 `document.elementFromPoint` 才是真实命中；被误挡时改用节点中心坐标点击，或 CDP `el.click()` 直接触发处理器（截图坐标≠视口坐标，注意缩放）。
- **中文 StrReplace**：HANDOFF/中文文档偶有编码/相似行导致 fuzzy 匹配失败 → 用更长唯一上下文，仍不行才退回逐段替换。
- **改名/文案**：一处名字改动要同步 `spirit-data`(ENEMY_TYPES+WAVE_STAGES)、`spirit-boss`、`spirit-waves`、`spirit-drones`、`bossTeachBody` 全链，别只改一处。

**下一刀配方（按序 · 每条可独立交付）**

**① I62 深化 · 关底结算 + 多星区**
- 目标：领主节点（n3/n6）通关弹知识卡；首星区 6 节点全清 → 解锁「次星区」。
- 动：`spirit-campaign.js`（新增 `SECTORS[1]` 次星区，wave 7–12，节点坐标仿首区）；`spirit-journey.html`（`renderCampaignMap`/`openCampaign` 里把写死的 `0` 换成 `currentSectorIdx` 变量；`onNodeCleared` 对 lord 节点调 `openSectorReview` 或弹卡；全清后地图给「进入次星区」入口）。
- 验收：清完 6 节点 → 出现次星区可选；领主通关有一张知识卡。
- 坑：`renderCampaignMap` 现在硬编码 `SC.nodes(0)`；先加 `currentSectorIdx` 再泛化。

**② I65 台词交互**
- 目标：Boss 关键台词（出场/狂暴/阶段3）时，屏幕给 2–3 个回应钮（挑衅/安抚/沉默），点击给浮字 + 微 buff（如短暂 `swiftUntil` 或让 Boss 下次技能 CD +少许）。
- 动：`spirit-journey.html`（非模态小面板，`pointer-events` 只在钮上，几秒自动消失，**不冻结主 loop**）；`spirit-data.js`（可加 `BOSS_REPLIES`）。
- 验收：出场时回应钮出现，点一个有浮字+微效果，自动消失；不卡战斗。
- 坑：别做成模态；务必自动 timeout，避免忘关挡操作。

**③ I55 卫星进化 + 血量阶梯**（大 · 拆 3 小步做）
- 3a 多僚机槽：`spirit-drones.js` 支持 >1 drone（先读它现有 API/reset/update）。
- 3b 卫星进化：3 个同型僚机 → 合成「卫星」，改为**绕玩家周期公转**（更大、更慢、独立属性）。
- 3c 血量阶梯：`spirit-data.js` 定义按星区递增的 `player.maxLives` 与 Boss HP 倍率（越后期涨越慢）。
- 验收：每小步单独可玩可见；别一次全塞。
- 坑：先 Read `spirit-drones.js` 摸清接口再改。

**④ I60 终局 + 女神寄语** — **已消化·v1.7.9**
- 目标：击破终局君主（`isMega`）后播叙事：君主前尘→醒悟→女神寄语（努力/优秀/摘星）→回图谱演奏或导入想听的歌。
- 动：`spirit-journey.html` 新增 `openFinale()`（多段叙事面板，仿 `openDefeat` 结构）；文案放 `spirit-data.js`。
- 验收：**仅**在击破 mega 时触发，不与「灵气达标 victory」混淆。
- 坑：触发点要判 `isMega` 且是真正击破，不是灵气达标。

**⑤ 下一刀候选（v1.7.14 后）**
- **演奏手感**；I61 分端 UX 穿插；卫星能力再分化
- ~~闪步 / I66 / Boss telegraph / 进化池 / 地形~~ 已消化·v1.7.13–14
- A/B / 问卷 — **后置，须用户点名**

**之后**：内容打磨稳后再议 A/B 发布与问卷。发布/部署仍须用户点名。

## 详细参考

见 [docs/HANDOFF-AND-ROADMAP.md](../../docs/HANDOFF-AND-ROADMAP.md)、[docs/IDEA-BACKLOG.md](../../docs/IDEA-BACKLOG.md)。
