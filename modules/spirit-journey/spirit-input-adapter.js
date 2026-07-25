/**
 * I71 — InputAdapter：keyboard | touchMOBA
 * 摇杆只产出 {vx,vy}；MOBA 下关闭画布点按开火。不改 PC 键鼠路径。
 */
(function (global) {
  "use strict";

  const STICK_SIZE = 80;
  const DEAD_ZONE = 18;

  let mode = "keyboard";
  let canvasTouchEnabled = true;
  let stick = { vx: 0, vy: 0 };
  let battleActive = false;
  const modeListeners = [];

  function detect() {
    const coarse = !!(global.matchMedia && matchMedia("(pointer: coarse)").matches);
    const fine = !!(global.matchMedia && matchMedia("(pointer: fine)").matches);
    const touch = (navigator.maxTouchPoints > 0) || ("ontouchstart" in global);
    const shortSide = Math.min(global.innerWidth || 0, global.innerHeight || 0);
    const phoneLike = shortSide > 0 && shortSide <= 920;
    // 手机/粗指针触屏 → MOBA；桌面精鼠标即使带触摸板也走键盘
    if (touch && coarse) return "touchMOBA";
    if (touch && !fine && phoneLike) return "touchMOBA";
    return "keyboard";
  }

  function isPortrait() {
    return (global.innerHeight || 0) > (global.innerWidth || 0);
  }

  function isLandscape() {
    return (global.innerWidth || 0) >= (global.innerHeight || 0);
  }

  function setMode(m) {
    mode = m === "touchMOBA" ? "touchMOBA" : "keyboard";
    canvasTouchEnabled = mode !== "touchMOBA";
    try {
      document.documentElement.dataset.inputMode = mode;
      document.body.dataset.inputMode = mode;
    } catch { /* */ }
    modeListeners.forEach((fn) => {
      try { fn(mode); } catch { /* */ }
    });
  }

  function zeroStick() {
    stick.vx = 0;
    stick.vy = 0;
  }

  function getStick() {
    return stick;
  }

  function bindStick(baseEl, knobEl) {
    if (!baseEl) return;
    let tracking = null;

    function placeKnob(dx, dy) {
      if (!knobEl) return;
      knobEl.style.transform = "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))";
    }

    function updateFrom(clientX, clientY) {
      const rect = baseEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      const maxR = Math.max(8, rect.width / 2);
      if (dist < DEAD_ZONE) {
        zeroStick();
        placeKnob(0, 0);
        return;
      }
      const nx = dx / dist;
      const ny = dy / dist;
      const clamped = Math.min(dist, maxR);
      const mag = Math.min(1, (dist - DEAD_ZONE) / Math.max(1, maxR - DEAD_ZONE));
      stick.vx = nx * mag;
      stick.vy = ny * mag;
      placeKnob(nx * clamped, ny * clamped);
    }

    function onDown(e) {
      if (!battleActive) return;
      if (e.pointerType === "mouse" && mode !== "touchMOBA") return;
      e.preventDefault();
      e.stopPropagation();
      tracking = e.pointerId;
      try { baseEl.setPointerCapture(e.pointerId); } catch { /* */ }
      baseEl.classList.add("pressed");
      updateFrom(e.clientX, e.clientY);
    }

    function onMove(e) {
      if (tracking !== e.pointerId) return;
      e.preventDefault();
      updateFrom(e.clientX, e.clientY);
    }

    function onUp(e) {
      if (tracking != null && tracking !== e.pointerId) return;
      tracking = null;
      zeroStick();
      baseEl.classList.remove("pressed");
      placeKnob(0, 0);
    }

    baseEl.addEventListener("pointerdown", onDown);
    baseEl.addEventListener("pointermove", onMove);
    baseEl.addEventListener("pointerup", onUp);
    baseEl.addEventListener("pointercancel", onUp);
    baseEl.addEventListener("lostpointercapture", onUp);
  }

  function bindPressButton(el, onPress, opts) {
    if (!el || typeof onPress !== "function") return;
    const holdMs = opts && opts.holdMs;
    let holdTimer = 0;
    let tracking = null;

    function clearHold() {
      if (holdTimer) {
        clearInterval(holdTimer);
        holdTimer = 0;
      }
    }

    function down(e) {
      if (!battleActive && !(opts && opts.always)) return;
      e.preventDefault();
      e.stopPropagation();
      tracking = e.pointerId;
      try { el.setPointerCapture(e.pointerId); } catch { /* */ }
      el.classList.add("pressed");
      onPress();
      if (holdMs && holdMs > 0) {
        clearHold();
        holdTimer = setInterval(onPress, holdMs);
      }
    }

    function up(e) {
      if (tracking != null && e && tracking !== e.pointerId) return;
      tracking = null;
      el.classList.remove("pressed");
      clearHold();
    }

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("lostpointercapture", up);
  }

  async function enterLandscapePlay() {
    const root = document.documentElement;
    try {
      if (!document.fullscreenElement) {
        if (root.requestFullscreen) await root.requestFullscreen.call(root);
        else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
        else if (root.webkitRequestFullScreen) root.webkitRequestFullScreen();
      }
    } catch { /* iOS / iframe 可能拒；手势按钮仍算尝试 */ }
    try {
      if (screen.orientation && typeof screen.orientation.lock === "function") {
        await screen.orientation.lock("landscape");
      }
    } catch { /* Safari 常失败；靠旋转提示 + CSS */ }
    return isLandscape();
  }

  function setBattleActive(on) {
    battleActive = !!on;
    if (!battleActive) zeroStick();
    /* body.moba-battle / moba-landscape 由壳 syncMobaUi 控制 */
  }

  function init() {
    setMode(detect());
    const bump = () => {
      /* orientation 变化只通知外部同步 HUD */
      modeListeners.forEach((fn) => {
        try { fn(mode); } catch { /* */ }
      });
    };
    global.addEventListener("orientationchange", bump);
    global.addEventListener("resize", bump);
  }

  global.SpiritInputAdapter = {
    STICK_SIZE,
    DEAD_ZONE,
    init,
    detect,
    getMode: function () { return mode; },
    setMode: setMode,
    get canvasTouchEnabled() { return canvasTouchEnabled; },
    set canvasTouchEnabled(v) { canvasTouchEnabled = !!v; },
    getStick: getStick,
    zeroStick: zeroStick,
    bindStick: bindStick,
    bindPressButton: bindPressButton,
    enterLandscapePlay: enterLandscapePlay,
    isPortrait: isPortrait,
    isLandscape: isLandscape,
    setBattleActive: setBattleActive,
    isBattleActive: function () { return battleActive; },
    needsRotateHint: function () {
      return mode === "touchMOBA" && isPortrait();
    },
    onModeChange: function (fn) {
      if (typeof fn === "function") modeListeners.push(fn);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
