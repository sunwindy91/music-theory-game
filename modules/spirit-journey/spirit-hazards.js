/**
 * I33/I34 — 星图探险地形：坑 / 雾 / 晶石 / 软墙遗迹柱。
 * 主循环：ensureForWave / update / draw / blocksSpawn / getMoveMul / resolvePlayer / tryRamBreak。
 */
(function (global) {
  "use strict";

  const SD = () => global.SpiritData || {};
  function cfg(key, fallback) {
    const v = SD()[key];
    return v != null ? v : fallback;
  }

  let pits = [];
  let fogs = [];
  let crystals = [];
  let walls = [];
  let lastWave = 0;
  let lastFallAt = 0;

  function reset() {
    pits = [];
    fogs = [];
    crystals = [];
    walls = [];
    lastWave = 0;
    lastFallAt = 0;
  }

  function blocksSpawn(x, y, pad) {
    const p = pad || 36;
    for (let i = 0; i < pits.length; i++) {
      if (Math.hypot(x - pits[i].x, y - pits[i].y) < pits[i].r + p) return true;
    }
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      if (w.broken) continue;
      if (Math.hypot(x - w.x, y - w.y) < w.r + p * 0.6) return true;
    }
    return false;
  }

  function placeAway(W, H, player, minR, maxR, existing) {
    for (let t = 0; t < 40; t++) {
      const r = minR + Math.random() * (maxR - minR);
      const x = 70 + Math.random() * (W - 140);
      const y = 90 + Math.random() * (H - 180);
      if (Math.hypot(x - player.x, y - player.y) < 130 + r) continue;
      let ok = true;
      for (let i = 0; i < existing.length; i++) {
        if (Math.hypot(x - existing[i].x, y - existing[i].y) < existing[i].r + r + 28) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      return { x, y, r };
    }
    return null;
  }

  function ensureForWave(wave, W, H, player) {
    if (!W || !H || !player) return;
    if (wave === lastWave && (pits.length || crystals.length || walls.length)) return;
    lastWave = wave;
    pits = [];
    fogs = [];
    crystals = [];
    walls = [];
    const pitN = Math.min(cfg("PIT_MAX", 5), 1 + Math.floor(wave / 2));
    const fogN = Math.min(cfg("FOG_MAX", 3), Math.floor(wave / 3));
    const crystalN = Math.min(cfg("CRYSTAL_MAX", 4), 1 + Math.floor(wave / 2));
    const wallN = Math.min(cfg("WALL_MAX", 4), Math.floor(wave / 2));
    const placed = [];
    for (let i = 0; i < pitN; i++) {
      const spot = placeAway(W, H, player, cfg("PIT_MIN_R", 28), cfg("PIT_MAX_R", 46), placed);
      if (!spot) break;
      pits.push({
        id: `pit-${wave}-${i}`,
        x: spot.x, y: spot.y, r: spot.r,
        pulse: Math.random() * Math.PI * 2
      });
      placed.push(spot);
    }
    for (let i = 0; i < fogN; i++) {
      const spot = placeAway(W, H, player, cfg("FOG_MIN_R", 50), cfg("FOG_MAX_R", 90), placed);
      if (!spot) break;
      fogs.push({
        id: `fog-${wave}-${i}`,
        x: spot.x, y: spot.y, r: spot.r,
        pulse: Math.random() * Math.PI * 2
      });
      placed.push(spot);
    }
    const cr = cfg("CRYSTAL_R", 14);
    for (let i = 0; i < crystalN; i++) {
      const spot = placeAway(W, H, player, cr, cr + 2, placed);
      if (!spot) break;
      crystals.push({
        id: `cry-${wave}-${i}`,
        x: spot.x, y: spot.y, r: cr,
        pulse: Math.random() * Math.PI * 2,
        taken: false
      });
      placed.push({ x: spot.x, y: spot.y, r: cr + 10 });
    }
    const wr = cfg("WALL_R", 22);
    for (let i = 0; i < wallN; i++) {
      const spot = placeAway(W, H, player, wr, wr + 4, placed);
      if (!spot) break;
      walls.push({
        id: `wall-${wave}-${i}`,
        x: spot.x, y: spot.y, r: wr,
        hp: cfg("WALL_HP", 2),
        maxHp: cfg("WALL_HP", 2),
        broken: false,
        pulse: Math.random() * Math.PI * 2
      });
      placed.push({ x: spot.x, y: spot.y, r: wr + 8 });
    }
  }

  function inPit(player) {
    for (let i = 0; i < pits.length; i++) {
      if (Math.hypot(player.x - pits[i].x, player.y - pits[i].y) < pits[i].r * 0.72) {
        return pits[i];
      }
    }
    return null;
  }

  function getMoveMul(player) {
    const slow = cfg("FOG_SLOW", 0.55);
    for (let i = 0; i < fogs.length; i++) {
      if (Math.hypot(player.x - fogs[i].x, player.y - fogs[i].y) < fogs[i].r * 0.9) {
        return slow;
      }
    }
    return 1;
  }

  /** 把玩家从完整遗迹柱里推出 */
  function resolvePlayer(player) {
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      if (w.broken) continue;
      const d = Math.hypot(player.x - w.x, player.y - w.y);
      const min = player.r + w.r * 0.92;
      if (d < min && d > 0.001) {
        const nx = (player.x - w.x) / d;
        const ny = (player.y - w.y) / d;
        player.x = w.x + nx * min;
        player.y = w.y + ny * min;
      } else if (d < min) {
        player.x = w.x + min;
      }
    }
  }

  /**
   * 撞击中对柱子造成伤害。
   * @returns {number} 本帧打碎数量
   */
  function tryRamBreak(player, ramming, ramToken) {
    if (!ramming) return 0;
    let broke = 0;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      if (w.broken) continue;
      if (w.ramHitToken === ramToken) continue;
      if (Math.hypot(player.x - w.x, player.y - w.y) < player.r + w.r + 6) {
        w.ramHitToken = ramToken;
        w.hp -= 1;
        if (w.hp <= 0) {
          w.broken = true;
          broke++;
        }
      }
    }
    return broke;
  }

  function update(ctx) {
    const { dt, now, player, ramming, invulnUntil, onFall, onCrystal, onWallBreak } = ctx;
    pits.forEach((p) => { p.pulse += dt * 1.6; });
    fogs.forEach((f) => { f.pulse += dt * 0.9; });
    crystals.forEach((c) => { if (!c.taken) c.pulse += dt * 3.2; });
    walls.forEach((w) => { if (!w.broken) w.pulse += dt * 1.1; });

    let picked = 0;
    for (let i = 0; i < crystals.length; i++) {
      const c = crystals[i];
      if (c.taken) continue;
      if (Math.hypot(player.x - c.x, player.y - c.y) < player.r + c.r) {
        c.taken = true;
        picked++;
        if (typeof onCrystal === "function") onCrystal(c);
      }
    }

    if (ramming || now < invulnUntil) return { fell: false, pit: null, crystals: picked };
    if (now - lastFallAt < cfg("PIT_HURT_COOLDOWN_MS", 900)) {
      return { fell: false, pit: null, crystals: picked };
    }
    const pit = inPit(player);
    if (!pit) return { fell: false, pit: null, crystals: picked };
    lastFallAt = now;
    if (typeof onFall === "function") onFall(pit);
    return { fell: true, pit, crystals: picked };
  }

  function draw(ctx, now) {
    if (!ctx) return;
    fogs.forEach((f) => {
      const wob = Math.sin((now || 0) * 0.002 + f.pulse) * 4;
      const g = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, f.r + wob);
      g.addColorStop(0, "rgba(120, 160, 200, 0.22)");
      g.addColorStop(0.55, "rgba(80, 110, 150, 0.12)");
      g.addColorStop(1, "rgba(40, 60, 90, 0)");
      ctx.beginPath();
      ctx.fillStyle = g;
      ctx.arc(f.x, f.y, f.r + wob, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(180, 210, 240, 0.35)";
      ctx.font = "10px Segoe UI,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("雾", f.x, f.y + 3);
    });
    pits.forEach((p) => {
      const wob = Math.sin((now || 0) * 0.003 + p.pulse) * 2.5;
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r + wob);
      g.addColorStop(0, "rgba(8, 6, 14, 0.95)");
      g.addColorStop(0.45, "rgba(40, 20, 55, 0.75)");
      g.addColorStop(0.75, "rgba(90, 50, 40, 0.35)");
      g.addColorStop(1, "rgba(30, 20, 40, 0)");
      ctx.beginPath();
      ctx.fillStyle = g;
      ctx.arc(p.x, p.y, p.r + wob, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(180, 90, 70, 0.45)";
      ctx.lineWidth = 2;
      ctx.arc(p.x, p.y, p.r * 0.82, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(220, 160, 120, 0.55)";
      ctx.font = "11px Segoe UI,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("坑", p.x, p.y + 4);
    });
    walls.forEach((w) => {
      if (w.broken) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(80, 70, 60, 0.25)";
        ctx.arc(w.x, w.y, w.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      const wob = Math.sin((now || 0) * 0.002 + w.pulse) * 1.5;
      ctx.beginPath();
      ctx.fillStyle = "rgba(90, 78, 68, 0.88)";
      ctx.arc(w.x, w.y, w.r + wob, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(180, 150, 120, 0.55)";
      ctx.lineWidth = 2;
      ctx.arc(w.x, w.y, w.r * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(220, 200, 170, 0.7)";
      ctx.font = "10px Segoe UI,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(w.hp > 1 ? "柱" : "裂", w.x, w.y + 3);
    });
    crystals.forEach((c) => {
      if (c.taken) return;
      const pr = c.r + Math.sin(c.pulse) * 2;
      const g = ctx.createRadialGradient(c.x, c.y, 1, c.x, c.y, pr + 8);
      g.addColorStop(0, "rgba(200, 240, 255, 0.95)");
      g.addColorStop(0.4, "rgba(120, 200, 255, 0.55)");
      g.addColorStop(1, "rgba(60, 100, 180, 0)");
      ctx.beginPath();
      ctx.fillStyle = g;
      ctx.arc(c.x, c.y, pr + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - pr);
      ctx.lineTo(c.x + pr * 0.7, c.y);
      ctx.lineTo(c.x, c.y + pr);
      ctx.lineTo(c.x - pr * 0.7, c.y);
      ctx.closePath();
      ctx.fillStyle = "rgba(210, 240, 255, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(140, 190, 255, 0.7)";
      ctx.stroke();
    });
  }

  function objectiveHint() {
    const bits = [];
    if (walls.some((w) => !w.broken)) bits.push("E 撞击遗迹柱开路·碎柱得弹");
    if (crystals.some((c) => !c.taken)) bits.push("拾取晶石回灵气/弹药");
    if (fogs.length) bits.push("雾区减速·尽快穿出");
    if (pits.length) bits.push("避开坑洞");
    return bits.length ? bits.join(" · ") : "";
  }

  global.SpiritHazards = {
    reset,
    ensureForWave,
    update,
    draw,
    blocksSpawn,
    getMoveMul,
    resolvePlayer,
    tryRamBreak,
    objectiveHint,
    unbrokenWallCount() { return walls.filter((w) => !w.broken).length; },
    getPits: () => pits,
    getFogs: () => fogs,
    getCrystals: () => crystals,
    getWalls: () => walls
  };
})(typeof window !== "undefined" ? window : globalThis);
