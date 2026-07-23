/**
 * 壳显示密度 · UiDensity（I46）
 * kid = 儿童：大字、少次要文案、暖色大按钮
 * std = 标准：更紧凑、清爽谱面风
 * 同一信息架构，只改密度与肤色，不做第二套 App。
 */
(function (global) {
  const LS_KEY = "mtg_ui_density_v1";
  const MODES = ["kid", "std"];
  const DEFAULT = "std";

  const COPY = {
    kid: "点下面开始学 · 边玩边会",
    std: "先学乐理，再练技巧 · 快乐学音乐"
  };

  function read() {
    try {
      const v = localStorage.getItem(LS_KEY);
      if (MODES.includes(v)) return v;
    } catch { /* */ }
    return DEFAULT;
  }

  function write(mode) {
    try { localStorage.setItem(LS_KEY, mode); } catch { /* */ }
  }

  function apply(mode) {
    const m = MODES.includes(mode) ? mode : DEFAULT;
    document.body.setAttribute("data-density", m);
    write(m);
    const sub = document.querySelector(".header p");
    if (sub && !document.body.classList.contains("module-open")) {
      sub.textContent = COPY[m] || COPY.std;
    }
    document.querySelectorAll("[data-density-btn]").forEach((btn) => {
      const on = btn.getAttribute("data-density-btn") === m;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    return m;
  }

  function bindToggle(root) {
    if (!root) return;
    root.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-density-btn]");
      if (!btn) return;
      apply(btn.getAttribute("data-density-btn"));
    });
  }

  function init() {
    apply(read());
    bindToggle(document.getElementById("densityToggle"));
  }

  global.UiDensity = {
    LS_KEY,
    MODES,
    DEFAULT,
    get: read,
    set: apply,
    init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
