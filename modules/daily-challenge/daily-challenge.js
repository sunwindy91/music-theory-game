const DailyChallengeModule = (() => {
  let root = null;
  let callbacks = {};

  function render() {
    if (!root) return;

    const completed = DailyChallengeStore.isCompletedToday();
    const progress = DailyChallengeStore.getProgress();
    const streak = DailyChallengeStore.getStreak();
    const pct = Math.round((progress.current / DailyChallengeStore.DAILY_TOTAL) * 100);

    let bodyHtml;
    if (completed) {
      bodyHtml = `
        <div class="dc-done">
          <span class="emoji">🎉</span>
          <h3>今日挑战已完成！</h3>
          <p>得分 <strong>${progress.score}</strong> 分 · 连续 ${streak} 天<br>明天再来新的挑战吧</p>
          ${window.AppFeatures && AppFeatures.shareCard ? `
          <button class="dc-btn-share" type="button" id="dcShareBtn">📤 分享成绩</button>` : ""}
        </div>`;
    } else {
      bodyHtml = `
        <div class="dc-stats">
          今日进度 <strong>${progress.current}</strong> / ${DailyChallengeStore.DAILY_TOTAL} 题
          <div class="dc-progress-bar"><div class="dc-progress-fill" style="width:${pct}%"></div></div>
          ${progress.current > 0 ? `当前得分 <strong>${progress.score}</strong> 分` : "尚未开始"}
          <div class="dc-streak">🔥 连续 ${streak} 天</div>
        </div>
        <div class="dc-actions">
          <button class="dc-btn-primary" type="button" id="dcStartBtn">
            ${progress.current > 0 ? "继续挑战" : "开始今日挑战"}
          </button>
        </div>
        <ul class="dc-info">
          <li>固定中级难度 · 10 题（7 综合 + 3 听音）</li>
          <li>每天题目固定，完成即止</li>
          <li>答错自动收录错题本</li>
        </ul>`;
    }

    root.innerHTML = `
      <div class="dc-module">
        <div class="dc-header">
          <h2>📅 每日挑战</h2>
          <button class="dc-back" type="button" id="dcBack">← 返回</button>
        </div>
        ${bodyHtml}
      </div>`;

    root.querySelector("#dcBack").addEventListener("click", () => {
      if (callbacks.onBack) callbacks.onBack();
    });

    const startBtn = root.querySelector("#dcStartBtn");
    if (startBtn && callbacks.onStart) {
      startBtn.addEventListener("click", () => callbacks.onStart());
    }

    const shareBtn = root.querySelector("#dcShareBtn");
    if (shareBtn && typeof buildSharePayload === "function" && typeof ShareCardModule !== "undefined") {
      shareBtn.addEventListener("click", () => {
        const payload = buildSharePayload({
          sessionType: "daily",
          score: progress.score,
          totalQuestions: DailyChallengeStore.DAILY_TOTAL,
          correctCount: progress.correctCount || 0,
          maxCombo: 0,
          streak,
          dateKey: getTodayKey()
        });
        ShareCardModule.openPreview(payload);
      });
    }
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
  window.DailyChallengeModule = DailyChallengeModule;
}
