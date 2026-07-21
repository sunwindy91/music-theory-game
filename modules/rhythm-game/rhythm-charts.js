/** 节奏天国式微关卡谱面 · time 为相对起始的秒数 */
const RHYTHM_CHARTS = [
  {
    id: "level-01",
    title: "拍一拍",
    subtitle: "四分音符 · 跟拍入门",
    theory: "一个四分音符 = 一拍，每拍敲一次",
    bpm: 70,
    emoji: "👏",
    beats: [0, 0.857, 1.714, 2.571, 3.429, 4.286, 5.143, 6],
    winAccuracy: 0.65
  },
  {
    id: "level-02",
    title: "咚咚哒",
    subtitle: "四分 + 八分组合",
    theory: "两拍长音 + 两拍短音，听「哒哒-哒」",
    bpm: 90,
    emoji: "🥁",
    beats: [0, 0.667, 1.333, 1.667, 2.667, 3.333, 4, 4.333],
    winAccuracy: 0.65
  },
  {
    id: "level-03",
    title: "附点一击",
    subtitle: "附点四分 + 八分",
    theory: "长–短节奏型，感受附点时值",
    bpm: 84,
    emoji: "🎵",
    beats: [0, 1.071, 2.143, 3.214, 4.286, 5.357],
    winAccuracy: 0.6
  },
  {
    id: "level-04",
    title: "跳跳跳",
    subtitle: "三连音入门",
    theory: "一拍里均匀分三份 · 哒-哒-哒",
    bpm: 72,
    emoji: "🎶",
    beats: [0, 0.278, 0.556, 0.833, 1.111, 1.389, 1.667, 1.944],
    winAccuracy: 0.6
  },
  {
    id: "level-05",
    title: "切分感",
    subtitle: "重音在弱拍",
    theory: "长–短–长型切分，感受「落在拍子之间」",
    bpm: 80,
    emoji: "🎭",
    beats: [0, 0.375, 0.75, 1.125, 1.875, 2.25, 2.625, 3.375],
    winAccuracy: 0.55
  },
  {
    id: "level-06",
    title: "6/8 摇",
    subtitle: "复合拍 · 两拍一大拍",
    theory: "6/8 拍：每小节 2 大拍，每大拍含 3 个八分音符",
    lessonIntro: "<p><strong>本关学什么</strong></p><ul><li>6/8 是「复合拍」：感觉像 <strong>2 拍</strong>，不是 6 拍</li><li>每拍里均匀 <strong>哒-哒-哒</strong> 三个八分</li><li>摇的感觉：强—弱，强—弱</li></ul>",
    bpm: 66,
    emoji: "🌊",
    beats: [0, 0.303, 0.606, 0.909, 1.212, 1.515, 1.818, 2.121],
    winAccuracy: 0.55
  },
  {
    id: "level-07",
    title: "休止一击",
    subtitle: "空拍与停顿",
    theory: "有些拍子不敲——听静音，只在有「点」的地方敲",
    lessonIntro: "<p><strong>本关学什么</strong></p><ul><li>节奏不只「敲」，还要会 <strong>等</strong></li><li>空拍（休止）也是音乐的一部分</li><li>眼睛跟谱点，该停就停</li></ul>",
    bpm: 78,
    emoji: "⏸️",
    beats: [0, 0.769, 1.538, 3.077, 3.846],
    winAccuracy: 0.5
  }
];

if (typeof window !== "undefined") {
  window.RHYTHM_CHARTS = RHYTHM_CHARTS;
}
