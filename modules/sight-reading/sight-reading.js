const SightProgressStore = LessonEngine.createProgressStore("mtg_sight_progress_v1");
const SightAudio = (() => {
  let ctx = null;

  function init() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") return ctx.resume();
    return Promise.resolve();
  }

  function playMidi(midi) {
    if (!midi || !ctx) return;
    init();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440 * Math.pow(2, (midi - 69) / 12), t);
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  function playCorrect() {
    playMidi(72);
    setTimeout(() => playMidi(76), 120);
  }

  function playWrong() {
    playMidi(58);
  }

  return { init, playMidi, playCorrect, playWrong };
})();

const SightReadingModule = (() => {
  let root = null;
  let callbacks = {};
  let currentLesson = null;
  let questionIndex = 0;
  let correctCount = 0;
  let hits = [];
  let canvas = null;

  function renderMenu() {
    const lessons = window.SIGHT_LESSONS || [];
    const cards = lessons.map(les => {
      const done = SightProgressStore.isLessonDone(les.id);
      return `
        <button class="sr-lesson-card ${done ? "done" : ""}" type="button" data-lesson="${les.id}">
          <span class="sr-lesson-emoji">${les.emoji}</span>
          <div class="sr-lesson-info">
            <h3>${les.title}</h3>
            <p>${les.questions.length} 道互动题</p>
          </div>
          ${done ? '<span class="sr-badge">已完成</span>' : ""}
        </button>`;
    }).join("");

    root.innerHTML = `
      <div class="sr-module">
        <div class="sr-header">
          <h2>🎼 识谱教学</h2>
          <button class="sr-back" type="button" id="srBack">← 返回</button>
        </div>
        <p class="sr-intro">点击谱上的音符来答题 · 完成全部 ${(window.SIGHT_LESSONS || []).length} 课掌握高音谱号基础<br><small>💡 每课 3 题全做完 → 结算页有 <strong>📤 分享成绩</strong></small></p>
        <button class="sr-drill-btn" type="button" id="srDrillBtn">⚡ 识谱快练 · 无限刷题</button>
        <div class="sr-menu" id="srMenu">
          <div class="sr-lesson-list">${cards}</div>
        </div>
        <div class="sr-stage" id="srStage"></div>
      </div>`;

    root.querySelector("#srBack").addEventListener("click", () => {
      if (callbacks.onBack) callbacks.onBack();
    });

    root.querySelector("#srDrillBtn").addEventListener("click", () => startDrill());

    root.querySelectorAll("[data-lesson]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-lesson");
        const lesson = lessons.find(l => l.id === id);
        if (lesson) startLesson(lesson);
      });
    });
  }

  function drawCanvas(notes) {
    if (!canvas) return;
    const result = StaffRenderer.render(canvas, { notes });
    hits = result.hits;
  }

  let drillStreak = 0;
  let drillTotal = 0;
  let drillTarget = null;

  function pickDrillPitch() {
    const pool = window.SIGHT_DRILL_PITCHES || ["C4", "E4", "G4", "C5"];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function startDrill() {
    drillStreak = 0;
    drillTotal = 0;
    currentLesson = null;
    root.querySelector("#srMenu").classList.add("hidden");
    const stage = root.querySelector("#srStage");
    stage.classList.add("active");
    stage.innerHTML = `
      <p class="sr-intro"><strong>⚡ 识谱快练</strong> · 谱上出现什么音，就点什么音 · 家人推荐模式</p>
      <div class="sr-canvas-wrap">
        <canvas class="sr-canvas" id="srCanvas" aria-label="五线谱"></canvas>
      </div>
      <p class="sr-progress" id="srProgress">连对 0 · 总计 0</p>
      <p class="sr-prompt" id="srPrompt">点击谱上与提示相同的音</p>
      <p class="sr-feedback" id="srFeedback"></p>
      <button class="sr-back" type="button" id="srDrillBack">← 返回课程列表</button>`;

    canvas = stage.querySelector("#srCanvas");
    stage.querySelector("#srDrillBack").addEventListener("click", () => {
      stage.classList.remove("active");
      root.querySelector("#srMenu").classList.remove("hidden");
      renderMenu();
      if (callbacks.onProgressChange) callbacks.onProgressChange();
    });

    canvas.addEventListener("click", onCanvasClick);
    canvas.addEventListener("touchstart", onCanvasTouch, { passive: false });

    SightAudio.init().then(() => nextDrillQuestion());
  }

  function onCanvasTouch(e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    onCanvasClick({ clientX: t.clientX, clientY: t.clientY });
  }

  function nextDrillQuestion() {
    drillTarget = pickDrillPitch();
    const label = (window.PITCH_LABEL && PITCH_LABEL[drillTarget]) || drillTarget;
    const stage = root.querySelector("#srStage");
    if (!stage.querySelector("#srPrompt")) return;
    stage.querySelector("#srPrompt").innerHTML = `点击 <strong>${label}</strong>`;
    stage.querySelector("#srFeedback").textContent = "";
    stage.querySelector("#srFeedback").className = "sr-feedback";
    drawCanvas([{ pitch: drillTarget, id: drillTarget }]);
  }

  function onDrillClick(e) {
    if (!drillTarget) return;
    const hit = StaffRenderer.hitTest(hits, e.clientX, e.clientY, canvas);
    const fb = root.querySelector("#srFeedback");
    const prog = root.querySelector("#srProgress");

    if (!hit) {
      fb.textContent = "请点击音符符头哦";
      fb.className = "sr-feedback err";
      return;
    }

    drillTotal++;
    if (hit.id === drillTarget) {
      drillStreak++;
      SightAudio.playCorrect();
      if (PITCH_MIDI[hit.pitch]) SightAudio.playMidi(PITCH_MIDI[hit.pitch]);
      fb.textContent = "✓ 正确！";
      fb.className = "sr-feedback ok";
      if (drillStreak > 0 && drillStreak % 5 === 0 && window.SpiritProgressStore) {
        SpiritProgressStore.award("sight_drill_streak", { id: `streak-${drillStreak}`, once: false });
      }
      if (prog) prog.textContent = `连对 ${drillStreak} · 总计 ${drillTotal}`;
      setTimeout(() => nextDrillQuestion(), 500);
    } else {
      drillStreak = 0;
      SightAudio.playWrong();
      const label = PITCH_LABEL[hit.pitch] || hit.pitch;
      fb.textContent = `再试试～ 目标是 ${PITCH_LABEL[drillTarget] || drillTarget}，你点了 ${label}`;
      fb.className = "sr-feedback err";
      if (prog) prog.textContent = `连对 ${drillStreak} · 总计 ${drillTotal}`;
    }
  }

  function startLesson(lesson) {
    drillTarget = null;
    currentLesson = lesson;
    questionIndex = 0;
    correctCount = 0;

    root.querySelector("#srMenu").classList.add("hidden");
    const stage = root.querySelector("#srStage");
    stage.classList.add("active");
    stage.innerHTML = `
      <p class="sr-intro">${lesson.intro}</p>
      <div class="sr-canvas-wrap">
        <canvas class="sr-canvas" id="srCanvas" aria-label="五线谱"></canvas>
      </div>
      <p class="sr-progress" id="srProgress"></p>
      <p class="sr-prompt" id="srPrompt"></p>
      <p class="sr-feedback" id="srFeedback"></p>
      <button class="sr-back" type="button" id="srLessonBack">← 返回课程列表</button>`;

    canvas = stage.querySelector("#srCanvas");
    drawCanvas(lesson.demoNotes);

    stage.querySelector("#srLessonBack").addEventListener("click", () => {
      stage.classList.remove("active");
      root.querySelector("#srMenu").classList.remove("hidden");
      renderMenu();
    });

    canvas.addEventListener("click", onCanvasClick);
    canvas.addEventListener("touchstart", onCanvasTouch, { passive: false });

    SightAudio.init().then(() => {
      setTimeout(() => showQuestion(), 1200);
    });
  }

  function showQuestion() {
    const q = currentLesson.questions[questionIndex];
    const stage = root.querySelector("#srStage");
    stage.querySelector("#srProgress").textContent =
      `第 ${questionIndex + 1} / ${currentLesson.questions.length} 题`;
    stage.querySelector("#srPrompt").innerHTML = q.prompt;
    stage.querySelector("#srFeedback").textContent = "";
    stage.querySelector("#srFeedback").className = "sr-feedback";
    drawCanvas(q.notes);
  }

  function onCanvasClick(e) {
    if (drillTarget && !currentLesson) {
      onDrillClick(e);
      return;
    }
    const q = currentLesson.questions[questionIndex];
    const hit = StaffRenderer.hitTest(hits, e.clientX, e.clientY, canvas);
    const fb = root.querySelector("#srFeedback");

    if (!hit) {
      fb.textContent = "请点击音符符头哦";
      fb.className = "sr-feedback err";
      return;
    }

    if (hit.id === q.answer) {
      correctCount++;
      SightAudio.playCorrect();
      if (PITCH_MIDI[hit.pitch]) SightAudio.playMidi(PITCH_MIDI[hit.pitch]);
      fb.textContent = "✓ 正确！";
      fb.className = "sr-feedback ok";
      setTimeout(() => {
        questionIndex++;
        if (questionIndex >= currentLesson.questions.length) {
          finishLesson();
        } else {
          showQuestion();
        }
      }, 700);
    } else {
      SightAudio.playWrong();
      const label = PITCH_LABEL[hit.pitch] || (hit.noteType === "eighth" ? "八分音符" : "四分音符");
      fb.textContent = `再试试～ 你点的是 ${label}`;
      fb.className = "sr-feedback err";
    }
  }

  function finishLesson() {
    const total = currentLesson.questions.length;
    const accuracy = correctCount / total;
    SightProgressStore.markLessonDone(currentLesson.id, { correctCount, total, accuracy });

    if (window.SpiritProgressStore) {
      SpiritProgressStore.award("sight_lesson", { id: currentLesson.id, once: true });
    }

    const allDone = SightProgressStore.completedCount() >= (window.SIGHT_LESSONS || []).length;
    const stage = root.querySelector("#srStage");

    stage.innerHTML = `
      <div class="sr-result">
        <span class="emoji">${accuracy >= 0.8 ? "🎉" : "📖"}</span>
        <h3>${currentLesson.title} · 完成！</h3>
        <p>正确 ${correctCount} / ${total} 题（${Math.round(accuracy * 100)}%）</p>
        ${allDone ? "<p>🏆 全部课程完成，识谱入门达成！</p>" : ""}
        <div class="sr-actions">
          ${window.AppFeatures && AppFeatures.shareCard ? `
            <button class="sr-btn sr-btn-share" type="button" id="srShare">📤 分享成绩</button>` : ""}
          <button class="sr-btn sr-btn-primary" type="button" id="srAgain">再练一次</button>
          <button class="sr-btn sr-btn-secondary" type="button" id="srList">课程列表</button>
        </div>
      </div>`;

    stage.querySelector("#srAgain").addEventListener("click", () => startLesson(currentLesson));
    stage.querySelector("#srList").addEventListener("click", () => {
      stage.classList.remove("active");
      root.querySelector("#srMenu").classList.remove("hidden");
      renderMenu();
    });

    const shareBtn = stage.querySelector("#srShare");
    if (shareBtn && typeof buildSharePayload === "function" && typeof ShareCardModule !== "undefined") {
      shareBtn.addEventListener("click", () => {
        const payload = buildSharePayload({
          sessionType: "sight",
          score: Math.round(accuracy * 1000),
          totalQuestions: total,
          correctCount,
          maxCombo: 0,
          levelTitle: currentLesson.title + (allDone ? " · 全部完成" : ""),
          grade: accuracy >= 1 ? "S" : accuracy >= 0.66 ? "A" : "B",
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
      if (!document.querySelector('link[href="modules/sight-reading/sight-reading.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "modules/sight-reading/sight-reading.css";
        document.head.appendChild(link);
      }
      renderMenu();
    },
    unmount() {
      if (root) root.innerHTML = "";
      root = null;
      canvas = null;
      drillTarget = null;
    },
    startDrill() {
      if (root) startDrill();
    }
  };
})();

if (typeof window !== "undefined") {
  window.SightReadingModule = SightReadingModule;
  window.SightProgressStore = SightProgressStore;
}
