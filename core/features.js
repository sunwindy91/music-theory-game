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

const APP_VERSION = "v1.7.36";

/** 试玩问卷 · 腾讯问卷（中/英分表；EN 空则 survey-en.html 显示 pending） */
const SURVEY_URL_ZH = "https://wj.qq.com/s2/27402422/a11b/";
const SURVEY_URL_EN = "https://wj.qq.com/s2/27402528/b2ad/";

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
  window.SURVEY_URL_ZH = SURVEY_URL_ZH;
  window.SURVEY_URL_EN = SURVEY_URL_EN;
  window.AppUrls = AppUrls;
  window.isDevUnlock = isDevUnlock;
}
