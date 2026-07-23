const PianoProgressStore = LessonEngine.createProgressStore("mtg_piano_intro_v1");
const GuitarProgressStore = LessonEngine.createProgressStore("mtg_guitar_intro_v1");
const UkuleleProgressStore = LessonEngine.createProgressStore("mtg_ukulele_intro_v1");
const ViolinProgressStore = LessonEngine.createProgressStore("mtg_violin_intro_v1");

const InstrumentIntroModule = (() => {
  const modules = {};

  const KIND = {
    piano: {
      lessons: () => window.PIANO_LESSONS || [],
      store: () => PianoProgressStore,
      title: "🎹 钢琴入门",
      intro: "认识键盘布局与中央 C · 4 道互动题<br><small>💡 完成后可去练习中心巩固，或进入「演奏练习」弹键盘</small>",
      share: "piano"
    },
    guitar: {
      lessons: () => window.GUITAR_LESSONS || [],
      store: () => GuitarProgressStore,
      title: "🎸 吉他入门",
      intro: "认识六弦与开放和弦 · 4 道互动题<br><small>💡 完成后可去练习中心巩固，或进入「演奏练习」弹和弦</small>",
      share: "guitar"
    },
    ukulele: {
      lessons: () => window.UKULELE_LESSONS || [],
      store: () => UkuleleProgressStore,
      title: "🪕 尤克里里入门",
      intro: "认识四弦 gCEA 与常用和弦 · 4 道互动题<br><small>💡 完成后去「演奏练习 → 尤克里里」试弹</small>",
      share: "ukulele"
    },
    violin: {
      lessons: () => window.VIOLIN_LESSONS || [],
      store: () => ViolinProgressStore,
      title: "🎻 小提琴入门",
      intro: "认识四弦 GDAE 与运弓发声 · 4 道互动题<br><small>💡 完成后去「演奏练习 → 小提琴」按住运弓区来回拉动</small>",
      share: "violin"
    }
  };

  function getModule(kind) {
    const key = KIND[kind] ? kind : "piano";
    if (!modules[key]) {
      const cfg = KIND[key];
      modules[key] = LessonEngine.createMCQModule({
        lessons: cfg.lessons(),
        progressStore: cfg.store(),
        moduleTitle: cfg.title,
        moduleIntro: cfg.intro,
        cssHref: "modules/instrument-intro/instrument-intro.css",
        shareSessionType: cfg.share
      });
    }
    return modules[key];
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
      const cfg = KIND[kind] || KIND.piano;
      return cfg.store().completedCount();
    },
    totalCount(kind) {
      const cfg = KIND[kind] || KIND.piano;
      return cfg.lessons().length;
    }
  };
})();

if (typeof window !== "undefined") {
  window.InstrumentIntroModule = InstrumentIntroModule;
  window.PianoProgressStore = PianoProgressStore;
  window.GuitarProgressStore = GuitarProgressStore;
  window.UkuleleProgressStore = UkuleleProgressStore;
  window.ViolinProgressStore = ViolinProgressStore;
}
