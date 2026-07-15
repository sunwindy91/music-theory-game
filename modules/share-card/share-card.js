const ShareCardModule = (() => {
  let overlay = null;
  let currentPayload = null;
  let cachedCanvas = null;
  let canNativeShare = false;

  function detectNativeShare() {
    return typeof navigator.share === "function";
  }

  function setStatus(msg, type) {
    const el = overlay && overlay.querySelector(".sc-status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "sc-status" + (type ? ` ${type}` : "");
  }

  function hideShareEntry() {
    const actions = document.getElementById("shareCardActions");
    if (actions) actions.classList.add("hidden");
  }

  function showShareEntry() {
    const actions = document.getElementById("shareCardActions");
    if (actions) actions.classList.remove("hidden");
  }

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "sc-overlay hidden";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "分享卡片预览");
    overlay.innerHTML = `
      <div class="sc-modal">
        <div class="sc-modal-header">
          <h3>📤 分享卡片</h3>
          <button class="sc-close" type="button" aria-label="关闭">×</button>
        </div>
        <div class="sc-preview-wrap">
          <p class="sc-loading">正在生成卡片…</p>
          <img class="sc-preview-img hidden" alt="乐理小达人分享卡片预览" />
          <p class="sc-ios-hint">长按上方图片保存到相册，可用于公众号或朋友圈</p>
        </div>
        <div class="sc-actions">
          <button class="sc-btn sc-btn-download" type="button">⬇️ 下载 PNG</button>
          <button class="sc-btn sc-btn-share hidden" type="button">📲 系统分享</button>
          <button class="sc-btn sc-btn-copy" type="button">🔗 复制分享文案</button>
        </div>
        <p class="sc-status"></p>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector(".sc-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    overlay.querySelector(".sc-btn-download").addEventListener("click", handleDownload);
    overlay.querySelector(".sc-btn-share").addEventListener("click", handleShare);
    overlay.querySelector(".sc-btn-copy").addEventListener("click", handleCopy);

    return overlay;
  }

  async function renderPreview() {
    if (!currentPayload) return;
    const loading = overlay.querySelector(".sc-loading");
    const img = overlay.querySelector(".sc-preview-img");
    const iosHint = overlay.querySelector(".sc-ios-hint");

    loading.classList.remove("hidden");
    img.classList.add("hidden");
    iosHint.classList.remove("show");
    setStatus("");

    try {
      cachedCanvas = await ShareCardRenderer.renderToCanvas(currentPayload);
      img.src = cachedCanvas.toDataURL("image/png");
      loading.classList.add("hidden");
      img.classList.remove("hidden");

      if (typeof isIosShareCardDevice === "function" && isIosShareCardDevice()) {
        iosHint.classList.add("show");
      }
    } catch (err) {
      loading.textContent = "卡片生成失败，请重试";
      setStatus("生成失败", "err");
    }
  }

  async function handleDownload() {
    if (!cachedCanvas || !currentPayload) return;
    setStatus("");
    try {
      await downloadPng(cachedCanvas, shareFilename(currentPayload));
      setStatus("已触发下载", "ok");
    } catch (err) {
      const img = overlay.querySelector(".sc-preview-img");
      if (img && !img.classList.contains("hidden")) {
        overlay.querySelector(".sc-ios-hint").classList.add("show");
        setStatus("下载受限，请长按图片保存", "err");
      } else {
        setStatus("下载失败，请重试", "err");
      }
    }
  }

  async function handleShare() {
    if (!cachedCanvas || !currentPayload) return;
    setStatus("");
    const ok = await tryNativeShare(cachedCanvas, currentPayload);
    if (ok) {
      setStatus("已打开系统分享", "ok");
    } else {
      setStatus("当前环境不支持图片分享", "err");
    }
  }

  async function handleCopy() {
    if (!currentPayload) return;
    const btn = overlay.querySelector(".sc-btn-copy");
    try {
      await copyShareText(currentPayload);
      btn.textContent = "✓ 已复制文案";
      btn.classList.add("copied");
      setStatus("分享文案已复制到剪贴板", "ok");
      setTimeout(() => {
        btn.textContent = "🔗 复制分享文案";
        btn.classList.remove("copied");
      }, 2000);
    } catch (err) {
      setStatus("复制失败，请手动复制", "err");
    }
  }

  function offer(payload) {
    if (!window.AppFeatures || !AppFeatures.shareCard) return;
    currentPayload = payload;
    showShareEntry();
  }

  async function openPreview(payload) {
    if (!window.AppFeatures || !AppFeatures.shareCard) return;
    if (payload) currentPayload = payload;
    if (!currentPayload) return;

    ensureOverlay();
    canNativeShare = detectNativeShare();

    const shareBtn = overlay.querySelector(".sc-btn-share");
    if (canNativeShare) {
      shareBtn.classList.remove("hidden");
    } else {
      shareBtn.classList.add("hidden");
    }

    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    await renderPreview();
  }

  function close() {
    if (overlay) {
      overlay.classList.add("hidden");
      const loading = overlay.querySelector(".sc-loading");
      const img = overlay.querySelector(".sc-preview-img");
      if (loading) {
        loading.textContent = "正在生成卡片…";
        loading.classList.remove("hidden");
      }
      if (img) {
        img.src = "";
        img.classList.add("hidden");
      }
      overlay.querySelector(".sc-ios-hint").classList.remove("show");
    }
    document.body.style.overflow = "";
    cachedCanvas = null;
    setStatus("");
  }

  function reset() {
    close();
    hideShareEntry();
    currentPayload = null;
  }

  return {
    offer,
    openPreview,
    close,
    reset,
    getPayload() {
      return currentPayload;
    }
  };
})();

if (typeof window !== "undefined") {
  window.ShareCardModule = ShareCardModule;
}
