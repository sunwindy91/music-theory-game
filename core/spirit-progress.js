/**
 * 灵气进度 · 与学习路径 / 灵气星图联动
 * 完课/闯关/捡音符获得灵气，写入 localStorage。
 */
const SpiritProgressStore = (() => {
  const KEY = "mtg_spirit_progress_v1";
  const GOAL = 30;

  const AWARD = {
    theory_lesson: 4,
    instrument_lesson: 3,
    sight_lesson: 4,
    sight_drill_streak: 2,
    rhythm_pass: 5,
    topic_practice: 2,
    spirit_note: 1
  };

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return { total: 0, log: [] };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  }

  function getTotal() {
    return load().total || 0;
  }

  function award(type, meta = {}) {
    const amount = AWARD[type] || 2;
    const data = load();
    const id = meta.id || type;
    const dedupeKey = `${type}:${id}:${meta.dateKey || ""}`;
    if (meta.once && (data.awarded || []).includes(dedupeKey)) {
      return data.total || 0;
    }
    data.total = (data.total || 0) + amount;
    data.awarded = data.awarded || [];
    if (meta.once) data.awarded.push(dedupeKey);
    data.log = (data.log || []).slice(-50);
    data.log.push({ type, amount, meta, at: new Date().toISOString() });
    save(data);
    if (typeof window.refreshSpiritDisplay === "function") window.refreshSpiritDisplay();
    try {
      if (window.parent && window.parent !== window && typeof window.parent.refreshSpiritDisplay === "function") {
        window.parent.refreshSpiritDisplay();
      }
    } catch { /* cross-origin ignore */ }
    return data.total;
  }

  function isGoalReached() {
    return getTotal() >= GOAL;
  }

  function getSkills() {
    const data = load();
    return Object.assign({ major: 0, minor: 0, schoolDone: false }, data.skills || {});
  }

  function setSkills(patch = {}) {
    const data = load();
    data.skills = Object.assign(getSkills(), patch);
    save(data);
    return data.skills;
  }

  return { GOAL, AWARD, getTotal, award, isGoalReached, load, getSkills, setSkills };
})();

if (typeof window !== "undefined") {
  window.SpiritProgressStore = SpiritProgressStore;
}
