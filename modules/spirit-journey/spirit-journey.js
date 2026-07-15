/**
 * 灵气 · 光点星图 — 嵌入模块（iframe 壳）
 */
const SpiritJourneyModule = (() => {
  let root = null;
  let onBack = null;

  function mount(container, options = {}) {
    if (root) unmount();
    root = container;
    onBack = options.onBack || null;
    root.innerHTML =
      '<button type="button" class="sj-back" id="sjBackBtn" aria-label="返回练习">← 返回</button>' +
      '<iframe class="sj-frame" id="sjFrame" src="modules/spirit-journey/spirit-journey.html" title="灵气光点星图"></iframe>';
    const backBtn = root.querySelector("#sjBackBtn");
    if (onBack) backBtn.addEventListener("click", onBack);
  }

  function unmount() {
    if (root) root.innerHTML = "";
    root = null;
    onBack = null;
  }

  return { mount, unmount };
})();

if (typeof window !== "undefined") {
  window.SpiritJourneyModule = SpiritJourneyModule;
}
