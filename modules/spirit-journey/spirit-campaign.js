/**
 * I62 — 战役星图（PvZ 式节点关卡）。
 * 星区=一张地图，节点串成路径；打通解锁下一处，而非自动刷新。
 * 仅数据 + 解锁进度（localStorage）；渲染与启动在 spirit-journey.html。
 */
(function (global) {
  "use strict";

  const LS = "mtg_spirit_campaign_v1";

  // 首星区节点（wave 对应现有 WAVE_STAGES；x/y 为地图百分比坐标）
  const SECTORS = [
    {
      id: "s1",
      name: "首星区",
      nodes: [
        /* y 控制在 ~28–68，避免贴底与「返回菜单」热区抢点击 */
        { id: "s1n1", wave: 1, title: "入门走位", type: "battle", x: 12, y: 62 },
        { id: "s1n2", wave: 2, title: "明快初识", type: "battle", x: 27, y: 38 },
        { id: "s1n3", wave: 3, title: "初识领主", type: "lord",   x: 43, y: 55 },
        { id: "s1n4", wave: 4, title: "阴郁控场", type: "battle", x: 59, y: 32 },
        { id: "s1n5", wave: 5, title: "地形试炼", type: "battle", x: 74, y: 52 },
        { id: "s1n6", wave: 6, title: "星区试炼", type: "lord",   x: 89, y: 34 }
      ]
    },
    {
      id: "s2",
      name: "次星区",
      nodes: [
        { id: "s2n1", wave: 7,  title: "变化音潮",   type: "battle", x: 11, y: 54 },
        { id: "s2n2", wave: 8,  title: "抗性综练",   type: "battle", x: 27, y: 36 },
        { id: "s2n3", wave: 9,  title: "明快星区领主", type: "lord",  x: 44, y: 52 },
        { id: "s2n4", wave: 10, title: "双重浪潮",   type: "battle", x: 60, y: 34 },
        { id: "s2n5", wave: 11, title: "加压整备",   type: "battle", x: 75, y: 50 },
        { id: "s2n6", wave: 12, title: "噬律·失谐君主", type: "mega", x: 90, y: 32 }
      ]
    }
  ];

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(LS));
      if (s && s.cleared) return s;
    } catch { /* */ }
    return { cleared: {} };
  }
  function save(s) {
    try { localStorage.setItem(LS, JSON.stringify(s)); } catch { /* */ }
  }

  let state = load();

  function sector(i) { return SECTORS[i || 0]; }
  function nodes(i) { return sector(i).nodes; }
  function isCleared(id) { return !!state.cleared[id]; }
  function isUnlocked(i, idx) {
    if (idx <= 0) return true;
    const ns = nodes(i);
    return isCleared(ns[idx - 1].id);
  }
  function nodeById(id) {
    for (const s of SECTORS) {
      const n = s.nodes.find((x) => x.id === id);
      if (n) return n;
    }
    return null;
  }
  function nextNode(id) {
    for (const s of SECTORS) {
      const idx = s.nodes.findIndex((x) => x.id === id);
      if (idx >= 0) return s.nodes[idx + 1] || null;
    }
    return null;
  }
  function markCleared(id) { state.cleared[id] = true; save(state); }
  function clearedCount(i) { return nodes(i).filter((n) => isCleared(n.id)).length; }
  function sectorCount() { return SECTORS.length; }
  function isSectorCleared(i) { return nodes(i).every((n) => isCleared(n.id)); }
  // 首个「未全清」的星区索引；全清则停在最后一区
  function firstOpenSector() {
    for (let i = 0; i < SECTORS.length; i++) if (!isSectorCleared(i)) return i;
    return SECTORS.length - 1;
  }
  // 该星区是否可进入：首区永远可进；后续区需前一区全清
  function isSectorUnlocked(i) { return i <= 0 ? true : isSectorCleared(i - 1); }
  function reset() { state = { cleared: {} }; save(state); }

  global.SpiritCampaign = {
    SECTORS, sector, nodes, isCleared, isUnlocked, nodeById, nextNode,
    markCleared, clearedCount, sectorCount, isSectorCleared, firstOpenSector,
    isSectorUnlocked, reset
  };
})(typeof window !== "undefined" ? window : globalThis);
