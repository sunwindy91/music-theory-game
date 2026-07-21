const PIANO_LESSONS = [
  {
    id: "intro-piano",
    title: "钢琴键盘与中央 C",
    emoji: "🎹",
    intro: `
      <p>钢琴从左到右音高逐渐升高。白键是 <strong>C D E F G A B</strong> 七个基本音，黑键是升/降半音。</p>
      <p><strong>中央 C（C4）</strong> 是找到音区的锚点，通常在键盘正中间附近。</p>
      <p>一组 7 白 + 5 黑 = 一个八度，音名循环重复。</p>`,
    visual: `
      <div class="ii-keyboard">
        <div class="ii-keys">
          <span class="ii-w">C</span><span class="ii-b">C#</span><span class="ii-w">D</span><span class="ii-b">D#</span>
          <span class="ii-w">E</span><span class="ii-w">F</span><span class="ii-b">F#</span><span class="ii-w">G</span>
          <span class="ii-b">G#</span><span class="ii-w">A</span><span class="ii-b">A#</span><span class="ii-w">B</span>
        </div>
        <p class="ii-caption">白键 = 基本音名 · 黑键 = 升半音</p>
      </div>`,
    steps: [
      {
        prompt: "钢琴白键循环的 7 个基本音名是？",
        options: ["C D E F G A B", "A B C D E F G", "Do Re Mi Fa Sol La Si Do", "C E G B D F A"],
        answer: 0
      },
      {
        prompt: "<strong>中央 C</strong> 通常用来做什么？",
        hint: "它是左右音区的参考点",
        options: ["定位音区与读谱", "只用于低音", "只在黑键上", "仅古典曲使用"],
        answer: 0
      },
      {
        prompt: "从 C 到高八度 C，跨越几个半音？",
        options: ["6 个", "8 个", "12 个", "7 个"],
        answer: 2
      },
      {
        prompt: "黑键 C# 相对于白键 C 是？",
        options: ["低半音", "高半音", "低全音", "同音"],
        answer: 1
      }
    ]
  }
];

const GUITAR_LESSONS = [
  {
    id: "intro-guitar",
    title: "六弦与开放和弦",
    emoji: "🎸",
    intro: `
      <p>标准吉他 <strong>6 根弦</strong>，从粗到细（六弦→一弦）：<strong>E A D G B E</strong>。</p>
      <p>左手按品格改变音高，每上一格升高半音；右手拨弦或扫弦发声。</p>
      <p>开放和弦不需按满所有弦，是入门最常用的伴奏方式。</p>`,
    visual: `
      <div class="ii-strings">
        <div class="ii-string"><span>⑥</span><strong>E</strong><small>最粗 · 最低</small></div>
        <div class="ii-string"><span>⑤</span><strong>A</strong></div>
        <div class="ii-string"><span>④</span><strong>D</strong></div>
        <div class="ii-string"><span>③</span><strong>G</strong></div>
        <div class="ii-string"><span>②</span><strong>B</strong></div>
        <div class="ii-string hl"><span>①</span><strong>E</strong><small>最细 · 最高</small></div>
        <p class="ii-caption">口诀：E A D G B E（六到一弦）</p>
      </div>`,
    steps: [
      {
        prompt: "吉他最粗的低音弦（六弦）空弦音是？",
        options: ["E", "A", "D", "G"],
        answer: 0
      },
      {
        prompt: "从一弦到六弦，空弦音名顺序是？",
        hint: "E A D G B E",
        options: ["E A D G B E", "G B E A D G", "C F A D G C", "A D G C E A"],
        answer: 0
      },
      {
        prompt: "C 大三和弦的组成音是？",
        options: ["C E G", "C D E", "C F A", "C G B"],
        answer: 0
      },
      {
        prompt: "Am（A 小三和弦）的组成音是？",
        options: ["A C E", "A C♯ E", "A B D", "A D F"],
        answer: 0
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.PIANO_LESSONS = PIANO_LESSONS;
  window.GUITAR_LESSONS = GUITAR_LESSONS;
}
