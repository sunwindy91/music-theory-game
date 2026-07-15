const WrongBookModule = (() => {
  let root = null;
  let callbacks = {};

  function formatDueTime(ts) {
    const diff = ts - Date.now();
    if (diff <= 0) return "待复习";
    const mins = Math.ceil(diff / 60000);
    if (mins < 60) return `${mins} 分钟后`;
    const hours = Math.ceil(diff / 3600000);
    if (hours < 24) return `${hours} 小时后`;
    const days = Math.ceil(diff / 86400000);
    return `${days} 天后`;
  }

  function stageLabel(stage) {
    const labels = ["新错题", "第1次", "第2次", "第3次", "第4次", "第5次", "已掌握"];
    return labels[Math.min(stage, 6)] || "新错题";
  }

  function sourceLabel(source) {
    if (source === "audio") return "听音识名";
    if (source === "daily") return "每日挑战";
    return "综合练习";
  }

  function render() {
    if (!root) return;
    const entries = WrongBookStore.getAll();
    const dueCount = WrongBookStore.getDueCount();
    const total = WrongBookStore.getTotalCount();
    const now = Date.now();

    let listHtml = "";
    if (entries.length === 0) {
      listHtml = `
        <div class="wb-empty">
          <span class="emoji">📖</span>
          还没有错题记录<br>在综合练习或听音识名中答错后会自动收录
        </div>`;
    } else {
      listHtml = `<div class="wb-list">${entries.map(entry => {
        const q = entry.question;
        const isDue = entry.nextReviewAt <= now;
        return `
          <div class="wb-item${isDue ? " wb-item-due" : ""}" data-id="${entry.id}">
            <div class="wb-item-top">
              <span class="wb-item-type">${q.type || "题目"}</span>
              <span class="wb-item-stage">${stageLabel(entry.stage)} · ${sourceLabel(entry.source)}</span>
            </div>
            <div class="wb-item-text">${q.text}</div>
            <div class="wb-item-meta">
              错 ${entry.wrongCount || 1} 次 · ${isDue ? "⏰ 待复习" : formatDueTime(entry.nextReviewAt)}
            </div>
            <div class="wb-item-actions">
              <button class="wb-btn-sm" type="button" data-action="practice" data-id="${entry.id}">再练这题</button>
              <button class="wb-btn-sm danger" type="button" data-action="remove" data-id="${entry.id}">移出错题本</button>
            </div>
          </div>`;
      }).join("")}</div>`;
    }

    root.innerHTML = `
      <div class="wb-module">
        <div class="wb-header">
          <h2>📖 错题本</h2>
          <button class="wb-back" type="button" id="wbBack">← 返回</button>
        </div>
        <div class="wb-stats">
          今日待复习 <strong>${dueCount}</strong> 题 · 共 <strong>${total}</strong> 题
        </div>
        <div class="wb-actions">
          <button class="wb-btn-primary" type="button" id="wbStartReview" ${dueCount === 0 ? "disabled" : ""}>
            开始复习${dueCount > 0 ? `（${dueCount} 题）` : ""}
          </button>
        </div>
        ${listHtml}
      </div>`;

    root.querySelector("#wbBack").addEventListener("click", () => {
      if (callbacks.onBack) callbacks.onBack();
    });

    const reviewBtn = root.querySelector("#wbStartReview");
    if (reviewBtn && dueCount > 0) {
      reviewBtn.addEventListener("click", () => {
        const due = WrongBookStore.getDueEntries();
        if (due.length && callbacks.onStartReview) callbacks.onStartReview(due);
      });
    }

    root.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === "practice" && callbacks.onPracticeOne) {
          const entry = WrongBookStore.getById(id);
          if (entry) callbacks.onPracticeOne(entry);
        } else if (action === "remove") {
          WrongBookStore.remove(id);
          if (callbacks.onRefreshBadge) callbacks.onRefreshBadge();
          render();
        }
      });
    });
  }

  return {
    mount(container, options = {}) {
      root = container;
      callbacks = options;
      render();
    },

    unmount() {
      if (root) root.innerHTML = "";
      root = null;
      callbacks = {};
    },

    refresh() {
      render();
    }
  };
})();

if (typeof window !== "undefined") {
  window.WrongBookModule = WrongBookModule;
}
