const PERSONA_LS_KEY = "mtg_persona_sim";

const PERSONAS = {
  novice: {
    id: "novice",
    label: "小白",
    emoji: "🌱",
    quizCorrectRate: 0.35,
    audioCorrectRate: 0.20
  },
  musical: {
    id: "musical",
    label: "乐感型",
    emoji: "🎧",
    quizCorrectRate: 0.55,
    audioCorrectRate: 0.70
  },
  expert: {
    id: "expert",
    label: "乐理大师",
    emoji: "🎓",
    quizCorrectRate: 0.90,
    audioCorrectRate: 0.75
  }
};

const PersonaSimulator = (() => {
  let quizPoolProvider = null;
  let audioBuilder = null;

  function configure(options = {}) {
    if (options.getQuizPool) quizPoolProvider = options.getQuizPool;
    if (options.buildAudioQuestion) audioBuilder = options.buildAudioQuestion;
  }

  function isEnabled() {
    if (typeof window === "undefined") return false;
    if (window.AppFeatures && AppFeatures.personaSimulator) return true;
    try {
      if (localStorage.getItem(PERSONA_LS_KEY) === "1") return true;
    } catch { /* ignore */ }
    try {
      return new URLSearchParams(window.location.search).get("persona") === "1";
    } catch {
      return false;
    }
  }

  function getQuizPool() {
    if (quizPoolProvider) return quizPoolProvider();
    if (typeof window !== "undefined" && window.QUESTIONS) return window.QUESTIONS;
    return [];
  }

  function createRng(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildMockAudio(difficulty, rng) {
    if (audioBuilder) return audioBuilder(difficulty);
    const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const midiPool = difficulty === 1
      ? [60, 62, 64, 65, 67, 69, 71]
      : Array.from({ length: 16 }, (_, i) => 57 + i);
    const midi = midiPool[Math.floor(rng() * midiPool.length)];
    const correctName = NOTE_NAMES[midi % 12];
    const distractors = shuffle(NOTE_NAMES.filter(n => n !== correctName), rng).slice(0, 3);
    const options = shuffle([correctName, ...distractors], rng);
    return {
      id: `persona-audio-${midi}`,
      type: "听音识名",
      difficulty,
      isAudio: true,
      midi,
      options,
      answer: options.indexOf(correctName)
    };
  }

  function getCorrectRate(persona, question) {
    return question.isAudio ? persona.audioCorrectRate : persona.quizCorrectRate;
  }

  function simulateAnswer(question, persona, rng) {
    const rate = getCorrectRate(persona, question);
    const correct = rng() < rate;
    if (correct) return { correct: true };
    const wrongIndices = question.options
      .map((_, i) => i)
      .filter(i => i !== question.answer);
    const wrongIdx = wrongIndices[Math.floor(rng() * wrongIndices.length)];
    return { correct: false, wrongOption: question.options[wrongIdx] };
  }

  function pickQuizSession(pool, difficulty, count, rng) {
    const filtered = pool.filter(q => q.difficulty <= difficulty);
    return shuffle(filtered, rng).slice(0, count);
  }

  function buildDailyQuestions(pool, dateKey, rng) {
    const quizQs = shuffle(pool.filter(q => q.difficulty === 2 && !q.isAudio), rng).slice(0, 7);
    const audioQs = Array.from({ length: 3 }, () => buildMockAudio(2, rng));
    return shuffle([...quizQs, ...audioQs], rng);
  }

  function simulateSession(persona, options, rng) {
    const pool = getQuizPool();
    const difficulty = options.difficulty || 2;
    const quizCount = { 1: 10, 2: 20, 3: 30 }[difficulty] || 10;

    const wrongByType = {};
    const typeAttempts = {};
    let wrongCount = 0;
    let correctCount = 0;
    let score = 0;
    const POINTS = 20;

    const questions = pickQuizSession(pool, difficulty, quizCount, rng);
    questions.forEach(q => {
      const result = simulateAnswer(q, persona, rng);
      typeAttempts[q.type] = (typeAttempts[q.type] || 0) + 1;
      if (result.correct) {
        correctCount++;
        score += POINTS;
      } else {
        wrongCount++;
        wrongByType[q.type] = (wrongByType[q.type] || 0) + 1;
      }
    });

    return {
      questionsAnswered: questions.length,
      correctCount,
      wrongCount,
      score,
      wrongByType,
      typeAttempts
    };
  }

  function simulateDaily(persona, dateKey, rng) {
    const pool = getQuizPool();
    const questions = buildDailyQuestions(pool, dateKey, rng);
    let correctCount = 0;
    let score = 0;
    const wrongByType = {};
    const typeAttempts = {};
    const POINTS = 20;

    questions.forEach(q => {
      const result = simulateAnswer(q, persona, rng);
      typeAttempts[q.type] = (typeAttempts[q.type] || 0) + 1;
      if (result.correct) {
        correctCount++;
        score += POINTS;
      } else {
        wrongByType[q.type] = (wrongByType[q.type] || 0) + 1;
      }
    });

    return {
      questionsAnswered: questions.length,
      correctCount,
      score,
      accuracy: questions.length ? correctCount / questions.length : 0,
      wrongByType,
      typeAttempts
    };
  }

  function mergeTypeStats(target, source) {
    Object.keys(source).forEach(key => {
      target[key] = (target[key] || 0) + source[key];
    });
  }

  function computeWeakAreas(wrongByType, typeAttempts) {
    return Object.keys(typeAttempts)
      .map(type => {
        const attempts = typeAttempts[type];
        const wrongs = wrongByType[type] || 0;
        return {
          type,
          attempts,
          wrongs,
          wrongRate: attempts ? wrongs / attempts : 0
        };
      })
      .filter(a => a.wrongs > 0)
      .sort((a, b) => b.wrongRate - a.wrongRate || b.wrongs - a.wrongs)
      .slice(0, 5);
  }

  function runPersona(personaId, options = {}) {
    const persona = PERSONAS[personaId];
    if (!persona) throw new Error(`未知人设: ${personaId}`);

    const days = options.days != null ? options.days : (options.mode === "session" ? 1 : 7);
    const seed = options.seed != null ? options.seed : Date.now();
    const rng = createRng(seed);

    const wrongByType = {};
    const typeAttempts = {};
    let totalWrong = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;
    let dailyScoreSum = 0;
    let dailyAccuracySum = 0;
    const dailyScores = [];

    for (let d = 0; d < days; d++) {
      const dateKey = `sim-day-${d}`;
      const session = simulateSession(persona, { difficulty: 2 }, rng);
      const daily = simulateDaily(persona, dateKey, rng);

      totalWrong += session.wrongCount;
      totalCorrect += session.correctCount + daily.correctCount;
      totalQuestions += session.questionsAnswered + daily.questionsAnswered;
      dailyScoreSum += daily.score;
      dailyAccuracySum += daily.accuracy;
      dailyScores.push(daily.score);

      mergeTypeStats(wrongByType, session.wrongByType);
      mergeTypeStats(wrongByType, daily.wrongByType);
      mergeTypeStats(typeAttempts, session.typeAttempts);
      mergeTypeStats(typeAttempts, daily.typeAttempts);
    }

    const expectedWrongBookGrowth = Math.min(totalWrong, 50);
    const avgDailyScore = days ? Math.round(dailyScoreSum / days) : 0;
    const avgDailyAccuracy = days ? dailyAccuracySum / days : 0;

    const report = {
      personaId: persona.id,
      label: persona.label,
      emoji: persona.emoji,
      quizCorrectRate: persona.quizCorrectRate,
      audioCorrectRate: persona.audioCorrectRate,
      mode: days === 1 ? "session" : "days",
      days,
      seed,
      runAt: new Date().toISOString(),
      totalQuestions,
      totalCorrect,
      totalWrong,
      expectedWrongBookGrowth,
      estimatedDailyScore: avgDailyScore,
      estimatedDailyAccuracy: Math.round(avgDailyAccuracy * 100),
      dailyScoreRange: dailyScores.length
        ? { min: Math.min(...dailyScores), max: Math.max(...dailyScores) }
        : { min: 0, max: 0 },
      weakAreas: computeWeakAreas(wrongByType, typeAttempts)
    };

    console.table([{
      人设: report.label,
      天数: report.days,
      预估错题增长: report.expectedWrongBookGrowth,
      每日挑战均分: report.estimatedDailyScore,
      每日正确率: `${report.estimatedDailyAccuracy}%`
    }]);
    if (report.weakAreas.length) console.log("薄弱题型:", report.weakAreas);

    return report;
  }

  function mountUI() {
    if (!isEnabled() || document.getElementById("personaSimFab")) return;

    const uxFab = document.getElementById("uxSimFab");
    const bottomOffset = uxFab ? "72px" : "20px";

    const fab = document.createElement("button");
    fab.id = "personaSimFab";
    fab.type = "button";
    fab.textContent = "👤 人设";
    fab.title = "运行人设模拟测评";
    fab.style.cssText = `
      position: fixed; bottom: ${bottomOffset}; right: 20px; z-index: 9998;
      font-family: inherit; font-size: 0.85rem; font-weight: 700;
      padding: 10px 16px; border: none; border-radius: 50px;
      background: linear-gradient(135deg, #ffb347, #e89420);
      color: #fff; cursor: pointer;
      box-shadow: 0 4px 16px rgba(255,179,71,0.4);
      transition: transform 0.15s;
    `;
    fab.addEventListener("mouseenter", () => { fab.style.transform = "translateY(-2px)"; });
    fab.addEventListener("mouseleave", () => { fab.style.transform = ""; });

    const overlay = document.createElement("div");
    overlay.id = "personaSimOverlay";
    overlay.style.cssText = `
      display: none; position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.45); align-items: center; justify-content: center; padding: 16px;
    `;

    const panel = document.createElement("div");
    panel.style.cssText = `
      background: #fff; border-radius: 20px; max-width: 480px; width: 100%;
      max-height: 80vh; overflow-y: auto; padding: 24px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.2); font-family: inherit; color: #3d3a50;
    `;
    overlay.appendChild(panel);

    let selectedPersona = "novice";
    let selectedDays = 7;

    function renderForm() {
      const personaChips = Object.values(PERSONAS).map(p => `
        <button type="button" class="ps-chip${p.id === selectedPersona ? " selected" : ""}" data-persona="${p.id}"
          style="font-family:inherit;font-size:0.85rem;font-weight:600;padding:8px 14px;border:2px solid #e8e0ff;
          border-radius:50px;background:#fff;cursor:pointer;margin:4px;
          ${p.id === selectedPersona ? "background:linear-gradient(135deg,#ffb347,#e89420);border-color:#e89420;color:#fff;" : ""}">
          ${p.emoji} ${p.label}
        </button>`).join("");

      panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0;color:#e89420">👤 人设模拟</h3>
          <button type="button" id="personaSimClose" style="border:none;background:#fff8ee;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem">✕</button>
        </div>
        <p style="font-size:0.85rem;color:#7a7590;margin-bottom:12px">模拟不同用户类型的答题表现，预估错题本增长与薄弱题型。</p>
        <div style="margin-bottom:14px">
          <div style="font-size:0.8rem;font-weight:600;color:#7a7590;margin-bottom:6px">选择人设</div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center">${personaChips}</div>
        </div>
        <div style="margin-bottom:16px">
          <div style="font-size:0.8rem;font-weight:600;color:#7a7590;margin-bottom:6px">模拟周期</div>
          <div style="display:flex;gap:8px;justify-content:center">
            <button type="button" class="ps-days" data-days="1" style="font-family:inherit;font-size:0.85rem;font-weight:600;padding:8px 14px;border:2px solid #e8e0ff;border-radius:50px;background:${selectedDays === 1 ? "linear-gradient(135deg,#ffb347,#e89420)" : "#fff"};color:${selectedDays === 1 ? "#fff" : "inherit"};border-color:${selectedDays === 1 ? "#e89420" : "#e8e0ff"};cursor:pointer">1 次练习</button>
            <button type="button" class="ps-days" data-days="7" style="font-family:inherit;font-size:0.85rem;font-weight:600;padding:8px 14px;border:2px solid #e8e0ff;border-radius:50px;background:${selectedDays === 7 ? "linear-gradient(135deg,#ffb347,#e89420)" : "#fff"};color:${selectedDays === 7 ? "#fff" : "inherit"};border-color:${selectedDays === 7 ? "#e89420" : "#e8e0ff"};cursor:pointer">7 天</button>
            <button type="button" class="ps-days" data-days="30" style="font-family:inherit;font-size:0.85rem;font-weight:600;padding:8px 14px;border:2px solid #e8e0ff;border-radius:50px;background:${selectedDays === 30 ? "linear-gradient(135deg,#ffb347,#e89420)" : "#fff"};color:${selectedDays === 30 ? "#fff" : "inherit"};border-color:${selectedDays === 30 ? "#e89420" : "#e8e0ff"};cursor:pointer">30 天</button>
          </div>
        </div>
        <button type="button" id="personaSimRun" style="width:100%;font-family:inherit;font-size:1rem;font-weight:700;padding:12px;border:none;border-radius:50px;background:linear-gradient(135deg,#ffb347,#e89420);color:#fff;cursor:pointer">▶ 开始模拟</button>
      `;

      panel.querySelectorAll("[data-persona]").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedPersona = btn.dataset.persona;
          renderForm();
        });
      });
      panel.querySelectorAll(".ps-days").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedDays = Number(btn.dataset.days);
          renderForm();
        });
      });
      panel.querySelector("#personaSimClose").addEventListener("click", () => {
        overlay.style.display = "none";
      });
      panel.querySelector("#personaSimRun").addEventListener("click", () => {
        fab.disabled = true;
        fab.textContent = "⏳ 模拟中…";
        setTimeout(() => {
          const report = runPersona(selectedPersona, { days: selectedDays });
          showReport(report);
          fab.disabled = false;
          fab.textContent = "👤 人设";
        }, 50);
      });
    }

    function showReport(report) {
      const accColor = report.estimatedDailyAccuracy >= 70 ? "#4cd964" : report.estimatedDailyAccuracy >= 40 ? "#ffb347" : "#ff6b6b";
      let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0;color:#e89420">${report.emoji} ${report.label} · 模拟报告</h3>
          <button type="button" id="personaSimClose" style="border:none;background:#fff8ee;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;font-size:0.88rem">
          <div style="background:#faf8ff;border-radius:12px;padding:12px;text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:#ff6b6b">${report.expectedWrongBookGrowth}</div>
            <div style="color:#7a7590;font-size:0.75rem">预估错题增长</div>
          </div>
          <div style="background:#faf8ff;border-radius:12px;padding:12px;text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:${accColor}">${report.estimatedDailyScore}</div>
            <div style="color:#7a7590;font-size:0.75rem">每日挑战均分</div>
          </div>
          <div style="background:#faf8ff;border-radius:12px;padding:12px;text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:${accColor}">${report.estimatedDailyAccuracy}%</div>
            <div style="color:#7a7590;font-size:0.75rem">每日正确率</div>
          </div>
          <div style="background:#faf8ff;border-radius:12px;padding:12px;text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:#7c5cff">${report.days}</div>
            <div style="color:#7a7590;font-size:0.75rem">模拟天数</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:#7a7590;margin-bottom:8px">
          综合 ${report.quizCorrectRate * 100}% 笔试 · ${report.audioCorrectRate * 100}% 听音 · 共答 ${report.totalQuestions} 题
        </p>`;

      if (report.weakAreas.length) {
        html += `<div style="margin-bottom:12px"><strong style="font-size:0.88rem">📉 薄弱题型</strong><ul style="margin:8px 0 0;padding-left:20px;font-size:0.85rem;line-height:1.7">`;
        report.weakAreas.forEach(w => {
          html += `<li>${w.type}：错 ${w.wrongs}/${w.attempts}（${Math.round(w.wrongRate * 100)}%）</li>`;
        });
        html += `</ul></div>`;
      } else {
        html += `<p style="text-align:center;color:#4cd964;font-weight:600;font-size:0.88rem">✅ 无明显薄弱题型</p>`;
      }

      html += `
        <div style="display:flex;gap:8px;margin-top:16px">
          <button type="button" id="personaSimBack" style="flex:1;font-family:inherit;font-size:0.88rem;font-weight:600;padding:10px;border:2px solid #e8e0ff;border-radius:50px;background:#fff;cursor:pointer">← 重新选择</button>
        </div>
        <p style="font-size:0.72rem;color:#7a7590;text-align:center;margin-top:12px">${report.runAt}</p>`;

      panel.innerHTML = html;
      panel.querySelector("#personaSimClose").addEventListener("click", () => {
        overlay.style.display = "none";
      });
      panel.querySelector("#personaSimBack").addEventListener("click", renderForm);
    }

    fab.addEventListener("click", () => {
      renderForm();
      overlay.style.display = "flex";
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    });

    document.body.appendChild(fab);
    document.body.appendChild(overlay);
  }

  return {
    PERSONAS,
    configure,
    isEnabled,
    runPersona,
    mountUI
  };
})();

if (typeof window !== "undefined") {
  window.PersonaSimulator = PersonaSimulator;
}
