/**
 * 星图成长积木 · SpiritEvo
 * 叠层阶位、三选一文案与选择效果描述；主循环负责改玩家状态。
 */
(function (global) {
  const SD = () => global.SpiritData || {};

  /** 进化池加厚：每次三选一从池中抽 3 条 */
  const CHOICES = [
    { id: "life", title: "生命上限 +1", desc: "更耐打，适合稳扎稳打学和弦" },
    { id: "steal", title: "生命偷取", desc: "正确击杀时有机会回 1 命" },
    { id: "craft", title: "合弦精通", desc: "立即 +2 超级弹；之后 T 合成多得 1 发" },
    { id: "ammo", title: "弹药补给", desc: "大三+3 · 小三+3 · 立刻可打" },
    { id: "shield", title: "刚盾凝成", desc: "刚盾 +2，挡一次碰撞伤害" },
    { id: "swift", title: "流光步伐", desc: "永久移速小幅提升（可叠）" }
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  global.SpiritEvo = {
    choices() {
      return CHOICES.slice();
    },

    /** 随机抽 3 条（不足则全给） */
    pickThree() {
      return shuffle(CHOICES).slice(0, 3);
    },

    tierLabel(tier) {
      return tier === 1
        ? "进化 I · 选一条成长（体型与撞击已解锁）"
        : "龙鳞 II · 再选一条强化";
    },

    tierFromKills(correctKills) {
      const t1 = SD().STACK_T1 || 10;
      const t2 = SD().STACK_T2 || 20;
      if (correctKills >= t2) return 2;
      if (correctKills >= t1) return 1;
      return 0;
    },

    baseStats(tier) {
      if (tier <= 0) return { baseR: 14, maxLives: 3 };
      if (tier === 1) return { baseR: 18, maxLives: 4 };
      return { baseR: 22, maxLives: 5 };
    },

    /**
     * @returns {{ toast: string, patch: object }}
     * patch：maxLivesDelta, livesDelta, lifeStealDelta, craftMaster, ammoSuperDelta,
     *        ammoMajorDelta, ammoMinorDelta, armorDelta, swiftStack, selectAmmo
     */
    applyChoice(id) {
      if (id === "life") {
        return {
          toast: "生命上限提升",
          patch: { maxLivesDelta: 1, livesDelta: 1 }
        };
      }
      if (id === "steal") {
        return {
          toast: "生命偷取",
          patch: { lifeStealDelta: 1 }
        };
      }
      if (id === "craft") {
        return {
          toast: "合弦精通 · 超级弹 +2",
          patch: { craftMaster: true, ammoSuperDelta: 2, selectAmmo: "super" }
        };
      }
      if (id === "ammo") {
        return {
          toast: "弹药补给 · 大+3 小+3",
          patch: { ammoMajorDelta: 3, ammoMinorDelta: 3 }
        };
      }
      if (id === "shield") {
        return {
          toast: "刚盾凝成 · +2",
          patch: { armorDelta: 2 }
        };
      }
      if (id === "swift") {
        return {
          toast: "流光步伐 · 移速提升",
          patch: { swiftStack: 1 }
        };
      }
      return { toast: "已选择", patch: {} };
    },

    craftYield(traitCraftMaster) {
      return traitCraftMaster ? 2 : 1;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
