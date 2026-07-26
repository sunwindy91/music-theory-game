/**
 * 灵气星图 — 嵌入模块（iframe 壳）
 * 游戏本体：WASD 捡音符 + 敌人，与 SpiritProgressStore 同步
 */
const SpiritJourneyModule = (() => {
  let root = null;
  let onBack = null;
  let msgHandler = null;

  function mount(container, options = {}) {
    if (root) unmount();
    root = container;
    onBack = options.onBack || null;
    const ver = (typeof window.APP_VERSION === "string" && window.APP_VERSION) || String(Date.now());
    root.innerHTML =
      '<button type="button" class="sj-back" id="sjBackBtn" aria-label="返回练习">← 返回</button>' +
      `<iframe class="sj-frame" id="sjFrame" src="modules/spirit-journey/spirit-journey.html?v=${encodeURIComponent(ver)}" title="灵气星图" allow="autoplay"></iframe>`;
    const backBtn = root.querySelector("#sjBackBtn");
    if (onBack) backBtn.addEventListener("click", onBack);

    msgHandler = (ev) => {
      if (!ev.data || typeof onBack !== "function") return;
      if (ev.data.type === "mtg-spirit-exit") {
        onBack();
        return;
      }
      if (ev.data.type === "mtg-spirit-open" && ev.data.module === "perform") {
        if (typeof window.AppShell?.openPerformFromSpirit === "function") {
          window.AppShell.openPerformFromSpirit();
          return;
        }
        onBack();
        try {
          document.querySelector('[data-module="perform"]')?.click();
        } catch { /* */ }
      }
    };
    window.addEventListener("message", msgHandler);
  }

  function unmount() {
    if (msgHandler) {
      window.removeEventListener("message", msgHandler);
      msgHandler = null;
    }
    if (root) root.innerHTML = "";
    root = null;
    onBack = null;
  }

  return { mount, unmount };
})();

if (typeof window !== "undefined") {
  window.SpiritJourneyModule = SpiritJourneyModule;
}
