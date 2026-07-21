/**
 * 学练联动 · 单元 topicId ↔ 练习题池
 */
const LearnPracticeBridge = (() => {
  const TOPIC_META = {
    "theory-notes": { title: "音名与谱表", emoji: "🎵", learnModule: "theory" },
    "theory-intervals": { title: "音程", emoji: "📐", learnModule: "theory" },
    "theory-triads": { title: "和弦构成", emoji: "🎹", learnModule: "theory" },
    "theory-keys": { title: "调号入门", emoji: "🔑", learnModule: "theory" },
    "theory-meter": { title: "拍号时值", emoji: "🥁", learnModule: "theory" },
    "intro-piano": { title: "钢琴入门", emoji: "🎹", learnModule: "piano" },
    "intro-guitar": { title: "吉他入门", emoji: "🎸", learnModule: "guitar" }
  };

  function getQuizPool() {
    return window.QUIZ_BANK || window.QUESTIONS || [];
  }

  function getTopicMeta(topicId) {
    return TOPIC_META[topicId] || { title: topicId, emoji: "📖", learnModule: null };
  }

  function countForTopic(topicId, maxDifficulty) {
    const pool = getQuizPool().filter(q => q.topicId === topicId);
    if (maxDifficulty == null) return pool.length;
    return pool.filter(q => q.difficulty <= maxDifficulty).length;
  }

  function filterByTopic(topicId, difficulty, maxCount) {
    let pool = getQuizPool().filter(q => q.topicId === topicId && q.difficulty <= difficulty);
    if (!pool.length) {
      pool = getQuizPool().filter(q => q.topicId === topicId);
    }
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const count = Math.min(maxCount || shuffled.length, shuffled.length);
    return shuffled.slice(0, count);
  }

  function getRecommendations() {
    const items = [];
    const theoryLessons = window.THEORY_LESSONS || [];
    const store = window.TheoryProgressStore;

    for (const les of theoryLessons) {
      if (store && !store.isDone(les.id)) {
        items.push({
          kind: "learn",
          lessonId: les.id,
          module: "theory",
          label: `继续学习：${les.title}`,
          emoji: les.emoji || "📖"
        });
        const n = countForTopic(les.id, 2);
        if (n >= 3) {
          items.push({
            kind: "practice",
            topicId: les.id,
            label: `预习刷题：${les.title}`,
            emoji: "🎯",
            count: n
          });
        }
        return items.slice(0, 2);
      }
    }

    for (const les of theoryLessons) {
      const n = countForTopic(les.id, 3);
      if (n >= 3) {
        items.push({
          kind: "practice",
          topicId: les.id,
          label: `巩固练习：${les.title}`,
          emoji: les.emoji || "🎯",
          count: n
        });
        break;
      }
    }

    const sightLessons = window.SIGHT_LESSONS || [];
    const sightStore = window.SightProgressStore;
    for (const les of sightLessons) {
      if (sightStore && !sightStore.isLessonDone(les.id)) {
        items.push({
          kind: "learn",
          lessonId: les.id,
          module: "sight",
          label: `继续识谱：${les.title}`,
          emoji: les.emoji || "🎼"
        });
        break;
      }
    }

    return items.slice(0, 2);
  }

  return {
    TOPIC_META,
    getTopicMeta,
    countForTopic,
    filterByTopic,
    getRecommendations
  };
})();

if (typeof window !== "undefined") {
  window.LearnPracticeBridge = LearnPracticeBridge;
}
