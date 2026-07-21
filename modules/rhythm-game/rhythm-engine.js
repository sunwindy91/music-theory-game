const RhythmEngine = (() => {
  const PERFECT_MS = 100;
  const GOOD_MS = 180;
  const COUNTDOWN_SEC = 3;
  /** 用户常「听到再按」，略放宽并允许轻微预判 */
  const INPUT_EARLY_MS = 120;
  const SCORE = { perfect: 100, good: 50, miss: 0 };

  let ctx = null;
  let chart = null;
  let songStart = 0;
  let beatTimes = [];
  let hitMask = [];
  let results = [];
  let combo = 0;
  let maxCombo = 0;
  let score = 0;
  let rafId = null;
  let missTimers = [];
  let countdownInterval = null;
  let running = false;
  let onEvent = null;
  let onComplete = null;
  let beatPulseSent = [];
  let phase = "idle";
  let prepStart = 0;
  let practiceBeatInterval = 0.857;
  let practiceBeats = 0;
  let practicePulseSent = [];

  function initAudio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") return ctx.resume();
    return Promise.resolve();
  }

  function playClickAt(when, type) {
    if (!ctx) return;
    const t = Math.max(ctx.currentTime, when);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    if (type === "perfect") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    } else if (type === "good") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(660, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.28, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    } else if (type === "miss") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(520, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    }
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  function playClick(type) {
    if (!ctx) return;
    playClickAt(ctx.currentTime, type);
  }

  function scheduleMetronome() {
    beatTimes.forEach((rel) => {
      playClickAt(songStart + rel, "tick");
    });
  }

  function scheduleMissChecks() {
    missTimers.forEach(clearTimeout);
    missTimers = [];
    beatTimes.forEach((rel, i) => {
      const delayMs = (songStart + rel + GOOD_MS / 1000 - ctx.currentTime) * 1000 + 50;
      const id = setTimeout(() => {
        if (!running || hitMask[i]) return;
        registerHit(i, "miss", songStart + rel);
      }, Math.max(0, delayMs));
      missTimers.push(id);
    });

    const endDelay = (songStart + beatTimes[beatTimes.length - 1] + GOOD_MS / 1000 + 0.5 - ctx.currentTime) * 1000;
    missTimers.push(setTimeout(() => finish(), Math.max(0, endDelay)));
  }

  function registerHit(index, judgment, targetTime) {
    if (hitMask[index] && judgment !== "miss") return;
    if (hitMask[index] && judgment === "miss") return;

    hitMask[index] = true;
    results[index] = judgment;

    if (judgment === "perfect") {
      combo++;
      score += SCORE.perfect;
      playClick("perfect");
    } else if (judgment === "good") {
      combo++;
      score += SCORE.good;
      playClick("good");
    } else {
      combo = 0;
      playClick("miss");
    }
    maxCombo = Math.max(maxCombo, combo);

    if (onEvent) {
      onEvent({
        type: "hit",
        judgment,
        index,
        combo,
        score,
        targetTime
      });
    }
  }

  function handleInput() {
    if (!running || !ctx) return;
    if (phase === "practice") {
      playClick("good");
      if (onEvent) onEvent({ type: "practiceTap" });
      return;
    }
    if (phase !== "play") return;
    const now = ctx.currentTime;
    let bestIdx = -1;
    let bestDelta = Infinity;

    for (let i = 0; i < beatTimes.length; i++) {
      if (hitMask[i]) continue;
      const target = songStart + beatTimes[i];
      const early = (target - now) * 1000;
      const late = (now - target) * 1000;
      if (early <= INPUT_EARLY_MS && late <= GOOD_MS) {
        const delta = Math.abs(now - target) * 1000;
        if (delta < bestDelta) {
          bestDelta = delta;
          bestIdx = i;
        }
      }
    }

    if (bestIdx === -1) {
      playClick("miss");
      combo = 0;
      if (onEvent) onEvent({ type: "empty", combo: 0, score });
      return;
    }

    const judgment = bestDelta <= PERFECT_MS ? "perfect" : "good";
    registerHit(bestIdx, judgment, songStart + beatTimes[bestIdx]);
  }

  function finish() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    missTimers.forEach(clearTimeout);
    missTimers = [];

    const total = beatTimes.length;
    const perfect = results.filter(r => r === "perfect").length;
    const good = results.filter(r => r === "good").length;
    const hit = perfect + good;
    const accuracy = total ? hit / total : 0;

    let grade = "C";
    if (accuracy >= 0.9 && perfect >= total * 0.6) grade = "S";
    else if (accuracy >= 0.75) grade = "A";
    else if (accuracy >= 0.6) grade = "B";

    const passed = accuracy >= (chart.winAccuracy || 0.6);

    if (onComplete) {
      onComplete({
        chart,
        score,
        maxCombo,
        perfect,
        good,
        miss: total - hit,
        total,
        accuracy,
        grade,
        passed
      });
    }
  }

  function tick() {
    if (!running) return;
    const now = ctx.currentTime;

    if (phase === "practice") {
      for (let i = 0; i < practiceBeats; i++) {
        if (!practicePulseSent[i] && now >= prepStart + i * practiceBeatInterval - 0.02) {
          practicePulseSent[i] = true;
          if (onEvent) onEvent({ type: "practice", index: i, total: practiceBeats });
        }
      }
      if (now >= songStart - 0.02) {
        phase = "play";
        if (onEvent) onEvent({ type: "playStart" });
        scheduleMetronome();
        scheduleMissChecks();
      }
    }

    if (phase === "play") {
      beatTimes.forEach((rel, i) => {
        if (!beatPulseSent[i] && now >= songStart + rel - 0.02) {
          beatPulseSent[i] = true;
          if (onEvent) onEvent({ type: "beat", index: i, rel });
        }
      });
      if (onEvent) onEvent({ type: "tick", elapsed: now - songStart, songStart, now });
    }

    rafId = requestAnimationFrame(tick);
  }

  async function start(selectedChart, callbacks = {}, options = {}) {
    await initAudio();
    stop();
    chart = selectedChart;
    onEvent = callbacks.onEvent || null;
    onComplete = callbacks.onComplete || null;
    beatTimes = [...chart.beats];
    hitMask = new Array(beatTimes.length).fill(false);
    beatPulseSent = new Array(beatTimes.length).fill(false);
    results = new Array(beatTimes.length).fill(null);
    combo = 0;
    maxCombo = 0;
    score = 0;
    running = true;
    practiceBeats = Math.max(0, options.practiceLeadIn || 0);
    practiceBeatInterval = 60 / (chart.bpm || 80);
    practicePulseSent = new Array(practiceBeats).fill(false);
    phase = "countdown";

    let count = COUNTDOWN_SEC;
    if (onEvent) onEvent({ type: "countdown", value: count });
    playClick("tick");
    countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        if (onEvent) onEvent({ type: "countdown", value: count });
        playClick("tick");
      } else {
        clearInterval(countdownInterval);
        countdownInterval = null;
        prepStart = ctx.currentTime + 0.15;
        if (practiceBeats > 0) {
          phase = "practice";
          songStart = prepStart + practiceBeats * practiceBeatInterval;
          for (let i = 0; i < practiceBeats; i++) {
            playClickAt(prepStart + i * practiceBeatInterval, "tick");
          }
          if (onEvent) onEvent({ type: "practiceStart", total: practiceBeats });
          tick();
        } else {
          phase = "play";
          songStart = prepStart;
          if (onEvent) onEvent({ type: "playStart" });
          scheduleMetronome();
          scheduleMissChecks();
          tick();
        }
      }
    }, 1000);
  }

  function stop() {
    running = false;
    phase = "idle";
    cancelAnimationFrame(rafId);
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    missTimers.forEach(clearTimeout);
    missTimers = [];
  }

  return { start, stop, handleInput, initAudio, PERFECT_MS, GOOD_MS };
})();

if (typeof window !== "undefined") {
  window.RhythmEngine = RhythmEngine;
}
