/**
 * 星图波次积木 · SpiritWaves
 * 只负责「这一波出什么」；刷怪/喘息仍由主循环执行。
 * I03/I43：WAVE_STAGES 关卡表 + 教学节奏字段（lesson / exclusive / stagger）。
 */
(function (global) {
  const SD = () => global.SpiritData || {};

  function isMegaWave(w, data) {
    if (data.isMegaWave) return data.isMegaWave(w);
    const n = data.SECTOR_WAVES || 6;
    const slot = ((Math.max(1, w) - 1) % n) + 1;
    const sector = Math.floor((Math.max(1, w) - 1) / n);
    return slot === 6 && sector >= 1;
  }

  function stageKey(w) {
    if (w <= 12) return w;
    return ((w - 1) % 12) + 1;
  }

  function sectorBoostEscort(w, data, base) {
    const sector = data.sectorIndex ? data.sectorIndex(w) : Math.floor((w - 1) / (data.SECTOR_WAVES || 6));
    return Math.min(3, (base || 0) + Math.max(0, sector - 1));
  }

  function fromStage(w, stage, data) {
    if (!stage) return null;
    const title = stage.title || `第 ${w} 波`;
    const lesson = stage.lesson || stage.focus || "";
    const exclusive = stage.exclusive != null
      ? !!stage.exclusive
      : (data.STAGE_EXCLUSIVE !== false && !!(stage.preferred && stage.preferred.length));
    const stagger = data.STAGGER_MS != null ? data.STAGGER_MS : 700;
    const sector = data.sectorIndex ? data.sectorIndex(w) : 0;
    const sectorTag = data.SECTOR_NAMES && data.SECTOR_NAMES[Math.min(sector, (data.SECTOR_NAMES.length || 1) - 1)];

    if (stage.kind === "mega" || (stage.kind !== "boss" && isMegaWave(w, data))) {
      const esc = sectorBoostEscort(w, data, stage.escort != null ? stage.escort : 1);
      return {
        kind: "mega",
        bossTypeIndex: stage.bossTypeIndex != null ? stage.bossTypeIndex : 1,
        escort: esc,
        preferred: stage.preferred || null,
        exclusive: false,
        toast: `关卡 · ${title}`,
        hint: lesson || stage.focus || "噬律·失谐君主 · 多阶段 · 超级弹硬刚",
        title: sectorTag ? `${sectorTag} · ${title}` : title,
        lesson
      };
    }
    if (stage.kind === "boss") {
      const esc = sectorBoostEscort(w, data, stage.escort != null ? stage.escort : 0);
      return {
        kind: "boss",
        bossTypeIndex: stage.bossTypeIndex != null ? stage.bossTypeIndex : (w % 2 === 1 ? 1 : 2),
        escort: esc,
        preferred: stage.preferred || null,
        exclusive: false,
        toast: `关卡 · ${title}`,
        hint: lesson || stage.focus || "不和谐音 · 会吞音放技能 · 超级弹更稳",
        title: sectorTag ? `${sectorTag} · ${title}` : title,
        lesson
      };
    }
    const count = stage.count != null
      ? stage.count
      : (data.waveEnemyCount ? data.waveEnemyCount(w) : 3);
    const scaled = w > 12 ? Math.min(5, count + Math.floor((w - 1) / 12)) : count;
    return {
      kind: "normal",
      count: scaled,
      preferred: stage.preferred || null,
      exclusive,
      staggerMs: stagger,
      toast: `关卡 · ${title}`,
      hint: lesson || stage.focus || `第 ${w} 波 · 清场后可整备捡音`,
      title: sectorTag ? `${sectorTag} · ${title}` : title,
      lesson
    };
  }

  global.SpiritWaves = {
    plan(w) {
      const data = SD();
      const stages = data.WAVE_STAGES || {};
      const key = stageKey(w);
      const staged = stages[key];

      if (isMegaWave(w, data)) {
        const base = fromStage(w, Object.assign({}, staged || {}, { kind: "mega" }), data);
        return base || {
          kind: "mega",
          bossTypeIndex: 1,
          escort: sectorBoostEscort(w, data, 1),
          toast: `关卡 · 君主 · 第 ${w} 波`,
          hint: "噬律·失谐君主 · 多阶段 · 超级弹硬刚",
          title: "噬律·失谐君主"
        };
      }
      const isBoss = data.isBossWave
        ? data.isBossWave(w)
        : (() => {
            const n = data.SECTOR_WAVES || 6;
            const slot = ((Math.max(1, w) - 1) % n) + 1;
            const sector = Math.floor((Math.max(1, w) - 1) / n);
            if (slot === 6 && sector >= 1) return false;
            return slot === 3 || slot === 6;
          })();
      if (isBoss) {
        const base = fromStage(w, Object.assign({}, staged || {}, { kind: "boss" }), data);
        return base || {
          kind: "boss",
          bossTypeIndex: w % 2 === 1 ? 1 : 2,
          escort: sectorBoostEscort(w, data, 1),
          toast: `关卡 · Boss · 第 ${w} 波`,
          hint: "不和谐音 · 会吞音放技能 · 超级弹（T）更稳",
          title: "领主试炼"
        };
      }
      if (staged) return fromStage(w, Object.assign({}, staged, { kind: "normal" }), data);
      const count = data.waveEnemyCount
        ? data.waveEnemyCount(w)
        : (w <= 1 ? 2 : w <= 3 ? 2 : w <= 5 ? 3 : 4);
      return {
        kind: "normal",
        count,
        staggerMs: data.STAGGER_MS || 700,
        toast: `关卡 · 第 ${w} 波`,
        hint: `第 ${w} 波 · 清场后可整备捡音`,
        title: `第 ${w} 波`
      };
    },

    breathMs(w) {
      const data = SD();
      return w <= 2
        ? (data.BREATH_MS_EARLY || 2200)
        : (data.BREATH_MS_LATER || 1600);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
