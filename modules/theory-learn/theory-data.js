const THEORY_LESSONS = [
  {
    id: "theory-notes",
    title: "音名与谱表基础",
    emoji: "🎵",
    intro: `
      <p>音乐用 <strong>7 个基本音名</strong>：C D E F G A B（Do Re Mi Fa Sol La Si）。</p>
      <p>高音谱号（𝄞）是最常见的谱号。五线四间从<strong>下到上</strong>记音：</p>
      <ul>
        <li><strong>线音</strong>：E G B D F（Every Good Boy Does Fine）</li>
        <li><strong>间音</strong>：F A C E（Face 脸）</li>
      </ul>
      <p>中央 C（C4）在谱表下方加一条短线上，是连接高低音区的桥梁。</p>`,
    visual: `
      <div class="tl-staff-demo">
        <div class="tl-staff-line"><span class="tl-note">F5</span></div>
        <div class="tl-staff-line"><span class="tl-note">D5</span></div>
        <div class="tl-staff-line"><span class="tl-note hl">B4</span></div>
        <div class="tl-staff-line"><span class="tl-note">G4</span></div>
        <div class="tl-staff-line"><span class="tl-note hl">E4</span></div>
        <p class="tl-caption">高音谱号 · 五线（E-G-B-D-F）</p>
      </div>`,
    steps: [
      {
        prompt: "高音谱号下，<strong>第一线</strong>（最下面一条线）是什么音？",
        hint: "线音口诀：Every Good Boy Does Fine",
        options: ["E（Mi）", "G（Sol）", "C（Do）", "F（Fa）"],
        answer: 0
      },
      {
        prompt: "高音谱号下，<strong>第三线</strong>是什么音？",
        options: ["A（La）", "B（Si）", "G（Sol）", "D（Re）"],
        answer: 1
      },
      {
        prompt: "四间音从下到上拼出什么单词？",
        hint: "F A C E",
        options: ["FACE（脸）", "BEAD（珠子）", "CAFE（咖啡）", "DEAF（聋）"],
        answer: 0
      },
      {
        prompt: "<strong>中央 C</strong> 在高音谱表上的位置是？",
        options: ["谱表下方加一线", "第三线", "第五线", "谱表上方加一线"],
        answer: 0
      }
    ]
  },
  {
    id: "theory-intervals",
    title: "音程入门",
    emoji: "📐",
    intro: `
      <p><strong>音程</strong>是两个音之间的「距离」，用「度」来衡量。</p>
      <p>从 C 出发数到目标音（含首尾）：</p>
      <ul>
        <li>C → D = <strong>大二度</strong>（2 个半音）</li>
        <li>C → E = <strong>大三度</strong>（4 个半音）</li>
        <li>C → F = <strong>纯四度</strong>（5 个半音）</li>
        <li>C → G = <strong>纯五度</strong>（7 个半音）</li>
      </ul>
      <p>纯八度是同音名的上下关系，听起来最和谐。</p>`,
    visual: `
      <div class="tl-interval-demo">
        <div class="tl-pair"><span>C</span><span class="tl-arrow">→</span><span>D</span><span class="tl-label">大二度</span></div>
        <div class="tl-pair"><span>C</span><span class="tl-arrow">→</span><span>E</span><span class="tl-label">大三度</span></div>
        <div class="tl-pair"><span>C</span><span class="tl-arrow">→</span><span>G</span><span class="tl-label">纯五度</span></div>
      </div>`,
    steps: [
      {
        prompt: "从 C 到 D 是什么音程？",
        hint: "C→D 数两个音，相差 2 个半音",
        options: ["纯一度", "大二度", "小三度", "纯四度"],
        answer: 1
      },
      {
        prompt: "从 C 到 E 是什么音程？",
        options: ["大二度", "小三度", "大三度", "纯四度"],
        answer: 2
      },
      {
        prompt: "从 C 到 G 是什么音程？",
        options: ["纯四度", "增四度", "纯五度", "小六度"],
        answer: 2
      },
      {
        prompt: "从 C 到高八度 C 是什么音程？",
        options: ["小七度", "大七度", "纯八度", "增八度"],
        answer: 2
      }
    ]
  },
  {
    id: "theory-triads",
    title: "和弦构成",
    emoji: "🎹",
    intro: `
      <p><strong>三和弦</strong>由三个音叠加而成：根音 + 三度 + 五度。</p>
      <ul>
        <li><strong>大三和弦</strong>：大三度 + 小三度（明亮）→ 如 C-E-G</li>
        <li><strong>小三和弦</strong>：小三度 + 大三度（柔和）→ 如 A-C-E</li>
      </ul>
      <p>常见大三和弦：C（C-E-G）、G（G-B-D）、F（F-A-C）</p>
      <p>常见小三和弦：Am（A-C-E）、Dm（D-F-A）、Em（E-G-B）</p>`,
    visual: `
      <div class="tl-triad-demo">
        <div class="tl-triad">
          <span class="tl-root">C</span>
          <span class="tl-third">E</span>
          <span class="tl-fifth">G</span>
          <p class="tl-caption">C 大三和弦</p>
        </div>
      </div>`,
    steps: [
      {
        prompt: "C 大三和弦由哪三个音组成？",
        hint: "根音 C + 大三度 E + 纯五度 G",
        options: ["C D E", "C E G", "C F A", "C E A"],
        answer: 1
      },
      {
        prompt: "G 大三和弦由哪三个音组成？",
        options: ["G B D", "G A B", "G C E", "G D F"],
        answer: 0
      },
      {
        prompt: "A 小三和弦（Am）的组成音是？",
        options: ["A C E", "A C♯ E", "A B D", "A D F"],
        answer: 0
      },
      {
        prompt: "大三和弦与小三和弦的主要区别是？",
        options: [
          "根音不同",
          "三音与根音之间的音程大小不同",
          "五音总是降半音",
          "只有三个音 vs 四个音"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "theory-keys",
    title: "调号入门",
    emoji: "🔑",
    intro: `
      <p><strong>调号</strong>写在谱号后面，表示整首曲子哪些音要升或降。</p>
      <ul>
        <li><strong>C 大调</strong>：无升降号</li>
        <li><strong>G 大调</strong>：1 个升号（F♯）</li>
        <li><strong>F 大调</strong>：1 个降号（B♭）</li>
        <li><strong>D 大调</strong>：2 个升号（F♯、C♯）</li>
      </ul>
      <p>升号顺序口诀：<strong>F C G D A E B</strong>（FCGDAEB）</p>`,
    visual: `
      <div class="tl-interval-demo">
        <div class="tl-pair"><span>C</span><span class="tl-arrow">→</span><span>0♯</span><span class="tl-label">C 大调</span></div>
        <div class="tl-pair"><span>G</span><span class="tl-arrow">→</span><span>1♯</span><span class="tl-label">F♯</span></div>
        <div class="tl-pair"><span>F</span><span class="tl-arrow">→</span><span>1♭</span><span class="tl-label">B♭</span></div>
      </div>`,
    steps: [
      {
        prompt: "C 大调有几个升降号？",
        options: ["0 个", "1 个升号", "1 个降号", "2 个升号"],
        answer: 0
      },
      {
        prompt: "G 大调的调号是？",
        hint: "G 大调只有一个升号 F♯",
        options: ["无升降号", "1 个升号（F♯）", "1 个降号（B♭）", "2 个降号"],
        answer: 1
      },
      {
        prompt: "F 大调的调号是？",
        options: ["1 个升号", "1 个降号（B♭）", "2 个升号", "3 个降号"],
        answer: 1
      },
      {
        prompt: "D 大调有几个升号？",
        options: ["1 个", "2 个", "3 个", "4 个"],
        answer: 1
      }
    ]
  },
  {
    id: "theory-meter",
    title: "拍号与时值",
    emoji: "🥁",
    intro: `
      <p><strong>拍号</strong>如 4/4、3/4，告诉你每小节有几拍、以什么音符为一拍。</p>
      <ul>
        <li><strong>4/4</strong>：每小节 4 拍，四分音符为一拍（最常见）</li>
        <li><strong>3/4</strong>：每小节 3 拍，华尔兹感</li>
        <li><strong>2/4</strong>：每小节 2 拍，进行曲感</li>
      </ul>
      <p>时值：<strong>全音符 4 拍 · 二分 2 拍 · 四分 1 拍 · 八分 半拍</strong></p>`,
    visual: `
      <div class="tl-triad-demo">
        <p class="tl-caption">4/4 拍 · 一小节可装 4 个四分音符</p>
        <div class="tl-pair"><span>♩</span><span class="tl-arrow">=</span><span>1拍</span></div>
        <div class="tl-pair"><span>♪♪</span><span class="tl-arrow">=</span><span>1拍</span></div>
      </div>`,
    steps: [
      {
        prompt: "4/4 拍中，一小节最多几个四分音符？",
        options: ["2 个", "3 个", "4 个", "8 个"],
        answer: 2
      },
      {
        prompt: "一个四分音符等于几个八分音符？",
        options: ["1 个", "2 个", "3 个", "4 个"],
        answer: 1
      },
      {
        prompt: "3/4 拍每小节有几拍？",
        options: ["2 拍", "3 拍", "4 拍", "6 拍"],
        answer: 1
      },
      {
        prompt: "附点四分音符的时值等于？",
        hint: "四分 + 八分",
        options: ["1 个四分 + 1 个八分", "2 个四分", "1 个二分", "3 个八分"],
        answer: 0
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.THEORY_LESSONS = THEORY_LESSONS;
}
