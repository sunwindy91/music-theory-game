const TheoryProgressStore = LessonEngine.createProgressStore("mtg_theory_progress_v1");

const TheoryLearnModule = (() => {
  let inner = null;

  function ensureInner() {
    if (!inner) {
      inner = LessonEngine.createMCQModule({
        lessons: window.THEORY_LESSONS || [],
        progressStore: TheoryProgressStore,
        moduleTitle: "📘 乐理入门",
        moduleIntro: "先学后练 · 3 个单元掌握音名、音程与和弦基础<br><small>💡 完成全部单元后可在练习中心巩固</small>",
        cssHref: "modules/theory-learn/theory-learn.css",
        shareSessionType: "theory"
      });
    }
    return inner;
  }

  return {
    mount(container, options = {}) {
      ensureInner().mount(container, options);
    },
    unmount() {
      if (inner) inner.unmount();
    },
    getProgressStore() {
      return TheoryProgressStore;
    },
    completedCount() {
      return TheoryProgressStore.completedCount();
    },
    totalCount() {
      return (window.THEORY_LESSONS || []).length;
    },
    isAllDone() {
      return TheoryProgressStore.completedCount() >= (window.THEORY_LESSONS || []).length;
    },
    startLesson(id) {
      ensureInner().startLessonById(id);
    }
  };
})();

if (typeof window !== "undefined") {
  window.TheoryLearnModule = TheoryLearnModule;
  window.TheoryProgressStore = TheoryProgressStore;
}
