/**
 * 星区积木 · SpiritSectors（I44）
 * 星区划分、区末回顾题、君主结算奖励文案。主循环负责改玩家状态。
 * 游戏内禁止外部作品名。
 */
(function (global) {
  "use strict";

  const SD = () => global.SpiritData || {};

  const MEGA_REWARDS = [
    { id: "maxLife", title: "生命上限 +1", desc: "更耐打，适合稳扎稳打" },
    { id: "firePower", title: "和弦火力 +1", desc: "大三/小三伤害略升（本局）" },
    { id: "tenacity", title: "星区韧性", desc: "受伤有更高机会减伤（本局叠层）" }
  ];

  function wavesPerSector() {
    return SD().SECTOR_WAVES || 6;
  }

  function sectorIndexFromWave(w) {
    const n = wavesPerSector();
    return Math.max(0, Math.floor((Math.max(1, w) - 1) / n));
  }

  function sectorLabel(idx) {
    const names = SD().SECTOR_NAMES || ["初识星区", "明快星区", "阴郁星区", "深层星区"];
    return names[Math.min(idx, names.length - 1)] || `星区 ${idx + 1}`;
  }

  function waveRangeForSector(idx) {
    const n = wavesPerSector();
    const start = idx * n + 1;
    return { start, end: start + n - 1 };
  }

  /** 区末回顾：只取本星区末关 tip（勿拼接多关 lesson）+ 一题 */
  function reviewForSector(idx) {
    const { end } = waveRangeForSector(idx);
    const stages = SD().WAVE_STAGES || {};
    const endStage = stages[end] || stages[((end - 1) % 12) + 1] || null;
    const summary = (endStage && (endStage.lesson || endStage.focus))
      || "复习：大三明快、小三阴郁、看抗性换弹";
    const quizzes = [
      {
        prompt: "大三听感更接近？",
        answer: "a",
        options: [
          { id: "a", label: "明快、适合穿透" },
          { id: "b", label: "阴郁、适合冰冻" },
          { id: "c", label: "完全无差别" }
        ],
        teach: "大三 = 根 + 大三度(+4) + 纯五 → 明快穿透"
      },
      {
        prompt: "小三更克制哪类？",
        answer: "b",
        options: [
          { id: "a", label: "刚石（怕大三）" },
          { id: "b", label: "雾灵（怕小三）" },
          { id: "c", label: "谁都不怕" }
        ],
        teach: "小三阴郁控场 · 对雾灵更有效"
      },
      {
        prompt: "清场后的「整备」期间可以？",
        answer: "a",
        options: [
          { id: "a", label: "移动、捡音、合成" },
          { id: "b", label: "完全不能动" },
          { id: "c", label: "只能开火" }
        ],
        teach: "整备不是定身 · Enter 可立刻下一波"
      }
    ];
    const quiz = quizzes[idx % quizzes.length];
    return {
      title: `${sectorLabel(idx)} · 结算`,
      summary,
      quiz
    };
  }

  function megaRewards() {
    return MEGA_REWARDS.slice();
  }

  global.SpiritSectors = {
    wavesPerSector,
    sectorIndexFromWave,
    sectorLabel,
    waveRangeForSector,
    reviewForSector,
    megaRewards,
    isSectorEndWave(w) {
      const n = wavesPerSector();
      return w > 0 && w % n === 0;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
