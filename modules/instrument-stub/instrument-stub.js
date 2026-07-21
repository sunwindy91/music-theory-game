/**
 * 乐器入门占位模块 · 钢琴 / 吉他
 */
const InstrumentStubModule = (() => {
  const CONFIGS = {
    piano: {
      title: "🎹 钢琴入门",
      emoji: "🎹",
      intro: "钢琴有 88 个键，从左到右音高逐渐升高。白键是基本音名，黑键是升/降半音。",
      tips: [
        "中央 C 通常在键盘正中间附近",
        "每 7 个白键循环一次：C D E F G A B",
        "双手配合：右手旋律，左手和弦"
      ],
      next: "后续版本将加入交互式键盘与指法练习"
    },
    guitar: {
      title: "🎸 吉他入门",
      emoji: "🎸",
      intro: "标准吉他 6 根弦，从粗到细：E A D G B E（六弦到一弦）。",
      tips: [
        "左手按弦改变音高，右手拨/扫弦发声",
        "品格（fret）每格升高半音",
        "开放和弦 C、G、Am、Em 是最常见的入门和弦"
      ],
      next: "后续版本将加入和弦图与指法动画"
    }
  };

  let root = null;
  let callbacks = {};

  function render(kind) {
    const cfg = CONFIGS[kind] || CONFIGS.piano;
    const tipsHtml = cfg.tips.map(t => `<li>${t}</li>`).join("");

    root.innerHTML = `
      <div class="is-module">
        <div class="is-header">
          <h2>${cfg.title}</h2>
          <button class="is-back" type="button" id="isBack">← 返回</button>
        </div>
        <div class="is-hero">${cfg.emoji}</div>
        <p class="is-intro">${cfg.intro}</p>
        <ul class="is-tips">${tipsHtml}</ul>
        <div class="is-soon">
          <span>🚧</span>
          <p>${cfg.next}</p>
        </div>
      </div>`;

    root.querySelector("#isBack").addEventListener("click", () => {
      if (callbacks.onBack) callbacks.onBack();
    });
  }

  return {
    mount(container, options = {}) {
      root = container;
      callbacks = options;
      if (!document.querySelector('link[href="modules/instrument-stub/instrument-stub.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "modules/instrument-stub/instrument-stub.css";
        document.head.appendChild(link);
      }
      render(options.kind || "piano");
    },
    unmount() {
      if (root) root.innerHTML = "";
      root = null;
    }
  };
})();

if (typeof window !== "undefined") {
  window.InstrumentStubModule = InstrumentStubModule;
}
