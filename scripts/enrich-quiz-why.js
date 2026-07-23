/**
 * One-shot: ensure every QUIZ_BANK item has a why field (keeps existing why).
 * Run: node scripts/enrich-quiz-why.js
 */
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "core", "quiz-bank.js");
let s = fs.readFileSync(p, "utf8");
const start = s.indexOf("const QUIZ_BANK = [");
const end = s.indexOf("\n];", start);
if (start < 0 || end < 0) {
  console.error("parse fail");
  process.exit(1);
}
const arrText = s.slice(start + "const QUIZ_BANK = ".length, end + 2);
// eslint-disable-next-line no-eval
const bank = eval("(" + arrText + ")");
let added = 0;
bank.forEach((q) => {
  if (q.why) return;
  const c = q.options && q.options[q.answer] != null ? q.options[q.answer] : "";
  q.why = q.hint
    ? `为什么：${q.hint} · 正解「${c}」`
    : `为什么：正确答案是「${c}」。先想再选更稳。`;
  added++;
});
const header = `/**
 * 题库 · 综合练习 / 错题本 / 每日挑战共用
 * 格式：{ type, difficulty, text, hint?, why?, options, answer, topicId? }
 */
`;
function fmt(obj, indent = 0) {
  const pad = "  ".repeat(indent);
  if (Array.isArray(obj)) {
    if (obj.every((x) => typeof x === "string" || typeof x === "number" || typeof x === "boolean")) {
      return "[" + obj.map((x) => JSON.stringify(x)).join(", ") + "]";
    }
    return "[\n" + obj.map((x) => pad + "  " + fmt(x, indent + 1)).join(",\n") + "\n" + pad + "]";
  }
  if (obj && typeof obj === "object") {
    const keys = Object.keys(obj);
    return (
      "{ " +
      keys
        .map((k) => {
          const v = obj[k];
          return `${k}: ${JSON.stringify(v)}`;
        })
        .join(", ") +
      " }"
    );
  }
  return JSON.stringify(obj);
}
const body =
  "const QUIZ_BANK = [\n" +
  bank.map((q) => "  " + fmt(q)).join(",\n") +
  "\n];\n\n" +
  'if (typeof window !== "undefined") {\n  window.QUIZ_BANK = QUIZ_BANK;\n}\n';
fs.writeFileSync(p, header + body);
console.log("enriched", added, "of", bank.length);
