/**
 * 通用课程引擎 · 列表 → 介绍 → 互动步骤 → 结算
 * 识谱教学保留 Canvas 专用逻辑；乐理入门等 MCQ 课程复用此引擎。
 */
const LessonEngine = (() => {
  function createProgressStore(storageKey) {
    return {
      key: storageKey,
      load() {
        try {
          return JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch {
          return {};
        }
      },
      save(data) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch { /* ignore */ }
      },
      isDone(id) {
        return !!this.load()[id];
      },
      isLessonDone(id) {
        return this.isDone(id);
      },
      markDone(id, stats) {
        const all = this.load();
        all[id] = { ...stats, at: new Date().toISOString() };
        this.save(all);
        return all;
      },
      markLessonDone(id, stats) {
        return this.markDone(id, stats);
      },
      completedCount() {
        return Object.keys(this.load()).length;
      },
      completedIds() {
        return Object.keys(this.load());
      }
    };
  }

  const LessonAudio = (() => {
    let ctx = null;
    function init() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") return ctx.resume();
      return Promise.resolve();
    }
    function playMidi(midi) {
      if (!ctx) return;
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

  function ensureStylesheet(href) {
    if (!href || document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * MCQ 课程模块工厂
   * @param {object} config
   * @param {Array} config.lessons
   * @param {object} config.progressStore
   * @param {string} config.moduleTitle
   * @param {string} [config.moduleIntro]
   * @param {string} [config.cssHref]
   */
  function createMCQModule(config) {
    let root = null;
    let callbacks = {};
    let currentLesson = null;
    let stepIndex = 0;
    let correctCount = 0;
    let answered = false;

    function renderMenu() {
      const lessons = config.lessons || [];
      const cards = lessons.map(les => {
        const done = config.progressStore.isDone(les.id);
        const stepCount = (les.steps || []).length;
        return `
          <button class="le-lesson-card ${done ? "done" : ""}" type="button" data-lesson="${les.id}">
            <span class="le-lesson-emoji">${les.emoji || "📖"}</span>
            <div class="le-lesson-info">
              <h3>${les.title}</h3>
              <p>${stepCount} 道互动题</p>
            </div>
            ${done ? '<span class="le-badge">已完成</span>' : ""}
          </button>`;
      }).join("");

      root.innerHTML = `
        <div class="le-module">
          <div class="le-header">
            <h2>${config.moduleTitle}</h2>
            <button class="le-back" type="button" id="leBack">← 返回</button>
          </div>
          ${config.moduleIntro ? `<p class="le-intro">${config.moduleIntro}</p>` : ""}
          <div class="le-menu" id="leMenu">
            <div class="le-lesson-list">${cards}</div>
          </div>
          <div class="le-stage" id="leStage"></div>
        </div>`;

      root.querySelector("#leBack").addEventListener("click", () => {
        if (callbacks.onBack) callbacks.onBack();
      });

      root.querySelectorAll("[data-lesson]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-lesson");
          const lesson = lessons.find(l => l.id === id);
          if (lesson) startLesson(lesson);
        });
      });
    }

    function startLesson(lesson) {
      currentLesson = lesson;
      stepIndex = 0;
      correctCount = 0;
      answered = false;

      root.querySelector("#leMenu").classList.add("hidden");
      const stage = root.querySelector("#leStage");
      stage.classList.add("active");

      const visualHtml = lesson.visual
        ? `<div class="le-visual">${lesson.visual}</div>`
        : "";

      stage.innerHTML = `
        <div class="le-intro-panel">
          <h3>${lesson.emoji || ""} ${lesson.title}</h3>
          <div class="le-intro-text">${lesson.intro || ""}</div>
          ${visualHtml}
        </div>
        <p class="le-progress" id="leProgress"></p>
        <p class="le-prompt" id="lePrompt"></p>
        <div class="le-options" id="leOptions"></div>
        <p class="le-feedback" id="leFeedback"></p>
        <button class="le-back le-back-inline" type="button" id="leLessonBack">← 返回课程列表</button>`;

      stage.querySelector("#leLessonBack").addEventListener("click", () => {
        stage.classList.remove("active");
        root.querySelector("#leMenu").classList.remove("hidden");
        renderMenu();
        if (callbacks.onProgressChange) callbacks.onProgressChange();
      });

      LessonAudio.init().then(() => showStep());
    }

    function showStep() {
      answered = false;
      const step = currentLesson.steps[stepIndex];
      const stage = root.querySelector("#leStage");
      const introPanel = stage.querySelector(".le-intro-panel");
      if (introPanel) introPanel.classList.add("hidden");

      stage.querySelector("#leProgress").textContent =
        `第 ${stepIndex + 1} / ${currentLesson.steps.length} 题`;
      stage.querySelector("#lePrompt").innerHTML = step.prompt;
      stage.querySelector("#leFeedback").textContent = "";
      stage.querySelector("#leFeedback").className = "le-feedback";

      const hintEl = stage.querySelector(".le-hint");
      if (hintEl) hintEl.remove();

      const optsEl = stage.querySelector("#leOptions");
      optsEl.innerHTML = "";
      optsEl.classList.add("le-options-gated");

      // I10：先想/先听再揭晓选项
      let gate = stage.querySelector(".le-preview-gate");
      if (!gate) {
        gate = document.createElement("div");
        gate.className = "le-preview-gate";
        optsEl.before(gate);
      }
      gate.hidden = false;
      const needsHear = step.previewMidi != null;
      gate.innerHTML = needsHear
        ? `<p>先听示范音，再选答案</p><button type="button" class="le-hear">再听一次</button> <button type="button" class="le-reveal">听好了 · 看选项</button>`
        : `<p>先读题、想一想，再看选项</p><button type="button" class="le-reveal">想好了 · 看选项</button>`;

      function revealLessonOptions() {
        gate.hidden = true;
        optsEl.classList.remove("le-options-gated");
        if (step.hint) {
          const hint = document.createElement("p");
          hint.className = "le-hint";
          hint.textContent = "💡 " + step.hint;
          stage.querySelector("#lePrompt").after(hint);
        }
        optsEl.innerHTML = step.options.map((opt, i) =>
          `<button class="le-option" type="button" data-idx="${i}">${opt}</button>`
        ).join("");
        optsEl.querySelectorAll(".le-option").forEach(btn => {
          btn.addEventListener("click", () => onAnswer(parseInt(btn.getAttribute("data-idx"), 10), btn));
        });
      }

      const hearBtn = gate.querySelector(".le-hear");
      if (hearBtn) {
        hearBtn.addEventListener("click", () => LessonAudio.playMidi(step.previewMidi));
        LessonAudio.playMidi(step.previewMidi);
      }
      gate.querySelector(".le-reveal").addEventListener("click", revealLessonOptions);
      clearTimeout(showStep._t);
      showStep._t = setTimeout(revealLessonOptions, needsHear ? 2600 : 1500);
    }

    function onAnswer(idx, btnEl) {
      if (answered) return;
      answered = true;
      const step = currentLesson.steps[stepIndex];
      const fb = root.querySelector("#leFeedback");
      const opts = root.querySelectorAll(".le-option");

      opts.forEach(b => { b.disabled = true; });

      if (idx === step.answer) {
        correctCount++;
        LessonAudio.playCorrect();
        btnEl.classList.add("correct");
        fb.textContent = step.correctMsg || "✓ 正确！";
        fb.className = "le-feedback ok";
      } else {
        LessonAudio.playWrong();
        btnEl.classList.add("wrong");
        opts[step.answer].classList.add("reveal");
        const why = step.wrongMsg || step.why || (step.hint ? `为什么：${step.hint}` : null);
        fb.textContent = why
          ? `${why} · 正解：${step.options[step.answer]}`
          : `再想想～ 正确答案是：${step.options[step.answer]}`;
        fb.className = "le-feedback err";
      }

      setTimeout(() => {
        stepIndex++;
        if (stepIndex >= currentLesson.steps.length) {
          finishLesson();
        } else {
          showStep();
        }
      }, idx === step.answer ? 700 : 1400);
    }

    function finishLesson() {
      const total = currentLesson.steps.length;
      const accuracy = correctCount / total;
      config.progressStore.markDone(currentLesson.id, { correctCount, total, accuracy });

      if (window.SpiritProgressStore) {
        const spiritType =
          config.shareSessionType === "piano" || config.shareSessionType === "guitar"
            ? "instrument_lesson"
            : "theory_lesson";
        SpiritProgressStore.award(spiritType, { id: currentLesson.id, once: true });
      }

      const allDone = config.progressStore.completedCount() >= (config.lessons || []).length;
      const stage = root.querySelector("#leStage");
      const topicId = currentLesson.topicId || currentLesson.id;
      const practiceCount = window.LearnPracticeBridge
        ? LearnPracticeBridge.countForTopic(topicId, 3)
        : 0;

      stage.innerHTML = `
        <div class="le-result">
          <span class="emoji">${accuracy >= 0.8 ? "🎉" : "📖"}</span>
          <h3>${currentLesson.title} · 完成！</h3>
          <p>正确 ${correctCount} / ${total} 题（${Math.round(accuracy * 100)}%）</p>
          ${allDone ? "<p>🏆 全部单元完成，恭喜你！</p>" : ""}
          <div class="le-actions">
            ${practiceCount >= 3 ? `
              <button class="le-btn le-btn-practice" type="button" id="lePractice">🎯 去练习巩固</button>` : ""}
            ${window.AppFeatures && AppFeatures.shareCard ? `
              <button class="le-btn le-btn-share" type="button" id="leShare">📤 分享成绩</button>` : ""}
            <button class="le-btn le-btn-primary" type="button" id="leAgain">再练一次</button>
            <button class="le-btn le-btn-secondary" type="button" id="leList">课程列表</button>
          </div>
        </div>`;

      if (callbacks.onProgressChange) callbacks.onProgressChange();

      stage.querySelector("#leAgain").addEventListener("click", () => startLesson(currentLesson));
      stage.querySelector("#leList").addEventListener("click", () => {
        stage.classList.remove("active");
        root.querySelector("#leMenu").classList.remove("hidden");
        renderMenu();
      });

      const practiceBtn = stage.querySelector("#lePractice");
      if (practiceBtn) {
        practiceBtn.addEventListener("click", () => {
          if (callbacks.onPracticeTopic) callbacks.onPracticeTopic(topicId);
          else if (typeof window.startTopicPractice === "function") window.startTopicPractice(topicId);
        });
      }

      const shareBtn = stage.querySelector("#leShare");
      if (shareBtn && typeof buildSharePayload === "function" && typeof ShareCardModule !== "undefined") {
        shareBtn.addEventListener("click", () => {
          const payload = buildSharePayload({
            sessionType: config.shareSessionType || "theory",
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
        if (config.cssHref) ensureStylesheet(config.cssHref);
        renderMenu();
      },
      unmount() {
        if (root) root.innerHTML = "";
        root = null;
      },
      getProgressStore() {
        return config.progressStore;
      },
      refreshMenu() {
        if (root) renderMenu();
      },
      startLessonById(id) {
        const lesson = (config.lessons || []).find(l => l.id === id);
        if (lesson && root) startLesson(lesson);
      }
    };
  }

  return { createProgressStore, createMCQModule, LessonAudio, ensureStylesheet };
})();

if (typeof window !== "undefined") {
  window.LessonEngine = LessonEngine;
}
