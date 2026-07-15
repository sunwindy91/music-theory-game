/**
 * 乐理符号翻翻乐 · 卡片数据
 * 16 对：音符 / 休止符 / 调号 / 力度记号 各 4 对
 * 每局 4×4 网格随机抽取其中 8 对（16 张牌）
 */
const SYMBOL_PAIRS = [
  // ── 音符 ×4 ──
  { id: "note-whole",   symbol: "全音符", name: "全音符",   soundType: "note-whole" },
  { id: "note-half",    symbol: "二分音符", name: "二分音符", soundType: "note-half" },
  { id: "note-quarter", symbol: "四分音符", name: "四分音符", soundType: "note-quarter" },
  { id: "note-eighth",  symbol: "八分音符", name: "八分音符", soundType: "note-eighth" },

  // ── 休止符 ×4 ──
  { id: "rest-whole",   symbol: "全休止", name: "全休止符",   soundType: "rest-whole" },
  { id: "rest-half",    symbol: "二分休止", name: "二分休止符", soundType: "rest-half" },
  { id: "rest-quarter", symbol: "四分休止", name: "四分休止符", soundType: "rest-quarter" },
  { id: "rest-eighth",  symbol: "八分休止", name: "八分休止符", soundType: "rest-eighth" },

  // ── 调号 ×4 ──
  { id: "key-C", symbol: "♮", name: "C 大调", soundType: "key-C" },
  { id: "key-G", symbol: "1♯",    name: "G 大调", soundType: "key-G" },
  { id: "key-F", symbol: "1♭",    name: "F 大调", soundType: "key-F" },
  { id: "key-D", symbol: "2♯",    name: "D 大调", soundType: "key-D" },

  // ── 力度记号 ×4 ──
  { id: "dyn-pp", symbol: "pp", name: "很弱", soundType: "dyn-pp" },
  { id: "dyn-p",  symbol: "p",  name: "弱",   soundType: "dyn-p" },
  { id: "dyn-f",  symbol: "f",  name: "强",   soundType: "dyn-f" },
  { id: "dyn-ff", symbol: "ff", name: "很强", soundType: "dyn-ff" }
];

if (typeof window !== "undefined") {
  window.SYMBOL_PAIRS = SYMBOL_PAIRS;
}
