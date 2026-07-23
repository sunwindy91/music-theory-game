const RhythmProgressStore = (() => {
  const KEY = "mtg_rhythm_progress_v1";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  }

  function getBest(chartId) {
    return load()[chartId] || null;
  }

  function recordResult(chartId, result) {
    const all = load();
    const prev = all[chartId];
    const gradeRank = { S: 4, A: 3, B: 2, C: 1 };
    const better =
      !prev ||
      (gradeRank[result.grade] || 0) > (gradeRank[prev.grade] || 0) ||
      ((gradeRank[result.grade] || 0) === (gradeRank[prev.grade] || 0) && result.accuracy > (prev.accuracy || 0));

    if (better) {
      all[chartId] = {
        grade: result.grade,
        accuracy: result.accuracy,
        score: result.score,
        maxCombo: result.maxCombo,
        at: new Date().toISOString()
      };
      save(all);
    }
    return all[chartId];
  }

  return { getBest, recordResult, load };
})();

const RhythmGameModule = (() => {
  const PRACTICE_LS_KEY = "mtg_rhythm_practice";
  const FIRST_HINT_KEY = "mtg_rhythm_first_hint_v1";
  let root = null;
  let callbacks = {};
  let currentChart = null;
  let keyHandler = null;
  let lastResult = null;

  function isPracticeModeOn() {
    try {
      return localStorage.getItem(PRACTICE_LS_KEY) !== "0";
    } catch {
      return true;
    }
  }

  function setPracticeMode(on) {
    try {
      localStorage.setItem(PRACTICE_LS_KEY, on ? "1" : "0");
    } catch { /* ignore */ }
  }

  function gradeLabel(g) {
    return g || "—";
  }

  function consumeFirstHintHtml() {
    try {
      if (localStorage.getItem(FIRST_HINT_KEY)) return "";
      localStorage.setItem(FIRST_HINT_KEY, "1");
    } catch { /* ignore */ }
    return `<p class="rg-first-hint">👋 首次来玩？建议开启下方「练习模式」，先跟 4 拍预备再找手感。</p>`;
  }

  function renderMenu() {
    if (!root) return;
    const charts = window.RHYTHM_CHARTS || [];

    const cards = charts.map(c => {
      const best = RhythmProgressStore.getBest(c.id);
      return `
        <button class="rg-level-card" type="button" data-chart="${c.id}">
          <span class="rg-level-emoji">${c.emoji}</span>
          <div class="rg-level-info">
            <h3>${c.title}</h3>
            <p>${c.subtitle} · BPM ${c.bpm}</p>
          </div>
          <span class="rg-level-grade">${gradeLabel(best && best.grade)}</span>
        </button>`;
    }).join("");

    const levelList = charts.length
      ? `<div class="rg-level-list">${cards}</div>`
      : `<p class="rg-empty">暂无可用关卡。请刷新页面；若仍为空，检查是否已加载节奏谱面脚本。</p>`;

    root.innerHTML = `
      <div class="rg-module">
        <div class="rg-header">
          <h2>🥁 节奏闯关</h2>
          <button class="rg-back" type="button" id="rgBack">← 返回</button>
        </div>
        <p class="rg-intro">跟着节拍跟拍练习 · 听节拍敲击 Space 或点击画面<br>练会了再去「综合练习」里的节奏型题目！<br><small>💡 完成关卡后点 <strong>📤 分享成绩</strong> 生成 PNG（公众号可用）</small></p>
        ${consumeFirstHintHtml()}
        <label class="rg-practice-toggle">
          <input type="checkbox" id="rgPracticeToggle" ${isPracticeModeOn() ? "checked" : ""}>
          <span>练习模式：开始前先打 <strong>4 拍</strong>预备（推荐新手）</span>
        </label>
        <div class="rg-menu" id="rgMenu">
          ${levelList}
        </div>
        <div class="rg-play" id="rgPlay"></div>
      </div>`;

    root.querySelector("#rgBack").addEventListener("click", () => {
      RhythmEngine.stop();
      unbindInput();
      if (callbacks.onBack) callbacks.onBack();
    });

    const practiceToggle = root.querySelector("#rgPracticeToggle");
    if (practiceToggle) {
      practiceToggle.addEventListener("change", () => {
        setPracticeMode(practiceToggle.checked);
      });
    }

    root.querySelectorAll("[data-chart]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-chart");
        const chart = charts.find(c => c.id === id);
        if (chart) showLevelIntro(chart);
      });
    });
  }

  function showLevelIntro(chart) {
    currentChart = chart;
    const menu = root.querySelector("#rgMenu");
    const play = root.querySelector("#rgPlay");
    menu.classList.add("hidden");
    play.classList.add("active");

    const introBody = chart.lessonIntro
      ? chart.lessonIntro
      : `<p><strong>本关学什么</strong></p><p>${chart.theory}</p>`;

    play.innerHTML = `
      <div class="rg-lesson-intro">
        <span class="rg-intro-emoji">${chart.emoji}</span>
        <h3>${chart.title}</h3>
        <p class="rg-intro-sub">${chart.subtitle} · BPM ${chart.bpm}</p>
        <div class="rg-intro-body">${introBody}</div>
        <div class="rg-actions">
          <button class="rg-btn rg-btn-primary" type="button" id="rgStartLevel">开始闯关</button>
          <button class="rg-btn rg-btn-secondary" type="button" id="rgIntroBack">选关</button>
        </div>
      </div>`;

    play.querySelector("#rgStartLevel").addEventListener("click", () => startPlay(chart));
    play.querySelector("#rgIntroBack").addEventListener("click", () => {
      play.classList.remove("active");
      menu.classList.remove("hidden");
    });
  }

  function bindInput(onTap) {
    unbindInput();
    keyHandler = (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        onTap();
      }
    };
    window.addEventListener("keydown", keyHandler);
  }

  function unbindInput() {
    if (keyHandler) {
      window.removeEventListener("keydown", keyHandler);
      keyHandler = null;
    }
  }

  function startPlay(chart) {
    currentChart = chart;
    lastResult = null;
    const menu = root.querySelector("#rgMenu");
    const play = root.querySelector("#rgPlay");
    menu.classList.add("hidden");
    play.classList.add("active");

    const dots = chart.beats.map((_, i) => `<span class="rg-beat-dot" data-i="${i}"></span>`).join("");

    play.innerHTML = `
      <p class="rg-bpm">${chart.title} · ${chart.theory}</p>
      <div class="rg-beat-bar" id="rgBeatBar">${dots}</div>
      <div class="rg-stage" id="rgStage" role="button" tabindex="0" aria-label="点击跟拍">
        <span class="rg-mascot" id="rgMascot">${chart.emoji}</span>
        <div class="rg-countdown" id="rgCountdown">3</div>
      </div>
      <div class="rg-judge" id="rgJudge"></div>
      <div class="rg-hud">
        <span>得分 <strong id="rgScore">0</strong></span>
        <span>连击 <strong id="rgCombo">0</strong></span>
      </div>
      <p class="rg-tap-hint" id="rgTapHint">💡 跟「心里的拍子」敲，不要等响完再按 · Space 或点击</p>
      <button class="rg-back" type="button" id="rgQuit">退出关卡</button>`;

    const stage = play.querySelector("#rgStage");
    const mascot = play.querySelector("#rgMascot");
    const judgeEl = play.querySelector("#rgJudge");
    const scoreEl = play.querySelector("#rgScore");
    const comboEl = play.querySelector("#rgCombo");
    const countdownEl = play.querySelector("#rgCountdown");
    const hintEl = play.querySelector("#rgTapHint");
    const practiceLeadIn = isPracticeModeOn() ? 4 : 0;

    const tap = () => RhythmEngine.handleInput();
    stage.addEventListener("click", tap);
    stage.addEventListener("touchstart", (e) => { e.preventDefault(); tap(); }, { passive: false });
    bindInput(tap);

    play.querySelector("#rgQuit").addEventListener("click", () => {
      RhythmEngine.stop();
      unbindInput();
      play.classList.remove("active");
      menu.classList.remove("hidden");
      renderMenu();
    });

    RhythmEngine.initAudio().then(() => {
      RhythmEngine.start(chart, {
        onEvent(ev) {
          if (ev.type === "countdown") {
            countdownEl.textContent = String(ev.value);
            countdownEl.classList.remove("hidden");
          } else if (ev.type === "practiceStart") {
            countdownEl.classList.remove("hidden");
            countdownEl.textContent = "预备拍";
            if (hintEl) hintEl.textContent = "🎵 先跟 4 拍预备找感觉，不计分 · 可跟着敲";
          } else if (ev.type === "practice") {
            countdownEl.classList.remove("hidden");
            countdownEl.textContent = `预备 ${ev.index + 1}/${ev.total}`;
            stage.classList.remove("pulse");
            void stage.offsetWidth;
            stage.classList.add("pulse");
          } else if (ev.type === "practiceTap") {
            mascot.classList.remove("hit");
            void mascot.offsetWidth;
            mascot.classList.add("hit");
          } else if (ev.type === "playStart") {
            countdownEl.textContent = "开始！";
            setTimeout(() => countdownEl.classList.add("hidden"), 400);
            if (hintEl) hintEl.textContent = "💡 跟「心里的拍子」敲 · Space 或点击";
            judgeEl.textContent = "跟拍！";
            judgeEl.className = "rg-judge";
          } else if (ev.type === "beat") {
            stage.classList.remove("pulse");
            void stage.offsetWidth;
            stage.classList.add("pulse");
            play.querySelectorAll(".rg-beat-dot").forEach(d => d.classList.remove("next"));
            const dot = play.querySelector(`.rg-beat-dot[data-i="${ev.index}"]`);
            if (dot && !dot.classList.contains("perfect") && !dot.classList.contains("good")) {
              dot.classList.add("next");
            }
          } else if (ev.type === "hit") {
            mascot.classList.remove("hit", "miss");
            void mascot.offsetWidth;
            if (ev.judgment === "miss") {
              mascot.classList.add("miss");
              judgeEl.textContent = "Miss…";
              judgeEl.className = "rg-judge miss";
            } else {
              mascot.classList.add("hit");
              judgeEl.textContent = ev.judgment === "perfect" ? "Perfect!" : "Good!";
              judgeEl.className = "rg-judge " + ev.judgment;
            }
            scoreEl.textContent = String(ev.score);
            comboEl.textContent = String(ev.combo);
            const dot = play.querySelector(`.rg-beat-dot[data-i="${ev.index}"]`);
            if (dot) {
              dot.classList.remove("next");
              dot.classList.add(ev.judgment === "perfect" ? "perfect" : ev.judgment === "good" ? "good" : "miss");
            }
          } else if (ev.type === "empty") {
            judgeEl.textContent = "…";
            judgeEl.className = "rg-judge miss";
          }
        },
        onComplete(result) {
          unbindInput();
          lastResult = result;
          RhythmProgressStore.recordResult(chart.id, result);
          if (result.passed && window.SpiritProgressStore) {
            SpiritProgressStore.award("rhythm_pass", { id: chart.id, once: true });
          }
          showResult(result);
        }
      }, { practiceLeadIn });
    });
  }

  function showResult(result) {
    const play = root.querySelector("#rgPlay");
    const passed = result.passed;
    const pct = Math.round(result.accuracy * 100);

    play.innerHTML = `
      <div class="rg-result">
        <span class="emoji">${passed ? "🎉" : "💪"}</span>
        <h3>${passed ? "闯关成功！" : "再练一次！"}</h3>
        <p>
          评级 <strong>${result.grade}</strong> · 命中率 ${pct}%<br>
          得分 ${result.score} · 最高连击 ${result.maxCombo}<br>
          Perfect ${result.perfect} · Good ${result.good} · Miss ${result.miss}
        </p>
        <div class="rg-actions">
          ${window.AppFeatures && AppFeatures.shareCard ? `
            <button class="rg-btn rg-btn-share" type="button" id="rgShare">📤 分享成绩</button>` : ""}
          <button class="rg-btn rg-btn-primary" type="button" id="rgRetry">再玩一次</button>
          <button class="rg-btn rg-btn-secondary" type="button" id="rgMenuBtn">选关</button>
        </div>
      </div>`;

    play.querySelector("#rgRetry").addEventListener("click", () => startPlay(currentChart));
    play.querySelector("#rgMenuBtn").addEventListener("click", () => {
      play.classList.remove("active");
      root.querySelector("#rgMenu").classList.remove("hidden");
      renderMenu();
    });

    const shareBtn = play.querySelector("#rgShare");
    if (shareBtn && typeof buildSharePayload === "function" && typeof ShareCardModule !== "undefined") {
      shareBtn.addEventListener("click", () => {
        const payload = buildSharePayload({
          sessionType: "rhythm",
          score: result.score,
          totalQuestions: result.total,
          correctCount: result.perfect + result.good,
          maxCombo: result.maxCombo,
          levelTitle: currentChart.title,
          grade: result.grade,
          dateKey: typeof getTodayKey === "function" ? getTodayKey() : undefined
        });
        ShareCardModule.openPreview(payload);
      });
    }
  }

  return {
    mount(container, options = {}) {
      root = container;
      callbacks = options;
      root.innerHTML = "";
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "modules/rhythm-game/rhythm-game.css";
      if (!document.querySelector('link[href="modules/rhythm-game/rhythm-game.css"]')) {
        document.head.appendChild(link);
      }
      renderMenu();
    },
    unmount() {
      RhythmEngine.stop();
      unbindInput();
      if (root) root.innerHTML = "";
      root = null;
    }
  };
})();

if (typeof window !== "undefined") {
  window.RhythmGameModule = RhythmGameModule;
  window.RhythmProgressStore = RhythmProgressStore;
}
