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
  wrongBook: true,
  dailyChallenge: true,
  shareCard: true,
  uxSimulator: false,
  personaSimulator: false,
  rhythmGame: true,
  sightReading: true,
  theoryLearn: true,
  instrumentIntro: true,
  multiTrack: false,
  midiInput: false
};

const APP_VERSION = "v1.7.17";

/** 部署 Cloudflare 后若域名不同，改 domestic 为实际 pages.dev 地址 */
const AppUrls = {
  domestic: "https://music-theory-game-br5.pages.dev/",
  overseas: "https://music-theory-game.vercel.app/"
};

/** ?dev=1 — 路径全解锁，便于联调（不改动正式解锁规则） */
function isDevUnlock() {
  try {
    return new URLSearchParams(window.location.search).get("dev") === "1";
  } catch {
    return false;
  }
}

if (typeof window !== "undefined") {
  window.AppFeatures = AppFeatures;
  window.APP_VERSION = APP_VERSION;
  window.AppUrls = AppUrls;
  window.isDevUnlock = isDevUnlock;
}
