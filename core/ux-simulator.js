const UX_REPORTS_KEY = "mtg_ux_reports";
const UX_SIM_LS_KEY = "mtg_ux_sim";

const UxSimulator = (() => {
  function isEnabled() {
    if (typeof window === "undefined") return false;
    if (window.AppFeatures && AppFeatures.uxSimulator) return true;
    try {
      if (localStorage.getItem(UX_SIM_LS_KEY) === "1") return true;
    } catch { /* ignore */ }
    try {
      return new URLSearchParams(window.location.search).get("sim") === "1";
    } catch {
      return false;
    }
  }

  function makeReport() {
    return {
      runAt: new Date().toISOString(),
      passed: 0,
      warnings: [],
      failures: [],
      score: 0
    };
  }

  function pass(report, id) {
    report.passed++;
    report._checks = report._checks || [];
    report._checks.push({ id, status: "pass" });
  }

  function warn(report, id, message, suggestion) {
    report.warnings.push({ id, message, suggestion: suggestion || "" });
    report._checks = report._checks || [];
    report._checks.push({ id, status: "warn", message });
  }

  function fail(report, id, message, suggestion) {
    report.failures.push({ id, message, suggestion: suggestion || "" });
    report._checks = report._checks || [];
    report._checks.push({ id, status: "fail", message });
  }

  function finalizeReport(report) {
    const total = report.passed + report.warnings.length + report.failures.length;
    const score = total === 0 ? 100 : Math.round(
      ((report.passed + report.warnings.length * 0.5) / total) * 100
    );
    report.score = Math.max(0, Math.min(100, score - report.failures.length * 10));
    delete report._checks;
    return report;
  }

  function saveReport(report) {
    try {
      const list = JSON.parse(localStorage.getItem(UX_REPORTS_KEY) || "[]");
      list.unshift({ runAt: report.runAt, score: report.score, passed: report.passed, warnings: report.warnings.length, failures: report.failures.length });
      localStorage.setItem(UX_REPORTS_KEY, JSON.stringify(list.slice(0, 5)));
    } catch { /* ignore */ }
  }

  function checkStoreConsistency(report) {
    if (!window.WrongBookStore) {
      fail(report, "store-wrongbook", "WrongBookStore 未加载");
      return;
    }
    const due = WrongBookStore.getDueCount();
    const badge = document.getElementById("wrongBookDueBadge");
    if (badge) {
      const hidden = badge.classList.contains("hidden");
      const text = badge.textContent.trim();
      if (due > 0 && hidden) {
        fail(report, "badge-wrongbook-hidden", "错题本有待复习题但徽章隐藏", "检查 refreshReviewHint 是否在数据变更后调用");
      } else if (due === 0 && !hidden) {
        warn(report, "badge-wrongbook-visible", "无待复习题但徽章仍显示", "应在 due=0 时隐藏徽章");
      } else if (due > 0 && text !== String(due > 99 ? "99+" : due)) {
        fail(report, "badge-wrongbook-mismatch", `徽章文本 "${text}" 与 due=${due} 不一致`);
      } else {
        pass(report, "badge-wrongbook");
      }
    } else {
      warn(report, "badge-wrongbook-missing", "未找到 #wrongBookDueBadge 元素");
    }

    if (window.DailyChallengeStore && window.AppFeatures && AppFeatures.dailyChallenge) {
      const prog = DailyChallengeStore.getProgress();
      const dcBadge = document.getElementById("dailyChallengeBadge");
      if (dcBadge) {
        const hidden = dcBadge.classList.contains("hidden");
        if (prog.completed && !hidden) {
          warn(report, "badge-daily-completed", "每日挑战已完成但徽章仍显示", "完成后应隐藏或显示完成态");
        } else if (!prog.completed && prog.current > 0 && hidden) {
          fail(report, "badge-daily-hidden", "每日挑战进行中但徽章隐藏");
        } else {
          pass(report, "badge-daily");
        }
      }
    }
  }

  function checkDailyChallenge(report) {
    if (!window.DailyChallengeStore) {
      fail(report, "daily-store", "DailyChallengeStore 未加载");
      return;
    }
    const today = DailyChallengeStore.getTodayKey();
    const q1 = DailyChallengeStore.generateToday({ dateKey: today, force: true });
    const q2 = DailyChallengeStore.generateToday({ dateKey: today, force: true });

    if (q1.length !== 10) {
      fail(report, "daily-count", `题目数量 ${q1.length}，期望 10`);
    } else {
      pass(report, "daily-count");
    }

    const quizN = q1.filter(q => !q.isAudio).length;
    const audioN = q1.filter(q => q.isAudio).length;
    if (quizN !== 7 || audioN !== 3) {
      fail(report, "daily-mix", `题型比例 ${quizN} quiz + ${audioN} audio，期望 7+3`);
    } else {
      pass(report, "daily-mix");
    }

    const ids1 = q1.map(q => q.id).join(",");
    const ids2 = q2.map(q => q.id).join(",");
    if (ids1 !== ids2) {
      fail(report, "daily-seed-same", "同一天两次生成题目不一致");
    } else {
      pass(report, "daily-seed-same");
    }

    const tomorrow = new Date(today + "T12:00:00");
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = DailyChallengeStore.getTodayKey(tomorrow);
    const qTomorrow = DailyChallengeStore.generateToday({ dateKey: tomorrowKey, force: true });
    const idsTomorrow = qTomorrow.map(q => q.id).join(",");
    if (ids1 === idsTomorrow) {
      warn(report, "daily-seed-diff", "不同日期生成的题目相同（池子较小时可能发生）");
    } else {
      pass(report, "daily-seed-diff");
    }

    q1.forEach(q => {
      if (q.difficulty && q.difficulty !== 2 && !q.isAudio) {
        warn(report, "daily-diff", `非听音题难度 ${q.difficulty}，期望 2`);
      }
    });
    pass(report, "daily-diff-check");
  }

  function checkStreakLogic(report) {
    if (!window.DailyChallengeStore) return;

    const saved = localStorage.getItem("mtg_daily_challenge_v1");
    DailyChallengeStore.resetForTest();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = DailyChallengeStore.getTodayKey(yesterday);
    const tKey = DailyChallengeStore.getTodayKey();

    DailyChallengeStore._setStateForTest({
      dateKey: yKey,
      completed: true,
      progress: 10,
      streak: 1,
      lastCompletedDate: yKey
    });
    DailyChallengeStore.markComplete();
    const afterTwo = DailyChallengeStore.getStreak();
    if (afterTwo === 2) {
      pass(report, "streak-consecutive");
    } else {
      fail(report, "streak-consecutive", `连续完成 streak=${afterTwo}，期望 2`);
    }

    DailyChallengeStore.resetForTest();
    DailyChallengeStore._setStateForTest({
      streak: 5,
      lastCompletedDate: "2020-01-01"
    });
    DailyChallengeStore.markComplete();
    const afterGap = DailyChallengeStore.getStreak();
    if (afterGap === 1) {
      pass(report, "streak-gap-reset");
    } else {
      fail(report, "streak-gap-reset", `间隔后 streak=${afterGap}，期望 1`);
    }

    if (saved) localStorage.setItem("mtg_daily_challenge_v1", saved);
    else DailyChallengeStore.resetForTest();
  }

  function checkSrsWrongBook(report) {
    if (!window.WrongBookStore) return;

    const testQ = {
      id: "ux-sim-test-q",
      type: "测试",
      difficulty: 2,
      text: "UX 模拟测试题",
      options: ["A", "B", "C", "D"],
      answer: 0
    };

    WrongBookStore.recordWrong(testQ, "ux-sim", "B");
    const entry = WrongBookStore.getById("ux-sim-test-q");
    if (!entry) {
      fail(report, "srs-record", "recordWrong 未创建条目");
      return;
    }
    if (entry.stage !== 0) {
      fail(report, "srs-stage0", `新错题 stage=${entry.stage}，期望 0`);
    } else {
      pass(report, "srs-stage0");
    }

    WrongBookStore.recordReviewCorrect("ux-sim-test-q");
    const after = WrongBookStore.getById("ux-sim-test-q");
    if (after && after.stage === 1) {
      pass(report, "srs-stage-up");
    } else {
      fail(report, "srs-stage-up", `复习正确后 stage=${after ? after.stage : "null"}，期望 1`);
    }

    WrongBookStore.remove("ux-sim-test-q");
    pass(report, "srs-cleanup");
  }

  function checkEdgeCases(report) {
    if (window.WrongBookStore) {
      const total = WrongBookStore.getTotalCount();
      if (total >= 0) pass(report, "edge-wrongbook-read");
    }

    if (window.DailyChallengeStore) {
      const saved = localStorage.getItem("mtg_daily_challenge_v1");
      DailyChallengeStore._setStateForTest({
        dateKey: DailyChallengeStore.getTodayKey(),
        completed: true,
        progress: 10,
        lastCompletedDate: DailyChallengeStore.getTodayKey()
      });
      if (!DailyChallengeStore.canStart()) {
        pass(report, "edge-daily-no-restart");
      } else {
        fail(report, "edge-daily-no-restart", "已完成每日挑战仍允许开始");
      }
      if (saved) localStorage.setItem("mtg_daily_challenge_v1", saved);
      else DailyChallengeStore.resetForTest();
    }
  }

  function checkDomHeuristics(report) {
    const reviewGroup = document.getElementById("reviewGroup");
    if (!reviewGroup || reviewGroup.classList.contains("hidden")) {
      warn(report, "dom-review-hidden", "#reviewGroup 不可见，跳过 DOM 检查");
      return;
    }

    const hint = document.getElementById("reviewHint");
    if (hint && hint.textContent.trim().length > 0) {
      pass(report, "dom-hint-nonempty");
    } else {
      fail(report, "dom-hint-empty", "#reviewHint 为空");
    }

    if (window.AppFeatures && AppFeatures.wrongBook) {
      const wbChip = document.getElementById("chipWrongBook");
      if (wbChip && !wbChip.disabled && !wbChip.classList.contains("chip-soon")) {
        pass(report, "dom-wrongbook-enabled");
      } else if (wbChip) {
        fail(report, "dom-wrongbook-disabled", "错题本功能已开启但 chip 仍禁用");
      }
    }

    if (window.AppFeatures && AppFeatures.dailyChallenge) {
      const dcChip = document.getElementById("chipDailyChallenge");
      if (dcChip && !dcChip.disabled && !dcChip.classList.contains("chip-soon")) {
        pass(report, "dom-daily-enabled");
      } else if (dcChip) {
        fail(report, "dom-daily-disabled", "每日挑战功能已开启但 chip 仍禁用");
      }
    }

    if (document.getElementById("wrongBookDueBadge")) pass(report, "dom-badge-exists");
    else warn(report, "dom-badge-missing", "缺少错题本徽章元素");
  }

  function runAll() {
    const report = makeReport();
    checkStoreConsistency(report);
    checkDailyChallenge(report);
    checkStreakLogic(report);
    checkSrsWrongBook(report);
    checkEdgeCases(report);
    checkDomHeuristics(report);
    finalizeReport(report);
    saveReport(report);

    console.table([{
      时间: report.runAt,
      得分: report.score,
      通过: report.passed,
      警告: report.warnings.length,
      失败: report.failures.length
    }]);
    if (report.warnings.length) console.warn("UX 警告:", report.warnings);
    if (report.failures.length) console.error("UX 失败:", report.failures);

    return report;
  }

  function mountUI() {
    if (!isEnabled() || document.getElementById("uxSimFab")) return;

    const fab = document.createElement("button");
    fab.id = "uxSimFab";
    fab.type = "button";
    fab.textContent = "🤖 测评";
    fab.title = "运行 UX 模拟测评";
    fab.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      font-family: inherit; font-size: 0.85rem; font-weight: 700;
      padding: 10px 16px; border: none; border-radius: 50px;
      background: linear-gradient(135deg, #7c5cff, #5a3fd4);
      color: #fff; cursor: pointer;
      box-shadow: 0 4px 16px rgba(124,92,255,0.4);
      transition: transform 0.15s;
    `;
    fab.addEventListener("mouseenter", () => { fab.style.transform = "translateY(-2px)"; });
    fab.addEventListener("mouseleave", () => { fab.style.transform = ""; });

    const overlay = document.createElement("div");
    overlay.id = "uxSimOverlay";
    overlay.style.cssText = `
      display: none; position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.45); align-items: center; justify-content: center; padding: 16px;
    `;

    const panel = document.createElement("div");
    panel.style.cssText = `
      background: #fff; border-radius: 20px; max-width: 480px; width: 100%;
      max-height: 80vh; overflow-y: auto; padding: 24px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.2); font-family: inherit; color: #3d3a50;
    `;
    overlay.appendChild(panel);

    function showReport(report) {
      const scoreColor = report.score >= 80 ? "#4cd964" : report.score >= 50 ? "#ffb347" : "#ff6b6b";
      let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0;color:#7c5cff">🤖 UX 模拟测评</h3>
          <button type="button" id="uxSimClose" style="border:none;background:#f0ebff;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem">✕</button>
        </div>
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:2.5rem;font-weight:700;color:${scoreColor}">${report.score}</div>
          <div style="font-size:0.85rem;color:#7a7590">综合得分 · 通过 ${report.passed} · 警告 ${report.warnings.length} · 失败 ${report.failures.length}</div>
        </div>`;

      if (report.failures.length) {
        html += `<div style="margin-bottom:12px"><strong style="color:#ff6b6b">❌ 失败 (${report.failures.length})</strong><ul style="margin:8px 0 0;padding-left:20px;font-size:0.88rem;line-height:1.6">`;
        report.failures.forEach(f => {
          html += `<li><code>${f.id}</code>: ${f.message}${f.suggestion ? `<br><small style="color:#7a7590">💡 ${f.suggestion}</small>` : ""}</li>`;
        });
        html += `</ul></div>`;
      }

      if (report.warnings.length) {
        html += `<div style="margin-bottom:12px"><strong style="color:#ffb347">⚠️ 警告 (${report.warnings.length})</strong><ul style="margin:8px 0 0;padding-left:20px;font-size:0.88rem;line-height:1.6">`;
        report.warnings.forEach(w => {
          html += `<li><code>${w.id}</code>: ${w.message}${w.suggestion ? `<br><small style="color:#7a7590">💡 ${w.suggestion}</small>` : ""}</li>`;
        });
        html += `</ul></div>`;
      }

      if (!report.failures.length && !report.warnings.length) {
        html += `<p style="text-align:center;color:#4cd964;font-weight:600">✅ 全部检查通过！</p>`;
      }

      html += `<p style="font-size:0.75rem;color:#7a7590;text-align:center;margin-top:12px">${report.runAt}</p>`;
      panel.innerHTML = html;
      overlay.style.display = "flex";
      panel.querySelector("#uxSimClose").addEventListener("click", () => {
        overlay.style.display = "none";
      });
    }

    fab.addEventListener("click", () => {
      fab.disabled = true;
      fab.textContent = "⏳ 测评中…";
      setTimeout(() => {
        const report = runAll();
        showReport(report);
        fab.disabled = false;
        fab.textContent = "🤖 测评";
      }, 50);
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    });

    document.body.appendChild(fab);
    document.body.appendChild(overlay);
  }

  return { isEnabled, runAll, mountUI };
})();

if (typeof window !== "undefined") {
  window.UxSimulator = UxSimulator;
}
