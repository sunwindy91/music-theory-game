/**
 * 演奏练习模块
 * 挂载：PerformModule.mount(container, { onBack })
 * v1.2：钢弦吉他采样/拨弦回退 + 指板单音；9 件鼓组舞台布局
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
  const WAF_PIANO_URL = "https://surikov.github.io/webaudiofontdata/sound/0000_FluidR3_GM_sf2_file.js";
  const WAF_PIANO_NAME = "_tone_0000_FluidR3_GM_sf2_file";
  const WAF_GUITAR_URL = "https://surikov.github.io/webaudiofontdata/sound/0250_FluidR3_GM_sf2_file.js";
  const WAF_GUITAR_NAME = "_tone_0250_FluidR3_GM_sf2_file";
  /** 尼龙弦（尤克更接近）GM 25 */
  const WAF_NYLON_URL = "https://surikov.github.io/webaudiofontdata/sound/0240_FluidR3_GM_sf2_file.js";
  const WAF_NYLON_NAME = "_tone_0240_FluidR3_GM_sf2_file";
  /** 指弹贝斯 GM 34 */
  const WAF_BASS_URL = "https://surikov.github.io/webaudiofontdata/sound/0330_FluidR3_GM_sf2_file.js";
  const WAF_BASS_NAME = "_tone_0330_FluidR3_GM_sf2_file";
  /** 小提琴 GM 40 */
  const WAF_VIOLIN_URL = "https://surikov.github.io/webaudiofontdata/sound/0400_FluidR3_GM_sf2_file.js";
  const WAF_VIOLIN_NAME = "_tone_0400_FluidR3_GM_sf2_file";
  /** 大提琴 GM 42 */
  const WAF_CELLO_URL = "https://surikov.github.io/webaudiofontdata/sound/0420_FluidR3_GM_sf2_file.js";
  const WAF_CELLO_NAME = "_tone_0420_FluidR3_GM_sf2_file";

  /**
   * 音色表契约（I53）：乐器 → 采样源 / 回退 / 交互。
   * 加新乐器：补一行 + ensureSample 常量 + playXxx / startBow voice。
   */
  const TIMBRE_TABLE = Object.freeze({
    piano:  { label: "钢琴",   sample: WAF_PIANO_NAME,  gm: "0000", fallback: "sine",    interact: "key" },
    guitar: { label: "钢弦吉他", sample: WAF_GUITAR_NAME, gm: "0250", fallback: "karplus", interact: "fret+strum" },
    uke:    { label: "尤克里里", sample: WAF_NYLON_NAME,  gm: "0240", fallback: "karplus", interact: "fret+strum" },
    bass:   { label: "贝斯",   sample: WAF_BASS_NAME,   gm: "0330", fallback: "bassSynth", interact: "fret+strum" },
    violin: { label: "小提琴", sample: WAF_VIOLIN_NAME, gm: "0400", fallback: "bowSynth", interact: "finger+bow" },
    cello:  { label: "大提琴", sample: WAF_CELLO_NAME,  gm: "0420", fallback: "bowSynth", interact: "finger+bow" },
    drums:  { label: "架子鼓", sample: null,            gm: null,   fallback: "drumSynth", interact: "pad" }
  });

  /** 标准调弦 EADGBE，由粗到细（MIDI） */
  const GUITAR_OPEN_MIDI = [40, 45, 50, 55, 59, 64];
  const GUITAR_STRING_NAMES = ["E", "A", "D", "G", "B", "E"];
  const GUITAR_FRET_COUNT = 5;

  /** 尤克里里高音 G 调弦 gCEA（细→粗视觉：自上而下 G C E A） */
  const UKE_OPEN_MIDI = [67, 60, 64, 69];
  const UKE_STRING_NAMES = ["G", "C", "E", "A"];
  const UKE_FRET_COUNT = 5;
  const UKE_CHORDS = [
    { digit: "1", name: "C",  label: "C 大三", notes: [60, 64, 67, 72] },
    { digit: "2", name: "Am", label: "A 小三", notes: [57, 60, 64, 69] },
    { digit: "3", name: "F",  label: "F 大三", notes: [53, 60, 65, 69] },
    { digit: "4", name: "G",  label: "G 大三", notes: [55, 62, 67, 71] }
  ];

  /** 贝斯标准调弦 E1 A1 D2 G2（由粗到细，比吉他低八度） */
  const BASS_OPEN_MIDI = [28, 33, 38, 43];
  const BASS_STRING_NAMES = ["E", "A", "D", "G"];
  const BASS_FRET_COUNT = 5;

  /** 小提琴标准调弦 G3 D4 A4 E5（自上而下低→高）；第一把位常用指位 */
  const VIOLIN_OPEN_MIDI = [55, 62, 69, 76];
  const VIOLIN_STRING_NAMES = ["G", "D", "A", "E"];
  /** 大提琴标准调弦 C2 G2 D3 A3（比小提琴低一个八度 + 再低五度一组） */
  const CELLO_OPEN_MIDI = [36, 43, 50, 57];
  const CELLO_STRING_NAMES = ["C", "G", "D", "A"];
  /** 指位半音偏移（空弦 / 1 / 2 / 3 / 4 指，近似第一把位大调音阶） */
  const VIOLIN_POSITIONS = [
    { off: 0, label: "空" },
    { off: 2, label: "1" },
    { off: 4, label: "2" },
    { off: 5, label: "3" },
    { off: 7, label: "4" }
  ];
  const BOW_POSITIONS = VIOLIN_POSITIONS;

  /** 开放/把位和弦 voicing（含低音弦） */
  const GUITAR_CHORDS = [
    { digit: "1", name: "C",    label: "C 大三（开放）",  notes: [48, 52, 55, 59, 64] },
    { digit: "2", name: "Dm",   label: "D 小三（开放）",  notes: [50, 57, 62, 65] },
    { digit: "3", name: "Em",   label: "E 小三（开放）",  notes: [40, 47, 52, 55, 59, 64] },
    { digit: "4", name: "F",    label: "F 大三（1 品横按）", notes: [41, 48, 53, 57, 60, 65] },
    { digit: "5", name: "G",    label: "G 大三（开放）",  notes: [43, 47, 50, 55, 59, 67] },
    { digit: "6", name: "Am",   label: "A 小三（开放）",  notes: [45, 52, 57, 60, 64] },
    { digit: "7", name: "Bdim", label: "B 减三", notes: [47, 59, 62, 65] },
    { digit: "8", name: "C7",   label: "C 属七（开放）", notes: [48, 52, 58, 60, 64] },
    { digit: "9", name: "G7",   label: "G 属七（开放）", notes: [43, 47, 50, 55, 59, 65] }
  ];

  const DRUM_PADS = [
    { key: "q", id: "crash",      label: "强音镲", hint: "Crash",  layout: "crash" },
    { key: "p", id: "ride",       label: "节奏镲", hint: "Ride",   layout: "ride" },
    { key: "a", id: "hihat",      label: "闭镲",   hint: "HH 关",  layout: "hihat-cl" },
    { key: "w", id: "hihat-open", label: "开镲",   hint: "HH 开",  layout: "hihat-op" },
    { key: "r", id: "tom-hi",     label: "高音通鼓", hint: "Hi Tom", layout: "tom-hi" },
    { key: "x", id: "snare",      label: "军鼓",   hint: "Snare",  layout: "snare" },
    { key: "e", id: "tom-mid",    label: "中音通鼓", hint: "Mid Tom", layout: "tom-mid" },
    { key: "f", id: "tom-floor",  label: "落地通鼓", hint: "Floor",  layout: "tom-floor" },
    { key: "z", id: "kick",       label: "底鼓",   hint: "Kick",   layout: "kick" }
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

  const LS_GUITAR_GUIDE = "mtg_guitar_guide_v1";
  const LS_DRUMS_GUIDE = "mtg_drums_guide_v1";
  const LS_GUITAR_JAM = "mtg_guitar_jam_v1";
  const LS_DRUMS_JAM = "mtg_drums_jam_v1";
  /** 弹唱进行：Am → F → C → G（digit 与 GUITAR_CHORDS 一致） */
  const JAM_DIGITS = ["6", "4", "1", "5"];
  /** 节奏底：Kick → Snare → Kick → HiHat 闭 */
  const DRUMS_JAM_PAD_IDS = ["kick", "snare", "kick", "hihat"];
  const DRUMS_JAM_LABELS = { kick: "底鼓", snare: "军鼓", hihat: "闭镲" };

  let guitarGuideActive = false;
  let guitarGuideStep = 0;
  let drumsGuideActive = false;
  let drumsGuideStep = 0;
  let jamActive = false;
  let jamStep = 0;
  let jamToastTimer = null;
  let drumsJamActive = false;
  let drumsJamStep = 0;
  let drumsJamToastTimer = null;
  let strumSuppressClick = false;
  let chordStrumMode = false;
  let guitarChordDigit = "1";
  let ukeChordDigit = "1";
  /** 扫弦节奏型：1=下扫，-1=上扫；空格/再按同数字键推进一拍 */
  const STRUM_PATTERNS = [
    { id: "basic", name: "基础 ↓↑", strokes: [1, -1] },
    { id: "folk", name: "民谣 ↓↓↑↓↑", strokes: [1, 1, -1, 1, -1] },
    { id: "ballad", name: "抒情 ↓—↑—", strokes: [1, 0, -1, 0] },
    { id: "drive", name: "推进 ↓↑↓↑", strokes: [1, -1, 1, -1] }
  ];
  let strumPatternId = "folk";
  let strumStrokeIdx = 0;
  let violinString = 2;
  let violinPos = 0;
  let celloString = 2;
  let celloPos = 0;
  let bowActive = false;
  let bowDecayTimer = null;
  /** 提琴简易点奏：点一下就响；关则回到运弓拖动 */
  let bowEasyMode = true;

  const Audio = {
    ctx: null,
    wafPlayer: null,
    wafPreset: null,
    wafReady: false,
    wafLoading: null,
    wafFailed: false,
    guitarWafPreset: null,
    guitarWafReady: false,
    guitarWafLoading: null,
    guitarWafFailed: false,

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

    loadWafPreset(url, globalName) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("waf timeout")), 20000);
        try {
          this.wafPlayer.loader.startLoad(this.ctx, url, globalName);
          this.wafPlayer.loader.waitLoad(() => {
            clearTimeout(timer);
            const p = window[globalName];
            if (p) resolve(p);
            else reject(new Error("no preset"));
          });
        } catch (err) {
          clearTimeout(timer);
          reject(err);
        }
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
          this.wafPlayer = player;
          const preset = await this.loadWafPreset(WAF_PIANO_URL, WAF_PIANO_NAME);
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

    ensureGuitarFont() {
      if (this.guitarWafReady) return Promise.resolve(true);
      if (this.guitarWafFailed) return Promise.resolve(false);
      if (this.guitarWafLoading) return this.guitarWafLoading;
      this.guitarWafLoading = (async () => {
        try {
          this.init();
          if (typeof WebAudioFontPlayer === "undefined") {
            await this.loadScript(WAF_PLAYER_URL);
          }
          if (typeof WebAudioFontPlayer === "undefined") throw new Error("no player");
          if (!this.wafPlayer) this.wafPlayer = new WebAudioFontPlayer();
          const preset = await this.loadWafPreset(WAF_GUITAR_URL, WAF_GUITAR_NAME);
          this.guitarWafPreset = preset;
          this.guitarWafReady = true;
          return true;
        } catch {
          this.guitarWafFailed = true;
          this.guitarWafReady = false;
          return false;
        } finally {
          this.guitarWafLoading = null;
        }
      })();
      return this.guitarWafLoading;
    },

    /** 通用采样库：按 WAF 名缓存 preset，供尤克/贝斯等复用（避免多份重复加载逻辑） */
    sampleBank: {},
    _sampleState: {},
    _samplePromise: {},

    ensureSample(url, globalName) {
      if (this.sampleBank[globalName]) return Promise.resolve(true);
      if (this._sampleState[globalName] === "failed") return Promise.resolve(false);
      if (this._samplePromise[globalName]) return this._samplePromise[globalName];
      this._sampleState[globalName] = "loading";
      this._samplePromise[globalName] = (async () => {
        try {
          this.init();
          if (typeof WebAudioFontPlayer === "undefined") {
            await this.loadScript(WAF_PLAYER_URL);
          }
          if (typeof WebAudioFontPlayer === "undefined") throw new Error("no player");
          if (!this.wafPlayer) this.wafPlayer = new WebAudioFontPlayer();
          const preset = await this.loadWafPreset(url, globalName);
          this.sampleBank[globalName] = preset;
          this._sampleState[globalName] = "ready";
          return true;
        } catch {
          this._sampleState[globalName] = "failed";
          return false;
        } finally {
          this._samplePromise[globalName] = null;
        }
      })();
      return this._samplePromise[globalName];
    },

    playSample(globalName, midi, duration, delay = 0, gain = 0.5) {
      const preset = this.sampleBank[globalName];
      if (preset && this.wafPlayer && this.ctx) {
        this.wafPlayer.queueWaveTable(
          this.ctx,
          this.ctx.destination,
          preset,
          this.ctx.currentTime + delay,
          midi,
          duration,
          gain
        );
        return true;
      }
      return false;
    },

    /** 尤克里里：尼龙弦采样，回退到柔化 Karplus */
    playUkeNote(midi, duration = 0.7, delay = 0, gain = 0.5) {
      this.init();
      if (this.playSample(WAF_NYLON_NAME, midi, duration, delay, gain)) return;
      this.playKarplus(midi, duration, delay, Math.min(0.4, gain));
      this.ensureSample(WAF_NYLON_URL, WAF_NYLON_NAME);
    },

    /** 贝斯：指弹贝斯采样，回退到低频合成（sine 基音 + 三角谐波） */
    playBassNote(midi, duration = 0.9, delay = 0, gain = 0.6) {
      this.init();
      if (this.playSample(WAF_BASS_NAME, midi, duration, delay, gain)) return;
      const t = this.ctx.currentTime + delay;
      const freq = this.freq(midi);
      const osc = this.ctx.createOscillator();
      const harm = this.ctx.createOscillator();
      const harmGain = this.ctx.createGain();
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = "sine";
      harm.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      harm.frequency.setValueAtTime(freq, t);
      harmGain.gain.value = 0.3;
      lp.type = "lowpass";
      lp.frequency.value = Math.min(1600, freq * 4 + 300);
      lp.Q.value = 0.6;
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(Math.min(0.5, gain), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(lp);
      harm.connect(harmGain);
      harmGain.connect(lp);
      lp.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      harm.start(t);
      osc.stop(t + duration + 0.05);
      harm.stop(t + duration + 0.05);
      this.ensureSample(WAF_BASS_URL, WAF_BASS_NAME);
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

    playKarplus(midi, duration = 0.85, delay = 0, peak = 0.38) {
      this.init();
      const freq = this.freq(midi);
      const sr = this.ctx.sampleRate;
      const period = Math.max(2, Math.round(sr / freq));
      const total = Math.min(sr * 3, period * Math.ceil((duration * sr) / period) + period);
      const buf = this.ctx.createBuffer(1, total, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < period; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.65;
      }
      for (let i = period; i < total; i++) {
        data[i] = 0.996 * 0.5 * (data[i - period] + data[i - period + 1]);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      // 柔化拨弦：低通去除数字毛刺
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = Math.min(6000, freq * 6 + 800);
      lp.Q.value = 0.3;
      const g = this.ctx.createGain();
      const t = this.ctx.currentTime + delay;
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      src.connect(lp);
      lp.connect(g);
      g.connect(this.ctx.destination);
      src.start(t);
      src.stop(t + duration + 0.05);
    },

    playGuitarNote(midi, duration = 0.75, delay = 0, gain = 0.48) {
      this.init();
      if (this.guitarWafReady && this.wafPlayer && this.guitarWafPreset) {
        const when = this.ctx.currentTime + delay;
        this.wafPlayer.queueWaveTable(
          this.ctx,
          this.ctx.destination,
          this.guitarWafPreset,
          when,
          midi,
          duration,
          gain
        );
        return;
      }
      this.playKarplus(midi, duration, delay, gain);
      this.ensureGuitarFont();
    },

    playGuitarChord(notes, arp = false) {
      if (arp) {
        notes.forEach((m, i) => this.playGuitarNote(m, 0.42, i * 0.11));
      } else {
        notes.forEach(m => this.playGuitarNote(m, 0.7));
      }
    },

    /** 真实扫弦：按弦序小间隔（~22ms）依次发声；下扫低→高、上扫高→低；velocity 控力度；voice 选音色 */
    strumChord(notes, downstroke = true, velocity = 0.6, voice = "guitar") {
      if (!notes || !notes.length) return;
      const order = downstroke ? notes.slice() : notes.slice().reverse();
      const stagger = 0.018 + (1 - Math.min(1, velocity)) * 0.02;
      const peak = 0.3 + Math.min(1, velocity) * 0.35;
      const dur = 1.1 + Math.min(1, velocity) * 0.5;
      const play = voice === "uke"
        ? (m, i) => this.playUkeNote(m, dur, i * stagger, peak)
        : (m, i) => this.playGuitarNote(m, dur, i * stagger, peak);
      order.forEach(play);
    },

    /** 运弓：优先采样（经 GainNode 控力度），失败回退擦弦合成；voice=violin|cello */
    bowVoice: null,
    _bowRequeueTimer: null,

    _bowSampleName(voice) {
      return voice === "cello" ? WAF_CELLO_NAME : WAF_VIOLIN_NAME;
    },

    _cancelBowEnvelope(env) {
      if (!env) return;
      try {
        if (typeof env.cancel === "function") env.cancel();
        else if (typeof env.cancelQueueWaveTable === "function") env.cancelQueueWaveTable();
      } catch { /* */ }
    },

    _clearBowRequeue() {
      if (this._bowRequeueTimer) {
        clearTimeout(this._bowRequeueTimer);
        this._bowRequeueTimer = null;
      }
    },

    _queueBowSample(midi, voice) {
      const name = this._bowSampleName(voice);
      const preset = this.sampleBank[name];
      if (!preset || !this.wafPlayer || !this.ctx || !this.bowVoice || this.bowVoice.mode !== "sample") {
        return false;
      }
      this._cancelBowEnvelope(this.bowVoice.envelope);
      // 长时值：采样自然衰减前再排队，模拟持续运弓
      const dur = 2.4;
      const env = this.wafPlayer.queueWaveTable(
        this.ctx,
        this.bowVoice.g,
        preset,
        this.ctx.currentTime,
        midi,
        dur,
        0.55
      );
      this.bowVoice.envelope = env;
      this.bowVoice.midi = midi;
      this.bowVoice.freq = this.freq(midi);
      this._clearBowRequeue();
      this._bowRequeueTimer = setTimeout(() => {
        if (this.bowVoice && this.bowVoice.mode === "sample") {
          this._queueBowSample(this.bowVoice.midi, this.bowVoice.voice);
        }
      }, 1800);
      return true;
    },

    startBow(midi, voice = "violin") {
      this.init();
      this.stopBow(0.02);
      const sampleName = this._bowSampleName(voice);
      const hasSample = !!this.sampleBank[sampleName];
      if (!hasSample) {
        this.ensureSample(
          voice === "cello" ? WAF_CELLO_URL : WAF_VIOLIN_URL,
          sampleName
        );
      }

      if (hasSample && this.wafPlayer) {
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        g.connect(this.ctx.destination);
        this.bowVoice = {
          mode: "sample",
          voice,
          g,
          envelope: null,
          midi,
          freq: this.freq(midi)
        };
        this._queueBowSample(midi, voice);
        return;
      }

      // 回退：擦弦合成（锯齿+暖三角+双低通+高通+共振峰）
      const t = this.ctx.currentTime;
      const freq = this.freq(midi);
      const osc = this.ctx.createOscillator();
      const warm = this.ctx.createOscillator();
      const lp1 = this.ctx.createBiquadFilter();
      const lp2 = this.ctx.createBiquadFilter();
      const hp = this.ctx.createBiquadFilter();
      const formant = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      osc.type = "sawtooth";
      warm.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      warm.frequency.setValueAtTime(freq, t);
      const warmGain = this.ctx.createGain();
      warmGain.gain.value = 0.55;
      lp1.type = "lowpass";
      lp1.frequency.setValueAtTime(Math.min(6500, freq * 2.6 + 650), t);
      lp1.Q.value = 0.4;
      lp2.type = "lowpass";
      lp2.frequency.setValueAtTime(Math.min(8000, freq * 4 + 1200), t);
      lp2.Q.value = 0.2;
      hp.type = "highpass";
      hp.frequency.setValueAtTime(Math.min(220, freq * 0.75), t);
      formant.type = "peaking";
      formant.frequency.setValueAtTime(1100, t);
      formant.Q.value = 0.9;
      formant.gain.value = 4;
      vibrato.type = "sine";
      vibrato.frequency.setValueAtTime(5.4, t);
      vibratoGain.gain.setValueAtTime(freq * 0.0035, t);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibratoGain.connect(warm.frequency);
      g.gain.setValueAtTime(0.0001, t);
      osc.connect(lp1);
      warm.connect(warmGain);
      warmGain.connect(lp1);
      lp1.connect(hp);
      hp.connect(formant);
      formant.connect(lp2);
      lp2.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      warm.start(t);
      vibrato.start(t);
      this.bowVoice = {
        mode: "synth",
        voice,
        osc, warm, lp1, lp2, hp, formant, g, vibrato, vibratoGain,
        midi, freq
      };
    },

    /** intensity 0–1：随运弓速度调音量（快=响、停=弱） */
    setBowIntensity(intensity) {
      if (!this.bowVoice || !this.ctx) return;
      const t = this.ctx.currentTime;
      const peak = this.bowVoice.mode === "sample" ? 0.85 : 0.26;
      const target = Math.max(0.0001, Math.min(peak, intensity * peak));
      this.bowVoice.g.gain.cancelScheduledValues(t);
      this.bowVoice.g.gain.setTargetAtTime(target, t, 0.07);
      if (this.bowVoice.mode === "synth" && this.bowVoice.lp1) {
        const cut = Math.min(7000, this.bowVoice.freq * (2.2 + intensity * 2.2) + 600);
        this.bowVoice.lp1.frequency.setTargetAtTime(cut, t, 0.08);
      }
    },

    setBowPitch(midi) {
      if (!this.bowVoice || !this.ctx) return;
      if (this.bowVoice.mode === "sample") {
        if (this.bowVoice.midi === midi) return;
        this._queueBowSample(midi, this.bowVoice.voice || "violin");
        return;
      }
      const t = this.ctx.currentTime;
      const freq = this.freq(midi);
      this.bowVoice.freq = freq;
      this.bowVoice.midi = midi;
      this.bowVoice.osc.frequency.setTargetAtTime(freq, t, 0.04);
      this.bowVoice.warm.frequency.setTargetAtTime(freq, t, 0.04);
      this.bowVoice.lp1.frequency.setTargetAtTime(Math.min(6500, freq * 2.6 + 650), t, 0.05);
      this.bowVoice.vibratoGain.gain.setTargetAtTime(freq * 0.0035, t, 0.05);
    },

    stopBow(fade = 0.14) {
      this._clearBowRequeue();
      if (!this.bowVoice || !this.ctx) return;
      const v = this.bowVoice;
      this.bowVoice = null;
      const t = this.ctx.currentTime;
      try {
        v.g.gain.cancelScheduledValues(t);
        v.g.gain.setTargetAtTime(0.0001, t, fade / 3);
        if (v.mode === "sample") {
          setTimeout(() => this._cancelBowEnvelope(v.envelope), fade * 1000);
        } else {
          v.osc.stop(t + fade + 0.08);
          v.warm.stop(t + fade + 0.08);
          v.vibrato.stop(t + fade + 0.08);
        }
      } catch { /* already stopped */ }
    },

    /** 擦弦乐器短试听（点指位） */
    playBowPreview(midi, voice = "violin", duration = 0.45) {
      this.init();
      const name = this._bowSampleName(voice);
      if (this.playSample(name, midi, duration, 0, 0.48)) return;
      this.startBow(midi, voice);
      this.setBowIntensity(0.45);
      setTimeout(() => this.stopBow(0.12), Math.floor(duration * 1000));
      this.ensureSample(
        voice === "cello" ? WAF_CELLO_URL : WAF_VIOLIN_URL,
        name
      );
    },

    noise(duration, peak = 0.35, type = "white", filterFreq = null) {
      this.init();
      const sr = this.ctx.sampleRate;
      const len = Math.floor(sr * duration);
      const buf = this.ctx.createBuffer(1, len, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const n = Math.random() * 2 - 1;
        data[i] = n * (type === "white" ? 1 : 1 - i / len);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      let tail = src;
      if (filterFreq) {
        const bp = this.ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = filterFreq;
        bp.Q.value = 0.9;
        src.connect(bp);
        tail = bp;
      }
      const g = this.ctx.createGain();
      const t = this.ctx.currentTime;
      g.gain.setValueAtTime(peak, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      tail.connect(g);
      g.connect(this.ctx.destination);
      src.start(t);
      src.stop(t + duration + 0.02);
    },

    playKick() {
      this.init();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.85, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
      this.noise(0.04, 0.12, "white", 120);
    },

    playSnare() {
      this.init();
      const t = this.ctx.currentTime;
      this.noise(0.22, 0.55, "white", 1800);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    },

    playHiHat(closed = true) {
      const dur = closed ? 0.055 : 0.38;
      const peak = closed ? 0.28 : 0.32;
      this.noise(dur, peak, "white", closed ? 7200 : 5800);
      if (!closed) {
        this.playTone(6200, 0.25, "square", 0.04);
      }
    },

    playCrash() {
      this.noise(1.4, 0.42, "white", 4200);
      [2800, 4100, 5300].forEach((f, i) => {
        this.playTone(f, 1.1 - i * 0.15, "sine", 0.06, i * 0.01);
      });
    },

    playRide() {
      this.noise(0.35, 0.22, "white", 4800);
      this.playTone(5400, 0.55, "sine", 0.14);
    },

    playTom(pitch = 180) {
      this.init();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.55, t + 0.12);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.48, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.42);
      this.noise(0.03, 0.08, "white", pitch * 4);
    },

    playDrum(id) {
      switch (id) {
        case "kick":       this.playKick(); break;
        case "snare":      this.playSnare(); break;
        case "hihat":      this.playHiHat(true); break;
        case "hihat-open": this.playHiHat(false); break;
        case "crash":      this.playCrash(); break;
        case "ride":       this.playRide(); break;
        case "tom-hi":     this.playTom(280); break;
        case "tom-mid":    this.playTom(200); break;
        case "tom-floor":  this.playTom(130); break;
        default: break;
      }
    }
  };

  function $(sel) { return root.querySelector(sel); }

  function guideStorageGet(key) {
    try { return localStorage.getItem(key) === "1"; } catch { return false; }
  }

  function guideStorageSet(key) {
    try { localStorage.setItem(key, "1"); } catch { /* ignore */ }
  }

  function setGuideVisible(kind, visible) {
    const bar = $(kind === "guitar" ? "#pfGuitarGuide" : "#pfDrumsGuide");
    if (bar) bar.classList.toggle("hidden", !visible);
    const replay = $(kind === "guitar" ? "#pfGuitarGuideReplay" : "#pfDrumsGuideReplay");
    if (replay && !visible && guideStorageGet(kind === "guitar" ? LS_GUITAR_GUIDE : LS_DRUMS_GUIDE)) {
      replay.classList.remove("hidden");
    }
  }

  function updateGuitarGuideTask(text) {
    const el = $("#pfGuitarGuideTask");
    if (el) el.textContent = text;
  }

  function updateDrumsGuideTask(text) {
    const el = $("#pfDrumsGuideTask");
    if (el) el.textContent = text;
  }

  function clearGuitarGuideHighlight() {
    if (!root) return;
    root.querySelectorAll(".pf-guide-target").forEach((el) => el.classList.remove("pf-guide-target"));
  }

  function highlightGuitarGuideTarget() {
    clearGuitarGuideHighlight();
    if (!guitarGuideActive || !root) return;
    if (guitarGuideStep === 0) {
      const cell = root.querySelector('[data-fret="0-0"]');
      if (cell) cell.classList.add("pf-guide-target");
    } else if (guitarGuideStep === 1) {
      const btn = root.querySelector('[data-chord="1"]');
      if (btn) btn.classList.add("pf-guide-target");
    }
  }

  function finishGuitarGuide() {
    guitarGuideActive = false;
    guitarGuideStep = 0;
    clearGuitarGuideHighlight();
    guideStorageSet(LS_GUITAR_GUIDE);
    setGuideVisible("guitar", false);
    setFeedback("吉他引导完成，继续练指板与和弦吧");
  }

  function finishDrumsGuide() {
    drumsGuideActive = false;
    drumsGuideStep = 0;
    guideStorageSet(LS_DRUMS_GUIDE);
    setGuideVisible("drums", false);
    setFeedback("鼓组引导完成，试试更多组合");
  }

  function startGuitarGuide() {
    // 引导与和弦扫弦/弹唱互斥：否则指板点击被吞、高亮像「卡在 Am」
    if (jamActive) stopJam();
    if (chordStrumMode) setChordStrumMode(false);
    guitarGuideActive = true;
    guitarGuideStep = 0;
    updateGuitarGuideTask("请点击⑥弦空弦（最低音 E）· 高亮格");
    const replay = $("#pfGuitarGuideReplay");
    if (replay) replay.classList.add("hidden");
    setGuideVisible("guitar", true);
    // 指板可能稍后才 render；下一帧再高亮
    requestAnimationFrame(() => highlightGuitarGuideTarget());
  }

  function startDrumsGuide() {
    drumsGuideActive = true;
    drumsGuideStep = 0;
    updateDrumsGuideTask("小任务：先敲底鼓 Z，再敲军鼓 X");
    const replay = $("#pfDrumsGuideReplay");
    if (replay) replay.classList.add("hidden");
    setGuideVisible("drums", true);
  }

  function maybeShowInstrumentGuide(inst, force = false) {
    if (inst === "guitar") {
      const done = guideStorageGet(LS_GUITAR_GUIDE);
      const replay = $("#pfGuitarGuideReplay");
      if (replay) replay.classList.toggle("hidden", !done || force);
      if (force || !done) startGuitarGuide();
      else {
        guitarGuideActive = false;
        setGuideVisible("guitar", false);
      }
    } else if (inst === "drums") {
      const done = guideStorageGet(LS_DRUMS_GUIDE);
      const replay = $("#pfDrumsGuideReplay");
      if (replay) replay.classList.toggle("hidden", !done || force);
      if (force || !done) startDrumsGuide();
      else {
        drumsGuideActive = false;
        setGuideVisible("drums", false);
      }
    }
  }

  function onGuitarGuideProgress(stringIdx, fret, chordDigit) {
    if (!guitarGuideActive) return;
    if (guitarGuideStep === 0 && stringIdx === 0 && fret === 0) {
      guitarGuideStep = 1;
      updateGuitarGuideTask("请点数字键 1 或高亮的 C 和弦钮");
      highlightGuitarGuideTarget();
      setFeedback("很好！再听一下 C 开放和弦");
    } else if (guitarGuideStep === 1 && chordDigit === "1") {
      finishGuitarGuide();
    }
  }

  function jamChordByDigit(digit) {
    return GUITAR_CHORDS.find(c => c.digit === digit) || null;
  }

  function jamCurrentDigit() {
    return JAM_DIGITS[jamStep] || JAM_DIGITS[0];
  }

  function jamCurrentName() {
    const ch = jamChordByDigit(jamCurrentDigit());
    return ch ? ch.name : "?";
  }

  function updateJamHighlight() {
    if (!root) return;
    root.querySelectorAll(".pf-chord-btn").forEach(btn => {
      btn.classList.remove("pf-chord-jam-target");
    });
    if (!jamActive) return;
    const btn = root.querySelector(`[data-chord="${jamCurrentDigit()}"]`);
    if (btn) btn.classList.add("pf-chord-jam-target");
  }

  function updateJamBar() {
    const bar = $("#pfJam");
    const target = $("#pfJamTarget");
    const prog = $("#pfJamProgress");
    const start = $("#pfJamStart");
    if (bar) bar.classList.toggle("hidden", !jamActive);
    if (start) start.classList.toggle("hidden", jamActive);
    if (target) target.textContent = jamCurrentName();
    if (prog) prog.textContent = `${jamStep + 1}/4`;
    updateJamHighlight();
  }

  function showJamToast(text) {
    const el = $("#pfJamToast");
    if (!el) {
      setFeedback(text);
      return;
    }
    el.textContent = text;
    el.classList.remove("hidden");
    if (jamToastTimer) clearTimeout(jamToastTimer);
    jamToastTimer = setTimeout(() => {
      el.classList.add("hidden");
      jamToastTimer = null;
    }, 3200);
  }

  function startJam() {
    if (guitarGuideActive) finishGuitarGuide();
    if (chordStrumMode) {
      // 弹唱用「点和弦即响」更直观；扫弦模式可稍后再开
      setChordStrumMode(false);
    }
    jamActive = true;
    jamStep = 0;
    guitarGuideActive = false;
    guitarGuideStep = 0;
    setGuideVisible("guitar", false);
    updateJamBar();
    setFeedback("弹唱练习：按高亮和弦，进行 Am–F–C–G");
  }

  function stopJam() {
    jamActive = false;
    jamStep = 0;
    updateJamBar();
    const toast = $("#pfJamToast");
    if (toast) toast.classList.add("hidden");
    if (jamToastTimer) {
      clearTimeout(jamToastTimer);
      jamToastTimer = null;
    }
    setFeedback("已退出弹唱练习");
  }

  function onJamChordInput(digit) {
    if (!jamActive) return;
    const expected = jamCurrentDigit();
    if (digit !== expected) {
      return;
    }
    jamStep++;
    if (jamStep >= JAM_DIGITS.length) {
      guideStorageSet(LS_GUITAR_JAM);
      showJamToast("第一圈完成 · 可循环练习");
      jamStep = 0;
    }
    updateJamBar();
  }

  function drumsJamCurrentPadId() {
    return DRUMS_JAM_PAD_IDS[drumsJamStep] || DRUMS_JAM_PAD_IDS[0];
  }

  function drumsJamCurrentLabel() {
    return DRUMS_JAM_LABELS[drumsJamCurrentPadId()] || "?";
  }

  function updateDrumsJamHighlight() {
    if (!root) return;
    root.querySelectorAll(".pf-drum-pad").forEach(btn => {
      btn.classList.remove("pf-drum-jam-target");
    });
    if (!drumsJamActive) return;
    const btn = root.querySelector(`[data-drum="${drumsJamCurrentPadId()}"]`);
    if (btn) btn.classList.add("pf-drum-jam-target");
  }

  function updateDrumsJamBar() {
    const bar = $("#pfDrumsJam");
    const target = $("#pfDrumsJamTarget");
    const prog = $("#pfDrumsJamProgress");
    const start = $("#pfDrumsJamStart");
    if (bar) bar.classList.toggle("hidden", !drumsJamActive);
    if (start) start.classList.toggle("hidden", drumsJamActive);
    if (target) target.textContent = drumsJamCurrentLabel();
    if (prog) prog.textContent = `${drumsJamStep + 1}/4`;
    updateDrumsJamHighlight();
  }

  function showDrumsJamToast(text) {
    const el = $("#pfDrumsJamToast");
    if (!el) {
      setFeedback(text);
      return;
    }
    el.textContent = text;
    el.classList.remove("hidden");
    if (drumsJamToastTimer) clearTimeout(drumsJamToastTimer);
    drumsJamToastTimer = setTimeout(() => {
      el.classList.add("hidden");
      drumsJamToastTimer = null;
    }, 3200);
  }

  function startDrumsJam() {
    drumsJamActive = true;
    drumsJamStep = 0;
    drumsGuideActive = false;
    drumsGuideStep = 0;
    setGuideVisible("drums", false);
    updateDrumsJamBar();
    setFeedback("节奏底练习：按高亮鼓垫，Z → X → Z → A");
  }

  function stopDrumsJam() {
    drumsJamActive = false;
    drumsJamStep = 0;
    updateDrumsJamBar();
    const toast = $("#pfDrumsJamToast");
    if (toast) toast.classList.add("hidden");
    if (drumsJamToastTimer) {
      clearTimeout(drumsJamToastTimer);
      drumsJamToastTimer = null;
    }
    setFeedback("已退出节奏底练习");
  }

  function onDrumsJamInput(padId) {
    if (!drumsJamActive) return;
    const expected = drumsJamCurrentPadId();
    if (padId !== expected) return;
    drumsJamStep++;
    if (drumsJamStep >= DRUMS_JAM_PAD_IDS.length) {
      guideStorageSet(LS_DRUMS_JAM);
      showDrumsJamToast("第一圈完成");
      drumsJamStep = 0;
    }
    updateDrumsJamBar();
  }

  function onDrumsGuideProgress(padId) {
    if (!drumsGuideActive) return;
    if (drumsGuideStep === 0) {
      if (padId === "kick") {
        drumsGuideStep = 1;
        updateDrumsGuideTask("很好！再敲军鼓 X");
      } else if (padId === "snare") {
        updateDrumsGuideTask("顺序不对哦：先敲底鼓 Z，再敲军鼓 X");
      }
    } else if (drumsGuideStep === 1) {
      if (padId === "snare") {
        drumsGuideStep = 2;
        updateDrumsGuideTask("试试闭镲 A");
      } else if (padId === "kick") {
        updateDrumsGuideTask("底鼓已敲过，请敲军鼓 X");
      }
    } else if (drumsGuideStep === 2 && padId === "hihat") {
      finishDrumsGuide();
    }
  }

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

  function setSourceBadge(state, kind = "piano") {
    const el = $("#pfSourceBadge");
    if (!el) return;
    el.classList.remove("ok", "fallback", "loading", "hidden");
    const texts = {
      piano: {
        ok: "音源：WebAudioFont 钢琴采样",
        fallback: "音源：钢琴合成音回退",
        loading: "音源：正在加载钢琴采样…"
      },
      guitar: {
        ok: "音源：WebAudioFont 钢弦吉他采样",
        fallback: "音源：钢弦拨弦合成回退",
        loading: "音源：正在加载吉他采样…"
      },
      drums: {
        ok: "音源：Web Audio 鼓组合成",
        fallback: "音源：Web Audio 鼓组合成",
        loading: "音源：Web Audio 鼓组合成"
      }
    };
    const copy = texts[kind] || texts.piano;
    if (kind === "drums") {
      el.classList.add("ok");
      el.textContent = copy.ok;
      return;
    }
    if (state === "ok") {
      el.classList.add("ok");
      el.textContent = copy.ok;
    } else if (state === "fallback") {
      el.classList.add("fallback");
      el.textContent = copy.fallback;
    } else {
      el.classList.add("loading");
      el.textContent = copy.loading;
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
    Audio.playGuitarChord(chord.notes, arpeggio);
    setInfo(chord.label, `组成音：${chord.notes.map(m => Audio.noteName(m)).join(" · ")}`);
    if (jamActive) {
      const expected = jamCurrentDigit();
      if (chord.digit !== expected) {
        setFeedback(`现在是 ${jamCurrentName()}`);
      } else {
        setFeedback(`✓ ${chord.name} · 下一和弦`);
      }
      onJamChordInput(chord.digit);
    } else {
      setFeedback(`你演奏了 ${chord.name} 和弦`);
    }
    onGuitarGuideProgress(null, null, chord.digit);
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

  function playGuitarFret(stringIdx, fret) {
    Audio.init();
    const midi = GUITAR_OPEN_MIDI[stringIdx] + fret;
    const name = Audio.noteName(midi);
    const strLabel = GUITAR_STRING_NAMES[stringIdx];
    Audio.playGuitarNote(midi, 0.72);
    setInfo(`${strLabel} 弦 · ${fret} 品`, `${name} · ${Audio.freq(midi).toFixed(1)} Hz`);
    setFeedback(`单音 ${name}（${strLabel} 弦 ${fret} 品）`);
    onGuitarGuideProgress(stringIdx, fret, null);
    noteCount++;
    updateStats();
    const btn = root.querySelector(`[data-fret="${stringIdx}-${fret}"]`);
    if (btn) {
      btn.classList.add("active");
      setTimeout(() => btn.classList.remove("active"), 180);
    }
  }

  function playUkeChord(chord, fromKeyboard = false) {
    Audio.init();
    if (arpeggio) {
      chord.notes.forEach((m, i) => Audio.playUkeNote(m, 0.42, i * 0.1));
    } else {
      Audio.strumChord(chord.notes, true, 0.5, "uke");
    }
    setInfo(chord.label, `尤克 · ${chord.notes.map(m => Audio.noteName(m)).join(" · ")}`);
    setFeedback(`你演奏了 ${chord.name}（尤克里里）`);
    noteCount++;
    updateStats();
    if (fromKeyboard) {
      const btn = root.querySelector(`[data-uke-chord="${chord.digit}"]`);
      if (btn) {
        btn.classList.add("active");
        setTimeout(() => btn.classList.remove("active"), 200);
      }
    }
  }

  function playUkeFret(stringIdx, fret) {
    Audio.init();
    const midi = UKE_OPEN_MIDI[stringIdx] + fret;
    const name = Audio.noteName(midi);
    const strLabel = UKE_STRING_NAMES[stringIdx];
    Audio.playUkeNote(midi, 0.65);
    setInfo(`${strLabel} 弦 · ${fret} 品`, `${name} · 尤克里里`);
    setFeedback(`单音 ${name}（尤克 ${strLabel}）`);
    noteCount++;
    updateStats();
    const btn = root.querySelector(`[data-uke-fret="${stringIdx}-${fret}"]`);
    if (btn) {
      btn.classList.add("active");
      setTimeout(() => btn.classList.remove("active"), 180);
    }
  }

  function renderUkeFretboard() {
    const board = $("#pfUkeFretboard");
    if (!board) return;
    board.innerHTML = "";
    const head = document.createElement("div");
    head.className = "pf-fret-head";
    head.innerHTML = `<span class="pf-fret-corner">弦</span><span class="pf-fret-nut">空弦</span>`;
    for (let f = 1; f <= UKE_FRET_COUNT; f++) {
      const s = document.createElement("span");
      s.className = "pf-fret-num";
      s.textContent = String(f);
      head.appendChild(s);
    }
    board.appendChild(head);
    UKE_OPEN_MIDI.forEach((openMidi, si) => {
      const row = document.createElement("div");
      row.className = "pf-fret-row";
      const label = document.createElement("span");
      label.className = "pf-fret-string-label";
      label.innerHTML =
        `<span class="pf-fret-str-num">${4 - si}</span>` +
        `<span class="pf-fret-str-name">${UKE_STRING_NAMES[si]}</span>`;
      row.appendChild(label);
      for (let f = 0; f <= UKE_FRET_COUNT; f++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pf-fret-cell" + (f === 0 ? " open" : "");
        btn.dataset.ukeFret = `${si}-${f}`;
        const midi = openMidi + f;
        btn.innerHTML = `<span class="pf-fret-note">${Audio.noteName(midi)}</span>`;
        btn.addEventListener("click", () => {
          if (strumSuppressClick || chordStrumMode) return;
          playUkeFret(si, f);
        });
        row.appendChild(btn);
      }
      board.appendChild(row);
    });
    attachStrum(board, "ukeFret", playUkeFret);
    attachChordStrum(board);
  }

  function playBassFret(stringIdx, fret) {
    Audio.init();
    const midi = BASS_OPEN_MIDI[stringIdx] + fret;
    const name = Audio.noteName(midi);
    const strLabel = BASS_STRING_NAMES[stringIdx];
    Audio.playBassNote(midi, 0.9);
    setInfo(`${strLabel} 弦 · ${fret} 品`, `${name} · 贝斯`);
    setFeedback(`低音 ${name}（贝斯 ${strLabel}）`);
    noteCount++;
    updateStats();
    const btn = root.querySelector(`[data-bass-fret="${stringIdx}-${fret}"]`);
    if (btn) {
      btn.classList.add("active");
      setTimeout(() => btn.classList.remove("active"), 180);
    }
  }

  function renderBassFretboard() {
    const board = $("#pfBassFretboard");
    if (!board) return;
    board.innerHTML = "";
    const head = document.createElement("div");
    head.className = "pf-fret-head";
    head.innerHTML = `<span class="pf-fret-corner">弦</span><span class="pf-fret-nut">空弦</span>`;
    for (let f = 1; f <= BASS_FRET_COUNT; f++) {
      const s = document.createElement("span");
      s.className = "pf-fret-num";
      s.textContent = String(f);
      head.appendChild(s);
    }
    board.appendChild(head);
    BASS_OPEN_MIDI.forEach((openMidi, si) => {
      const row = document.createElement("div");
      row.className = "pf-fret-row";
      const label = document.createElement("span");
      label.className = "pf-fret-string-label";
      label.innerHTML =
        `<span class="pf-fret-str-num">${4 - si}</span>` +
        `<span class="pf-fret-str-name">${BASS_STRING_NAMES[si]}</span>`;
      row.appendChild(label);
      for (let f = 0; f <= BASS_FRET_COUNT; f++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pf-fret-cell" + (f === 0 ? " open" : "");
        btn.dataset.bassFret = `${si}-${f}`;
        const midi = openMidi + f;
        btn.innerHTML = `<span class="pf-fret-note">${Audio.noteName(midi)}</span>`;
        btn.addEventListener("click", () => {
          if (strumSuppressClick) return;
          playBassFret(si, f);
        });
        row.appendChild(btn);
      }
      board.appendChild(row);
    });
    attachStrum(board, "bassFret", playBassFret);
  }

  /* ── 和弦扫弦模式（Smart Guitar 式：左手选和弦、右手扫）──
   * 左手：数字键 / 和弦钮 选当前和弦；右手：指板任意位置上下滑 = 扫弦。
   * 扫弦模式下指板单音不发声（像真吉他左手按弦不出声、右手才出声）。 */
  function currentStrumChord() {
    if (instrument === "uke") {
      return UKE_CHORDS.find(c => c.digit === ukeChordDigit) || UKE_CHORDS[0];
    }
    return GUITAR_CHORDS.find(c => c.digit === guitarChordDigit) || GUITAR_CHORDS[0];
  }

  function highlightSelectedChord() {
    const isUke = instrument === "uke";
    const digit = isUke ? ukeChordDigit : guitarChordDigit;
    const attr = isUke ? "ukeChord" : "chord";
    root.querySelectorAll(`[data-${attr === "chord" ? "chord" : "uke-chord"}]`).forEach((b) => {
      const d = isUke ? b.dataset.ukeChord : b.dataset.chord;
      b.classList.toggle("selected-chord", chordStrumMode && d === digit);
    });
    const hintEl = $(isUke ? "#pfUkeStrumHint" : "#pfGuitarStrumHint");
    if (hintEl) {
      const ch = currentStrumChord();
      hintEl.textContent = `扫弦区 · 当前和弦 ${ch ? ch.name : "-"} · 上下滑动`;
      hintEl.classList.toggle("hidden", !chordStrumMode);
    }
  }

  function currentStrumPattern() {
    return STRUM_PATTERNS.find(p => p.id === strumPatternId) || STRUM_PATTERNS[0];
  }

  function setStrumPattern(id) {
    const p = STRUM_PATTERNS.find(x => x.id === id);
    if (!p) return;
    strumPatternId = id;
    strumStrokeIdx = 0;
    syncPatternUi();
    setFeedback(`节奏型：${p.name} · 空格或再按同数字键扫下一拍`);
  }

  function syncPatternUi() {
    if (!root) return;
    root.querySelectorAll("[data-strum-pattern]").forEach((btn) => {
      btn.classList.toggle("on", btn.dataset.strumPattern === strumPatternId);
    });
  }

  /** 按当前节奏型推进一拍并扫弦；rest(0) 跳过发声仍推进 */
  function flashStrumStroke(downstroke) {
    if (!root) return;
    let el = root.querySelector(".pf-stroke-flash");
    if (!el) {
      el = document.createElement("div");
      el.className = "pf-stroke-flash";
      el.setAttribute("aria-hidden", "true");
      const board = root.querySelector(".pf-fretboard") || root;
      board.appendChild(el);
    }
    el.textContent = downstroke ? "↓" : "↑";
    el.classList.remove("show");
    // 强制重启动画
    void el.offsetWidth;
    el.classList.add("show");
  }

  function playPatternStroke(fromHint = "") {
    const isUke = instrument === "uke";
    if (instrument !== "guitar" && instrument !== "uke") return;
    if (!chordStrumMode && !fromHint) {
      setChordStrumMode(true);
    }
    const ch = currentStrumChord();
    if (!ch) return;
    const pat = currentStrumPattern();
    const stroke = pat.strokes[strumStrokeIdx % pat.strokes.length];
    strumStrokeIdx = (strumStrokeIdx + 1) % pat.strokes.length;
    Audio.init();
    if (stroke !== 0) {
      Audio.strumChord(ch.notes, stroke > 0, 0.62, isUke ? "uke" : "guitar");
      setFeedback(`${stroke > 0 ? "↓" : "↑"} ${ch.name} · ${pat.name}（空格续扫）`);
      flashStrumStroke(stroke > 0);
    } else {
      setFeedback(`— 休止 · ${ch.name}（空格续扫）`);
    }
    setInfo(ch.label, `节奏 ${pat.name} · 下一拍 ${strumStrokeIdx + 1}/${pat.strokes.length}`);
    noteCount++;
    updateStats();
    if (!isUke) {
      if (jamActive) onJamChordInput(ch.digit);
      onGuitarGuideProgress(null, null, ch.digit);
    }
  }

  function selectStrumChord(digit) {
    const isUke = instrument === "uke";
    const list = isUke ? UKE_CHORDS : GUITAR_CHORDS;
    const ch = list.find(c => c.digit === digit);
    if (!ch) return;
    const same = (isUke ? ukeChordDigit : guitarChordDigit) === digit;
    if (isUke) ukeChordDigit = digit; else guitarChordDigit = digit;
    highlightSelectedChord();
    // 再按同一数字 = 按节奏型再扫一下（流畅连扫）
    if (same && chordStrumMode) {
      playPatternStroke("rekey");
      return;
    }
    Audio.init();
    strumStrokeIdx = 0;
    Audio.strumChord(ch.notes, true, 0.55, isUke ? "uke" : "guitar");
    strumStrokeIdx = 1 % currentStrumPattern().strokes.length;
    setInfo(ch.label, `组成音：${ch.notes.map(m => Audio.noteName(m)).join(" · ")}`);
    if (!isUke && jamActive) {
      const expected = jamCurrentDigit();
      if (ch.digit !== expected) setFeedback(`现在是 ${jamCurrentName()}`);
      else setFeedback(`✓ ${ch.name} · 下一和弦`);
      onJamChordInput(ch.digit);
    } else {
      setFeedback(`和弦 ${ch.name} · 空格或再按 ${digit} 按节奏续扫`);
    }
    if (!isUke) onGuitarGuideProgress(null, null, ch.digit);
    noteCount++;
    updateStats();
  }

  function syncStrumUi() {
    const isUke = instrument === "uke";
    const board = $(isUke ? "#pfUkeFretboard" : "#pfFretboard");
    if (board) board.classList.toggle("strum-mode", chordStrumMode);
    const toggle = $(isUke ? "#pfUkeStrumToggle" : "#pfGuitarStrumToggle");
    if (toggle) {
      toggle.classList.toggle("on", chordStrumMode);
      toggle.textContent = chordStrumMode
        ? "✓ 和弦扫弦中"
        : (isUke ? "🪕 和弦扫弦" : "🎸 和弦扫弦");
    }
    highlightSelectedChord();
  }

  function setChordStrumMode(on) {
    chordStrumMode = !!on;
    const isUke = instrument === "uke";
    const board = $(isUke ? "#pfUkeFretboard" : "#pfFretboard");
    if (board) board.classList.toggle("strum-mode", chordStrumMode);
    const toggle = $(isUke ? "#pfUkeStrumToggle" : "#pfGuitarStrumToggle");
    if (toggle) {
      toggle.classList.toggle("on", chordStrumMode);
      toggle.textContent = chordStrumMode ? "✓ 和弦扫弦中" : "🎸 和弦扫弦";
    }
    highlightSelectedChord();
    setFeedback(chordStrumMode
      ? "和弦扫弦：数字键/和弦钮选和弦 · 指板上下滑扫弦"
      : "回到指板单音模式");
  }

  function attachChordStrum(board) {
    if (!board || board.dataset.chordStrumBound === "1") return;
    board.dataset.chordStrumBound = "1";
    let active = false;
    let anchorY = 0;
    let lastT = 0;
    const THRESH = 20;
    const begin = (e) => {
      if (!chordStrumMode) return;
      active = true;
      anchorY = e.clientY;
      lastT = performance.now();
      strumSuppressClick = true;
      try { board.setPointerCapture(e.pointerId); } catch { /* */ }
    };
    const move = (e) => {
      if (!active || !chordStrumMode) return;
      const dy = e.clientY - anchorY;
      if (Math.abs(dy) < THRESH) return;
      const now = performance.now();
      const dt = Math.max(30, now - lastT);
      const velocity = Math.min(1, (THRESH / dt) * 5 + 0.2);
      const chord = currentStrumChord();
      if (chord) {
        Audio.strumChord(chord.notes, dy > 0, velocity, instrument === "uke" ? "uke" : "guitar");
        setFeedback(`${dy > 0 ? "↓ 下扫" : "↑ 上扫"} ${chord.name}`);
      }
      anchorY = e.clientY;
      lastT = now;
    };
    const end = () => {
      if (!active) return;
      active = false;
      setTimeout(() => { strumSuppressClick = false; }, 80);
    };
    board.addEventListener("pointerdown", begin);
    board.addEventListener("pointermove", move);
    board.addEventListener("pointerup", end);
    board.addEventListener("pointerleave", end);
    board.addEventListener("pointercancel", end);
  }

  /**
   * 扫弦手势：竖向划过多根弦即依次拨响（鼠标拖动 / 手机滑动通用）。
   * 横向仍可滚动看更多品（CSS touch-action: pan-x）。
   */
  function attachStrum(board, datasetKey, play) {
    if (!board || board.dataset.strumBound === "1") return;
    board.dataset.strumBound = "1";
    let active = false;
    let lastSi = -1;
    let originSi = -1;
    let originF = 0;
    let playedOrigin = false;

    const attrName = datasetKey.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    const cellAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      const cell = el && el.closest(`[data-${attrName}]`);
      if (!cell || !board.contains(cell)) return null;
      const raw = cell.dataset[datasetKey];
      if (!raw) return null;
      const parts = raw.split("-");
      return { si: Number(parts[0]), f: Number(parts[1]) };
    };

    const strumTo = (targetSi, f) => {
      if (!playedOrigin) {
        play(originSi, originF);
        playedOrigin = true;
      }
      const step = targetSi > lastSi ? 1 : -1;
      for (let s = lastSi + step; s !== targetSi + step; s += step) play(s, f);
      lastSi = targetSi;
    };

    board.addEventListener("pointerdown", (e) => {
      if (chordStrumMode) return;
      const c = cellAt(e.clientX, e.clientY);
      active = true;
      playedOrigin = false;
      originSi = c ? c.si : -1;
      originF = c ? c.f : 0;
      lastSi = originSi;
    });
    board.addEventListener("pointermove", (e) => {
      if (!active || originSi < 0) return;
      const c = cellAt(e.clientX, e.clientY);
      if (!c || c.si === lastSi) return;
      strumSuppressClick = true;
      strumTo(c.si, c.f);
    });
    const end = () => {
      if (!active) return;
      active = false;
      if (playedOrigin) {
        setTimeout(() => { strumSuppressClick = false; }, 80);
      } else {
        strumSuppressClick = false;
      }
      lastSi = -1; originSi = -1; playedOrigin = false;
    };
    board.addEventListener("pointerup", end);
    board.addEventListener("pointerleave", end);
    board.addEventListener("pointercancel", end);
  }

  function currentViolinMidi() {
    return VIOLIN_OPEN_MIDI[violinString] + BOW_POSITIONS[violinPos].off;
  }

  function currentCelloMidi() {
    return CELLO_OPEN_MIDI[celloString] + BOW_POSITIONS[celloPos].off;
  }

  function currentBowMidi() {
    return instrument === "cello" ? currentCelloMidi() : currentViolinMidi();
  }

  function currentBowVoice() {
    return instrument === "cello" ? "cello" : "violin";
  }

  function updateBowCurrent() {
    const isCello = instrument === "cello";
    const el = $(isCello ? "#pfCelloBowCurrent" : "#pfBowCurrent");
    if (!el) return;
    const midi = currentBowMidi();
    const si = isCello ? celloString : violinString;
    const pi = isCello ? celloPos : violinPos;
    const names = isCello ? CELLO_STRING_NAMES : VIOLIN_STRING_NAMES;
    const posLabel = BOW_POSITIONS[pi].label === "空" ? "空弦" : `${BOW_POSITIONS[pi].label} 指`;
    el.textContent = `${names[si]} 弦 · ${posLabel} · ${Audio.noteName(midi)}`;
  }

  function selectViolin(si, pi, preview = true) {
    violinString = si;
    violinPos = pi;
    root.querySelectorAll("[data-violin]").forEach((b) => {
      b.classList.toggle("active", b.dataset.violin === `${si}-${pi}`);
    });
    updateBowCurrent();
    const midi = currentViolinMidi();
    setInfo(`${VIOLIN_STRING_NAMES[si]} 弦`, `${Audio.noteName(midi)} · 小提琴`);
    if (bowActive && instrument === "violin") {
      Audio.setBowPitch(midi);
    } else if (preview) {
      Audio.playBowPreview(midi, "violin", 0.4);
      setFeedback(`试听 ${Audio.noteName(midi)}`);
      noteCount++;
      updateStats();
    }
  }

  function selectCello(si, pi, preview = true) {
    celloString = si;
    celloPos = pi;
    root.querySelectorAll("[data-cello]").forEach((b) => {
      b.classList.toggle("active", b.dataset.cello === `${si}-${pi}`);
    });
    updateBowCurrent();
    const midi = currentCelloMidi();
    setInfo(`${CELLO_STRING_NAMES[si]} 弦`, `${Audio.noteName(midi)} · 大提琴`);
    if (bowActive && instrument === "cello") {
      Audio.setBowPitch(midi);
    } else if (preview) {
      Audio.playBowPreview(midi, "cello", 0.45);
      setFeedback(`试听 ${Audio.noteName(midi)}`);
      noteCount++;
      updateStats();
    }
  }

  function renderViolinPanel() {
    const wrap = $("#pfViolinStrings");
    if (!wrap) return;
    wrap.innerHTML = "";
    VIOLIN_OPEN_MIDI.forEach((openMidi, si) => {
      const row = document.createElement("div");
      row.className = "pf-violin-row";
      const label = document.createElement("span");
      label.className = "pf-violin-str-name";
      label.textContent = `${VIOLIN_STRING_NAMES[si]} 弦`;
      row.appendChild(label);
      BOW_POSITIONS.forEach((pos, pi) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pf-violin-cell" + (pi === 0 ? " open" : "");
        btn.dataset.violin = `${si}-${pi}`;
        const midi = openMidi + pos.off;
        btn.innerHTML =
          `<span class="pf-violin-note">${Audio.noteName(midi)}</span>` +
          `<span class="pf-violin-finger">${pos.label}</span>`;
        btn.addEventListener("click", () => selectViolin(si, pi, true));
        row.appendChild(btn);
      });
      wrap.appendChild(row);
    });
    selectViolin(violinString, violinPos, false);
    attachBow($("#pfBowZone"));
  }

  function renderCelloPanel() {
    const wrap = $("#pfCelloStrings");
    if (!wrap) return;
    wrap.innerHTML = "";
    CELLO_OPEN_MIDI.forEach((openMidi, si) => {
      const row = document.createElement("div");
      row.className = "pf-violin-row";
      const label = document.createElement("span");
      label.className = "pf-violin-str-name";
      label.textContent = `${CELLO_STRING_NAMES[si]} 弦`;
      row.appendChild(label);
      BOW_POSITIONS.forEach((pos, pi) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pf-violin-cell" + (pi === 0 ? " open" : "");
        btn.dataset.cello = `${si}-${pi}`;
        const midi = openMidi + pos.off;
        btn.innerHTML =
          `<span class="pf-violin-note">${Audio.noteName(midi)}</span>` +
          `<span class="pf-violin-finger">${pos.label}</span>`;
        btn.addEventListener("click", () => selectCello(si, pi, true));
        row.appendChild(btn);
      });
      wrap.appendChild(row);
    });
    selectCello(celloString, celloPos, false);
    attachBow($("#pfCelloBowZone"));
  }

  function attachBow(zone) {
    if (!zone || zone.dataset.bowBound === "1") return;
    zone.dataset.bowBound = "1";
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let intensity = 0;

    const startDecay = () => {
      if (bowDecayTimer) return;
      bowDecayTimer = setInterval(() => {
        if (!bowActive) return;
        intensity *= 0.7;
        if (intensity < 0.03) intensity = 0.03;
        Audio.setBowIntensity(intensity);
      }, 60);
    };
    const stopDecay = () => {
      if (bowDecayTimer) { clearInterval(bowDecayTimer); bowDecayTimer = null; }
    };

    const begin = (e) => {
      if (bowEasyMode) {
        // 简易点奏：点/触一下即采样发声，无需来回拉
        Audio.playBowPreview(currentBowMidi(), currentBowVoice(), 0.85);
        zone.classList.add("bowing");
        setTimeout(() => zone.classList.remove("bowing"), 280);
        setFeedback("点奏 · 可关「简易」改运弓拖动");
        setInfo(
          instrument === "cello" ? "大提琴点奏" : "小提琴点奏",
          Audio.noteName(currentBowMidi())
        );
        noteCount++;
        updateStats();
        return;
      }
      bowActive = true;
      intensity = 0.2;
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      Audio.startBow(currentBowMidi(), currentBowVoice());
      Audio.setBowIntensity(intensity);
      zone.classList.add("bowing");
      setFeedback("起弓 · 来回拉动持续发声");
      noteCount++;
      updateStats();
      startDecay();
      try { zone.setPointerCapture(e.pointerId); } catch { /* */ }
    };
    const move = (e) => {
      if (!bowActive) return;
      const now = performance.now();
      const dx = Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
      const dt = Math.max(8, now - lastT);
      const speed = dx / dt;
      intensity = Math.min(1, speed * 0.85 + 0.06);
      Audio.setBowIntensity(intensity);
      lastX = e.clientX; lastY = e.clientY; lastT = now;
    };
    const end = () => {
      if (!bowActive) return;
      bowActive = false;
      stopDecay();
      Audio.stopBow();
      zone.classList.remove("bowing");
      setFeedback("收弓");
    };

    zone.addEventListener("pointerdown", (e) => { e.preventDefault(); begin(e); });
    zone.addEventListener("pointermove", move);
    zone.addEventListener("pointerup", end);
    zone.addEventListener("pointerleave", end);
    zone.addEventListener("pointercancel", end);
  }

  function renderGuitarFretboard() {
    const board = $("#pfFretboard");
    if (!board) return;
    board.innerHTML = "";
    const head = document.createElement("div");
    head.className = "pf-fret-head";
    head.innerHTML = `<span class="pf-fret-corner">弦</span><span class="pf-fret-nut">空弦</span>`;
    for (let f = 1; f <= GUITAR_FRET_COUNT; f++) {
      const s = document.createElement("span");
      s.className = "pf-fret-num";
      s.textContent = String(f);
      head.appendChild(s);
    }
    board.appendChild(head);

    GUITAR_OPEN_MIDI.forEach((openMidi, si) => {
      const row = document.createElement("div");
      row.className = "pf-fret-row";
      const label = document.createElement("span");
      label.className = "pf-fret-string-label";
      label.innerHTML =
        `<span class="pf-fret-str-num">${6 - si}</span>` +
        `<span class="pf-fret-str-name">${GUITAR_STRING_NAMES[si]}</span>`;
      row.appendChild(label);

      for (let f = 0; f <= GUITAR_FRET_COUNT; f++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pf-fret-cell" + (f === 0 ? " open" : "");
        btn.dataset.fret = `${si}-${f}`;
        const midi = openMidi + f;
        btn.title = `${Audio.noteName(midi)}`;
        btn.innerHTML = f === 0
          ? `<span class="pf-fret-note">${Audio.noteName(midi)}</span>`
          : `<span class="pf-fret-dot"></span>`;
        btn.addEventListener("click", () => {
          // 引导第一步必须能点指板；和弦扫弦模式下其它点击仍静音
          if (strumSuppressClick) return;
          if (chordStrumMode && !(guitarGuideActive && guitarGuideStep === 0)) return;
          playGuitarFret(si, f);
        });
        row.appendChild(btn);
      }
      board.appendChild(row);
    });
    attachStrum(board, "fret", playGuitarFret);
    attachChordStrum(board);
    if (guitarGuideActive) highlightGuitarGuideTarget();
  }

  function playDrum(pad, fromKeyboard = false) {
    Audio.init();
    Audio.playDrum(pad.id);
    setInfo(pad.label, `鼓件：${pad.hint}`);
    if (drumsJamActive) {
      const expected = drumsJamCurrentPadId();
      if (pad.id !== expected) {
        setFeedback(`现在是${drumsJamCurrentLabel()}`);
      } else {
        setFeedback(`✓ ${pad.label} · 下一步`);
      }
      onDrumsJamInput(pad.id);
    } else {
      setFeedback(`你敲击了 ${pad.label}`);
    }
    if (!drumsJamActive) onDrumsGuideProgress(pad.id);
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
    if (bowActive || Audio.bowVoice) {
      bowActive = false;
      if (bowDecayTimer) { clearInterval(bowDecayTimer); bowDecayTimer = null; }
      Audio.stopBow(0.06);
    }
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
      setSourceBadge(Audio.wafReady ? "ok" : (Audio.wafFailed ? "fallback" : "loading"), "piano");
      setFeedback(Audio.wafReady ? "钢琴采样已就绪" : (Audio.wafFailed ? "采样加载失败，已用合成音" : "正在加载钢琴采样…"));
    } else if (inst === "guitar") {
      setModeLabel("🎸 吉他模式");
      setInfo("等待演奏…", "点指板弦×品弹单音 · 数字键 1–9 和弦");
      renderGuitarFretboard();
      syncStrumUi();
      setSourceBadge(
        Audio.guitarWafReady ? "ok" : (Audio.guitarWafFailed ? "fallback" : "loading"),
        "guitar"
      );
      setFeedback(
        Audio.guitarWafReady
          ? "钢弦吉他采样已就绪"
          : (Audio.guitarWafFailed ? "吉他采样未加载，使用拨弦合成" : "正在加载吉他采样…")
      );
      Audio.ensureGuitarFont().then((ok) => {
        if (!root || instrument !== "guitar") return;
        setSourceBadge(ok ? "ok" : "fallback", "guitar");
        if (!guitarGuideActive) {
          setFeedback(ok ? "钢弦吉他采样已就绪" : "吉他采样未加载，使用拨弦合成");
        }
      });
      maybeShowInstrumentGuide("guitar");
    } else if (inst === "uke") {
      setModeLabel("🪕 尤克里里模式");
      setInfo("等待演奏…", "四弦 gCEA · 数字键 1–4 和弦");
      renderUkeFretboard();
      syncStrumUi();
      const ukeLoaded = !!Audio.sampleBank[WAF_NYLON_NAME];
      setSourceBadge(ukeLoaded ? "ok" : "loading", "guitar");
      setFeedback("尤克里里 · 加载尼龙弦采样…");
      Audio.ensureSample(WAF_NYLON_URL, WAF_NYLON_NAME).then((ok) => {
        if (!root || instrument !== "uke") return;
        setSourceBadge(ok ? "ok" : "fallback", "guitar");
        setFeedback(ok ? "尤克里里就绪（尼龙弦采样）" : "拨弦合成 · 尤克里里");
      });
    } else if (inst === "bass") {
      setModeLabel("🎸 贝斯模式");
      setInfo("等待演奏…", "四弦 EADG · 点弦品走根音 · 竖划扫空弦");
      renderBassFretboard();
      const bassLoaded = !!Audio.sampleBank[WAF_BASS_NAME];
      setSourceBadge(bassLoaded ? "ok" : "loading", "guitar");
      setFeedback("贝斯 · 加载指弹贝斯采样…");
      Audio.ensureSample(WAF_BASS_URL, WAF_BASS_NAME).then((ok) => {
        if (!root || instrument !== "bass") return;
        setSourceBadge(ok ? "ok" : "fallback", "guitar");
        setFeedback(ok ? "贝斯就绪（指弹贝斯采样）" : "低频合成 · 贝斯");
      });
    } else if (inst === "violin") {
      setModeLabel("🎻 小提琴模式");
      setInfo("等待运弓…", "选弦选指位 · 运弓区按住来回拉动");
      renderViolinPanel();
      const vLoaded = !!Audio.sampleBank[WAF_VIOLIN_NAME];
      setSourceBadge(vLoaded ? "ok" : "loading", "guitar");
      setFeedback("小提琴 · 加载擦弦采样…");
      Audio.ensureSample(WAF_VIOLIN_URL, WAF_VIOLIN_NAME).then((ok) => {
        if (!root || instrument !== "violin") return;
        setSourceBadge(ok ? "ok" : "fallback", "guitar");
        setFeedback(ok ? "小提琴就绪（GM 小提琴采样 · 运弓）" : "擦弦合成 · 小提琴");
      });
    } else if (inst === "cello") {
      setModeLabel("🎻 大提琴模式");
      setInfo("等待运弓…", "C G D A · 选弦选指位 · 运弓区按住来回拉动");
      renderCelloPanel();
      const cLoaded = !!Audio.sampleBank[WAF_CELLO_NAME];
      setSourceBadge(cLoaded ? "ok" : "loading", "guitar");
      setFeedback("大提琴 · 加载擦弦采样…");
      Audio.ensureSample(WAF_CELLO_URL, WAF_CELLO_NAME).then((ok) => {
        if (!root || instrument !== "cello") return;
        setSourceBadge(ok ? "ok" : "fallback", "guitar");
        setFeedback(ok ? "大提琴就绪（GM 大提琴采样 · 运弓）" : "擦弦合成 · 大提琴");
      });
    } else if (inst === "studio") {
      setModeLabel("🎛️ 多轨创作室");
      setInfo("愿景页", "先练单乐器，后开多轨叠录");
      setSourceBadge("ok", "drums");
      setFeedback("多轨室为占位愿景 · 功能尚未开放录制");
    } else {
      setModeLabel("🥁 架子鼓模式");
      setInfo("等待演奏…", "键位见鼓垫标注（俯视舞台布局）");
      setSourceBadge("ok", "drums");
      setFeedback("鼓组为 Web Audio 合成，底鼓居中偏下");
      maybeShowInstrumentGuide("drums");
    }
    if (inst === "piano" || inst === "uke" || inst === "bass" || inst === "violin" || inst === "cello" || inst === "studio") {
      guitarGuideActive = false;
      drumsGuideActive = false;
      setGuideVisible("guitar", false);
      setGuideVisible("drums", false);
    }
    if (inst !== "guitar" && jamActive) stopJam();
    if (inst !== "drums" && drumsJamActive) stopDrumsJam();
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
        if (chordStrumMode) selectStrumChord(ch.digit);
        else playGuitarChord(ch, true);
      } else if (k === " " || e.code === "Space") {
        e.preventDefault();
        if (!chordStrumMode) setChordStrumMode(true);
        playPatternStroke("space");
      }
    } else if (instrument === "uke") {
      const ch = UKE_CHORDS.find(c => c.digit === k);
      if (ch) {
        e.preventDefault();
        if (chordStrumMode) selectStrumChord(ch.digit);
        else playUkeChord(ch, true);
      } else if (k === " " || e.code === "Space") {
        e.preventDefault();
        if (!chordStrumMode) setChordStrumMode(true);
        playPatternStroke("space");
      }
    } else if (instrument === "bass") {
      const idx = "1234".indexOf(k);
      if (idx >= 0) {
        e.preventDefault();
        playBassFret(idx, 0);
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
          <button type="button" class="pf-tab" data-instrument="uke">🪕 尤克里里</button>
          <button type="button" class="pf-tab" data-instrument="bass">🎸 贝斯</button>
          <button type="button" class="pf-tab" data-instrument="violin">🎻 小提琴</button>
          <button type="button" class="pf-tab" data-instrument="cello">🎻 大提琴</button>
          <button type="button" class="pf-tab" data-instrument="drums">🥁 架子鼓</button>
          <button type="button" class="pf-tab" data-instrument="studio">🎛️ 多轨室</button>
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
          <div class="pf-guide hidden" id="pfGuitarGuide" role="region" aria-label="吉他演奏引导">
            <div class="pf-guide-inner">
              <p class="pf-guide-tip">六弦空弦从粗到细 <strong>E A D G B E</strong></p>
              <p class="pf-guide-task" id="pfGuitarGuideTask">请点击⑥弦空弦（最低音 E）</p>
            </div>
            <button type="button" class="pf-guide-close" id="pfGuitarGuideClose" aria-label="关闭引导">×</button>
          </div>
          <button type="button" class="pf-guide-replay hidden" id="pfGuitarGuideReplay">再看引导</button>
          <div class="pf-guitar-neck">
            <h4>🎸 指板（粗弦在上 · 0–5 品）</h4>
            <div class="pf-strum-hint hidden" id="pfGuitarStrumHint">扫弦区 · 上下滑动</div>
            <div class="pf-fretboard" id="pfFretboard"></div>
          </div>
          <div class="pf-toggle-row">
            <button type="button" class="pf-toggle" id="pfGuitarStrumToggle">🎸 和弦扫弦</button>
            <span style="font-size:0.85rem;color:#7a7590;font-weight:600">和弦播放：</span>
            <button type="button" class="pf-toggle" id="pfArpToggle">同时播放</button>
          </div>
          <div class="pf-toggle-row pf-pattern-row" id="pfStrumPatterns" aria-label="扫弦节奏型">
            <span style="font-size:0.82rem;color:#7a7590;font-weight:600">节奏型：</span>
            <button type="button" class="pf-toggle" data-strum-pattern="basic">基础 ↓↑</button>
            <button type="button" class="pf-toggle on" data-strum-pattern="folk">民谣 ↓↓↑↓↑</button>
            <button type="button" class="pf-toggle" data-strum-pattern="ballad">抒情 ↓—↑—</button>
            <button type="button" class="pf-toggle" data-strum-pattern="drive">推进 ↓↑↓↑</button>
            <button type="button" class="pf-toggle pf-stroke-tap" id="pfGuitarStrokeTap" title="等同空格：按节奏型扫下一拍">↓↑ 续扫</button>
          </div>
          <button type="button" class="pf-jam-start" id="pfJamStart">🎤 弹唱练习</button>
          <div class="pf-jam hidden" id="pfJam" role="region" aria-label="弹唱练习">
            <span class="pf-jam-label">当前</span>
            <strong class="pf-jam-target" id="pfJamTarget">Am</strong>
            <span class="pf-jam-progress" id="pfJamProgress">1/4</span>
            <button type="button" class="pf-jam-exit" id="pfJamExit">退出弹唱</button>
            <span class="pf-jam-aside">跟高亮和弦依次弹即可</span>
          </div>
          <div class="pf-jam-toast hidden" id="pfJamToast" aria-live="polite"></div>
          <div class="pf-chord-grid" id="pfChordGrid"></div>
          <p class="pf-hint">单音模式：点弦品弹单音 · 竖划琴弦扫空弦。<strong>「🎸 和弦扫弦」</strong>：数字键选和弦（左手）；<strong>再按同一数字或空格</strong>按节奏型上下扫（右手）；指板也可上下滑扫。可选节奏型：基础/民谣/抒情/推进。</p>
        </div>

        <div class="pf-panel" data-panel="drums">
          <div class="pf-guide hidden" id="pfDrumsGuide" role="region" aria-label="架子鼓演奏引导">
            <div class="pf-guide-inner">
              <p class="pf-guide-tip">底鼓 <kbd>Z</kbd> + 军鼓 <kbd>X</kbd> 是常见摇滚底</p>
              <p class="pf-guide-task" id="pfDrumsGuideTask">小任务：先敲底鼓 Z，再敲军鼓 X</p>
            </div>
            <button type="button" class="pf-guide-close" id="pfDrumsGuideClose" aria-label="关闭引导">×</button>
          </div>
          <button type="button" class="pf-guide-replay hidden" id="pfDrumsGuideReplay">再看引导</button>
          <button type="button" class="pf-jam-start" id="pfDrumsJamStart">🥁 节奏底练习</button>
          <div class="pf-jam hidden" id="pfDrumsJam" role="region" aria-label="节奏底练习">
            <span class="pf-jam-label">当前</span>
            <strong class="pf-jam-target" id="pfDrumsJamTarget">底鼓</strong>
            <span class="pf-jam-progress" id="pfDrumsJamProgress">1/4</span>
            <button type="button" class="pf-jam-exit" id="pfDrumsJamExit">退出练习</button>
            <span class="pf-jam-aside">四拍底：Z 底鼓 · X 军鼓 · Z 底鼓 · A 闭镲</span>
          </div>
          <div class="pf-jam-toast hidden" id="pfDrumsJamToast" aria-live="polite"></div>
          <div class="pf-drum-kit" id="pfDrumGrid"></div>
          <p class="pf-hint">俯视鼓组（鼓皮/镲片材质）：Z 底鼓 · X 军鼓 · A/W 闭镲/开镲 · Q/P 强音镲/节奏镲 · R/E/F 通鼓</p>
        </div>

        <div class="pf-panel" data-panel="uke">
          <div class="pf-guitar-neck pf-uke-neck">
            <h4>🪕 尤克里里指板（高音 G · gCEA · 0–5 品）</h4>
            <div class="pf-strum-hint hidden" id="pfUkeStrumHint">扫弦区 · 上下滑动</div>
            <div class="pf-fretboard pf-uke-board" id="pfUkeFretboard"></div>
          </div>
          <div class="pf-toggle-row">
            <button type="button" class="pf-toggle" id="pfUkeStrumToggle">🪕 和弦扫弦</button>
            <span style="font-size:0.85rem;color:#7a7590;font-weight:600">和弦：</span>
            <button type="button" class="pf-toggle" id="pfUkeArpToggle">同时播放</button>
          </div>
          <div class="pf-chord-grid" id="pfUkeChordGrid"></div>
          <p class="pf-hint">四弦更短更高：口诀 gCEA。单音模式点弦品/竖划扫空弦。<strong>「🪕 和弦扫弦」模式</strong>：数字键 1–4 选 C/Am/F/G，指板上下滑动即扫弦（指板单音静音）。音色为尼龙弦采样。</p>
        </div>

        <div class="pf-panel" data-panel="bass">
          <div class="pf-guitar-neck pf-bass-neck">
            <h4>🎸 贝斯指板（粗弦在上 · E A D G · 0–5 品）</h4>
            <div class="pf-fretboard pf-bass-board" id="pfBassFretboard"></div>
          </div>
          <p class="pf-hint">四弦低音贝斯，比吉他低八度：点弦品弹单音（走根音、律动），竖划琴弦可依次拨响空弦，数字键 1–4 = 四根空弦。音色为指弹贝斯采样。手机与电脑均可点/滑。</p>
        </div>

        <div class="pf-panel" data-panel="violin">
          <div class="pf-violin-neck">
            <h4>🎻 指板 · 选弦选指位（G D A E · 第一把位）</h4>
            <div class="pf-violin-strings" id="pfViolinStrings"></div>
          </div>
          <div class="pf-toggle-row">
            <button type="button" class="pf-toggle on" id="pfBowEasyToggle">✓ 简易点奏</button>
            <span style="font-size:0.82rem;color:#7a7590;font-weight:600">关则改为运弓拖动</span>
          </div>
          <div class="pf-bow-wrap">
            <div class="pf-bow-current" id="pfBowCurrent">A 弦 · 空弦 · A4</div>
            <div class="pf-bow-zone" id="pfBowZone" role="slider" aria-label="运弓区" tabindex="0">
              <span class="pf-bow-hair"></span>
              <span class="pf-bow-label" id="pfBowLabel">点一下发声 · 或关掉简易后拖动运弓</span>
            </div>
          </div>
          <p class="pf-hint">先选弦与指位。默认<strong>简易点奏</strong>（点运弓区即响，手机友好）；关掉后按住来回拉动才持续发声。音色优先小提琴采样。</p>
        </div>

        <div class="pf-panel" data-panel="cello">
          <div class="pf-violin-neck pf-cello-neck">
            <h4>🎻 大提琴指板 · 选弦选指位（C G D A · 第一把位）</h4>
            <div class="pf-violin-strings" id="pfCelloStrings"></div>
          </div>
          <div class="pf-toggle-row">
            <button type="button" class="pf-toggle on" id="pfCelloBowEasyToggle">✓ 简易点奏</button>
            <span style="font-size:0.82rem;color:#7a7590;font-weight:600">关则改为运弓拖动</span>
          </div>
          <div class="pf-bow-wrap">
            <div class="pf-bow-current" id="pfCelloBowCurrent">D 弦 · 空弦 · D3</div>
            <div class="pf-bow-zone" id="pfCelloBowZone" role="slider" aria-label="大提琴运弓区" tabindex="0">
              <span class="pf-bow-hair"></span>
              <span class="pf-bow-label" id="pfCelloBowLabel">点一下发声 · 或关掉简易后拖动运弓</span>
            </div>
          </div>
          <p class="pf-hint">大提琴更低沉：C2–G2–D3–A3。默认简易点奏；关后运弓拖动。音色优先大提琴采样。</p>
        </div>

        <div class="pf-panel" data-panel="studio">
          <div class="pf-studio">
            <h3>🎛️ 多轨创作室 · 愿景</h3>
            <p class="pf-studio-lead">把钢琴、吉他、尤克、提琴、贝斯、鼓叠成一条小曲子——先占位，后开录。</p>
            <ul class="pf-studio-tracks">
              <li><span>轨 1</span> 旋律 · 钢琴 / 小提琴 / 大提琴</li>
              <li><span>轨 2</span> 和声 · 吉他 / 尤克里里</li>
              <li><span>轨 3</span> 节奏 · 架子鼓</li>
              <li><span>轨 4</span> 低音 · 贝斯</li>
            </ul>
            <p class="pf-studio-note">当前可先在各乐器页练习；多轨叠录将在后续版本解锁（功能开关 <code>multiTrack</code>）。</p>
          </div>
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
      btn.addEventListener("click", () => {
        if (chordStrumMode) selectStrumChord(ch.digit);
        else playGuitarChord(ch);
      });
      $("#pfChordGrid").appendChild(btn);
    });

    UKE_CHORDS.forEach(ch => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pf-chord-btn";
      btn.dataset.ukeChord = ch.digit;
      btn.innerHTML = `${ch.name}<kbd>键 ${ch.digit}</kbd>`;
      btn.addEventListener("click", () => {
        if (chordStrumMode) selectStrumChord(ch.digit);
        else playUkeChord(ch);
      });
      $("#pfUkeChordGrid").appendChild(btn);
    });

    const ukeArp = $("#pfUkeArpToggle");
    if (ukeArp) {
      ukeArp.addEventListener("click", () => {
        arpeggio = !arpeggio;
        ukeArp.classList.toggle("on", arpeggio);
        ukeArp.textContent = arpeggio ? "琶音（依次）" : "同时播放";
        const gArp = $("#pfArpToggle");
        if (gArp) {
          gArp.classList.toggle("on", arpeggio);
          gArp.textContent = arpeggio ? "琶音（依次）" : "同时播放";
        }
      });
    }

    const guitarStrumToggle = $("#pfGuitarStrumToggle");
    if (guitarStrumToggle) {
      guitarStrumToggle.addEventListener("click", () => setChordStrumMode(!chordStrumMode));
    }
    const ukeStrumToggle = $("#pfUkeStrumToggle");
    if (ukeStrumToggle) {
      ukeStrumToggle.addEventListener("click", () => setChordStrumMode(!chordStrumMode));
    }
    root.querySelectorAll("[data-strum-pattern]").forEach((btn) => {
      btn.addEventListener("click", () => setStrumPattern(btn.dataset.strumPattern));
    });
    syncPatternUi();
    const guitarStrokeTap = $("#pfGuitarStrokeTap");
    if (guitarStrokeTap) {
      guitarStrokeTap.addEventListener("click", (e) => {
        e.preventDefault();
        playPatternStroke("tap");
      });
    }

    const syncBowEasyUi = () => {
      ["#pfBowEasyToggle", "#pfCelloBowEasyToggle"].forEach((sel) => {
        const btn = $(sel);
        if (!btn) return;
        btn.classList.toggle("on", bowEasyMode);
        btn.textContent = bowEasyMode ? "✓ 简易点奏" : "简易点奏";
      });
      const vLab = $("#pfBowLabel");
      const cLab = $("#pfCelloBowLabel");
      const text = bowEasyMode
        ? "点一下发声 · 或关掉简易后拖动运弓"
        : "按住这里 · 来回拉动运弓";
      if (vLab) vLab.textContent = text;
      if (cLab) cLab.textContent = text;
    };
    const toggleBowEasy = () => {
      bowEasyMode = !bowEasyMode;
      if (bowActive) {
        bowActive = false;
        if (bowDecayTimer) { clearInterval(bowDecayTimer); bowDecayTimer = null; }
        Audio.stopBow(0.08);
      }
      syncBowEasyUi();
      setFeedback(bowEasyMode ? "简易点奏：点运弓区即响" : "运弓模式：按住来回拉动");
    };
    const vEasy = $("#pfBowEasyToggle");
    const cEasy = $("#pfCelloBowEasyToggle");
    if (vEasy) vEasy.addEventListener("click", toggleBowEasy);
    if (cEasy) cEasy.addEventListener("click", toggleBowEasy);
    syncBowEasyUi();

    DRUM_PADS.forEach(pad => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `pf-drum-pad pf-drum-${pad.id.replace(/-/g, "_")} pf-drum-pos-${pad.layout}`;
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

    $("#pfJamStart").addEventListener("click", startJam);
    $("#pfJamExit").addEventListener("click", stopJam);
    $("#pfDrumsJamStart").addEventListener("click", startDrumsJam);
    $("#pfDrumsJamExit").addEventListener("click", stopDrumsJam);

    $("#pfTaskToggle").addEventListener("click", toggleTaskMode);

    $("#pfGuitarGuideClose").addEventListener("click", () => {
      guitarGuideActive = false;
      guitarGuideStep = 0;
      clearGuitarGuideHighlight();
      setGuideVisible("guitar", false);
      if (guideStorageGet(LS_GUITAR_GUIDE)) $("#pfGuitarGuideReplay").classList.remove("hidden");
    });
    $("#pfGuitarGuideReplay").addEventListener("click", () => {
      if (instrument === "guitar") maybeShowInstrumentGuide("guitar", true);
    });

    $("#pfDrumsGuideClose").addEventListener("click", () => {
      drumsGuideActive = false;
      drumsGuideStep = 0;
      setGuideVisible("drums", false);
      if (guideStorageGet(LS_DRUMS_GUIDE)) $("#pfDrumsGuideReplay").classList.remove("hidden");
    });
    $("#pfDrumsGuideReplay").addEventListener("click", () => {
      if (instrument === "drums") maybeShowInstrumentGuide("drums", true);
    });
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
    chordStrumMode = false;
    guitarChordDigit = "1";
    ukeChordDigit = "1";
    renderShell();
    renderPiano();
    switchInstrument("piano");

    keyHandler = onKeyDown;
    window.addEventListener("keydown", keyHandler);

    setSourceBadge("loading", "piano");
    Audio.ensureWebAudioFont().then((ok) => {
      if (!root) return;
      if (instrument === "piano") {
        setSourceBadge(ok ? "ok" : "fallback", "piano");
        setFeedback(ok ? "钢琴采样已就绪（WebAudioFont 录音切片）" : "采样不可用，已用合成音");
      } else if (instrument === "guitar") {
        setSourceBadge(
          Audio.guitarWafReady ? "ok" : (Audio.guitarWafFailed ? "fallback" : "loading"),
          "guitar"
        );
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
    guitarGuideActive = false;
    guitarGuideStep = 0;
    drumsGuideActive = false;
    drumsGuideStep = 0;
    jamActive = false;
    jamStep = 0;
    if (jamToastTimer) {
      clearTimeout(jamToastTimer);
      jamToastTimer = null;
    }
    drumsJamActive = false;
    drumsJamStep = 0;
    if (drumsJamToastTimer) {
      clearTimeout(drumsJamToastTimer);
      drumsJamToastTimer = null;
    }
    bowActive = false;
    if (bowDecayTimer) {
      clearInterval(bowDecayTimer);
      bowDecayTimer = null;
    }
    Audio.stopBow(0.02);
  }

  return { mount, unmount };
})();

if (typeof window !== "undefined") {
  window.PerformModule = PerformModule;
}
