/**
 * 演奏练习模块
 * 挂载：PerformModule.mount(container, { onBack })
 * v1.1：WebAudioFont 钢琴采样 + 白键扩至高八度 C（K）
 */
const PerformModule = (() => {
  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const WHITE_COUNT = 8;

  const PIANO_LAYOUT = [
    { key: "a", semi: 0,  black: false, keyLabel: "A" },
    { key: "w", semi: 1,  black: true,  keyLabel: "W", left: `calc(1 * 100% / ${WHITE_COUNT} - 1.1rem)` },
    { key: "s", semi: 2,  black: false, keyLabel: "S" },
    { key: "e", semi: 3,  black: true,  keyLabel: "E", left: `calc(2 * 100% / ${WHITE_COUNT} - 1.1rem)` },
    { key: "d", semi: 4,  black: false, keyLabel: "D" },
    { key: "f", semi: 5,  black: false, keyLabel: "F" },
    { key: "t", semi: 6,  black: true,  keyLabel: "T", left: `calc(4 * 100% / ${WHITE_COUNT} - 1.1rem)` },
    { key: "g", semi: 7,  black: false, keyLabel: "G" },
    { key: "y", semi: 8,  black: true,  keyLabel: "Y", left: `calc(5 * 100% / ${WHITE_COUNT} - 1.1rem)` },
    { key: "h", semi: 9,  black: false, keyLabel: "H" },
    { key: "u", semi: 10, black: true,  keyLabel: "U", left: `calc(6 * 100% / ${WHITE_COUNT} - 1.1rem)` },
    { key: "j", semi: 11, black: false, keyLabel: "J" },
    { key: "k", semi: 12, black: false, keyLabel: "K" }
  ];

  const WAF_PLAYER_URL = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
  const WAF_PRESET_URL = "https://surikov.github.io/webaudiofontdata/sound/0000_FluidR3_GM_sf2_file.js";
  const WAF_PRESET_NAME = "_tone_0000_FluidR3_GM_sf2_file";

  const GUITAR_CHORDS = [
    { digit: "1", name: "C",    label: "C 大三和弦",  notes: [48, 52, 55] },
    { digit: "2", name: "Dm",   label: "D 小三和弦",  notes: [50, 53, 57] },
    { digit: "3", name: "Em",   label: "E 小三和弦",  notes: [52, 55, 59] },
    { digit: "4", name: "F",    label: "F 大三和弦",  notes: [53, 57, 60] },
    { digit: "5", name: "G",    label: "G 大三和弦",  notes: [55, 59, 62] },
    { digit: "6", name: "Am",   label: "A 小三和弦",  notes: [57, 60, 64] },
    { digit: "7", name: "Bdim", label: "B 减三和弦",  notes: [59, 62, 65] },
    { digit: "8", name: "C7",   label: "C 属七和弦",  notes: [48, 52, 55, 58] },
    { digit: "9", name: "G7",   label: "G 属七和弦",  notes: [55, 59, 62, 65] }
  ];

  const DRUM_PADS = [
    { key: "z", id: "kick",  label: "底鼓",   hint: "Kick" },
    { key: "x", id: "snare", label: "军鼓",   hint: "Snare" },
    { key: "c", id: "hihat", label: "踩镲",   hint: "Hi-Hat" },
    { key: "v", id: "crash", label: "强音镲", hint: "Crash" },
    { key: "b", id: "ride",  label: "节奏镲", hint: "Ride" },
    { key: "n", id: "tom",   label: "通鼓",   hint: "Tom" }
  ];

  let root = null;
  let octave = 4;
  let instrument = "piano";
  let arpeggio = false;
  let keyHandler = null;
  let practiceStartTime = 0;
  let noteCount = 0;
  let activeKeyEls = new Map();
  let taskMode = false;
  let taskScore = 0;
  let taskTarget = null;
  const TASK_WHITE_SEMIS = [0, 2, 4, 5, 7, 9, 11];

  const Audio = {
    ctx: null,
    wafPlayer: null,
    wafPreset: null,
    wafReady: false,
    wafLoading: null,
    wafFailed: false,

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      if (!this.wafReady && !this.wafFailed && !this.wafLoading) {
        this.ensureWebAudioFont();
      }
    },

    loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-waf-src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.dataset.wafSrc = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("script load failed: " + src));
        document.head.appendChild(s);
      });
    },

    ensureWebAudioFont() {
      if (this.wafReady) return Promise.resolve(true);
      if (this.wafFailed) return Promise.resolve(false);
      if (this.wafLoading) return this.wafLoading;
      this.wafLoading = (async () => {
        try {
          if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          }
          if (typeof WebAudioFontPlayer === "undefined") {
            await this.loadScript(WAF_PLAYER_URL);
          }
          if (typeof WebAudioFontPlayer === "undefined") throw new Error("no player");
          const player = new WebAudioFontPlayer();
          const preset = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("waf timeout")), 20000);
            try {
              player.loader.startLoad(this.ctx, WAF_PRESET_URL, WAF_PRESET_NAME);
              player.loader.waitLoad(() => {
                clearTimeout(timer);
                const p = window[WAF_PRESET_NAME];
                if (p) resolve(p);
                else reject(new Error("no preset"));
              });
            } catch (err) {
              clearTimeout(timer);
              reject(err);
            }
          });
          this.wafPlayer = player;
          this.wafPreset = preset;
          this.wafReady = true;
          return true;
        } catch {
          this.wafFailed = true;
          this.wafReady = false;
          return false;
        } finally {
          this.wafLoading = null;
        }
      })();
      return this.wafLoading;
    },

    freq(midi) {
      return 440 * Math.pow(2, (midi - 69) / 12);
    },

    noteName(midi) {
      const name = NOTE_NAMES[((midi % 12) + 12) % 12];
      const oct = Math.floor(midi / 12) - 1;
      return `${name}${oct}`;
    },

    playTone(freq, duration, type = "sine", peak = 0.28, delay = 0) {
      this.init();
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    },

    playNote(midi, duration = 0.55, delay = 0) {
      this.init();
      if (this.wafReady && this.wafPlayer && this.wafPreset) {
        const when = this.ctx.currentTime + delay;
        this.wafPlayer.queueWaveTable(
          this.ctx,
          this.ctx.destination,
          this.wafPreset,
          when,
          midi,
          duration,
          0.42
        );
        return;
      }
      this.playTone(this.freq(midi), duration, "sine", 0.28, delay);
      this.ensureWebAudioFont();
    },

    playChord(notes, arp = false) {
      if (arp) {
        notes.forEach((m, i) => this.playNote(m, 0.35, i * 0.14));
      } else {
        notes.forEach(m => this.playNote(m, 0.65));
      }
    },

    noise(duration, peak = 0.35, type = "white") {
      this.init();
      const sr = this.ctx.sampleRate;
      const len = sr * duration;
      const buf = this.ctx.createBuffer(1, len, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * (type === "white" ? 1 : 1 - i / len);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      const t = this.ctx.currentTime;
      g.gain.setValueAtTime(peak, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      src.connect(g);
      g.connect(this.ctx.destination);
      src.start(t);
      src.stop(t + duration);
    },

    playKick() {
      this.init();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    },

    playSnare() {
      this.noise(0.18, 0.4);
      this.playTone(180, 0.08, "triangle", 0.2);
    },

    playHiHat() {
      this.noise(0.06, 0.22, "white");
      this.playTone(8000, 0.04, "square", 0.04);
    },

    playCrash() {
      this.noise(0.55, 0.35);
      this.playTone(3200, 0.4, "sine", 0.08);
    },

    playRide() {
      this.noise(0.25, 0.18);
      this.playTone(5200, 0.2, "sine", 0.12);
    },

    playTom() {
      this.init();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
      g.gain.setValueAtTime(0.4, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    },

    playDrum(id) {
      switch (id) {
        case "kick":  this.playKick();  break;
        case "snare": this.playSnare(); break;
        case "hihat": this.playHiHat(); break;
        case "crash": this.playCrash(); break;
        case "ride":  this.playRide();  break;
        case "tom":   this.playTom();   break;
      }
    }
  };

  function $(sel) { return root.querySelector(sel); }

  function updateStats() {
    const el = $("#pfStats");
    if (!el) return;
    const sec = Math.floor((Date.now() - practiceStartTime) / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    el.textContent = `⏱ ${min}:${String(s).padStart(2, "0")} · 🎵 ${noteCount} 次`;
  }

  function setFeedback(text) {
    const el = $("#pfFeedback");
    if (el) el.textContent = text;
  }

  function setSourceBadge(state) {
    const el = $("#pfSourceBadge");
    if (!el) return;
    el.classList.remove("ok", "fallback", "loading");
    if (state === "ok") {
      el.classList.add("ok");
      el.textContent = "音源：WebAudioFont 真采样（录音切片回放）";
    } else if (state === "fallback") {
      el.classList.add("fallback");
      el.textContent = "音源：合成音回退（采样未加载成功）";
    } else {
      el.classList.add("loading");
      el.textContent = "音源：正在加载钢琴采样…";
    }
  }

  function setInfo(main, sub) {
    const m = $("#pfInfoMain");
    const s = $("#pfInfoSub");
    if (m) m.textContent = main;
    if (s) s.textContent = sub || "";
  }

  function setModeLabel(text) {
    const el = $("#pfInfoMode");
    if (el) el.textContent = text;
  }

  function pickNewTask() {
    const semi = TASK_WHITE_SEMIS[Math.floor(Math.random() * TASK_WHITE_SEMIS.length)];
    const midi = (octave + 1) * 12 + semi;
    taskTarget = { semi, midi, name: Audio.noteName(midi) };
    const banner = $("#pfTaskBanner");
    const scoreEl = $("#pfTaskScore");
    if (banner) banner.textContent = `请弹出：${taskTarget.name}`;
    if (scoreEl) scoreEl.textContent = String(taskScore);
  }

  function toggleTaskMode() {
    taskMode = !taskMode;
    const btn = $("#pfTaskToggle");
    const box = $("#pfTaskBox");
    if (btn) {
      btn.classList.toggle("on", taskMode);
      btn.textContent = taskMode ? "🎯 弹题中" : "🎯 弹题挑战";
    }
    if (box) box.classList.toggle("hidden", !taskMode);
    if (taskMode) {
      taskScore = 0;
      pickNewTask();
      setFeedback("听清目标音，在键盘上弹出");
    } else {
      taskTarget = null;
      setFeedback("");
    }
  }

  function checkTask(semi) {
    if (!taskMode || !taskTarget) return;
    const midi = (octave + 1) * 12 + semi;
    if (midi === taskTarget.midi) {
      taskScore++;
      setFeedback(`✓ 正确！${taskTarget.name}`);
      $("#pfTaskScore").textContent = String(taskScore);
      pickNewTask();
    } else {
      const played = Audio.noteName(midi);
      setFeedback(`再试试～ 目标是 ${taskTarget.name}，你弹了 ${played}`);
    }
  }

  function highlightKey(keyCode, ms = 200) {
    const el = activeKeyEls.get(keyCode);
    if (!el) return;
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), ms);
  }

  function playPianoSemi(semi, fromKeyboard = false) {
    Audio.init();
    const midi = (octave + 1) * 12 + semi;
    const freq = Audio.freq(midi);
    const name = Audio.noteName(midi);
    Audio.playNote(midi, 0.55);
    setInfo(name, `${freq.toFixed(1)} Hz`);
    if (taskMode) {
      checkTask(semi);
    } else {
      setFeedback(`你弹了 ${name}`);
    }
    noteCount++;
    updateStats();
    if (fromKeyboard) highlightKey(`piano-${semi}`);
  }

  function playGuitarChord(chord, fromKeyboard = false) {
    Audio.init();
    Audio.playChord(chord.notes, arpeggio);
    setInfo(chord.label, `组成音：${chord.notes.map(m => Audio.noteName(m)).join(" · ")}`);
    setFeedback(`你演奏了 ${chord.name} 和弦`);
    noteCount++;
    updateStats();
    if (fromKeyboard) {
      const btn = root.querySelector(`[data-chord="${chord.digit}"]`);
      if (btn) {
        btn.classList.add("active");
        setTimeout(() => btn.classList.remove("active"), 200);
      }
    }
  }

  function playDrum(pad, fromKeyboard = false) {
    Audio.init();
    Audio.playDrum(pad.id);
    setInfo(pad.label, `鼓件：${pad.hint}`);
    setFeedback(`你敲击了 ${pad.label}`);
    noteCount++;
    updateStats();
    const btn = root.querySelector(`[data-drum="${pad.id}"]`);
    if (btn) {
      btn.classList.add("hit", "ripple");
      setTimeout(() => btn.classList.remove("hit", "ripple"), 450);
    }
  }

  function renderPiano() {
    const whiteWrap = $("#pfKeysWhite");
    const blackWrap = $("#pfKeysBlack");
    whiteWrap.innerHTML = "";
    blackWrap.innerHTML = "";
    activeKeyEls.clear();

    PIANO_LAYOUT.filter(k => !k.black).forEach(k => {
      const midi = (octave + 1) * 12 + k.semi;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pf-key-white";
      btn.innerHTML = `<span class="pf-key-note">${Audio.noteName(midi)}</span><span class="pf-key-label">${k.keyLabel}</span>`;
      btn.addEventListener("click", () => playPianoSemi(k.semi));
      activeKeyEls.set(`piano-${k.semi}`, btn);
      whiteWrap.appendChild(btn);
    });

    PIANO_LAYOUT.filter(k => k.black).forEach(k => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pf-key-black";
      btn.style.left = k.left;
      btn.innerHTML = `<span class="pf-key-label">${k.keyLabel}</span>`;
      btn.addEventListener("click", () => playPianoSemi(k.semi));
      activeKeyEls.set(`piano-${k.semi}`, btn);
      blackWrap.appendChild(btn);
    });

    $("#pfOctLabel").textContent = `八度 ${octave}（${Audio.noteName((octave + 1) * 12)}–${Audio.noteName((octave + 1) * 12 + 12)}）`;
    $("#pfOctDown").disabled = octave <= 2;
    $("#pfOctUp").disabled = octave >= 6;
    if (taskMode) pickNewTask();
  }

  function switchInstrument(inst) {
    instrument = inst;
    root.querySelectorAll(".pf-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.instrument === inst);
    });
    root.querySelectorAll(".pf-panel").forEach(p => {
      p.classList.toggle("active", p.dataset.panel === inst);
    });

    if (inst === "piano") {
      setModeLabel("🎹 钢琴模式");
      setInfo("等待演奏…", "白键 A S D F G H J K · 黑键 W E T Y U");
      setSourceBadge(Audio.wafReady ? "ok" : (Audio.wafFailed ? "fallback" : "loading"));
      setFeedback(Audio.wafReady ? "钢琴采样已就绪" : (Audio.wafFailed ? "采样加载失败，已用合成音" : "正在加载钢琴采样…"));
    } else if (inst === "guitar") {
      setModeLabel("🎸 吉他模式");
      setInfo("等待演奏…", "数字键 1–9 弹奏和弦");
      setFeedback("");
    } else {
      setModeLabel("🥁 架子鼓模式");
      setInfo("等待演奏…", "键位 Z X C V B N");
      setFeedback("");
    }
  }

  function onKeyDown(e) {
    if (document.activeElement !== document.body && document.activeElement !== null) return;
    if (e.repeat || !root) return;
    const k = e.key.toLowerCase();

    if (instrument === "piano") {
      const pk = PIANO_LAYOUT.find(p => p.key === k);
      if (pk) {
        e.preventDefault();
        playPianoSemi(pk.semi, true);
      }
    } else if (instrument === "guitar") {
      const ch = GUITAR_CHORDS.find(c => c.digit === k);
      if (ch) {
        e.preventDefault();
        playGuitarChord(ch, true);
      }
    } else if (instrument === "drums") {
      const pad = DRUM_PADS.find(d => d.key === k);
      if (pad) {
        e.preventDefault();
        playDrum(pad, true);
      }
    }
  }

  function renderShell() {
    root.innerHTML = `
      <div class="pf-module">
        <div class="pf-instrument-tabs">
          <button type="button" class="pf-tab active" data-instrument="piano">🎹 钢琴</button>
          <button type="button" class="pf-tab" data-instrument="guitar">🎸 吉他</button>
          <button type="button" class="pf-tab" data-instrument="drums">🥁 架子鼓</button>
        </div>

        <div class="pf-info-bar">
          <div class="pf-info-mode" id="pfInfoMode">🎹 钢琴模式</div>
          <div class="pf-info-main" id="pfInfoMain">等待演奏…</div>
          <div class="pf-info-sub" id="pfInfoSub">白键 A S D F G H J K · 黑键 W E T Y U</div>
          <div class="pf-info-feedback" id="pfFeedback"></div>
          <div class="pf-source-badge loading" id="pfSourceBadge">音源：正在加载钢琴采样…</div>
        </div>

        <div class="pf-stats-bar" id="pfStats">⏱ 0:00 · 🎵 0 次</div>

        <div class="pf-panel active" data-panel="piano">
          <div class="pf-piano-toolbar">
            <div class="pf-piano-controls">
              <button type="button" class="pf-oct-btn" id="pfOctDown" aria-label="降低八度">−</button>
              <span class="pf-oct-label" id="pfOctLabel">八度 4</span>
              <button type="button" class="pf-oct-btn" id="pfOctUp" aria-label="升高八度">+</button>
            </div>
            <button type="button" class="pf-toggle" id="pfTaskToggle">🎯 弹题挑战</button>
          </div>
          <div class="pf-task-box hidden" id="pfTaskBox">
            <span class="pf-task-banner" id="pfTaskBanner">请弹出：C4</span>
            <span class="pf-task-score">得分 <strong id="pfTaskScore">0</strong></span>
          </div>
          <div class="pf-keyboard">
            <div class="pf-keys-black" id="pfKeysBlack"></div>
            <div class="pf-keys-white" id="pfKeysWhite"></div>
          </div>
          <p class="pf-hint">鼠标点击琴键，或键盘 A–K（白键含高八度 C）/ W E T Y U（黑键）。上方「音源」条会标明：真采样 = 预制钢琴录音切片回放；合成音 = 振荡器模拟。「弹题挑战」随机出题，八度 ± 切换音区（2–6）</p>
        </div>

        <div class="pf-panel" data-panel="guitar">
          <div class="pf-guitar-neck">
            <h4>🎸 六根弦（由粗到细）</h4>
            <div class="pf-strings">
              <div class="pf-string-row"><span class="pf-string-name">E</span><span class="pf-string-line"></span><span>① 弦 · _mi 低音</span></div>
              <div class="pf-string-row"><span class="pf-string-name">A</span><span class="pf-string-line"></span><span>② 弦 · _la</span></div>
              <div class="pf-string-row"><span class="pf-string-name">D</span><span class="pf-string-line"></span><span>③ 弦 · _re</span></div>
              <div class="pf-string-row"><span class="pf-string-name">G</span><span class="pf-string-line"></span><span>④ 弦 · _sol</span></div>
              <div class="pf-string-row"><span class="pf-string-name">B</span><span class="pf-string-line"></span><span>⑤ 弦 · _si</span></div>
              <div class="pf-string-row"><span class="pf-string-name">E</span><span class="pf-string-line"></span><span>⑥ 弦 · _mi 高音</span></div>
            </div>
          </div>
          <div class="pf-toggle-row">
            <span style="font-size:0.85rem;color:#7a7590;font-weight:600">和弦播放：</span>
            <button type="button" class="pf-toggle" id="pfArpToggle">同时播放</button>
          </div>
          <div class="pf-chord-grid" id="pfChordGrid"></div>
          <p class="pf-hint">按数字键 1–9，或点击和弦按钮</p>
        </div>

        <div class="pf-panel" data-panel="drums">
          <div class="pf-drum-grid" id="pfDrumGrid"></div>
          <p class="pf-hint">按 Z X C V B N，或点击鼓垫</p>
        </div>

        <div class="pf-actions">
          <button type="button" class="pf-back-btn hidden" id="pfBackBtn">← 返回练习</button>
        </div>
      </div>
    `;

    GUITAR_CHORDS.forEach(ch => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pf-chord-btn";
      btn.dataset.chord = ch.digit;
      btn.innerHTML = `${ch.name}<kbd>键 ${ch.digit}</kbd>`;
      btn.addEventListener("click", () => playGuitarChord(ch));
      $("#pfChordGrid").appendChild(btn);
    });

    DRUM_PADS.forEach(pad => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `pf-drum-pad pf-drum-${pad.id}`;
      btn.dataset.drum = pad.id;
      btn.innerHTML = `${pad.label}<kbd>${pad.key.toUpperCase()}</kbd>`;
      btn.addEventListener("click", () => playDrum(pad));
      $("#pfDrumGrid").appendChild(btn);
    });

    root.querySelectorAll(".pf-tab").forEach(tab => {
      tab.addEventListener("click", () => switchInstrument(tab.dataset.instrument));
    });

    $("#pfOctDown").addEventListener("click", () => {
      if (octave > 2) { octave--; renderPiano(); }
    });
    $("#pfOctUp").addEventListener("click", () => {
      if (octave < 6) { octave++; renderPiano(); }
    });

    $("#pfArpToggle").addEventListener("click", () => {
      arpeggio = !arpeggio;
      const btn = $("#pfArpToggle");
      btn.classList.toggle("on", arpeggio);
      btn.textContent = arpeggio ? "琶音（依次）" : "同时播放";
    });

    $("#pfTaskToggle").addEventListener("click", toggleTaskMode);
  }

  function mount(container, options = {}) {
    if (root) unmount();
    root = container;
    octave = 4;
    instrument = "piano";
    practiceStartTime = Date.now();
    noteCount = 0;
    arpeggio = false;
    taskMode = false;
    taskScore = 0;
    taskTarget = null;
    renderShell();
    renderPiano();
    switchInstrument("piano");

    keyHandler = onKeyDown;
    window.addEventListener("keydown", keyHandler);

    setSourceBadge("loading");
    Audio.ensureWebAudioFont().then((ok) => {
      if (!root) return;
      setSourceBadge(ok ? "ok" : "fallback");
      if (instrument === "piano") {
        setFeedback(ok ? "钢琴采样已就绪（WebAudioFont 录音切片）" : "采样不可用，已用合成音");
      }
    });

    const backBtn = $("#pfBackBtn");
    if (options.onBack) {
      backBtn.classList.remove("hidden");
      backBtn.addEventListener("click", options.onBack);
    }
  }

  function unmount() {
    if (keyHandler) {
      window.removeEventListener("keydown", keyHandler);
      keyHandler = null;
    }
    if (root) root.innerHTML = "";
    root = null;
    activeKeyEls.clear();
    practiceStartTime = 0;
    noteCount = 0;
    taskMode = false;
    taskScore = 0;
    taskTarget = null;
  }

  return { mount, unmount };
})();

if (typeof window !== "undefined") {
  window.PerformModule = PerformModule;
}
