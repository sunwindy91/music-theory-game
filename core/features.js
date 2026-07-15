/**
 * 功能开关 · Phase 3+ 扩展预留
 * 后续迭代在此启用，无需改壳层路由。
 */
const AppFeatures = {
  quiz: true,
  audioQuiz: true,
  symbolMatch: true,
  perform: true,
  spiritJourney: true,
  // 以下为预留入口，Phase 2+ 逐步启用
  wrongBook: true,
  dailyChallenge: true,
  shareCard: true,
  // 开发工具（生产环境默认关闭）
  uxSimulator: false,
  personaSimulator: false,
  rhythmGame: false,
  sightReading: false,
  multiTrack: false,
  midiInput: false
};

const APP_VERSION = "v0.2";

if (typeof window !== "undefined") {
  window.AppFeatures = AppFeatures;
  window.APP_VERSION = APP_VERSION;
}
