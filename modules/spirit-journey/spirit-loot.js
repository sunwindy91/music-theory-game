/**
 * 星图掉落积木 · SpiritLoot
 * 击散掉落表 / 碎裂生成；捡取效果仍由主循环 apply。
 */
(function (global) {
  const SD = () => global.SpiritData || {};

  function enemyTypes() {
    return SD().ENEMY_TYPES || [];
  }

  function noteDefs() {
    return SD().NOTE_DEFS || [];
  }

  function lootMeta() {
    return SD().LOOT_META || {};
  }

  function pickDropDef(typeId) {
    const type = enemyTypes().find(t => t.id === typeId);
    const defs = noteDefs();
    const pcs = type && type.dropPcs;
    if (pcs && pcs.length && defs.length) {
      const pc = pcs[Math.floor(Math.random() * pcs.length)];
      return defs.find(d => d.pc === pc) || defs[0];
    }
    return defs[Math.floor(Math.random() * Math.max(1, defs.length))] || { letter: "C", pc: 0, color: "#5a8cff" };
  }

  function rollLootKind(typeId) {
    const type = enemyTypes().find(t => t.id === typeId);
    const table = (type && type.loot) || [{ kind: "note", w: 1 }];
    const total = table.reduce((s, row) => s + row.w, 0);
    let r = Math.random() * total;
    for (const row of table) {
      r -= row.w;
      if (r <= 0) return row.kind;
    }
    return table[0].kind;
  }

  function toastName(d) {
    if (d.kind === "note") return `音符 ${d.label}`;
    if (d.kind === "ammo_major") return "明快弹药";
    if (d.kind === "ammo_minor") return "阴郁弹药";
    if (d.kind === "ammo_flat") return "弹芯";
    if (d.kind === "armor") return "刚石碎片";
    if (d.kind === "swift") return "闪速碎片";
    if (d.kind === "heart") return "灵息";
    return d.label;
  }

  /**
   * @param {object} e 被击杀怪
   * @param {string} source ram|shot|flat
   * @param {{
   *   player: {x:number,y:number},
   *   loot: array,
   *   particles: array,
   *   floatTexts: array,
   *   showToast: function,
   *   playSung?: function
   * }} world
   */
  function shatter(e, source, world) {
    if (!e || !world) return [];
    const data = SD();
    const maxLoot = data.MAX_LOOT || 10;
    const baseMidi = data.BASE_MIDI || 60;
    const octs = data.OCTAVE_SHIFTS || [-12, 0, 12];
    const metaAll = lootMeta();

    const count = e.isBoss ? 2 : (Math.random() < 0.4 ? 1 : 2);
    const shardColor = source === "ram" ? "#ffe08a" : (e.color || "#c8b0ff");
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 2.4 + Math.random() * 4.8;
      world.particles.push({
        x: e.x, y: e.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 1 + Math.random() * 0.35,
        color: i % 3 === 0 ? "#fff6e0" : shardColor,
        r: 1.4 + Math.random() * 2.2
      });
    }

    const away = Math.atan2(e.y - world.player.y, e.x - world.player.x) || (Math.random() * Math.PI * 2);
    const drops = [];
    for (let i = 0; i < count; i++) {
      if (world.loot.length >= maxLoot) break;
      const kind = rollLootKind(e.typeId);
      const spread = (i - (count - 1) / 2) * 0.85;
      const ang = away + spread + (Math.random() - 0.5) * 0.3;
      const spd = 240 + Math.random() * 120;
      const meta = metaAll[kind] || metaAll.note || { label: "?", color: "#ccc", r: 10 };
      const ox = Math.cos(ang) * 22;
      const oy = Math.sin(ang) * 22;
      let noteDef = null;
      let midi = null;
      let label = meta.label;
      if (kind === "note") {
        noteDef = pickDropDef(e.typeId);
        midi = baseMidi + noteDef.pc + octs[Math.floor(Math.random() * octs.length)];
        label = noteDef.letter;
      }
      const orb = {
        kind, label,
        color: kind === "note" ? noteDef.color : meta.color,
        x: e.x + ox, y: e.y + oy,
        r: meta.r,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        pulse: Math.random() * Math.PI * 2,
        shine: 1.6,
        pickupAt: Date.now() + 480,
        noteDef, midi
      };
      world.loot.push(orb);
      world.particles.push({
        x: e.x, y: e.y,
        vx: Math.cos(ang) * (3.2 + Math.random()),
        vy: Math.sin(ang) * (3.2 + Math.random()),
        life: 1.15,
        color: orb.color,
        r: 2.2,
        letter: label
      });
      drops.push(orb);
    }

    const summary = drops.map(d => d.label).join(" ");
    world.floatTexts.push({
      x: e.x, y: e.y - 24,
      text: summary ? `✦ ${summary}` : (source === "ram" ? "撞击碎裂" : "碎裂"),
      life: 1.15,
      color: source === "ram" ? "#ffe08a" : "#e8d8ff"
    });

    if (typeof world.playSung === "function") {
      drops.filter(d => d.kind === "note" && d.midi != null).forEach((d, idx) => {
        setTimeout(() => { try { world.playSung(d.midi, 0.22, 0.12); } catch { /* */ } }, idx * 70);
      });
    }
    if (typeof world.showToast === "function") {
      world.showToast(summary
        ? `${e.name}掉落 · ${drops.map(d => toastName(d)).join(" · ")}`
        : `${e.name}击散`);
    }
    return drops;
  }

  global.SpiritLoot = {
    pickDropDef,
    rollLootKind,
    toastName,
    shatter
  };
})(typeof window !== "undefined" ? window : globalThis);
