/**
 * I36/I37 — Boss 来袭 + 吞音 + 技能；领主 / 不和谐君主（mega）；I35 小怪技能。
 */
(function (global) {
  "use strict";

  const SD = () => global.SpiritData || {};
  function cfg(key, fallback) {
    const v = SD()[key];
    return v != null ? v : fallback;
  }

  let announce = null;
  let ripples = [];
  let hostile = [];
  let beam = null; // I54 聚能激光（同一时刻仅一个 Boss）

  function reset() {
    announce = null;
    ripples = [];
    hostile = [];
    beam = null;
  }

  function pickLine(pool) {
    const lines = (SD().BOSS_LINES || {})[pool];
    if (!lines || !lines.length) return "";
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function playDissonance(sfx, baseMidi) {
    if (!sfx || typeof sfx.playSung !== "function") return;
    const root = baseMidi || cfg("BASE_MIDI", 60);
    const cluster = [0, 1, 6, 13];
    cluster.forEach((iv, i) => {
      setTimeout(() => {
        try { sfx.playSung(root + iv, 0.42, 0.11 + i * 0.02); } catch { /* */ }
      }, i * 70);
    });
  }

  function beginAnnounce(wave, type, now, opts) {
    opts = opts || {};
    const mega = !!opts.mega;
    const name = mega
      ? "噬律·失谐君主"
      : (type.id === "stone" ? "磐岳·刚石领主" : "幽岚·雾灵领主");
    announce = {
      until: now + (mega ? cfg("MEGA_ANNOUNCE_MS", 3200) : cfg("BOSS_ANNOUNCE_MS", 2200)),
      wave,
      typeId: type.id,
      name,
      mega,
      line: pickLine(mega ? "mega" : "entrance"),
      startedAt: now
    };
    return announce;
  }

  function updateAnnounce(now) {
    if (!announce) return null;
    if (now < announce.until) return { ready: false, announce };
    const done = announce;
    announce = null;
    return { ready: true, announce: done };
  }

  function getAnnounce() {
    return announce;
  }

  function buildBoss(w, type, pos, opts) {
    opts = opts || {};
    const mega = !!opts.mega;
    const hpMul = mega ? cfg("MEGA_HP_MUL", 1.85) : 1;
    const hp = (cfg("BOSS_HP_BASE", 10) + w * cfg("BOSS_HP_PER_WAVE", 1.55)) * hpMul;
    const speed = (42 + Math.min(28, w * 2.2)) * type.speedMul * cfg("BOSS_SPEED_MUL", 1.08) * (mega ? 1.12 : 1);
    const now = Date.now();
    return {
      id: `${mega ? "mega" : "boss"}_${type.id}_${now}`,
      typeId: type.id,
      name: mega ? "噬律·失谐君主" : (type.id === "stone" ? "磐岳·刚石领主" : "幽岚·雾灵领主"),
      tag: mega ? "君" : "Boss",
      tip: mega
        ? "终局君主·吞音蓄能→聚能激光 · Shift/E 闪避"
        : (type.id === "stone" ? "领主·怕明快 / 蓄力重装·重砸（拉开距离）" : "领主·怕阴郁 / 会射不和谐弹"),
      color: mega ? "#2a1030" : type.color,
      eye: mega ? "rgba(255,90,120,1)" : type.eye,
      mult: mega
        ? { major: 0.55, minor: 0.55, flat: 0.45 }
        : type.mult,
      x: pos.x,
      y: pos.y,
      r: type.r * cfg("BOSS_R_MUL", 2.05) * (mega ? 1.35 : 1),
      hp,
      maxHp: hp,
      speed,
      baseSpeed: speed,
      slowUntil: 0,
      freezeDeep: false,
      wobble: Math.random() * Math.PI * 2,
      isBoss: true,
      isMega: mega,
      skillCdUntil: now + 550,
      devourCdUntil: now + 120,
      skillFlip: 0,
      phase: 1,
      beamCharge: 0,
      beamCdUntil: now + 5200
    };
  }

  // 点到「从 (ox,oy) 沿 ang、长 len 的射线」的最近距离（限制在 [0,len]）
  function distToRay(px, py, ox, oy, ang, len) {
    const dx = Math.cos(ang), dy = Math.sin(ang);
    let t = (px - ox) * dx + (py - oy) * dy;
    t = Math.max(0, Math.min(len, t));
    return Math.hypot(px - (ox + dx * t), py - (oy + dy * t));
  }

  function devourNear(boss, notes, opts) {
    const radius = opts.radius || cfg("BOSS_DEVOUR_R", 150);
    const heal = opts.healPerNote != null ? opts.healPerNote : cfg("BOSS_DEVOUR_HEAL", 0.35);
    let eaten = 0;
    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i];
      if (Math.hypot(n.x - boss.x, n.y - boss.y) <= radius) {
        if (typeof opts.onEat === "function") opts.onEat(n);
        notes.splice(i, 1);
        eaten++;
        boss.hp = Math.min(boss.maxHp, boss.hp + heal * (boss.isMega ? 1.25 : 1));
      }
    }
    return eaten;
  }

  function clearBeam() {
    beam = null;
  }

  function addRipple(x, y, color, life) {
    ripples.push({ x, y, r: 8, maxR: 120, color: color || "#ff8060", life: life || 0.7 });
  }

  function fireHostile(shot) {
    hostile.push(shot);
  }

  function doSlam(boss, player, ang, onHurt, opts) {
    opts = opts || {};
    addRipple(boss.x, boss.y, boss.isMega ? "#ff4060" : "#e09050", opts.heavy ? 1.15 : 0.9);
    const slamR = (boss.phase >= 2 ? 165 : 125) * (boss.isMega ? 1.25 : 1) * (opts.rMul || 1);
    if (Math.hypot(player.x - boss.x, player.y - boss.y) < slamR) {
      const push = opts.push != null ? opts.push : (boss.isMega ? 96 : 78);
      player.x += Math.cos(ang) * push;
      player.y += Math.sin(ang) * push;
      if (typeof onHurt === "function") {
        onHurt(opts.label || (boss.isMega ? "君主震地" : "震地轰击"), { weight: opts.weight || (boss.isMega ? 1.15 : 1.05) });
      }
    }
  }

  function doBolts(boss, ang) {
    const n = (boss.phase >= 2 ? 3 : 2) + (boss.isMega ? 2 : 0);
    const spd = cfg("BOSS_BOLT_SPEED", 210) * (boss.isMega ? 1.15 : 1);
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * 0.26;
      const a = ang + spread;
      fireHostile({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        r: boss.isMega ? 8 : 7,
        life: 2.8,
        color: boss.isMega ? "#ff70a0" : "#a090ff",
        kind: "dissonant"
      });
    }
  }

  /** 弹幕前摇：锁定朝向，到点再放 */
  function beginBoltTelegraph(boss, ang, delayMs, now) {
    const t = now || Date.now();
    boss.pendingBoltsAt = t + delayMs;
    boss.pendingBoltsAng = ang;
    addRipple(boss.x, boss.y, boss.isMega ? "#ff70a0" : "#a090ff", 0.55);
  }

  function updateBoss(ctx) {
    const { now, boss, player, notes, onHurt, onDevourFx, sfx } = ctx;
    const dt = ctx.dt || 0;
    if (!boss || !boss.isBoss) return;

    const rageAt = cfg("BOSS_RAGE_HP", 0.45);
    if (boss.hp < boss.maxHp * rageAt) {
      if (boss.phase < 2) {
        boss.phase = 2;
        boss.justEnraged = true;
        boss.rageLine = pickLine("enrage");
        const spdMul = cfg("BOSS_RAGE_SPEED_MUL", 1.14);
        const base = boss.baseSpeed != null ? boss.baseSpeed : boss.speed;
        boss.baseSpeed = base * spdMul;
        boss.speed = boss.baseSpeed;
        addRipple(boss.x, boss.y, "#ff4060", 1.1);
        playDissonance(sfx, (SD().BASE_MIDI || 60) - 7);
      }
    }

    const rage = boss.phase >= 2;
    const rageCdMul = rage ? cfg("BOSS_RAGE_SKILL_CD_MUL", 0.88) : 1;

    // I64 君主多阶段：阶段1 弹幕 → 阶段2 重砸+吞音 → 阶段3 解锁聚能激光
    if (boss.isMega) {
      const r = boss.hp / boss.maxHp;
      const st = r > 0.66 ? 1 : (r > 0.33 ? 2 : 3);
      if (st > (boss.megaStage || 1)) {
        boss.megaStage = st;
        boss.justStagedTo = st;
        boss.skillCdUntil = now + 420; // 进阶瞬间略作停顿，读得出变化
        addRipple(boss.x, boss.y, st >= 3 ? "#ff3050" : "#ff7040", 1.25);
        playDissonance(sfx, (SD().BASE_MIDI || 60) - (st >= 3 ? 10 : 6));
      } else if (!boss.megaStage) {
        boss.megaStage = 1;
      }
    }
    const devourR = (rage ? cfg("BOSS_DEVOUR_R_RAGE", 190) : cfg("BOSS_DEVOUR_R", 150))
      * (boss.isMega ? (rage ? cfg("MEGA_DEVOUR_R_RAGE_MUL", 1.42) : cfg("MEGA_DEVOUR_R_MUL", 1.3)) : 1);

    if (now >= (boss.devourCdUntil || 0)) {
      const eaten = devourNear(boss, notes, {
        radius: devourR,
        onEat(n) {
          if (typeof onDevourFx === "function") onDevourFx(n);
        }
      });
      const devourCd = (rage ? cfg("BOSS_DEVOUR_CD_RAGE", 2100) : cfg("BOSS_DEVOUR_CD", 3400))
        * (boss.isMega
          ? (rage ? cfg("MEGA_DEVOUR_CD_RAGE_MUL", 0.54) : cfg("MEGA_DEVOUR_CD_MUL", 0.62))
          : 0.88);
      boss.devourCdUntil = now + devourCd;
      if (eaten > 0) {
        addRipple(boss.x, boss.y, "#c070ff", 0.85);
        playDissonance(sfx, (SD().BASE_MIDI || 60) - 5);
        boss.beamCharge = (boss.beamCharge || 0) + eaten; // 吞音直接转化为激光蓄能
        if (typeof ctx.onStealPack === "function") ctx.onStealPack(eaten);
      }
    }

    // ---- I54 聚能激光：仅「最终 Boss / 不和谐君主」(mega) 专属；领主只是其附庸 ----
    if (boss.isMega) {
      boss.beamCharge = (boss.beamCharge || 0) + dt * cfg("BOSS_BEAM_CHARGE_RATE", 0.34) * 1.6 * (rage ? 1.3 : 1);
    }
    if (beam && beam.srcId === boss.id) {
      beam.x0 = boss.x; beam.y0 = boss.y;
      beam.t += dt * 1000;
      if (beam.state === "charge") {
        if (beam.t < beam.lockAt) {
          const desired = Math.atan2(player.y - boss.y, player.x - boss.x);
          let d = desired - beam.ang;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          beam.ang += d * Math.min(1, dt * cfg("BOSS_BEAM_TRACK", 2.1));
        }
        if (beam.t >= beam.chargeMs) {
          beam.state = "fire"; beam.t = 0;
          addRipple(boss.x, boss.y, beam.mega ? "#ff3050" : "#ff6030", 1.05);
          playDissonance(sfx, (SD().BASE_MIDI || 60) - 9);
        }
      } else if (beam.state === "fire") {
        const len = cfg("BOSS_BEAM_LEN", 1000);
        const half = cfg("BOSS_BEAM_WIDTH", 15) + (player.r || 12);
        if (distToRay(player.x, player.y, boss.x, boss.y, beam.ang, len) <= half) {
          if (typeof onHurt === "function") {
            onHurt(beam.mega ? "君主聚能激光" : "聚能激光", { weight: 1.35, beam: true });
          }
        }
        if (beam.t >= beam.fireMs) {
          const cd = cfg("BOSS_BEAM_CD", 4200) * (boss.isMega ? cfg("MEGA_BEAM_CD_MUL", 0.66) : 1) * (rage ? 0.82 : 1);
          boss.beamCdUntil = now + cd;
          beam = null;
        }
      }
      return; // 聚能/发射期间不叠其他技能，Boss 全力一击更可读
    }
    if (boss.isMega && (boss.megaStage || 1) >= 3 && !beam && !announce && boss.beamCharge >= cfg("BOSS_BEAM_CHARGE_NEED", 3) && now >= (boss.beamCdUntil || 0)) {
      const chargeMs = cfg("BOSS_BEAM_CHARGE_MS", 980) * (boss.isMega ? cfg("MEGA_BEAM_CHARGE_MS_MUL", 0.82) : 1);
      beam = {
        srcId: boss.id,
        x0: boss.x, y0: boss.y,
        ang: Math.atan2(player.y - boss.y, player.x - boss.x),
        state: "charge", t: 0,
        chargeMs,
        lockAt: chargeMs - cfg("BOSS_BEAM_LOCK_MS", 240),
        fireMs: cfg("BOSS_BEAM_FIRE_MS", 340),
        mega: boss.isMega
      };
      boss.beamCharge = 0;
      addRipple(boss.x, boss.y, boss.isMega ? "#ff3050" : "#ff8060", 1.2);
      playDissonance(sfx, (SD().BASE_MIDI || 60) - 11);
      if (typeof ctx.onBeamCharge === "function") ctx.onBeamCharge(boss, pickLine("laser"));
      return;
    }

    // 刚石领主·蓄力重装：预警脉动后重砸（更大范围/击退，无弹幕）
    if (boss.pendingSlamAt) {
      if (now >= boss.pendingSlamAt) {
        const a = Math.atan2(player.y - boss.y, player.x - boss.x);
        doSlam(boss, player, a, onHurt, {
          heavy: true,
          rMul: boss.isMega ? 1.7 : 1.55,
          push: boss.phase >= 2 ? 124 : 102,
          weight: boss.isMega ? 1.3 : 1.2,
          label: boss.isMega ? "君主·重装砸击" : "刚石·重装砸击"
        });
        boss.pendingSlamAt = 0;
      } else {
        if (!boss._slamFxAt || now - boss._slamFxAt > 150) {
          boss._slamFxAt = now;
          addRipple(boss.x, boss.y, "#ffcf80", 0.55);
        }
        return; // 蓄力中不叠其他技能
      }
    }

    // 弹幕前摇：虚线锥锁定后放出
    if (boss.pendingBoltsAt) {
      if (now >= boss.pendingBoltsAt) {
        doBolts(boss, boss.pendingBoltsAng != null
          ? boss.pendingBoltsAng
          : Math.atan2(player.y - boss.y, player.x - boss.x));
        boss.pendingBoltsAt = 0;
        boss.pendingBoltsAng = 0;
      } else {
        return;
      }
    }

    if (now < (boss.skillCdUntil || 0)) return;

    const ang = Math.atan2(player.y - boss.y, player.x - boss.x);
    if (boss.isMega) {
      const stage = boss.megaStage || 1;
      if (stage === 1) {
        beginBoltTelegraph(boss, ang, rage ? 280 : 380, now);
        boss.skillCdUntil = now + (rage ? 1200 : 1560) * rageCdMul;
      } else {
        boss.skillFlip = (boss.skillFlip || 0) + 1;
        if (boss.skillFlip % 2 === 1) {
          boss.pendingSlamAt = now + (rage ? 560 : 740);
          addRipple(boss.x, boss.y, "#ffcf80", 0.95);
        } else {
          beginBoltTelegraph(boss, ang, rage ? 260 : 340, now);
        }
        boss.skillCdUntil = now + (stage >= 3 ? (rage ? 980 : 1240) : (rage ? 1080 : 1400)) * rageCdMul;
      }
      playDissonance(sfx, (SD().BASE_MIDI || 60) - 2);
      return;
    }

    if (boss.typeId === "stone") {
      boss.pendingSlamAt = now + (rage ? 640 : 840);
      addRipple(boss.x, boss.y, "#ffcf80", 0.95);
      boss.skillCdUntil = now + (rage ? 2200 : 3000) * rageCdMul;
      playDissonance(sfx, SD().BASE_MIDI || 60);
    } else {
      beginBoltTelegraph(boss, ang, rage ? 300 : 420, now);
      boss.skillCdUntil = now + (rage ? 1320 : 2000) * rageCdMul;
      playDissonance(sfx, (SD().BASE_MIDI || 60) + 1);
    }
  }

  function beginDashTelegraph(enemy, ang, dist, durSec, cdMs, telegraphMs, now) {
    const t = now || Date.now();
    enemy.dashAng = ang;
    enemy.pendingDashDist = dist;
    enemy.pendingDashDur = durSec;
    enemy.pendingDashCd = cdMs;
    enemy.dashTelegraphUntil = t + telegraphMs;
    enemy.skillCdUntil = t + 999999; // 前摇/冲刺结束前不再触发
  }

  function updateMinion(ctx) {
    const { dt, now, enemy, player, frozen } = ctx;
    if (!enemy || enemy.isBoss || frozen) return;

    // 冲刺插值中：沿锁定方向滑行（禁止裸坐标跳跃）
    if (enemy.dashUntil && now < enemy.dashUntil) {
      enemy.x += (enemy.dashVx || 0) * (dt || 0.016);
      enemy.y += (enemy.dashVy || 0) * (dt || 0.016);
      return;
    }
    if (enemy.dashUntil && now >= enemy.dashUntil) {
      enemy.dashUntil = 0;
      enemy.dashVx = 0;
      enemy.dashVy = 0;
    }

    // 前摇结束 → 启动插值冲刺
    if (enemy.dashTelegraphUntil && now >= enemy.dashTelegraphUntil && enemy.pendingDashDist) {
      const ang = enemy.dashAng || 0;
      const dist = enemy.pendingDashDist;
      const dur = Math.max(0.12, enemy.pendingDashDur || 0.22);
      enemy.dashVx = Math.cos(ang) * (dist / dur);
      enemy.dashVy = Math.sin(ang) * (dist / dur);
      enemy.dashUntil = now + Math.floor(dur * 1000);
      enemy.blinkFlash = now + Math.floor(dur * 1000);
      enemy.dashTelegraphUntil = 0;
      enemy.pendingDashDist = 0;
      enemy.skillCdUntil = now + (enemy.pendingDashCd || 2800);
      addRipple(enemy.x, enemy.y, "#c8a0ff", 0.35);
      return;
    }
    if (enemy.dashTelegraphUntil && now < enemy.dashTelegraphUntil) return;

    if (!enemy.skillCdUntil) enemy.skillCdUntil = now + 800 + Math.random() * 1200;

    if (enemy.typeId === "shadow") {
      if (now >= enemy.skillCdUntil) {
        const ang = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        beginDashTelegraph(enemy, ang, 55, 0.2, 2800, 280, now);
      }
    } else if (enemy.typeId === "stone") {
      if (now >= enemy.skillCdUntil) {
        addRipple(enemy.x, enemy.y, "#c89050", 0.45);
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < 70) {
          player.x += (player.x - enemy.x) * 0.08;
          player.y += (player.y - enemy.y) * 0.08;
        }
        enemy.skillCdUntil = now + 3600;
      }
    } else if (enemy.typeId === "mist") {
      if (now >= enemy.skillCdUntil) {
        const ang = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        fireHostile({
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(ang) * 160,
          vy: Math.sin(ang) * 160,
          r: 5,
          life: 2.2,
          color: "#8090e8",
          kind: "mist"
        });
        enemy.skillCdUntil = now + 3200;
      }
    } else if (enemy.typeId === "dart") {
      if (now >= enemy.skillCdUntil) {
        const ang = Math.atan2(player.y - enemy.y, player.x - enemy.x) + (Math.random() - 0.5) * 0.6;
        beginDashTelegraph(enemy, ang, 70, 0.26, 2000, 320, now);
      }
    }
  }

  function updateHostile(dt, player, onHit) {
    for (let i = hostile.length - 1; i >= 0; i--) {
      const h = hostile[i];
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.life -= dt;
      if (Math.hypot(h.x - player.x, h.y - player.y) < player.r + h.r) {
        if (typeof onHit === "function") onHit(h);
        hostile.splice(i, 1);
        continue;
      }
      if (h.life <= 0) hostile.splice(i, 1);
    }
  }

  function updateFx(dt) {
    ripples.forEach((r) => {
      r.r += (r.maxR - r.r) * Math.min(1, dt * 4);
      r.life -= dt * 1.4;
    });
    ripples = ripples.filter((r) => r.life > 0);
  }

  function drawAnnounce(ctx, W, H, now) {
    if (!announce || !ctx) return;
    const t = 1 - (announce.until - now) / Math.max(1, announce.until - announce.startedAt);
    const pulse = 0.55 + Math.sin(now * 0.012) * 0.2;
    ctx.fillStyle = announce.mega
      ? `rgba(50, 4, 18, ${0.45 + t * 0.4})`
      : `rgba(40, 8, 12, ${0.35 + t * 0.35})`;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H * 0.38);
    ctx.scale(1 + t * 0.08, 1 + t * 0.08);
    ctx.fillStyle = `rgba(255, 120, 100, ${pulse})`;
    ctx.font = announce.mega ? "bold 48px Segoe UI,sans-serif" : "bold 42px Segoe UI,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(announce.mega ? "君主降临" : "BOSS 来袭", 0, 0);
    ctx.fillStyle = "rgba(255, 210, 180, 0.85)";
    ctx.font = "16px Segoe UI,sans-serif";
    ctx.fillText(`${announce.name} · 不和谐音吞噬星图`, 0, 36);
    if (announce.line) {
      ctx.fillStyle = `rgba(255, 150, 170, ${0.7 + pulse * 0.3})`;
      ctx.font = announce.mega ? "italic bold 22px Segoe UI,sans-serif" : "italic 19px Segoe UI,sans-serif";
      ctx.fillText(`「${announce.line}」`, 0, 68);
    }
    ctx.restore();
  }

  function drawBeam(ctx, now) {
    if (!ctx || !beam) return;
    const len = cfg("BOSS_BEAM_LEN", 1000);
    const ex = beam.x0 + Math.cos(beam.ang) * len;
    const ey = beam.y0 + Math.sin(beam.ang) * len;
    ctx.save();
    if (beam.state === "charge") {
      const p = Math.min(1, beam.t / beam.chargeMs);
      const locked = beam.t >= beam.lockAt;
      // 后摇 telegraph：虚线随蓄能变亮、锁定后转实线预警
      ctx.strokeStyle = beam.mega
        ? `rgba(255,${40 + p * 30},${70 + p * 20},${0.22 + p * 0.55})`
        : `rgba(255,${100 - p * 40},${70},${0.2 + p * 0.5})`;
      ctx.lineWidth = 2 + p * 3;
      ctx.lineCap = "round";
      if (!locked) { ctx.setLineDash([14, 11]); ctx.lineDashOffset = -(now * 0.06); }
      ctx.beginPath();
      ctx.moveTo(beam.x0, beam.y0);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([]);
      // 枪口蓄能光核
      const gr = 6 + p * 26 + (locked ? Math.sin(now * 0.05) * 4 : 0);
      const g = ctx.createRadialGradient(beam.x0, beam.y0, 0, beam.x0, beam.y0, gr);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.5, beam.mega ? "rgba(255,60,90,0.8)" : "rgba(255,140,90,0.8)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(beam.x0, beam.y0, gr, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const q = Math.max(0, 1 - beam.t / beam.fireMs);
      const w = cfg("BOSS_BEAM_WIDTH", 15) * (0.7 + q * 0.7);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.strokeStyle = beam.mega ? `rgba(255,60,90,${0.35 + q * 0.35})` : `rgba(255,120,70,${0.35 + q * 0.35})`;
      ctx.lineWidth = w * 2.4;
      ctx.beginPath(); ctx.moveTo(beam.x0, beam.y0); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.55 + q * 0.4})`;
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(beam.x0, beam.y0); ctx.lineTo(ex, ey); ctx.stroke();
    }
    ctx.restore();
  }

  function drawBossFx(ctx, now) {
    if (!ctx) return;
    drawBeam(ctx, now != null ? now : Date.now());
    ripples.forEach((r) => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 140, 90, ${Math.max(0, r.life)})`;
      ctx.lineWidth = 3;
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    hostile.forEach((h) => {
      const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r * 3);
      g.addColorStop(0, h.color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.arc(h.x, h.y, h.r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawSkillTelegraphs(ctx, now, enemies) {
    if (!ctx || !enemies) return;
    const t = now || Date.now();
    enemies.forEach((boss) => {
      if (!boss || !boss.isBoss) return;
      // 重砸预警圈
      if (boss.pendingSlamAt && t < boss.pendingSlamAt) {
        const slamR = (boss.phase >= 2 ? 165 : 125) * (boss.isMega ? 1.25 : 1) * (boss.isMega ? 1.55 : 1.55);
        const p = 1 - Math.max(0, (boss.pendingSlamAt - t) / 900);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 200, 120, ${0.35 + p * 0.5})`;
        ctx.lineWidth = 2 + p * 2;
        ctx.setLineDash([8, 6]);
        ctx.arc(boss.x, boss.y, slamR * (0.85 + p * 0.15), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255, 160, 80, ${0.06 + p * 0.1})`;
        ctx.fill();
      }
      // 弹幕锥预警
      if (boss.pendingBoltsAt && t < boss.pendingBoltsAt) {
        const ang = boss.pendingBoltsAng || 0;
        const len = 220;
        const n = (boss.phase >= 2 ? 3 : 2) + (boss.isMega ? 2 : 0);
        ctx.save();
        ctx.strokeStyle = boss.isMega ? "rgba(255,110,160,0.7)" : "rgba(160,140,255,0.65)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        for (let i = 0; i < n; i++) {
          const spread = (i - (n - 1) / 2) * 0.26;
          const a = ang + spread;
          ctx.beginPath();
          ctx.moveTo(boss.x, boss.y);
          ctx.lineTo(boss.x + Math.cos(a) * len, boss.y + Math.sin(a) * len);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }
    });
  }

  global.SpiritBoss = {
    reset,
    playDissonance,
    beginAnnounce,
    updateAnnounce,
    getAnnounce,
    buildBoss,
    devourNear,
    updateBoss,
    updateMinion,
    updateHostile,
    updateFx,
    clearBeam,
    drawAnnounce,
    drawBeam,
    drawBossFx,
    drawSkillTelegraphs
  };
})(typeof window !== "undefined" ? window : globalThis);
