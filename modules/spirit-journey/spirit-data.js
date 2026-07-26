/**
 * 星图数据积木 · SpiritData
 * 怪谱 / 掉落 / 战斗常量。改数值优先改本文件，少动主循环。
 */
(function (global) {
  const NOTE_DEFS = [
    { letter: "C", solfege: "do", pc: 0, color: "#5a8cff" },
    { letter: "C♯", solfege: "升do", pc: 1, color: "#4a9cff", accidental: true },
    { letter: "D", solfege: "re", pc: 2, color: "#6a9cff" },
    { letter: "E♭", solfege: "降mi", pc: 3, color: "#7a8cff", accidental: true },
    { letter: "E", solfege: "mi", pc: 4, color: "#7a6cff" },
    { letter: "F", solfege: "fa", pc: 5, color: "#a06cff" },
    { letter: "F♯", solfege: "升fa", pc: 6, color: "#b078e8", accidental: true },
    { letter: "G", solfege: "sol", pc: 7, color: "#c078e8" },
    { letter: "A", solfege: "la", pc: 9, color: "#e078c0" },
    { letter: "B♭", solfege: "降si", pc: 10, color: "#f088a0", accidental: true },
    { letter: "B", solfege: "si", pc: 11, color: "#ff9a7a" }
  ];

  const NOTE_DEFS_NATURAL = NOTE_DEFS.filter((n) => !n.accidental);

  const ENEMY_TYPES = [
    {
      id: "shadow", name: "暗涌", tag: "平",
      color: "#3a2048", eye: "rgba(255,120,140,0.9)",
      hp: 1, speedMul: 1, r: 13,
      mult: { major: 1, minor: 1, flat: 1 },
      dropPcs: null,
      loot: [
        { kind: "note", w: 55 },
        { kind: "ammo_flat", w: 25 },
        { kind: "heart", w: 20 }
      ],
      tip: "三种弹都行 · 闪步有前摇"
    },
    {
      id: "stone", name: "刚石", tag: "刚",
      color: "#6a4830", eye: "rgba(255,200,120,0.95)",
      hp: 2.2, speedMul: 0.38, r: 16,
      mult: { major: 1.6, minor: 0.12, flat: 0.55 },
      dropPcs: [0, 4, 7],
      loot: [
        { kind: "armor", w: 42 },
        { kind: "ammo_major", w: 38 },
        { kind: "note", w: 20 }
      ],
      tip: "怕明快大三 · 震地推开"
    },
    {
      id: "mist", name: "雾灵", tag: "雾",
      color: "#3a3470", eye: "rgba(170,150,255,0.95)",
      hp: 1.4, speedMul: 1.05, r: 12,
      mult: { major: 0.2, minor: 1.65, flat: 0.55 },
      dropPcs: [9, 0, 4],
      loot: [
        { kind: "ammo_minor", w: 42 },
        { kind: "note", w: 38 },
        { kind: "heart", w: 20 }
      ],
      tip: "怕阴郁小三 · 会射雾弹"
    },
    {
      id: "dart", name: "流曜", tag: "闪",
      color: "#204858", eye: "rgba(120,230,210,0.95)",
      hp: 1, speedMul: 2.15, r: 10,
      mult: { major: 0.85, minor: 1.25, flat: 1.15 },
      dropPcs: [2, 5, 9],
      loot: [
        { kind: "swift", w: 48 },
        { kind: "ammo_minor", w: 27 },
        { kind: "note", w: 25 }
      ],
      tip: "敏捷极快 · 冲刺有预警"
    }
  ];

  const LOOT_META = {
    note: { label: "♪", color: "#c8b0ff", r: 11 },
    ammo_major: { label: "大", color: "#ffb060", r: 10 },
    ammo_minor: { label: "小", color: "#90b0ff", r: 10 },
    ammo_flat: { label: "弹", color: "#d0d0e8", r: 10 },
    armor: { label: "刚", color: "#c89050", r: 10 },
    swift: { label: "闪", color: "#50e0c8", r: 10 },
    heart: { label: "♥", color: "#ff8090", r: 10 }
  };

  global.SpiritData = {
    NOTE_DEFS,
    NOTE_DEFS_NATURAL,
    OCTAVE_SHIFTS: [-12, 0, 12],
    BASE_MIDI: 60,
    PACK_MAX: 5,
    AMMO_PER_CHORD: 6,
    AMMO_CAP: 30,
    /** I20：背包凑纯五（根+7半音）稳固增益，每波触发上限 */
    PERFECT_FIFTH_WAVE_MAX: 2,
    /** I20：背包两音相差八度（12 半音）→ 短暂加速，每波触发上限 */
    OCTAVE_WAVE_MAX: 2,
    MAX_NOTES: 6,
    MAX_NOTES_HARD: 9,
    MAX_ENEMIES: 4,
    MAX_LOOT: 10,
    AMMO_DROP: 2,
    SWIFT_MS: 4500,
    /**
     * I43 寓教于乐 · 教学节奏（默认偏慢，给认怪/换弹时间）
     * PACE_ENEMY：敌移速总倍率；PACE_FIRE：开火冷却倍率（>1 更慢）
     * STAGE_EXCLUSIVE：有 preferred 时只出表内怪种（关卡感）
     * STAGGER_MS：普通波逐只刷出间隔
     */
    PACE_ENEMY: 0.78,
    PACE_PLAYER: 0.92,
    PACE_FIRE: 1.25,
    PACE_BULLET: 0.9,
    STAGE_EXCLUSIVE: true,
    STAGGER_MS: 700,
    /** I44 星区：每区波数；小领主回血；君主奖励在 SpiritSectors */
    SECTOR_WAVES: 6,
    SECTOR_NAMES: ["初识星区", "明快星区", "阴郁星区", "深层星区"],
    /** I48 练习房：只刷首星区 1–6，通关可再刷或改远征 */
    PRACTICE_WAVE_CAP: 6,
    LORD_HEAL_TO_FULL: true,
    LORD_HEAL_MIN: 2,
    BREATH_MS_EARLY: 1400,
    BREATH_MS_LATER: 1000,
    DEATH_BREATH_MS: 1600,
    /**
     * I03/I43/I44 关卡波次表（按星区 6 波对齐）
     * 区内节奏：教 → 练 → 小领主 → 综合 → 加压 → 区末（首区领主 / 其后君主）
     */
    WAVE_STAGES: {
      1:  { title: "入门走位", kind: "normal", count: 2, preferred: [0], exclusive: true, focus: "WASD 练走 · 平击即可", lesson: "本关只出暗涌 · 先学会走位与开火" },
      2:  { title: "明快初识", kind: "normal", count: 2, preferred: [1], exclusive: true, focus: "大三对刚石更疼", lesson: "本关主出刚石 · 用大三·明快弹" },
      3:  { title: "初识领主", kind: "boss", bossTypeIndex: 1, escort: 0, focus: "超级弹 · 注意吞音", lesson: "小领主会吞音 · 击破后生命重整" },
      4:  { title: "阴郁控场", kind: "normal", count: 2, preferred: [2], exclusive: true, focus: "小三冻雾灵", lesson: "本关主出雾灵 · 用小三·阴郁弹" },
      5:  { title: "地形试炼", kind: "normal", count: 3, preferred: [0, 3], exclusive: true, focus: "坑雾柱 · 边走边打", lesson: "流曜更快 · 绕开坑雾再开火" },
      6:  { title: "星区试炼", kind: "boss", bossTypeIndex: 2, escort: 1, focus: "护卫+领主 · 换弹", lesson: "首星区末 · 先清护卫再打领主" },
      7:  { title: "变化音潮", kind: "normal", count: 3, preferred: [1, 2], exclusive: true, focus: "升降号叠突变", lesson: "捡变化音叠突变层" },
      8:  { title: "抗性综练", kind: "normal", count: 3, preferred: [1, 2, 3], exclusive: false, focus: "三种抗性轮换", lesson: "看标签换弹 · 别一路平击" },
      9:  { title: "明快星区领主", kind: "boss", bossTypeIndex: 1, escort: 1, focus: "领主+护卫", lesson: "击破回灵 · 留超级弹" },
      10: { title: "双重浪潮", kind: "normal", count: 4, preferred: [0, 1, 2], exclusive: false, focus: "怪更多 · 仍可整备", lesson: "错开刷怪 · 逐个解决" },
      11: { title: "加压整备", kind: "normal", count: 3, preferred: [2, 3], exclusive: true, focus: "雾灵+流曜", lesson: "控场弹优先 · 整理背包" },
      12: { title: "噬律·失谐君主", kind: "mega", bossTypeIndex: 1, escort: 1, focus: "多阶段 · T 合超弹", lesson: "星区末君主 · 击破有成长奖励" }
    },
    PLAYER_SPEED: 200,
    INVULN_MS: 1300,
    FIRE_COOLDOWN_MS: 280,
    STACK_T1: 10,
    STACK_T2: 20,
    RAM_COOLDOWN_MS: 1400,
    RAM_DURATION_MS: 300,
    /** I23 僚机 MVP */
    DRONE_RECRUIT_CHANCE: 0.09,
    DRONE_MAX: 6,
    DRONE_FIRE_INTERVAL_MS: 1200,
    DRONE_ORBIT_RADIUS: 38,
    DRONE_ORBIT_SPEED: 0.85,
    DRONE_FLAT_DAMAGE: 0.38,
    DRONE_BULLET_SPEED: 340,
    DRONE_SAT_NEED: 3,        // I55 同型僚机满 3 → 合成卫星
    SAT_MAX: 3,               // 卫星上限
    SAT_ORBIT_RADIUS: 74,     // 卫星轨道更大
    SAT_ORBIT_SPEED: 0.42,    // 周期更慢更规则（像更大的星体）
    SAT_FIRE_INTERVAL_MS: 1500,
    SAT_DAMAGE_MUL: 2.1,      // 卫星火力更强
    /** I33 探险地形：坑 + 软雾 */
    PIT_MAX: 5,
    PIT_MIN_R: 28,
    PIT_MAX_R: 46,
    PIT_HURT_COOLDOWN_MS: 900,
    PIT_EJECT: 72,
    FOG_MAX: 3,
    FOG_MIN_R: 50,
    FOG_MAX_R: 90,
    FOG_SLOW: 0.55,
    /** 遗迹晶石：踩中得少量灵气，每波刷新 */
    CRYSTAL_MAX: 4,
    CRYSTAL_R: 14,
    CRYSTAL_SPIRIT: 1,
    /** I34 软墙遗迹柱：挡路；撞击可破 */
    WALL_MAX: 4,
    WALL_R: 22,
    WALL_HP: 2,
    /** I36 Boss 来袭 / 吞音 / 技能 */
    BOSS_ANNOUNCE_MS: 2200,
    BOSS_HP_BASE: 15,
    BOSS_HP_PER_WAVE: 2.35,
    BOSS_SPEED_MUL: 0.95,
    BOSS_R_MUL: 2.05,
    /** I71 短边实体缩放（runtime 由 spirit-journey refreshEntityScale 写入） */
    ENTITY_SCALE: 1,
    BOSS_DEVOUR_R: 150,
    BOSS_DEVOUR_HEAL: 0.35,
    BOSS_DEVOUR_CD: 3400,
    BOSS_DEVOUR_CD_RAGE: 2100,
    /** 血量比例低于此进入 phase2 狂暴 */
    BOSS_RAGE_HP: 0.45,
    BOSS_RAGE_SPEED_MUL: 1.14,
    /** 狂暴时再乘技能/吞音 CD（<1 更短） */
    BOSS_RAGE_SKILL_CD_MUL: 0.88,
    BOSS_DEVOUR_R_RAGE: 190,
    MEGA_DEVOUR_R_MUL: 1.3,
    MEGA_DEVOUR_R_RAGE_MUL: 1.42,
    MEGA_DEVOUR_CD_MUL: 0.62,
    MEGA_DEVOUR_CD_RAGE_MUL: 0.54,
    BOSS_BOLT_SPEED: 210,
    /** I54 聚能激光：吞音蓄能 → 长后摇 telegraph → 又远又细又快的白热激光；Shift/E 闪避 i-frames 可躲 */
    BOSS_BEAM_CHARGE_NEED: 3,
    BOSS_BEAM_CHARGE_RATE: 0.34,
    BOSS_BEAM_CHARGE_MS: 980,
    BOSS_BEAM_FIRE_MS: 340,
    BOSS_BEAM_LEN: 1000,
    BOSS_BEAM_WIDTH: 15,
    BOSS_BEAM_CD: 4200,
    BOSS_BEAM_TRACK: 2.1,
    BOSS_BEAM_LOCK_MS: 240,
    MEGA_BEAM_CHARGE_MS_MUL: 0.82,
    MEGA_BEAM_CD_MUL: 0.66,
    MEGA_ANNOUNCE_MS: 3200,
    MEGA_HP_MUL: 2.35,
    /** I54-B Boss 人格台词（桀桀桀/狂妄）· 纯氛围，与捡音符/伤害解耦 */
    BOSS_LINES: {
      entrance: [
        "桀桀桀……又一缕星火，来喂养我的寂静。",
        "渺小的旋律，也敢闯入我的领域？",
        "你的和谐，终将在我面前崩解。"
      ],
      mega: [
        "桀桀桀桀——我将吞噬整个星系！",
        "和谐？那是弱者的谎言，臣服吧！",
        "众星为我陪葬，此域再无光明！"
      ],
      laser: [
        "湮灭吧！",
        "尝尝这道不谐之光！",
        "无处可逃——桀桀桀！"
      ],
      enrage: [
        "桀桀桀……你惹恼我了！",
        "够了！让我认真起来！"
      ],
      stage2: [
        "有点意思……那就动真格了！",
        "桀桀桀，接下我的重压！"
      ],
      stage3: [
        "够了——见识真正的湮灭！",
        "星海将因我而寂静！桀桀桀桀！"
      ]
    },
    /** I60 终局叙事（仅击破 isMega 后播放） */
    FINALE_PAGES: [
      {
        title: "星海将息",
        body: "噬律·失谐君主倒下了。不谐之息散开，像潮水退去——你听见，它胸腔里曾有过真正的旋律。"
      },
      {
        title: "前尘",
        body: "它也曾热爱和谐。后来被嘲笑、被排挤，把「合在一起」当成了谎言。于是它吞噬音符，只留下寂静。"
      },
      {
        title: "醒悟",
        body: "「原来……不是和谐背叛了我，是我先放弃了被听见。」光从裂隙里漏出来，它第一次低下头。"
      },
      {
        title: "女神寄语",
        body: "恭喜你走到这里。你用努力与温柔，摘到了属于自己的那颗星。世界因你又多了一点可唱的光——去演奏吧，或把想听的歌带进图谱。"
      }
    ],
    /** 变化音 · 突变词条（拾 accidental 叠层 → 三选一） */
    MUTATION_STACK_PER_PICK: 1,
    MUTATION_CHOICE_EVERY: 3,
    MUTATION_TRAITS: [
      { id: "crit", title: "突变·暴击", desc: "每级 +10% 暴击率，暴击伤害 ×1.45" },
      { id: "armorBreak", title: "突变·破甲", desc: "每级对刚石与领主额外 +18% 伤害" },
      { id: "resist", title: "突变·韧性", desc: "每级受伤减伤 10%，并 +8% 完全格挡" }
    ],
    /** I05 闪避 */
    DODGE_COOLDOWN_MS: 1600,
    DODGE_DURATION_MS: 160,
    DODGE_BOOST: 480,
    /** I20 阴郁融化 DoT */
    MELT_DPS: 0.55,
    MELT_MS: 2200,
    ENEMY_TYPES,
    LOOT_META,
    /** 星区内槽位 1–6（I44） */
    waveSlotInSector(w) {
      const n = this.SECTOR_WAVES || 6;
      return ((Math.max(1, w) - 1) % n) + 1;
    },
    sectorIndex(w) {
      const n = this.SECTOR_WAVES || 6;
      return Math.floor((Math.max(1, w) - 1) / n);
    },
    /** 槽 3 = 小领主；首星区槽 6 = 区末领主；其后槽 6 = 君主 */
    isBossWave(w) {
      if (this.isMegaWave(w)) return false;
      const slot = this.waveSlotInSector(w);
      return slot === 3 || slot === 6;
    },
    isMegaWave(w) {
      const slot = this.waveSlotInSector(w);
      const sector = this.sectorIndex(w);
      return slot === 6 && sector >= 1;
    },
    waveEnemyCount(w) {
      const slot = this.waveSlotInSector(w);
      const sector = this.sectorIndex(w);
      const base = slot <= 2 ? 2 : slot <= 5 ? 3 : 3;
      return Math.min(5, base + Math.min(2, Math.floor(sector / 2)));
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
