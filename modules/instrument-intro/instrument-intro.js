const PianoProgressStore = LessonEngine.createProgressStore("mtg_piano_intro_v1");
const GuitarProgressStore = LessonEngine.createProgressStore("mtg_guitar_intro_v1");

const InstrumentIntroModule = (() => {
  const modules = {};

  function getModule(kind) {
    if (!modules[kind]) {
      const isGuitar = kind === "guitar";
      modules[kind] = LessonEngine.createMCQModule({
        lessons: isGuitar ? (window.GUITAR_LESSONS || []) : (window.PIANO_LESSONS || []),
        progressStore: isGuitar ? GuitarProgressStore : PianoProgressStore,
        moduleTitle: isGuitar ? "🎸 吉他入门" : "🎹 钢琴入门",
        moduleIntro: isGuitar
          ? "认识六弦与开放和弦 · 4 道互动题<br><small>💡 完成后可去练习中心巩固，或进入「演奏练习」弹和弦</small>"
          : "认识键盘布局与中央 C · 4 道互动题<br><small>💡 完成后可去练习中心巩固，或进入「演奏练习」弹键盘</small>",
        cssHref: "modules/instrument-intro/instrument-intro.css",
        shareSessionType: isGuitar ? "guitar" : "piano"
      });
    }
    return modules[kind];
  }

  return {
    mount(container, options = {}) {
      const kind = options.kind || "piano";
      getModule(kind).mount(container, options);
    },
    unmount() {
      Object.values(modules).forEach(m => m.unmount());
    },
    startLesson(kind, lessonId) {
      getModule(kind).startLessonById(lessonId);
    },
    completedCount(kind) {
      const store = kind === "guitar" ? GuitarProgressStore : PianoProgressStore;
      return store.completedCount();
    },
    totalCount(kind) {
      const lessons = kind === "guitar" ? window.GUITAR_LESSONS : window.PIANO_LESSONS;
      return (lessons || []).length;
    }
  };
})();

if (typeof window !== "undefined") {
  window.InstrumentIntroModule = InstrumentIntroModule;
  window.PianoProgressStore = PianoProgressStore;
  window.GuitarProgressStore = GuitarProgressStore;
}
