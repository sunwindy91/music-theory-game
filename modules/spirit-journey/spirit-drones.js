/**
 * 星图僚机积木 · SpiritDrones (I23)
 * 听辨收编 · 炼化词条 · 绕圈射击。
 */
(function (global) {
  const SD = () => global.SpiritData || {};
  let drones = [];
  let satellites = []; // I55 卫星（3 同型僚机合成 · 大轨道规则公转）
  let orbitAngle = 0;
  let satAngle = 0;

  function cfg(key, fallback) {
    const v = SD()[key];
    return v != null ? v : fallback;
  }

  function nearestEnemyFrom(x, y, enemies) {
    let best = null;
    let bestD = Infinity;
    for (const e of enemies) {
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  function droneLabel(name) {
    return name ? `${name}僚机` : "暗涌僚机";
  }

  /** 炼化词条：按原型怪种 */
  function traitFor(typeId) {
    if (typeId === "stone") {
      return { id: "majorBias", label: "刚盾炼化·明快弹", kind: "major", damageMul: 1.35, intervalMul: 1.1, slow: 0, pierce: 0 };
    }
    if (typeId === "mist") {
      return { id: "minorFreeze", label: "雾灵炼化·阴郁弹", kind: "minor", damageMul: 1.15, intervalMul: 1.05, slow: 1.2, pierce: 0 };
    }
    if (typeId === "dart") {
      return { id: "swiftFire", label: "流曜炼化·速射", kind: "flat", damageMul: 0.9, intervalMul: 0.55, slow: 0, pierce: 0 };
    }
    return { id: "shadowPierce", label: "暗涌炼化·穿透平击", kind: "flat", damageMul: 1, intervalMul: 0.85, slow: 0, pierce: 1 };
  }

  /** I55/I56 卫星专名（元素主题） */
  function satelliteName(typeId) {
    if (typeId === "stone") return "磐卫·守心";
    if (typeId === "mist") return "幽卫·凝霜";
    if (typeId === "dart") return "流卫·迅光";
    return "暗卫·涌沙";
  }

  /** 卫星词条 = 僚机词条强化版（更高伤害 + 穿透 + 更大弹） */
  function satelliteTrait(typeId) {
    const base = traitFor(typeId);
    return {
      id: "sat_" + base.id,
      label: satelliteName(typeId),
      kind: base.kind,
      damageMul: (base.damageMul || 1) * cfg("SAT_DAMAGE_MUL", 2.1),
      intervalMul: 1,
      slow: (base.slow || 0) * 1.4,
      pierce: (base.pierce || 0) + 1,
      bulletR: 7
    };
  }

  /** 同型僚机满 DRONE_SAT_NEED → 合成一颗卫星 */
  function tryEvolveSatellite(typeId, ui) {
    const need = cfg("DRONE_SAT_NEED", 3);
    if (satellites.length >= cfg("SAT_MAX", 3)) return false;
    const same = drones.filter((d) => d.typeId === typeId);
    if (same.length < need) return false;
    // 消耗 need 个同型僚机
    let consumed = 0;
    drones = drones.filter((d) => {
      if (d.typeId === typeId && consumed < need) { consumed++; return false; }
      return true;
    });
    drones.forEach((d, i) => { d.slot = i; });
    const trait = satelliteTrait(typeId);
    const proto = same[0];
    satellites.push({
      typeId,
      name: satelliteName(typeId),
      tag: "卫",
      color: proto.color || "#3a2048",
      eye: proto.eye || "rgba(255,120,140,0.9)",
      angle: satAngle + satellites.length * (Math.PI * 2 / 3),
      lastFireAt: 0,
      trait
    });
    if (ui && typeof ui.showToast === "function") ui.showToast(`进化·${trait.label} · 卫星成型！`);
    if (ui && typeof ui.pushFloat === "function") {
      ui.pushFloat({ x: proto.x || 0, y: (proto.y || 0) - 40, text: `${trait.label} 卫星`, life: 1.6, color: "#ffe0a0" });
    }
    return true;
  }

  global.SpiritDrones = {
    reset() {
      drones = [];
      satellites = [];
      orbitAngle = 0;
      satAngle = 0;
    },

    /** I66 远征局快照 · 跨节点保留僚机/卫星 */
    exportState() {
      return {
        drones: drones.map((d) => ({
          typeId: d.typeId, name: d.name, tag: d.tag, color: d.color, eye: d.eye, slot: d.slot, trait: d.trait
        })),
        satellites: satellites.map((s) => ({
          typeId: s.typeId, name: s.name, tag: s.tag, color: s.color, eye: s.eye, angle: s.angle, trait: s.trait
        })),
        orbitAngle,
        satAngle
      };
    },

    importState(snap) {
      if (!snap) { this.reset(); return; }
      drones = Array.isArray(snap.drones) ? snap.drones.map((d, i) => ({
        typeId: d.typeId || "shadow",
        name: d.name || "暗涌",
        tag: d.tag || "僚",
        color: d.color || "#3a2048",
        eye: d.eye || "rgba(255,120,140,0.9)",
        slot: d.slot != null ? d.slot : i,
        lastFireAt: 0,
        trait: d.trait || traitFor(d.typeId || "shadow")
      })) : [];
      satellites = Array.isArray(snap.satellites) ? snap.satellites.map((s) => ({
        typeId: s.typeId || "shadow",
        name: s.name || satelliteName(s.typeId),
        tag: s.tag || "卫",
        color: s.color || "#3a2048",
        eye: s.eye || "rgba(255,120,140,0.9)",
        angle: s.angle || 0,
        lastFireAt: 0,
        trait: s.trait || satelliteTrait(s.typeId || "shadow")
      })) : [];
      orbitAngle = snap.orbitAngle || 0;
      satAngle = snap.satAngle || 0;
    },

    count() {
      return drones.length;
    },

    satCount() {
      return satellites.length;
    },

    tryRecruit(enemy, ui) {
      if (!enemy || enemy.isBoss) return false;
      const max = cfg("DRONE_MAX", 2);
      if (drones.length >= max) return false;
      if (Math.random() >= cfg("DRONE_RECRUIT_CHANCE", 0.12)) return false;

      const pending = {
        typeId: enemy.typeId || "shadow",
        name: enemy.name || "暗涌",
        tag: enemy.tag || "僚",
        color: enemy.color || "#3a2048",
        eye: enemy.eye || "rgba(255,120,140,0.9)",
        x: enemy.x,
        y: enemy.y,
        answer: enemy.typeId === "stone"
          ? "major"
          : enemy.typeId === "mist"
            ? "minor"
            : (Math.random() < 0.5 ? "major" : "minor")
      };

      if (ui && typeof ui.openListenRecruit === "function") {
        ui.openListenRecruit(pending);
        return true;
      }
      return this.commitRecruit(pending, ui);
    },

    commitRecruit(pending, ui) {
      if (!pending) return false;
      const max = cfg("DRONE_MAX", 2);
      if (drones.length >= max) return false;
      const trait = traitFor(pending.typeId);
      drones.push({
        typeId: pending.typeId || "shadow",
        name: pending.name || "暗涌",
        tag: pending.tag || "僚",
        color: pending.color || "#3a2048",
        eye: pending.eye || "rgba(255,120,140,0.9)",
        slot: drones.length,
        lastFireAt: 0,
        trait
      });
      const msg = `收编·${droneLabel(pending.name)} · ${trait.label}`;
      if (ui && typeof ui.showToast === "function") ui.showToast(msg);
      if (ui && typeof ui.pushFloat === "function") {
        ui.pushFloat({
          x: pending.x || 0,
          y: (pending.y || 0) - 32,
          text: trait.label,
          life: 1.2,
          color: "#b8ffe8"
        });
      }
      // I55：同型满 3 → 立即合成卫星
      tryEvolveSatellite(pending.typeId || "shadow", ui);
      return true;
    },

    update(rt) {
      if (!rt || !rt.player || !rt.enemies) return;
      const { dt, now, player, enemies, addBullet } = rt;
      orbitAngle += dt * cfg("DRONE_ORBIT_SPEED", 0.85);
      satAngle += dt * cfg("SAT_ORBIT_SPEED", 0.42);
      if (!enemies.length) return;

      // 卫星：大轨道规则公转 + 更强火力
      if (satellites.length && typeof addBullet === "function") {
        const satR = cfg("SAT_ORBIT_RADIUS", 74);
        const satInterval = cfg("SAT_FIRE_INTERVAL_MS", 1500);
        const baseDmgS = cfg("DRONE_FLAT_DAMAGE", 0.38);
        const speedS = cfg("DRONE_BULLET_SPEED", 340);
        satellites.forEach((s, i) => {
          const ang = satAngle + i * (Math.PI * 2 / Math.max(1, satellites.length));
          const ox = player.x + Math.cos(ang) * satR;
          const oy = player.y + Math.sin(ang) * satR * 0.9;
          if (now - s.lastFireAt < satInterval) return;
          const target = nearestEnemyFrom(ox, oy, enemies);
          if (!target) return;
          s.lastFireAt = now;
          let dx = target.x - ox, dy = target.y - oy;
          const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
          const t = s.trait;
          const kind = t.kind || "flat";
          const color = kind === "major" ? "#ffcf80" : kind === "minor" ? "#a8c0ff" : "#c8f8e0";
          addBullet({
            x: ox, y: oy, vx: dx * speedS, vy: dy * speedS, r: t.bulletR || 7,
            kind, color, life: 1.6, damage: baseDmgS * (t.damageMul || 1),
            slow: t.slow || 0, pierce: t.pierce || 0, hitIds: Object.create(null), fromDrone: true
          });
        });
      }

      if (!drones.length) return;
      const baseInterval = cfg("DRONE_FIRE_INTERVAL_MS", 1200);
      const radius = cfg("DRONE_ORBIT_RADIUS", 38);
      const baseDmg = cfg("DRONE_FLAT_DAMAGE", 0.38);
      const speed = cfg("DRONE_BULLET_SPEED", 340);

      drones.forEach((d, i) => {
        const trait = d.trait || traitFor(d.typeId);
        const interval = baseInterval * (trait.intervalMul || 1);
        const ang = orbitAngle + (d.slot * Math.PI) + i * 0.4;
        const ox = player.x + Math.cos(ang) * radius;
        const oy = player.y + Math.sin(ang) * radius * 0.92;

        if (now - d.lastFireAt < interval) return;
        const target = nearestEnemyFrom(player.x, player.y, enemies);
        if (!target) return;

        d.lastFireAt = now;
        let dirX = target.x - ox;
        let dirY = target.y - oy;
        const len = Math.hypot(dirX, dirY) || 1;
        dirX /= len;
        dirY /= len;

        const kind = trait.kind || "flat";
        const color = kind === "major" ? "#ffb060" : kind === "minor" ? "#90b0ff" : "#a8e8d0";

        if (typeof addBullet === "function") {
          addBullet({
            x: ox,
            y: oy,
            vx: dirX * speed,
            vy: dirY * speed,
            r: 4,
            kind,
            color,
            life: 1.35,
            damage: baseDmg * (trait.damageMul || 1),
            slow: trait.slow || 0,
            pierce: trait.pierce || 0,
            hitIds: Object.create(null),
            fromDrone: true
          });
        }
      });
    },

    draw(ctx, player, now) {
      if (!ctx || !player) return;

      // 卫星：大轨道 + 更大的星体 + 光环
      if (satellites.length) {
        const satR = cfg("SAT_ORBIT_RADIUS", 74);
        satellites.forEach((s, i) => {
          const ang = satAngle + i * (Math.PI * 2 / Math.max(1, satellites.length));
          const x = player.x + Math.cos(ang) * satR;
          const y = player.y + Math.sin(ang) * satR * 0.9;
          const pulse = 0.9 + Math.sin(now * 0.003 + i) * 0.12;
          const r = 13 * pulse;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
          g.addColorStop(0, s.color);
          g.addColorStop(0.45, "rgba(255, 220, 150, 0.4)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
          // 光环
          ctx.strokeStyle = "rgba(255, 220, 160, 0.55)";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(x, y, r * 1.7, r * 0.7, ang, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill();
          ctx.beginPath();
          ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2);
          ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
          ctx.fillStyle = s.eye; ctx.fill();
          ctx.fillStyle = "rgba(255, 240, 200, 0.95)";
          ctx.font = "bold 10px Segoe UI,sans-serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(s.tag, x, y + r + 9);
        });
      }

      if (!drones.length) return;
      const radius = cfg("DRONE_ORBIT_RADIUS", 38);

      drones.forEach((d, i) => {
        const ang = orbitAngle + (d.slot * Math.PI) + i * 0.4;
        const x = player.x + Math.cos(ang) * radius;
        const y = player.y + Math.sin(ang) * radius * 0.92;
        const pulse = 0.85 + Math.sin(now * 0.004 + i) * 0.12;
        const r = 8 * pulse;

        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8);
        g.addColorStop(0, d.color);
        g.addColorStop(0.5, "rgba(168, 232, 208, 0.35)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - 2.5, y - 1.5, 1.5, 0, Math.PI * 2);
        ctx.arc(x + 2.5, y - 1.5, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = d.eye;
        ctx.fill();

        ctx.fillStyle = "rgba(200, 255, 240, 0.9)";
        ctx.font = "bold 9px Segoe UI,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.tag, x, y + r + 8);
      });
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
