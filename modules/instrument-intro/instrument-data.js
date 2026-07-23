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

const UKULELE_LESSONS = [
  {
    id: "intro-ukulele",
    title: "四弦与 gCEA",
    emoji: "🪕",
    intro: `
      <p>尤克里里常见 <strong>4 根弦</strong>，高音 G 调弦（自上而下）：<strong>G C E A</strong>（口诀 gCEA）。</p>
      <p>比吉他更短、音区更高，开放和弦 C、Am、F、G 最常用。</p>
      <p>先认弦名，再去「演奏练习」尤克页弹一弹。</p>`,
    visual: `
      <div class="ii-strings">
        <div class="ii-string"><span>④</span><strong>G</strong><small>高音 G</small></div>
        <div class="ii-string"><span>③</span><strong>C</strong></div>
        <div class="ii-string"><span>②</span><strong>E</strong></div>
        <div class="ii-string hl"><span>①</span><strong>A</strong><small>最细</small></div>
        <p class="ii-caption">口诀：gCEA（四到一弦）</p>
      </div>`,
    steps: [
      {
        prompt: "尤克里里高音 G 调弦的四弦音名是？",
        options: ["G C E A", "E A D G", "C G E A", "A E C G"],
        answer: 0
      },
      {
        prompt: "尤克里里相对吉他，通常？",
        options: ["弦更少、琴更短、音区偏高", "有 6 根弦", "只弹黑键", "不能弹和弦"],
        answer: 0
      },
      {
        prompt: "C 大三和弦的组成音是？",
        options: ["C E G", "C D F", "A C E", "G B D"],
        answer: 0
      },
      {
        prompt: "入门最常用的四个开放和弦常指？",
        options: ["C Am F G", "C# F# B E", "只弹空弦单音", "只用减和弦"],
        answer: 0
      }
    ]
  }
];

const VIOLIN_LESSONS = [
  {
    id: "intro-violin",
    title: "四弦与运弓",
    emoji: "🎻",
    intro: `
      <p>小提琴有 <strong>4 根弦</strong>，标准调弦（低→高）：<strong>G D A E</strong>，相邻两弦相差纯五度。</p>
      <p>它<strong>没有品</strong>：靠手指按在指板不同位置改变音高，靠<strong>运弓</strong>（拉动弓毛擦弦）发声。</p>
      <p>在「演奏练习 → 小提琴」里，选好弦与指位，再在运弓区按住来回拉动就能出声。</p>`,
    visual: `
      <div class="ii-strings">
        <div class="ii-string"><span>Ⅳ</span><strong>G</strong><small>最粗 · 最低</small></div>
        <div class="ii-string"><span>Ⅲ</span><strong>D</strong></div>
        <div class="ii-string"><span>Ⅱ</span><strong>A</strong></div>
        <div class="ii-string hl"><span>Ⅰ</span><strong>E</strong><small>最细 · 最高</small></div>
        <p class="ii-caption">四弦相差纯五度：G–D–A–E</p>
      </div>`,
    steps: [
      {
        prompt: "小提琴四弦从低到高是？",
        options: ["G D A E", "E A D G", "C G D A", "G C E A"],
        answer: 0
      },
      {
        prompt: "小提琴相邻两根弦的音程是？",
        hint: "和大提琴一样",
        options: ["纯五度", "纯四度", "大三度", "八度"],
        answer: 0
      },
      {
        prompt: "小提琴发声主要靠？",
        options: ["运弓擦弦（也可拨弦）", "只能吹气", "敲击琴身", "踩踏板"],
        answer: 0
      },
      {
        prompt: "小提琴改变音高靠？",
        options: ["手指按指板不同位置", "按不同的品", "换八度键", "转旋钮"],
        answer: 0
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.PIANO_LESSONS = PIANO_LESSONS;
  window.GUITAR_LESSONS = GUITAR_LESSONS;
  window.UKULELE_LESSONS = UKULELE_LESSONS;
  window.VIOLIN_LESSONS = VIOLIN_LESSONS;
}
