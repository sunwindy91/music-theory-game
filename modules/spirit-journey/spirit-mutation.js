/**
 * 变化音 · 突变词条积木
 */
(function (global) {
  "use strict";

  const SD = () => global.SpiritData || {};

  function emptyLevels() {
    return { crit: 0, armorBreak: 0, resist: 0 };
  }

  function choices() {
    const table = SD().MUTATION_TRAITS;
    if (table && table.length) return table.slice();
    return [
      { id: "crit", title: "突变·暴击", desc: "暴击率与暴击伤害提升" },
      { id: "armorBreak", title: "突变·破甲", desc: "对刚石与领主更疼" },
      { id: "resist", title: "突变·韧性", desc: "受伤减伤与格挡" }
    ];
  }

  function applyLevel(levels, id) {
    const lv = levels || emptyLevels();
    if (id === "crit" || id === "armorBreak" || id === "resist") {
      lv[id] = (lv[id] || 0) + 1;
    }
    return lv;
  }

  function rollCrit(levels) {
    const n = (levels && levels.crit) || 0;
    if (n <= 0) return false;
    return Math.random() < Math.min(0.65, n * 0.1);
  }

  function critDamageMul() {
    return 1.45;
  }

  function armorBreakMul(levels, enemy) {
    const n = (levels && levels.armorBreak) || 0;
    if (n <= 0 || !enemy) return 1;
    if (enemy.typeId === "stone" || enemy.isBoss) return 1 + n * 0.18;
    return 1;
  }

  /** @returns {{ blocked: boolean, factor: number }} */
  function mitigateIncoming(levels) {
    const n = (levels && levels.resist) || 0;
    if (n <= 0) return { blocked: false, factor: 1 };
    if (Math.random() < Math.min(0.45, n * 0.08)) {
      return { blocked: true, factor: 0 };
    }
    return { blocked: false, factor: Math.max(0.35, 1 - n * 0.1) };
  }

  function shortLabel(levels) {
    const lv = levels || emptyLevels();
    const parts = [];
    if (lv.crit) parts.push(`暴${lv.crit}`);
    if (lv.armorBreak) parts.push(`破${lv.armorBreak}`);
    if (lv.resist) parts.push(`韧${lv.resist}`);
    return parts.length ? `突变 ${parts.join("·")}` : "";
  }

  global.SpiritMutation = {
    emptyLevels,
    choices,
    applyLevel,
    rollCrit,
    critDamageMul,
    armorBreakMul,
    mitigateIncoming,
    shortLabel
  };
})(typeof window !== "undefined" ? window : globalThis);
