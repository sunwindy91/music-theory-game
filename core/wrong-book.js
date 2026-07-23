const WRONG_BOOK_KEY = "mtg_wrong_book_v2";
const MAX_ENTRIES = 50;

const SRS_INTERVALS_MS = [
  60 * 1000,
  10 * 60 * 1000,
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  15 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000
];

function getQuestionId(question, source) {
  if (question && question.id) return question.id;
  if (question && question.isAudio && question.midi != null) {
    return `audio-${question.midi}`;
  }
  const text = question && question.text ? question.text : "";
  return `${source}-${text.slice(0, 40)}`;
}

const WrongBookStore = (() => {
  function load() {
    try {
      const raw = localStorage.getItem(WRONG_BOOK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save(entries) {
    localStorage.setItem(WRONG_BOOK_KEY, JSON.stringify(entries));
  }

  function serializeQuestion(question) {
    return {
      id: question.id,
      type: question.type,
      difficulty: question.difficulty,
      text: question.text,
      hint: question.hint || "",
      why: question.why || "",
      options: [...question.options],
      answer: question.answer,
      isAudio: !!question.isAudio,
      midi: question.midi
    };
  }

  function findIndex(entries, id) {
    return entries.findIndex(e => e.id === id);
  }

  function trimEntries(entries) {
    if (entries.length <= MAX_ENTRIES) return entries;
    return entries
      .sort((a, b) => (b.lastWrongAt || b.createdAt) - (a.lastWrongAt || a.createdAt))
      .slice(0, MAX_ENTRIES);
  }

  function recordWrong(question, source, wrongOption) {
    const qid = getQuestionId(question, source);
    const now = Date.now();
    const entries = load();
    const idx = findIndex(entries, qid);

    if (idx >= 0) {
      const entry = entries[idx];
      entry.stage = 0;
      entry.nextReviewAt = now + SRS_INTERVALS_MS[0];
      entry.wrongCount = (entry.wrongCount || 0) + 1;
      entry.lastWrongAt = now;
      entry.lastWrongOption = wrongOption;
      entry.question = serializeQuestion(question);
      entry.source = source;
      entries.splice(idx, 1);
      entries.unshift(entry);
    } else {
      entries.unshift({
        id: qid,
        source,
        question: serializeQuestion(question),
        stage: 0,
        nextReviewAt: now + SRS_INTERVALS_MS[0],
        reviewCount: 0,
        consecutiveCorrect: 0,
        wrongCount: 1,
        lastWrongAt: now,
        lastWrongOption: wrongOption,
        createdAt: now,
        lastReviewAt: null
      });
    }

    save(trimEntries(entries));
    return qid;
  }

  function recordReviewCorrect(id) {
    const entries = load();
    const idx = findIndex(entries, id);
    if (idx < 0) return;
    const entry = entries[idx];
    const now = Date.now();
    const newStage = Math.min((entry.stage || 0) + 1, 6);
    entry.stage = newStage;
    entry.nextReviewAt = now + SRS_INTERVALS_MS[newStage];
    entry.reviewCount = (entry.reviewCount || 0) + 1;
    entry.consecutiveCorrect = (entry.consecutiveCorrect || 0) + 1;
    entry.lastReviewAt = now;
    save(entries);
  }

  function recordReviewWrong(id, wrongOption) {
    const entries = load();
    const idx = findIndex(entries, id);
    if (idx < 0) return;
    const entry = entries[idx];
    const now = Date.now();
    entry.stage = 0;
    entry.nextReviewAt = now + SRS_INTERVALS_MS[0];
    entry.wrongCount = (entry.wrongCount || 0) + 1;
    entry.consecutiveCorrect = 0;
    entry.lastWrongAt = now;
    entry.lastWrongOption = wrongOption;
    entry.reviewCount = (entry.reviewCount || 0) + 1;
    entry.lastReviewAt = now;
    save(entries);
  }

  function remove(id) {
    save(load().filter(e => e.id !== id));
  }

  function getAll() {
    return load().sort((a, b) => (b.lastWrongAt || b.createdAt) - (a.lastWrongAt || a.createdAt));
  }

  function getById(id) {
    return load().find(e => e.id === id) || null;
  }

  function getDueCount(now = Date.now()) {
    return load().filter(e => e.nextReviewAt <= now).length;
  }

  function getTotalCount() {
    return load().length;
  }

  function getDueEntries(now = Date.now()) {
    return getAll().filter(e => e.nextReviewAt <= now);
  }

  return {
    recordWrong,
    recordReviewCorrect,
    recordReviewWrong,
    remove,
    getAll,
    getById,
    getDueCount,
    getTotalCount,
    getDueEntries
  };
})();

if (typeof window !== "undefined") {
  window.WrongBookStore = WrongBookStore;
  window.getQuestionId = getQuestionId;
  window.SRS_INTERVALS_MS = SRS_INTERVALS_MS;
}
