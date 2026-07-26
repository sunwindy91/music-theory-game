/**
 * I75 · 学路径零基础三屏 onboarding
 * localStorage: onboarding_done — 老用户不弹；跳过始终可用。
 */
const LearnOnboarding = (() => {
  const LS_KEY = "onboarding_done";
  const FIRST_LESSON_ID = "theory-notes";

  let root = null;
  let step = 0;
  let onComplete = null;

  function isDone() {
    try {
      return localStorage.getItem(LS_KEY) === "1";
    } catch {
      return false;
    }
  }

  function markDone() {
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {
      /* */
    }
  }

  function staffSvg() {
    return `
<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="五线谱示意：五条线与四个间">
  <rect x="8" y="18" width="304" height="84" rx="8" fill="#fff" stroke="#e9d5ff"/>
  <g stroke="#1c1917" stroke-width="2" fill="none">
    <line x1="24" y1="30" x2="296" y2="30"/>
    <line x1="24" y1="46" x2="296" y2="46"/>
    <line x1="24" y1="62" x2="296" y2="62"/>
    <line x1="24" y1="78" x2="296" y2="78"/>
    <line x1="24" y1="94" x2="296" y2="94"/>
  </g>
  <text x="36" y="34" font-size="11" fill="#a855f7" font-family="Fredoka,Segoe UI,sans-serif">线</text>
  <text x="36" y="56" font-size="11" fill="#ea580c" font-family="Fredoka,Segoe UI,sans-serif">间</text>
  <circle cx="160" cy="62" r="9" fill="#a855f7"/>
  <text x="176" y="66" font-size="12" fill="#44403c" font-family="Fredoka,Segoe UI,sans-serif">音符可在「线」或「间」上</text>
</svg>`;
  }

  function ensureDom() {
    if (root) return root;
    root = document.createElement("div");
    root.id = "learnOnboarding";
    root.className = "ob-overlay";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "乐理入门引导");
    root.innerHTML = `
      <div class="ob-card">
        <button type="button" class="ob-skip" data-ob="skip">跳过</button>
        <div class="ob-step" data-step="0">
          <p class="ob-kicker">入门 · 1/3</p>
          <h2>五线谱是什么？</h2>
          <p>五线谱用<strong>五条横线</strong>和线与线之间的<strong>间</strong>来标音高。先认清「线」和「间」，后面的识谱题就不慌。</p>
          <div class="ob-staff">${staffSvg()}<p class="ob-staff-caption">示意图 · 线与间</p></div>
        </div>
        <div class="ob-step" data-step="1">
          <p class="ob-kicker">入门 · 2/3</p>
          <h2>这一课你会学到什么</h2>
          <ul class="ob-list">
            <li>音名：C D E F G A B</li>
            <li>谱表上怎么对应这些音</li>
            <li>做错会有讲解，对了也能巩固</li>
          </ul>
          <p>第一课是「音名与谱表」——零基础从这里开始，不是一上来就考试。</p>
        </div>
        <div class="ob-step" data-step="2">
          <p class="ob-kicker">入门 · 3/3</p>
          <h2>学完你能做什么</h2>
          <ul class="ob-list">
            <li>看得懂五线谱上的基本音位</li>
            <li>能跟学习路径往下走（音程、和弦…）</li>
            <li>为识谱练习和「玩」星图打底</li>
          </ul>
          <p>准备好了就从第一课开始；随时可以返回路径换别的。</p>
        </div>
        <div class="ob-dots" aria-hidden="true">
          <span class="ob-dot" data-dot="0"></span>
          <span class="ob-dot" data-dot="1"></span>
          <span class="ob-dot" data-dot="2"></span>
        </div>
        <div class="ob-actions">
          <button type="button" class="ob-btn ob-btn-primary" data-ob="next">继续</button>
        </div>
      </div>`;
    document.body.appendChild(root);

    root.querySelector('[data-ob="skip"]').addEventListener("click", () => finish({ startLesson: false }));
    root.querySelector('[data-ob="next"]').addEventListener("click", () => {
      if (step < 2) {
        step += 1;
        paint();
      } else {
        finish({ startLesson: true });
      }
    });
    return root;
  }

  function paint() {
    if (!root) return;
    root.querySelectorAll(".ob-step").forEach((el) => {
      el.classList.toggle("is-active", Number(el.getAttribute("data-step")) === step);
    });
    root.querySelectorAll(".ob-dot").forEach((el) => {
      el.classList.toggle("is-on", Number(el.getAttribute("data-dot")) === step);
    });
    const nextBtn = root.querySelector('[data-ob="next"]');
    if (nextBtn) nextBtn.textContent = step >= 2 ? "开始第一课" : "继续";
  }

  function finish({ startLesson }) {
    markDone();
    hide();
    const cb = onComplete;
    onComplete = null;
    if (typeof cb === "function") cb({ startLesson: !!startLesson, lessonId: FIRST_LESSON_ID });
  }

  function hide() {
    if (root) root.hidden = true;
  }

  function show(opts) {
    onComplete = opts && opts.onComplete;
    ensureDom();
    step = 0;
    root.hidden = false;
    paint();
  }

  /**
   * 学路径入口：未完成则弹三屏；已完成则直接 onReady。
   */
  function maybeShowAtLearnEntry(opts) {
    const onReady = opts && opts.onReady;
    if (isDone()) {
      if (typeof onReady === "function") onReady({ shown: false });
      return false;
    }
    show({
      onComplete: (result) => {
        if (typeof onReady === "function") onReady({ shown: true, ...result });
        if (result.startLesson && window.AppShell && typeof AppShell.openTheoryLesson === "function") {
          AppShell.openTheoryLesson(FIRST_LESSON_ID);
        }
      }
    });
    return true;
  }

  return { isDone, markDone, show, hide, maybeShowAtLearnEntry, FIRST_LESSON_ID };
})();

if (typeof window !== "undefined") {
  window.LearnOnboarding = LearnOnboarding;
}
