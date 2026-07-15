const SHARE_APP_URL = "https://music-theory-game.vercel.app/";
const SHARE_CANVAS_WIDTH = 900;
const SHARE_CANVAS_HEIGHT = 1200;

const SHARE_COLORS = {
  bgTop: "#fff5e6",
  bgBottom: "#e8f4ff",
  primary: "#7c5cff",
  primaryDark: "#5a3fd4",
  accent: "#ffb347",
  accentDark: "#e89420",
  text: "#3d3a50",
  textLight: "#7a7590",
  card: "#ffffff",
  cardBorder: "#f0ebff"
};

function formatDateLabel(dateKey) {
  const parts = (dateKey || getTodayKey()).split("-").map(Number);
  return `${parts[0]}年${parts[1]}月${parts[2]}日`;
}

function getModeLabel(mode) {
  if (mode === "audio") return "听音识名";
  return "综合练习";
}

function getQuizHeadline(ratio) {
  if (ratio >= 0.8) return { emoji: "🏆", headline: "太厉害了！" };
  if (ratio >= 0.5) return { emoji: "🎵", headline: "不错哦！" };
  return { emoji: "📖", headline: "继续加油！" };
}

function getDailyHeadline(accuracy) {
  if (accuracy >= 1) return { emoji: "🏆", headline: "今日挑战完美！" };
  if (accuracy >= 0.5) return { emoji: "🎉", headline: "今日挑战完成！" };
  return { emoji: "📅", headline: "坚持就是胜利！" };
}

function buildSharePayload(context) {
  const {
    sessionType,
    score = 0,
    totalQuestions = 0,
    correctCount = 0,
    maxCombo = 0,
    streak = 0,
    difficulty,
    mode,
    dateKey
  } = context;

  const total = Math.max(totalQuestions, 1);
  const accuracy = correctCount / total;
  const ratio = sessionType === "quiz" ? score / (total * 20) : accuracy;

  let emoji, headline, modeBadge;
  if (sessionType === "daily") {
    ({ emoji, headline } = getDailyHeadline(accuracy));
    modeBadge = "每日挑战 · 中级";
  } else {
    ({ emoji, headline } = getQuizHeadline(ratio));
    const diffLabel = { 1: "初级", 2: "中级", 3: "高级" }[difficulty] || "中级";
    modeBadge = `${diffLabel} · ${getModeLabel(mode)}`;
  }

  return {
    sessionType,
    emoji,
    headline,
    score,
    totalQuestions: total,
    correctCount,
    accuracy,
    maxCombo,
    streak: sessionType === "daily" ? streak : 0,
    modeBadge,
    dateLabel: formatDateLabel(dateKey),
    appName: "乐理小达人",
    appUrl: SHARE_APP_URL,
    footerTag: "轻松练习，快乐学音乐",
    disclaimer: "仅供学习娱乐"
  };
}

function shareFilename(payload) {
  const key = (payload.dateLabel || "").replace(/[年月日]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `乐理小达人-${key || "分享"}.png`;
}

function shareText(payload) {
  const pct = Math.round(payload.accuracy * 100);
  if (payload.sessionType === "daily") {
    return `我在乐理小达人完成了今日挑战，得了${payload.score}分（正确率${pct}%）！🔥连续${payload.streak}天。快来挑战：${SHARE_APP_URL}`;
  }
  return `我在乐理小达人得了${payload.score}分（正确率${pct}%）！快来挑战：${SHARE_APP_URL}`;
}

const ShareCardRenderer = {
  _fontReady: null,

  ensureFonts() {
    if (!this._fontReady) {
      this._fontReady = Promise.all([
        document.fonts.load('700 72px Fredoka'),
        document.fonts.load('600 48px Fredoka'),
        document.fonts.load('500 32px Fredoka'),
        document.fonts.load('400 24px Fredoka')
      ]).catch(() => {});
    }
    return this._fontReady;
  },

  _roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  _drawBackground(ctx) {
    const grad = ctx.createLinearGradient(0, 0, SHARE_CANVAS_WIDTH, SHARE_CANVAS_HEIGHT);
    grad.addColorStop(0, SHARE_COLORS.bgTop);
    grad.addColorStop(1, SHARE_COLORS.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SHARE_CANVAS_WIDTH, SHARE_CANVAS_HEIGHT);

    const notes = ["♪", "♫", "♩", "♬", "♭", "♯"];
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = SHARE_COLORS.primary;
    ctx.font = '600 64px Fredoka, "Segoe UI", sans-serif';
    const positions = [
      [60, 120, 72], [720, 180, 56], [100, 980, 48],
      [680, 1020, 60], [40, 560, 40], [780, 520, 52]
    ];
    positions.forEach(([x, y, size], i) => {
      ctx.font = `600 ${size}px Fredoka, "Segoe UI", sans-serif`;
      ctx.fillText(notes[i % notes.length], x, y);
    });
    ctx.globalAlpha = 1;
  },

  _drawCard(ctx, payload) {
    const cardX = 60;
    const cardY = 100;
    const cardW = SHARE_CANVAS_WIDTH - 120;
    const cardH = 880;

    ctx.save();
    ctx.shadowColor = "rgba(124, 92, 255, 0.18)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
    this._roundRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = SHARE_COLORS.card;
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = SHARE_COLORS.cardBorder;
    ctx.lineWidth = 6;
    this._roundRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.stroke();

    const cx = SHARE_CANVAS_WIDTH / 2;
    let y = cardY + 80;
    const font = 'Fredoka, "Segoe UI", sans-serif';

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `700 96px ${font}`;
    ctx.fillText(payload.emoji, cx, y);
    y += 90;

    ctx.font = `700 56px ${font}`;
    ctx.fillStyle = SHARE_COLORS.primary;
    ctx.fillText(payload.headline, cx, y);
    y += 56;

    const badgeW = ctx.measureText(payload.modeBadge).width + 56;
    const badgeH = 52;
    const badgeX = cx - badgeW / 2;
    const badgeY = y - badgeH / 2 + 8;
    const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY);
    badgeGrad.addColorStop(0, SHARE_COLORS.primary);
    badgeGrad.addColorStop(1, SHARE_COLORS.primaryDark);
    this._roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 26);
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.font = `600 26px ${font}`;
    ctx.fillStyle = "#fff";
    ctx.fillText(payload.modeBadge, cx, badgeY + badgeH / 2);
    y += 100;

    ctx.font = `700 120px ${font}`;
    ctx.fillStyle = SHARE_COLORS.accentDark;
    ctx.fillText(String(payload.score), cx, y);
    const scoreUnitW = ctx.measureText(String(payload.score)).width;
    ctx.font = `500 36px ${font}`;
    ctx.fillStyle = SHARE_COLORS.textLight;
    ctx.fillText("分", cx + scoreUnitW / 2 + 28, y + 16);
    y += 90;

    ctx.font = `500 36px ${font}`;
    ctx.fillStyle = SHARE_COLORS.text;
    const pct = Math.round(payload.accuracy * 100);
    ctx.fillText(`正确率 ${pct}%  ·  共 ${payload.totalQuestions} 题`, cx, y);
    y += 56;

    if (payload.maxCombo >= 2) {
      ctx.font = `600 34px ${font}`;
      ctx.fillStyle = "#e8650a";
      ctx.fillText(`🔥 最高连击 x${payload.maxCombo}`, cx, y);
      y += 52;
    }

    if (payload.sessionType === "daily" && payload.streak > 0) {
      ctx.font = `600 34px ${font}`;
      ctx.fillStyle = "#e8650a";
      ctx.fillText(`🔥 连续 ${payload.streak} 天`, cx, y);
      y += 52;
    }

    ctx.font = `400 30px ${font}`;
    ctx.fillStyle = SHARE_COLORS.textLight;
    ctx.fillText(payload.dateLabel, cx, cardY + cardH - 60);
  },

  _drawFooter(ctx, payload) {
    const cx = SHARE_CANVAS_WIDTH / 2;
    const font = 'Fredoka, "Segoe UI", sans-serif';

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `700 40px ${font}`;
    ctx.fillStyle = SHARE_COLORS.primary;
    ctx.fillText(`🎵 ${payload.appName}`, cx, 1040);

    ctx.font = `400 26px ${font}`;
    ctx.fillStyle = SHARE_COLORS.textLight;
    ctx.fillText(payload.footerTag, cx, 1090);

    ctx.font = `500 24px ${font}`;
    ctx.fillStyle = SHARE_COLORS.primary;
    ctx.fillText(payload.appUrl, cx, 1135);

    ctx.font = `400 22px ${font}`;
    ctx.fillStyle = SHARE_COLORS.textLight;
    ctx.fillText(payload.disclaimer, cx, 1175);
  },

  async renderToCanvas(payload) {
    await this.ensureFonts();
    const canvas = document.createElement("canvas");
    canvas.width = SHARE_CANVAS_WIDTH;
    canvas.height = SHARE_CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");

    this._drawBackground(ctx);
    this._drawCard(ctx, payload);
    this._drawFooter(ctx, payload);

    return canvas;
  }
};

function downloadPng(canvas, filename) {
  return new Promise((resolve, reject) => {
    if (!canvas || !canvas.toBlob) {
      reject(new Error("Canvas export unavailable"));
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG export failed"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve(true);
    }, "image/png");
  });
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

async function tryNativeShare(canvas, payload) {
  if (!navigator.share) return false;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return false;

  const file = new File([blob], shareFilename(payload), { type: "image/png" });
  const data = {
    title: payload.appName,
    text: shareText(payload),
    files: [file]
  };

  if (navigator.canShare && !navigator.canShare(data)) return false;

  try {
    await navigator.share(data);
    return true;
  } catch (err) {
    if (err && err.name === "AbortError") return true;
    return false;
  }
}

async function copyShareText(payload) {
  const text = shareText(payload);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

if (typeof window !== "undefined") {
  window.SHARE_APP_URL = SHARE_APP_URL;
  window.buildSharePayload = buildSharePayload;
  window.ShareCardRenderer = ShareCardRenderer;
  window.downloadPng = downloadPng;
  window.tryNativeShare = tryNativeShare;
  window.copyShareText = copyShareText;
  window.shareFilename = shareFilename;
  window.shareText = shareText;
  window.isIosShareCardDevice = isIosDevice;
}
