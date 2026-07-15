/**
 * 符号翻翻乐模块
 * 挂载：SymbolMatchModule.mount(container)
 */
const SymbolMatchModule = (() => {
  const PAIRS_PER_ROUND = 8;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let root = null;
  let timerId = null;
  let startTime = 0;
  let steps = 0;
  let flipped = [];
  let lock = false;
  let matchedCount = 0;
  let cards = [];

  const SymbolAudio = {
    ctx: null,

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
    },

    freq(midi) {
      return 440 * Math.pow(2, (midi - 69) / 12);
    },

    tone(freq, duration, type = "sine", gain = 0.25, delay = 0) {
      this.init();
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    },

    play(soundType) {
      const base = this.freq(60);
      switch (soundType) {
        case "note-whole":
          this.tone(base, 1.4, "sine", 0.28);
          break;
        case "note-half":
          this.tone(base, 0.75, "sine", 0.28);
          break;
        case "note-quarter":
          this.tone(base, 0.42, "sine", 0.28);
          break;
        case "note-eighth":
          this.tone(base, 0.22, "sine", 0.26);
          this.tone(base, 0.22, "sine", 0.26, 0.28);
          break;
        case "rest-whole":
        case "rest-half":
        case "rest-quarter":
        case "rest-eighth":
          this.tone(180, 0.08, "triangle", 0.06);
          break;
        case "key-C":
          [60, 62, 64, 65, 67, 69, 71, 72].forEach((m, i) =>
            this.tone(this.freq(m), 0.18, "sine", 0.2, i * 0.12)
          );
          break;
        case "key-G":
          [67, 69, 71, 72, 74, 76, 78, 79].forEach((m, i) =>
            this.tone(this.freq(m), 0.18, "sine", 0.2, i * 0.12)
          );
          break;
        case "key-F":
          [65, 67, 69, 70, 72, 74, 76, 77].forEach((m, i) =>
            this.tone(this.freq(m), 0.18, "sine", 0.2, i * 0.12)
          );
          break;
        case "key-D":
          [62, 64, 66, 67, 69, 71, 73, 74].forEach((m, i) =>
            this.tone(this.freq(m), 0.18, "sine", 0.2, i * 0.12)
          );
          break;
        case "dyn-pp":
          this.tone(base, 0.5, "sine", 0.06);
          break;
        case "dyn-p":
          this.tone(base, 0.5, "sine", 0.14);
          break;
        case "dyn-f":
          this.tone(base, 0.5, "sine", 0.28);
          break;
        case "dyn-ff":
          this.tone(base, 0.55, "sine", 0.42);
          break;
        default:
          this.tone(base, 0.4, "sine", 0.22);
      }
    },

    playMatchSuccess() {
      [523.25, 659.25].forEach((f, i) => this.tone(f, 0.15, "sine", 0.18, i * 0.08));
    },

    playMismatch() {
      this.tone(130, 0.25, "sawtooth", 0.12);
    }
  };

  function injectStyles() {
    if (document.getElementById("symbol-match-styles")) return;
    const style = document.createElement("style");
    style.id = "symbol-match-styles";
    style.textContent = `
      .sm-module { width: 100%; }
      .sm-stats {
        display: flex; justify-content: space-between; align-items: center;
        background: linear-gradient(135deg, #f5f0ff, #fff8ee);
        border-radius: 14px; padding: 12px 18px; margin-bottom: 16px;
        border: 2px dashed #ddd0ff; font-size: 0.9rem; color: #7a7590; font-weight: 600;
      }
      .sm-stats span { color: #e89420; font-weight: 700; }
      .sm-grid {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
        margin-bottom: 16px; perspective: 800px;
      }
      .sm-card {
        aspect-ratio: 1; cursor: pointer; border: none; background: none; padding: 0;
        font-family: inherit;
      }
      .sm-card-inner {
        width: 100%; height: 100%; position: relative;
        transform-style: preserve-3d;
        transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 14px;
      }
      .sm-card.flipped .sm-card-inner { transform: rotateY(180deg); }
      .sm-card.matched .sm-card-inner {
        box-shadow: 0 0 0 3px #4cd964;
        border-radius: 14px;
      }
      .sm-card.matched { pointer-events: none; cursor: default; }
      .sm-card-face {
        position: absolute; inset: 0; backface-visibility: hidden;
        border-radius: 14px; display: flex; align-items: center; justify-content: center;
        border: 2.5px solid #e8e0ff; font-weight: 700; padding: 6px; text-align: center;
        line-height: 1.2; word-break: break-all;
      }
      .sm-card-back {
        background: linear-gradient(135deg, #7c5cff, #5a3fd4);
        color: #fff; font-size: 1.6rem;
      }
      .sm-card-front {
        background: #fff; color: #3d3a50;
        transform: rotateY(180deg);
      }
      .sm-card-front.symbol { font-size: 1.8rem; }
      .sm-card-front.name { font-size: 0.78rem; color: #5a3fd4; }
      .sm-actions { text-align: center; }
      .sm-stars { font-size: 1.4rem; margin-bottom: 4px; letter-spacing: 0.1em; }
      .sm-best { font-size: 0.82rem; color: #7a7590; margin-top: 6px; font-weight: 600; }
      .sm-btn {
        font-family: inherit; font-size: 0.95rem; font-weight: 700; color: #fff;
        background: linear-gradient(135deg, #7c5cff, #5a3fd4);
        border: none; border-radius: 50px; padding: 12px 28px; cursor: pointer;
        box-shadow: 0 4px 16px rgba(124, 92, 255, 0.25);
        transition: transform 0.15s;
      }
      .sm-btn:hover { transform: translateY(-2px); }
      .sm-btn-outline {
        background: #fff; color: #7c5cff; border: 2px solid #7c5cff;
        box-shadow: none; margin-right: 8px;
      }
      .sm-win {
        text-align: center; padding: 16px 0 8px; color: #7a7590;
      }
      .sm-win .emoji { font-size: 2.5rem; display: block; margin-bottom: 8px; }
      .sm-win h3 { color: #7c5cff; font-size: 1.2rem; margin-bottom: 6px; }
      .sm-win.hidden { display: none; }
    `;
    document.head.appendChild(style);
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  }

  function updateStats() {
    const stepsEl = root.querySelector("#smSteps");
    const timeEl = root.querySelector("#smTime");
    const pairsEl = root.querySelector("#smPairs");
    if (stepsEl) stepsEl.textContent = steps;
    if (pairsEl) pairsEl.textContent = `${matchedCount}/${PAIRS_PER_ROUND}`;
    if (timeEl) timeEl.textContent = formatTime(Date.now() - startTime);
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(updateStats, 1000);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function buildDeck() {
    const pool = shuffle(window.SYMBOL_PAIRS || SYMBOL_PAIRS).slice(0, PAIRS_PER_ROUND);
    const deck = [];
    pool.forEach(pair => {
      deck.push({ pairId: pair.id, face: "symbol", label: pair.symbol, soundType: pair.soundType });
      deck.push({ pairId: pair.id, face: "name", label: pair.name, soundType: pair.soundType });
    });
    return shuffle(deck);
  }

  function renderGrid() {
    const grid = root.querySelector("#smGrid");
    grid.innerHTML = "";
    cards.forEach((card, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sm-card";
      btn.dataset.index = index;
      btn.innerHTML = `
        <div class="sm-card-inner">
          <div class="sm-card-face sm-card-back">?</div>
          <div class="sm-card-face sm-card-front ${card.face}">${card.label}</div>
        </div>
      `;
      btn.addEventListener("click", () => onCardClick(index, btn));
      grid.appendChild(btn);
    });
  }

  function onCardClick(index, el) {
    if (lock || el.classList.contains("flipped") || el.classList.contains("matched")) return;

    SymbolAudio.init();
    el.classList.add("flipped");
    flipped.push({ index, el, card: cards[index] });

    if (flipped.length === 2) {
      steps++;
      updateStats();
      lock = true;
      const [a, b] = flipped;

      if (a.card.pairId === b.card.pairId) {
        setTimeout(() => {
          a.el.classList.add("matched");
          b.el.classList.add("matched");
          SymbolAudio.playMatchSuccess();
          SymbolAudio.play(a.card.soundType);
          matchedCount++;
          updateStats();
          flipped = [];
          lock = false;

          if (matchedCount === PAIRS_PER_ROUND) {
            stopTimer();
            showWin();
          }
        }, 400);
      } else {
        SymbolAudio.playMismatch();
        setTimeout(() => {
          a.el.classList.remove("flipped");
          b.el.classList.remove("flipped");
          flipped = [];
          lock = false;
        }, 800);
      }
    }
  }

  function showWin() {
    const win = root.querySelector("#smWin");
    const elapsed = formatTime(Date.now() - startTime);

    let starCount, starEmoji;
    if (steps <= 10) { starCount = 3; starEmoji = "🎉"; }
    else if (steps <= 16) { starCount = 2; starEmoji = "👍"; }
    else { starCount = 1; starEmoji = "📚"; }
    const stars = "⭐".repeat(starCount);

    const bestKey = "sm_best_steps";
    const prev = localStorage.getItem(bestKey);
    let bestText = "";
    if (!prev || steps < parseInt(prev)) {
      localStorage.setItem(bestKey, steps);
      bestText = "🏆 新纪录！";
    } else {
      bestText = `最佳 ${prev} 步`;
    }

    win.querySelector("#smWinEmoji").textContent = starEmoji;
    win.querySelector("#smWinStars").textContent = stars;
    win.querySelector("#smWinSteps").textContent = steps;
    win.querySelector("#smWinTime").textContent = elapsed;
    win.querySelector("#smWinBest").textContent = bestText;
    win.classList.remove("hidden");
  }

  function hideWin() {
    root.querySelector("#smWin").classList.add("hidden");
  }

  function newGame() {
    SymbolAudio.init();
    steps = 0;
    flipped = [];
    lock = false;
    matchedCount = 0;
    startTime = Date.now();
    cards = buildDeck();
    hideWin();
    renderGrid();
    updateStats();
    startTimer();
  }

  function renderShell() {
    root.innerHTML = `
      <div class="sm-module">
        <div class="sm-stats">
          <div>步数：<span id="smSteps">0</span></div>
          <div>配对：<span id="smPairs">0/${PAIRS_PER_ROUND}</span></div>
          <div>用时：<span id="smTime">0:00</span></div>
        </div>
        <div class="sm-grid" id="smGrid"></div>
        <div class="sm-win hidden" id="smWin">
          <span class="emoji" id="smWinEmoji">🎉</span>
          <div class="sm-stars" id="smWinStars"></div>
          <h3>全部配对成功！</h3>
          <p>步数 <strong id="smWinSteps">0</strong> · 用时 <strong id="smWinTime">0:00</strong></p>
          <p class="sm-best" id="smWinBest"></p>
        </div>
        <div class="sm-actions">
          <button type="button" class="sm-btn sm-btn-outline" id="smBackBtn">← 返回练习</button>
          <button type="button" class="sm-btn" id="smRestartBtn">再来一局</button>
        </div>
      </div>
    `;
    root.querySelector("#smRestartBtn").addEventListener("click", newGame);
  }

  function mount(container, options = {}) {
    if (root) unmount();
    injectStyles();
    root = container;
    renderShell();
    newGame();

    const backBtn = root.querySelector("#smBackBtn");
    if (options.onBack) {
      backBtn.addEventListener("click", options.onBack);
    } else {
      backBtn.classList.add("hidden");
    }
  }

  function unmount() {
    stopTimer();
    if (root) root.innerHTML = "";
    root = null;
  }

  return { mount, unmount, newGame };
})();

if (typeof window !== "undefined") {
  window.SymbolMatchModule = SymbolMatchModule;
}
