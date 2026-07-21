/**
 * 学习路径 · v1.1
 * 识谱 7 课完成才解锁灵气星图；?dev=1 时全路径可点（仅测试）。
 */
const LearningPath = (() => {
  function isDevMode() {
    return typeof window.isDevUnlock === "function" ? window.isDevUnlock() : false;
  }

  const NODES = [
    { id: "theory-notes", kind: "lesson", emoji: "🎵", title: "音名与谱表", sub: "乐理 · 单元 1", module: "theory", lessonId: "theory-notes", topicId: "theory-notes" },
    { id: "practice-notes", kind: "practice", emoji: "🎯", title: "音名巩固", sub: "专题练习", topicId: "theory-notes", requires: "theory-notes" },
    { id: "theory-intervals", kind: "lesson", emoji: "📐", title: "音程入门", sub: "乐理 · 单元 2", module: "theory", lessonId: "theory-intervals", topicId: "theory-intervals" },
    { id: "practice-intervals", kind: "practice", emoji: "🎯", title: "音程巩固", sub: "专题练习", topicId: "theory-intervals", requires: "theory-intervals" },
    { id: "theory-triads", kind: "lesson", emoji: "🎹", title: "和弦构成", sub: "乐理 · 单元 3", module: "theory", lessonId: "theory-triads", topicId: "theory-triads" },
    { id: "practice-triads", kind: "practice", emoji: "🎯", title: "和弦巩固", sub: "专题练习", topicId: "theory-triads", requires: "theory-triads" },
    { id: "theory-keys", kind: "lesson", emoji: "🔑", title: "调号入门", sub: "乐理 · 单元 4", module: "theory", lessonId: "theory-keys", topicId: "theory-keys" },
    { id: "practice-keys", kind: "practice", emoji: "🎯", title: "调号巩固", sub: "专题练习", topicId: "theory-keys", requires: "theory-keys" },
    { id: "theory-meter", kind: "lesson", emoji: "🥁", title: "拍号时值", sub: "乐理 · 单元 5", module: "theory", lessonId: "theory-meter", topicId: "theory-meter" },
    { id: "practice-meter", kind: "practice", emoji: "🎯", title: "拍号巩固", sub: "专题练习", topicId: "theory-meter", requires: "theory-meter" },
    { id: "intro-piano", kind: "lesson", emoji: "🎹", title: "钢琴入门", sub: "键盘与中央 C", module: "piano", lessonId: "intro-piano", topicId: "intro-piano" },
    { id: "intro-guitar", kind: "lesson", emoji: "🎸", title: "吉他入门", sub: "六弦与开放和弦", module: "guitar", lessonId: "intro-guitar", topicId: "intro-guitar" },
    { id: "sight-reading", kind: "hub", emoji: "🎼", title: "识谱教学", sub: "7 课 · 五线谱点击认音", module: "sight" },
    { id: "sight-drill", kind: "drill", emoji: "⚡", title: "识谱快练", sub: "见谱点音 · 无限刷题", module: "sight", requires: "sight-reading" },
    { id: "rhythm-branch", kind: "side", emoji: "🥁", title: "节奏闯关", sub: "支线 · 7 关跟拍", module: "rhythm", requires: "theory-meter" },
    { id: "spirit-map", kind: "spirit", emoji: "✨", title: "灵气星图", sub: "完成识谱后解锁", module: "spirit", requires: "sight-reading" }
  ];

  function isLessonDone(node) {
    if (!node) return false;
    if (node.kind === "lesson") {
      if (node.module === "theory" && window.TheoryProgressStore) return TheoryProgressStore.isDone(node.lessonId);
      if (node.module === "piano" && window.PianoProgressStore) return PianoProgressStore.isDone(node.lessonId);
      if (node.module === "guitar" && window.GuitarProgressStore) return GuitarProgressStore.isDone(node.lessonId);
    }
    if (node.kind === "hub" && node.module === "sight" && window.SightProgressStore) {
      const total = (window.SIGHT_LESSONS || []).length;
      return total > 0 && SightProgressStore.completedCount() >= total;
    }
    return false;
  }

  function isRequirementMet(node) {
    if (isDevMode()) return true;
    if (node.requires) {
      const req = NODES.find(n => n.id === node.requires || n.lessonId === node.requires);
      return !!(req && isLessonDone(req));
    }
    const idx = NODES.indexOf(node);
    if (idx <= 0) return true;
    for (let i = idx - 1; i >= 0; i--) {
      const prev = NODES[i];
      if (prev.kind === "lesson" || prev.kind === "hub") return isLessonDone(prev);
    }
    return true;
  }

  function getNodeState(node) {
    if (node.kind === "practice" || node.kind === "drill" || node.kind === "side") {
      return isRequirementMet(node) ? "available" : "locked";
    }
    if (node.kind === "spirit") {
      if (!isDevMode()) {
        const req = NODES.find(n => n.id === node.requires);
        if (!req || !isLessonDone(req)) return "locked";
      }
      if (window.SpiritProgressStore && SpiritProgressStore.isGoalReached()) return "done";
      return "current";
    }
    if (node.kind === "lesson" || node.kind === "hub") {
      if (isLessonDone(node)) return "done";
      if (!isRequirementMet(node)) return "locked";
      const firstIncomplete = NODES.find(n => (n.kind === "lesson" || n.kind === "hub") && !isLessonDone(n));
      if (firstIncomplete && firstIncomplete.id === node.id) return "current";
      return "available";
    }
    return "available";
  }

  function completedCount() {
    return NODES.filter(n => (n.kind === "lesson" || n.kind === "hub") && isLessonDone(n)).length;
  }

  function totalLessonNodes() {
    return NODES.filter(n => n.kind === "lesson" || n.kind === "hub").length;
  }

  function handleNodeClick(node) {
    if (getNodeState(node) === "locked") return;
    if (node.kind === "practice" && typeof window.startTopicPractice === "function") {
      window.startTopicPractice(node.topicId);
      return;
    }
    if (node.module === "theory" && window.AppShell?.openTheoryLesson) {
      AppShell.openTheoryLesson(node.lessonId);
      return;
    }
    if (node.module === "piano" && window.AppShell?.openInstrumentLesson) {
      AppShell.openInstrumentLesson("piano", node.lessonId);
      return;
    }
    if (node.module === "guitar" && window.AppShell?.openInstrumentLesson) {
      AppShell.openInstrumentLesson("guitar", node.lessonId);
      return;
    }
    if (node.kind === "drill" && window.AppShell?.openSightDrill) {
      AppShell.openSightDrill();
      return;
    }
    if (node.module === "sight") {
      document.querySelector('[data-module="sight"]')?.click();
      return;
    }
    if (node.module === "rhythm") {
      document.querySelector('[data-module="rhythm"]')?.click();
      return;
    }
    if (node.module === "spirit") {
      document.querySelector('[data-module="spirit"]')?.click();
    }
  }

  function render(container) {
    if (!container) return;
    const done = completedCount();
    const total = totalLessonNodes();
    const spirit = window.SpiritProgressStore ? SpiritProgressStore.getTotal() : 0;
    const spiritGoal = window.SpiritProgressStore ? SpiritProgressStore.GOAL : 30;

    const rows = NODES.map((node, i) => {
      const state = getNodeState(node);
      const connector = i < NODES.length - 1
        ? `<div class="lp-connector ${state === "done" ? "done" : ""}" aria-hidden="true"></div>`
        : "";
      const badge = state === "done" ? '<span class="lp-badge">✓</span>'
        : state === "current" ? '<span class="lp-badge current">继续</span>'
        : state === "locked" ? '<span class="lp-badge lock">🔒</span>' : "";
      return `
        <div class="lp-row">
          <button type="button" class="lp-node ${state} ${node.kind}" data-node-id="${node.id}" ${state === "locked" ? "disabled" : ""}>
            <span class="lp-emoji">${node.emoji}</span>
            <span class="lp-body">
              <span class="lp-title">${node.title}</span>
              <span class="lp-sub">${node.sub}</span>
            </span>
            ${badge}
          </button>
        </div>${connector}`;
    }).join("");

    container.innerHTML = `
      <div class="lp-header">
        <span class="lp-progress-label">学习路径</span>
        <span class="lp-progress-count">${done}/${total} 完成 · ✨ ${spirit}/${spiritGoal}</span>
      </div>
      <div class="lp-track">${rows}</div>
      <p class="lp-hint">按路径学习 · 🎯 巩固 · ⚡ 快练 · 支线 🥁 · 识谱 7 课完成后解锁 <strong>灵气星图</strong>（WASD 捡音符）</p>`;

    container.querySelectorAll(".lp-node:not([disabled])").forEach(btn => {
      btn.addEventListener("click", () => {
        const node = NODES.find(n => n.id === btn.getAttribute("data-node-id"));
        if (node) handleNodeClick(node);
      });
    });
  }

  return { NODES, render, completedCount, totalLessonNodes, getNodeState, refresh: render };
})();

if (typeof window !== "undefined") {
  window.LearningPath = LearningPath;
}
