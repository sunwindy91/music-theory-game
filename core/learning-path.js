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
    { id: "theory-accidentals", kind: "lesson", emoji: "♯", title: "升降号", sub: "乐理 · 高阶", module: "theory", lessonId: "theory-accidentals", topicId: "theory-accidentals", requires: "theory-keys" },
    { id: "practice-accidentals", kind: "practice", emoji: "🎯", title: "升降号巩固", sub: "专题练习", topicId: "theory-accidentals", requires: "theory-accidentals" },
    { id: "theory-meter", kind: "lesson", emoji: "🥁", title: "拍号时值", sub: "乐理 · 单元 5", module: "theory", lessonId: "theory-meter", topicId: "theory-meter" },
    { id: "practice-meter", kind: "practice", emoji: "🎯", title: "拍号巩固", sub: "专题练习", topicId: "theory-meter", requires: "theory-meter" },
    { id: "intro-piano", kind: "lesson", emoji: "🎹", title: "钢琴入门", sub: "键盘与中央 C", module: "piano", lessonId: "intro-piano", topicId: "intro-piano" },
    { id: "intro-guitar", kind: "lesson", emoji: "🎸", title: "吉他入门", sub: "六弦与开放和弦", module: "guitar", lessonId: "intro-guitar", topicId: "intro-guitar" },
    { id: "sight-reading", kind: "hub", emoji: "🎼", title: "识谱教学", sub: "7 课 · 五线谱点击认音", module: "sight" },
    { id: "sight-drill", kind: "drill", emoji: "⚡", title: "识谱快练", sub: "见谱点音 · 无限刷题", module: "sight", requires: "sight-reading" },
    { id: "rhythm-branch", kind: "side", emoji: "🥁", title: "节奏闯关", sub: "支线 · 7 关跟拍", module: "rhythm", requires: "theory-meter" },
    { id: "spirit-map", kind: "spirit", emoji: "✨", title: "灵气星图", sub: "完成识谱后解锁", module: "spirit", requires: "sight-reading" }
  ];

  /** 路径节点 → 星图关卡建议（I29 MVP）；label 为空则仅预留 stub */
  const PATH_SPIRIT_SUGGESTIONS = {
    "theory-notes": { label: "捡白键音名入背包" },
    "practice-notes": { label: "捡白键音名入背包", mirrorLessonId: "theory-notes" },
    "theory-intervals": { label: "听音程距离感" },
    "practice-intervals": { label: "听音程距离感", mirrorLessonId: "theory-intervals" },
    "theory-triads": {
      label: "练明快/阴郁克制",
      focus: ["大三弹", "小三弹", "怪谱抗性"]
    },
    "practice-triads": { label: "练明快/阴郁克制", mirrorLessonId: "theory-triads" },
    "theory-keys": { label: "高阶再碰升降号" },
    "practice-keys": { label: "高阶再碰升降号", mirrorLessonId: "theory-keys" },
    "theory-accidentals": { label: "高波次可遇变化音" },
    "practice-accidentals": { label: "高波次可遇变化音", mirrorLessonId: "theory-accidentals" },
    "theory-meter": { label: "跟拍与小节呼吸" },
    "practice-meter": { label: "跟拍与小节呼吸", mirrorLessonId: "theory-meter" },
    "sight-reading": {
      label: "波次 1–2 白键",
      focus: ["识谱认键", "星图门禁已开"]
    },
    "sight-drill": { label: "波次 1–2 白键", mirrorLessonId: "sight-reading" },
    "spirit-map": { label: "波次 1–2 白键", whenRequirementMet: true }
  };

  let _bridgeDoneInit = false;
  let _bridgeDoneIds = new Set();

  function collectDoneLessonNodeIds() {
    const ids = new Set();
    for (const node of NODES) {
      if ((node.kind === "lesson" || node.kind === "hub") && isLessonDone(node)) {
        ids.add(node.id);
      }
    }
    return ids;
  }

  function popNewlyCompletedLessonNodes() {
    const now = collectDoneLessonNodeIds();
    if (!_bridgeDoneInit) {
      _bridgeDoneIds = now;
      _bridgeDoneInit = true;
      return [];
    }
    const fresh = [];
    for (const id of now) {
      if (!_bridgeDoneIds.has(id)) fresh.push(NODES.find(n => n.id === id));
    }
    _bridgeDoneIds = now;
    return fresh.filter(Boolean);
  }

  function bridgeToast(msg) {
    const el = document.createElement("div");
    el.className = "lp-bridge-toast";
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 280);
    }, 2600);
  }

  function dismissBridgeCard() {
    document.querySelector(".lp-bridge-backdrop")?.remove();
  }

  function openSpiritFromBridge(label) {
    const spiritNode = NODES.find(n => n.id === "spirit-map");
    const unlocked = spiritNode && (isDevMode() || getNodeState(spiritNode) !== "locked");
    if (!unlocked) {
      bridgeToast("识谱 7 课完成后解锁灵气星图");
      return;
    }
    try {
      sessionStorage.setItem("mtg-spirit-focus", label || "波次制 · 清场整备");
    } catch { /* ignore */ }
    dismissBridgeCard();
    document.querySelector('[data-module="spirit"]')?.click();
  }

  function maybeShowCompleteBridgeCard() {
    const nodes = popNewlyCompletedLessonNodes();
    for (const node of nodes) {
      const label = getSpiritSuggestionLabel(node);
      if (!label) continue;
      dismissBridgeCard();
      const backdrop = document.createElement("div");
      backdrop.className = "lp-bridge-backdrop";
      backdrop.setAttribute("role", "dialog");
      backdrop.setAttribute("aria-modal", "true");
      backdrop.innerHTML = `
        <div class="lp-bridge-card">
          <button type="button" class="lp-bridge-close" aria-label="关闭">×</button>
          <p class="lp-bridge-kicker">本课练成了什么</p>
          <h3 class="lp-bridge-title">${node.emoji} ${node.title}</h3>
          <p class="lp-bridge-suggest">去星图试：${label}</p>
          <div class="lp-bridge-actions">
            <button type="button" class="lp-bridge-btn secondary" data-lp-bridge="stay">继续路径</button>
            <button type="button" class="lp-bridge-btn primary" data-lp-bridge="spirit">去星图试试</button>
          </div>
        </div>`;
      document.body.appendChild(backdrop);
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) dismissBridgeCard();
      });
      backdrop.querySelector(".lp-bridge-close")?.addEventListener("click", dismissBridgeCard);
      backdrop.querySelector('[data-lp-bridge="stay"]')?.addEventListener("click", dismissBridgeCard);
      backdrop.querySelector('[data-lp-bridge="spirit"]')?.addEventListener("click", () => {
        openSpiritFromBridge(label);
      });
      return;
    }
  }

  function getSpiritSuggestionLabel(node) {
    const entry = PATH_SPIRIT_SUGGESTIONS[node.id];
    if (!entry || !entry.label) return null;

    if (entry.whenRequirementMet && node.kind === "spirit") {
      const req = NODES.find(n => n.id === node.requires);
      return req && isLessonDone(req) ? entry.label : null;
    }

    if (entry.mirrorLessonId) {
      const lesson = NODES.find(n => n.id === entry.mirrorLessonId);
      return lesson && isLessonDone(lesson) ? entry.label : null;
    }

    if (node.kind === "lesson" || node.kind === "hub") {
      return isLessonDone(node) ? entry.label : null;
    }

    return null;
  }

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

  /** 正式版焦点：当前课 → 可点巩固 → 已解锁星图 → 第一课 */
  function getFocusNode() {
    const current = NODES.find((n) => getNodeState(n) === "current");
    if (current) return current;
    const practice = NODES.find((n) =>
      (n.kind === "practice" || n.kind === "drill") && getNodeState(n) === "available"
    );
    if (practice) return practice;
    const spirit = NODES.find((n) => n.id === "spirit-map" && getNodeState(n) !== "locked");
    if (spirit) return spirit;
    return NODES.find((n) => n.kind === "lesson") || NODES[0];
  }

  function defaultPathMode() {
    return isDevMode() ? "full" : "focus";
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
      try {
        const hint = getSpiritSuggestionLabel(node) || "波次制 · 清场整备";
        sessionStorage.setItem("mtg-spirit-focus", hint);
      } catch { /* ignore */ }
      document.querySelector('[data-module="spirit"]')?.click();
    }
  }

  function nodeButtonHtml(node, opts) {
    opts = opts || {};
    const state = getNodeState(node);
    const badge = state === "done" ? '<span class="lp-badge">✓</span>'
      : state === "current" ? '<span class="lp-badge current">继续</span>'
      : state === "locked" ? '<span class="lp-badge lock">🔒</span>' : "";
    const spiritHint = opts.showSpiritHint !== false ? getSpiritSuggestionLabel(node) : null;
    const spiritHintHtml = spiritHint
      ? `<span class="lp-spirit-hint">星图建议：${spiritHint}</span>`
      : "";
    const cta = opts.cta
      ? `<span class="lp-focus-cta">${opts.cta}</span>`
      : "";
    return `
      <button type="button" class="lp-node ${state} ${node.kind} ${opts.extraClass || ""}" data-node-id="${node.id}" ${state === "locked" ? "disabled" : ""}>
        <span class="lp-emoji">${node.emoji}</span>
        <span class="lp-body">
          <span class="lp-title">${node.title}</span>
          <span class="lp-sub">${node.sub}</span>
          ${spiritHintHtml}
          ${cta}
        </span>
        ${badge}
      </button>`;
  }

  function bindNodeClicks(container) {
    container.querySelectorAll(".lp-node:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => {
        const node = NODES.find((n) => n.id === btn.getAttribute("data-node-id"));
        if (node) handleNodeClick(node);
      });
    });
  }

  function renderFullTrack(container, done, total, spirit, spiritGoal) {
    const rows = NODES.map((node, i) => {
      const state = getNodeState(node);
      const connector = i < NODES.length - 1
        ? `<div class="lp-connector ${state === "done" ? "done" : ""}" aria-hidden="true"></div>`
        : "";
      return `<div class="lp-row">${nodeButtonHtml(node)}</div>${connector}`;
    }).join("");

    container.innerHTML = `
      <div class="lp-header">
        <span class="lp-progress-label">完整路线图</span>
        <span class="lp-progress-count">${done}/${total} 完成 · ✨ ${spirit}/${spiritGoal}</span>
      </div>
      <div class="lp-track">${rows}</div>
      <p class="lp-hint">按路径学习 · 识谱 7 课完成后解锁 <strong>灵气星图</strong>。正式版默认只显示当前一关，减少压力。</p>
      <button type="button" class="lp-toggle-mode" data-lp-mode="focus">只看当前一关</button>`;

    bindNodeClicks(container);
    container.querySelector("[data-lp-mode=focus]")?.addEventListener("click", () => {
      render(container, { mode: "focus" });
    });
  }

  function renderFocus(container, done, total, spirit, spiritGoal) {
    const focus = getFocusNode();
    const state = focus ? getNodeState(focus) : "available";
    const action =
      state === "current" ? "继续这一关"
        : state === "done" ? "再看一眼 / 去下一环"
        : state === "locked" ? "尚未解锁"
        : "开始";
    let nextPreview = null;
    if (focus) {
      const idx = NODES.indexOf(focus);
      for (let i = idx + 1; i < NODES.length; i++) {
        const n = NODES[i];
        if ((n.kind === "lesson" || n.kind === "hub") && !isLessonDone(n)) {
          nextPreview = n;
          break;
        }
      }
    }

    container.innerHTML = `
      <div class="lp-header">
        <span class="lp-progress-label">现在这一关</span>
        <span class="lp-progress-count">${done}/${total} · ✨ ${spirit}/${spiritGoal}</span>
      </div>
      <p class="lp-focus-lead">一次只看一件事 · 做完再解锁下一关</p>
      <div class="lp-focus-card">
        ${focus ? nodeButtonHtml(focus, { cta: action, extraClass: "lp-focus-main", showSpiritHint: false }) : ""}
      </div>
      ${nextPreview
        ? `<p class="lp-focus-next">下一关预告：${nextPreview.emoji} ${nextPreview.title}<span>（完成后出现）</span></p>`
        : ""}
      <button type="button" class="lp-toggle-mode" data-lp-mode="full">查看完整路线图</button>
      <p class="lp-hint">不想被「好多课」吓到？先点上面这一关。测试可用 <code>?dev=1</code> 默认展开全图。</p>`;

    bindNodeClicks(container);
    container.querySelector("[data-lp-mode=full]")?.addEventListener("click", () => {
      render(container, { mode: "full" });
    });
  }

  function render(container, opts) {
    if (!container) return;
    opts = opts || {};
    const mode = opts.mode || container.dataset.lpMode || defaultPathMode();
    container.dataset.lpMode = mode;
    const done = completedCount();
    const total = totalLessonNodes();
    const spirit = window.SpiritProgressStore ? SpiritProgressStore.getTotal() : 0;
    const spiritGoal = window.SpiritProgressStore ? SpiritProgressStore.GOAL : 30;

    if (mode === "full") {
      renderFullTrack(container, done, total, spirit, spiritGoal);
    } else {
      renderFocus(container, done, total, spirit, spiritGoal);
    }

    maybeShowCompleteBridgeCard();
  }

  return {
    NODES,
    PATH_SPIRIT_SUGGESTIONS,
    getSpiritSuggestionLabel,
    getFocusNode,
    defaultPathMode,
    render,
    completedCount,
    totalLessonNodes,
    getNodeState,
    refresh: render
  };
})();

if (typeof window !== "undefined") {
  window.LearningPath = LearningPath;
}
