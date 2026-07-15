const DAILY_CHALLENGE_KEY = "mtg_daily_challenge_v1";
const DAILY_TOTAL = 10;
const DAILY_QUIZ_COUNT = 7;
const DAILY_AUDIO_COUNT = 3;
const DAILY_DIFFICULTY = 2;

function getTodayKey(dateOverride) {
  const d = dateOverride ? new Date(dateOverride) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createSeededRng(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const rng = createSeededRng(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSeededAudioQuestion(difficulty, rng) {
  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const NOTE_NAMES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  let midiPool, namePool, useFlats = false;

  if (difficulty === 1) {
    midiPool = [60, 62, 64, 65, 67, 69, 71];
    namePool = ["C", "D", "E", "F", "G", "A", "B"];
  } else if (difficulty === 2) {
    midiPool = [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72];
    namePool = NOTE_NAMES;
  } else {
    midiPool = Array.from({ length: 25 }, (_, i) => 55 + i);
    namePool = NOTE_NAMES;
    useFlats = rng() > 0.5;
  }

  const midi = midiPool[Math.floor(rng() * midiPool.length)];
  const idx = midi % 12;
  const correctName = useFlats ? NOTE_NAMES_FLAT[idx] : NOTE_NAMES[idx];
  const distractorPool = difficulty === 1 ? namePool : (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES);
  const others = distractorPool.filter(n => n !== correctName);
  const distractors = [];
  const poolCopy = [...others];
  while (distractors.length < 3 && poolCopy.length) {
    const i = Math.floor(rng() * poolCopy.length);
    distractors.push(poolCopy.splice(i, 1)[0]);
  }
  const options = seededShuffle([correctName, ...distractors], hashSeed(`${midi}-${rng()}`));
  const answer = options.indexOf(correctName);

  return {
    id: `daily-audio-${midi}`,
    type: "听音识名",
    difficulty,
    isAudio: true,
    midi,
    text: "请听音，选择正确的音名",
    hint: difficulty === 1 ? "提示：自然音 Do Re Mi…" : "提示：注意升降号",
    options,
    answer
  };
}

const DailyChallengeStore = (() => {
  let quizPoolProvider = null;

  function configure(options = {}) {
    if (options.getQuizPool) quizPoolProvider = options.getQuizPool;
  }

  function defaultState() {
    return {
      dateKey: getTodayKey(),
      completed: false,
      progress: 0,
      score: 0,
      correctCount: 0,
      streak: 0,
      lastCompletedDate: null,
      questionsCache: null
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(DAILY_CHALLENGE_KEY);
      if (!raw) return defaultState();
      const data = JSON.parse(raw);
      return { ...defaultState(), ...data, questionsCache: null };
    } catch {
      return defaultState();
    }
  }

  function save(data) {
    const toSave = { ...data };
    delete toSave.questionsCache;
    localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(toSave));
  }

  function ensureTodayState(state, dateKey) {
    if (state.dateKey !== dateKey) {
      state.dateKey = dateKey;
      state.completed = false;
      state.progress = 0;
      state.score = 0;
      state.correctCount = 0;
      state.questionsCache = null;
    }
    return state;
  }

  function getState(dateOverride) {
    const dateKey = getTodayKey(dateOverride);
    const state = ensureTodayState(load(), dateKey);
    save(state);
    return state;
  }

  function daysBetween(dateA, dateB) {
    const a = new Date(dateA + "T12:00:00");
    const b = new Date(dateB + "T12:00:00");
    return Math.round((b - a) / 86400000);
  }

  function computeStreakOnComplete(state, completedDateKey) {
    const last = state.lastCompletedDate;
    if (!last) return 1;
    if (last === completedDateKey) return state.streak || 1;
    const gap = daysBetween(last, completedDateKey);
    if (gap === 1) return (state.streak || 0) + 1;
    return 1;
  }

  function generateToday(options = {}) {
    const dateKey = options.dateKey || getTodayKey(options.dateOverride);
    const state = getState(options.dateOverride);
    const seed = hashSeed(`daily-${dateKey}`);

    if (state.questionsCache && state.dateKey === dateKey && !options.force) {
      return state.questionsCache;
    }

    const pool = options.quizPool || (quizPoolProvider ? quizPoolProvider() : []);
    const diffPool = pool.filter(q => q.difficulty === DAILY_DIFFICULTY);
    const shuffledQuiz = seededShuffle(diffPool.length ? diffPool : pool, seed);
    const quizQuestions = shuffledQuiz.slice(0, DAILY_QUIZ_COUNT).map(q => ({ ...q }));

    const rng = createSeededRng(seed + 1);
    const audioQuestions = Array.from({ length: DAILY_AUDIO_COUNT }, (_, i) =>
      buildSeededAudioQuestion(DAILY_DIFFICULTY, createSeededRng(seed + 100 + i))
    );

    const questions = seededShuffle([...quizQuestions, ...audioQuestions], seed + 2);
    state.questionsCache = questions;
    return questions;
  }

  function isCompletedToday(dateOverride) {
    const dateKey = getTodayKey(dateOverride);
    const state = getState(dateOverride);
    return state.dateKey === dateKey && state.completed;
  }

  function getProgress(dateOverride) {
    const state = getState(dateOverride);
    return {
      current: state.progress,
      total: DAILY_TOTAL,
      completed: state.completed,
      score: state.score,
      correctCount: state.correctCount || 0
    };
  }

  function getStreak(dateOverride) {
    return getState(dateOverride).streak || 0;
  }

  function recordAnswer(correct, points = 0, dateOverride) {
    const dateKey = getTodayKey(dateOverride);
    const state = getState(dateOverride);
    if (state.completed) return state;
    state.progress = Math.min(state.progress + 1, DAILY_TOTAL);
    if (correct) {
      state.score += points;
      state.correctCount = (state.correctCount || 0) + 1;
    }
    save(state);
    return state;
  }

  function markComplete(dateOverride) {
    const dateKey = getTodayKey(dateOverride);
    const state = getState(dateOverride);
    if (state.completed && state.lastCompletedDate === dateKey) return state;
    state.completed = true;
    state.progress = DAILY_TOTAL;
    state.streak = computeStreakOnComplete(state, dateKey);
    state.lastCompletedDate = dateKey;
    save(state);
    return state;
  }

  function canStart(dateOverride) {
    return !isCompletedToday(dateOverride);
  }

  function resetForTest() {
    localStorage.removeItem(DAILY_CHALLENGE_KEY);
  }

  function _setStateForTest(partial) {
    const state = { ...load(), ...partial };
    save(state);
    return state;
  }

  return {
    DAILY_TOTAL,
    DAILY_QUIZ_COUNT,
    DAILY_AUDIO_COUNT,
    DAILY_DIFFICULTY,
    configure,
    getTodayKey,
    generateToday,
    isCompletedToday,
    getProgress,
    getStreak,
    recordAnswer,
    markComplete,
    canStart,
    hashSeed,
    seededShuffle,
    daysBetween,
    computeStreakOnComplete,
    resetForTest,
    _setStateForTest
  };
})();

if (typeof window !== "undefined") {
  window.DailyChallengeStore = DailyChallengeStore;
  window.getTodayKey = getTodayKey;
}
