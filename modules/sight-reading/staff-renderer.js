/** 高音谱表 step：0 = 第一线 E4，每 +1 为上一间/线 */
const TREBLE_PITCH_STEP = {
  C4: -2, D4: -1, E4: 0, F4: 1, G4: 2, A4: 3, B4: 4,
  C5: 5, D5: 6, E5: 7, F5: 8, G5: 9, A5: 10
};

const PITCH_MIDI = {
  C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71,
  C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81
};

const PITCH_LABEL = {
  C4: "C（Do）", D4: "D（Re）", E4: "E（Mi）", F4: "F（Fa）", G4: "G（Sol）",
  A4: "A（La）", B4: "B（Si）", C5: "C5", D5: "D5", E5: "E5", F5: "F5",
  G5: "G5（Sol）", A5: "A5（La）"
};

/** 识谱快练 · 随机出题音高池 */
const SIGHT_DRILL_PITCHES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5"];

const StaffRenderer = (() => {
  const LINE_SPACING = 14;
  const NOTE_R = 9;

  function stepToY(step, staffTop, lines) {
    const bottomLineY = staffTop + (lines - 1) * LINE_SPACING;
    return bottomLineY - step * (LINE_SPACING / 2);
  }

  function drawStaff(ctx, x, y, width, lines = 5) {
    ctx.strokeStyle = "#3d3a50";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < lines; i++) {
      const ly = y + i * LINE_SPACING;
      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x + width, ly);
      ctx.stroke();
    }
    ctx.font = "48px serif";
    ctx.fillStyle = "#3d3a50";
    ctx.fillText("𝄞", x - 6, y + LINE_SPACING * 3 + 8);
  }

  function drawLedgerLines(ctx, step, noteX, staffTop, lines) {
    if (step >= 0 && step < (lines - 1) * 2) return;
    ctx.strokeStyle = "#7a7590";
    ctx.lineWidth = 1;
    if (step < 0) {
      for (let s = step; s < 0; s += 2) {
        const ly = stepToY(s, staffTop, lines);
        ctx.beginPath();
        ctx.moveTo(noteX - 14, ly);
        ctx.lineTo(noteX + 14, ly);
        ctx.stroke();
      }
    }
    if (step >= (lines - 1) * 2) {
      for (let s = step; s > (lines - 1) * 2; s -= 2) {
        const ly = stepToY(s, staffTop, lines);
        ctx.beginPath();
        ctx.moveTo(noteX - 14, ly);
        ctx.lineTo(noteX + 14, ly);
        ctx.stroke();
      }
    }
  }

  function drawNote(ctx, x, pitch, opts = {}) {
    const { staffTop = 40, lines = 5, noteType = "quarter", highlight = false, id = pitch } = opts;
    const step = TREBLE_PITCH_STEP[pitch];
    if (step === undefined) return null;
    const y = stepToY(step, staffTop, lines);

    drawLedgerLines(ctx, step, x, staffTop, lines);

    if (highlight) {
      ctx.fillStyle = "rgba(124, 92, 255, 0.2)";
      ctx.beginPath();
      ctx.arc(x, y, NOTE_R + 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = highlight ? "#7c5cff" : "#3d3a50";
    ctx.beginPath();
    ctx.ellipse(x, y, NOTE_R, NOTE_R * 0.85, -0.35, 0, Math.PI * 2);
    ctx.fill();

    const stemUp = step < 5;
    ctx.strokeStyle = "#3d3a50";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (stemUp) {
      ctx.moveTo(x + NOTE_R - 1, y);
      ctx.lineTo(x + NOTE_R - 1, y - 32);
      if (noteType === "eighth") {
        ctx.moveTo(x + NOTE_R - 1, y - 32);
        ctx.lineTo(x + NOTE_R + 10, y - 26);
      }
    } else {
      ctx.moveTo(x - NOTE_R + 1, y);
      ctx.lineTo(x - NOTE_R + 1, y + 32);
      if (noteType === "eighth") {
        ctx.moveTo(x - NOTE_R + 1, y + 32);
        ctx.lineTo(x - NOTE_R - 10, y + 26);
      }
    }
    ctx.stroke();

    return { id, pitch, x, y, r: NOTE_R + 12, step, noteType };
  }

  function render(canvas, config) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const staffTop = 36;
    const staffX = 52;
    const staffW = w - 72;
    drawStaff(ctx, staffX, staffTop, staffW);

    const hits = [];
    (config.notes || []).forEach((n, i) => {
      const x = n.x || (staffX + 70 + i * 58);
      const hit = drawNote(ctx, x, n.pitch, {
        staffTop,
        noteType: n.noteType || "quarter",
        highlight: n.highlight,
        id: n.id || n.pitch
      });
      if (hit) hits.push(hit);
    });

    return { hits, staffTop, staffX, staffW };
  }

  function hitTest(hits, clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (const h of hits) {
      const dx = x - h.x;
      const dy = y - h.y;
      if (dx * dx + dy * dy <= h.r * h.r) return h;
    }
    return null;
  }

  return { render, hitTest, stepToY, drawStaff };
})();

if (typeof window !== "undefined") {
  window.StaffRenderer = StaffRenderer;
  window.TREBLE_PITCH_STEP = TREBLE_PITCH_STEP;
  window.PITCH_MIDI = PITCH_MIDI;
  window.PITCH_LABEL = PITCH_LABEL;
  window.SIGHT_DRILL_PITCHES = SIGHT_DRILL_PITCHES;
}
