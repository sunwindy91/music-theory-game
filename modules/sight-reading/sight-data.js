const SIGHT_LESSONS = [
  {
    id: "lesson-01",
    title: "高音谱号线音",
    emoji: "📏",
    intro: "高音谱号五线四间，从下到上记线音：<strong>E G B D F</strong>（Every Good Boy Does Fine）",
    demoNotes: [
      { pitch: "E4", highlight: true },
      { pitch: "G4", highlight: true },
      { pitch: "B4", highlight: true },
      { pitch: "D5", highlight: true },
      { pitch: "F5", highlight: true }
    ],
    questions: [
      {
        prompt: "点击谱上的 <strong>G（Sol）</strong>",
        notes: [
          { pitch: "E4", id: "E4" },
          { pitch: "G4", id: "G4" },
          { pitch: "B4", id: "B4" },
          { pitch: "D5", id: "D5" }
        ],
        answer: "G4"
      },
      {
        prompt: "点击谱上的 <strong>E（Mi）</strong> · 第一线",
        notes: [
          { pitch: "F4", id: "F4" },
          { pitch: "E4", id: "E4" },
          { pitch: "G4", id: "G4" },
          { pitch: "A4", id: "A4" }
        ],
        answer: "E4"
      },
      {
        prompt: "点击谱上的 <strong>B（Si）</strong> · 第三线",
        notes: [
          { pitch: "G4", id: "G4" },
          { pitch: "A4", id: "A4" },
          { pitch: "B4", id: "B4" },
          { pitch: "C5", id: "C5" }
        ],
        answer: "B4"
      }
    ]
  },
  {
    id: "lesson-02",
    title: "中央 C 与下加线",
    emoji: "🎯",
    intro: "中央 C（C4）在谱表下方加一条短线上；D4 在下方一间",
    demoNotes: [
      { pitch: "C4", highlight: true },
      { pitch: "D4", highlight: true },
      { pitch: "E4", highlight: true }
    ],
    questions: [
      {
        prompt: "点击 <strong>中央 C（Do）</strong>",
        notes: [
          { pitch: "D4", id: "D4" },
          { pitch: "C4", id: "C4" },
          { pitch: "E4", id: "E4" },
          { pitch: "G4", id: "G4" }
        ],
        answer: "C4"
      },
      {
        prompt: "点击 <strong>D（Re）</strong> · 下加一间",
        notes: [
          { pitch: "C4", id: "C4" },
          { pitch: "D4", id: "D4" },
          { pitch: "F4", id: "F4" },
          { pitch: "E4", id: "E4" }
        ],
        answer: "D4"
      },
      {
        prompt: "哪个是 <strong>中央 C</strong>？",
        notes: [
          { pitch: "E4", id: "E4" },
          { pitch: "G4", id: "G4" },
          { pitch: "C4", id: "C4" },
          { pitch: "A4", id: "A4" }
        ],
        answer: "C4"
      }
    ]
  },
  {
    id: "lesson-03",
    title: "四分与八分音符",
    emoji: "♩",
    intro: "符头相同，<strong>符杆 + 旗</strong> 决定时值：四分一 beat，八分半 beat",
    demoNotes: [
      { pitch: "G4", noteType: "quarter", highlight: true },
      { pitch: "A4", noteType: "eighth", highlight: true }
    ],
    questions: [
      {
        prompt: "点击 <strong>四分音符</strong> ♩",
        noteTypeQuiz: true,
        notes: [
          { pitch: "G4", id: "q1", noteType: "quarter" },
          { pitch: "B4", id: "e1", noteType: "eighth" },
          { pitch: "D5", id: "q2", noteType: "quarter" }
        ],
        answer: "q1"
      },
      {
        prompt: "点击 <strong>八分音符</strong> ♪",
        noteTypeQuiz: true,
        notes: [
          { pitch: "E4", id: "q3", noteType: "quarter" },
          { pitch: "G4", id: "e2", noteType: "eighth" },
          { pitch: "C5", id: "q4", noteType: "quarter" }
        ],
        answer: "e2"
      },
      {
        prompt: "点击 <strong>八分音符</strong>",
        noteTypeQuiz: true,
        notes: [
          { pitch: "A4", id: "e3", noteType: "eighth" },
          { pitch: "F4", id: "q5", noteType: "quarter" },
          { pitch: "D5", id: "e4", noteType: "eighth" }
        ],
        answer: "e4"
      }
    ]
  },
  {
    id: "lesson-04",
    title: "高音谱表间音",
    emoji: "🎹",
    intro: "四间音从下到上：<strong>F A C E</strong>（Face 脸）— 在「线」与「线」之间",
    demoNotes: [
      { pitch: "F4", highlight: true },
      { pitch: "A4", highlight: true },
      { pitch: "C5", highlight: true },
      { pitch: "E5", highlight: true }
    ],
    questions: [
      {
        prompt: "点击间音 <strong>A（La）</strong>",
        notes: [
          { pitch: "G4", id: "G4" },
          { pitch: "A4", id: "A4" },
          { pitch: "B4", id: "B4" },
          { pitch: "C5", id: "C5" }
        ],
        answer: "A4"
      },
      {
        prompt: "点击间音 <strong>F（Fa）</strong> · 第一间",
        notes: [
          { pitch: "E4", id: "E4" },
          { pitch: "F4", id: "F4" },
          { pitch: "G4", id: "G4" },
          { pitch: "A4", id: "A4" }
        ],
        answer: "F4"
      },
      {
        prompt: "点击间音 <strong>C5（Do）</strong> · 第三间",
        notes: [
          { pitch: "B4", id: "B4" },
          { pitch: "D5", id: "D5" },
          { pitch: "C5", id: "C5" },
          { pitch: "E5", id: "E5" }
        ],
        answer: "C5"
      }
    ]
  },
  {
    id: "lesson-05",
    title: "线音 + 间音综合",
    emoji: "⭐",
    intro: "复习 <strong>E G B D F</strong> 线音与 <strong>F A C E</strong> 间音，快速辨认",
    demoNotes: [
      { pitch: "E4", highlight: true },
      { pitch: "F4", highlight: true },
      { pitch: "G4", highlight: true },
      { pitch: "A4", highlight: true },
      { pitch: "B4", highlight: true }
    ],
    questions: [
      {
        prompt: "点击 <strong>D5（Re）</strong> · 第四线",
        notes: [
          { pitch: "C5", id: "C5" },
          { pitch: "E5", id: "E5" },
          { pitch: "D5", id: "D5" },
          { pitch: "B4", id: "B4" }
        ],
        answer: "D5"
      },
      {
        prompt: "点击 <strong>E5</strong> · 第四间",
        notes: [
          { pitch: "D5", id: "D5" },
          { pitch: "F5", id: "F5" },
          { pitch: "E5", id: "E5" },
          { pitch: "C5", id: "C5" }
        ],
        answer: "E5"
      },
      {
        prompt: "点击 <strong>F5（Fa）</strong> · 第五线",
        notes: [
          { pitch: "D5", id: "D5" },
          { pitch: "E5", id: "E5" },
          { pitch: "F5", id: "F5" },
          { pitch: "G4", id: "G4" }
        ],
        answer: "F5"
      }
    ]
  },
  {
    id: "lesson-06",
    title: "上加线音",
    emoji: "⬆️",
    intro: "第五线 <strong>F5</strong> 之上用<strong>上加线</strong>记更高的音，如 <strong>G5、A5</strong>",
    demoNotes: [
      { pitch: "F5", highlight: true },
      { pitch: "G5", highlight: true },
      { pitch: "A5", highlight: true }
    ],
    questions: [
      {
        prompt: "点击 <strong>G5（Sol）</strong> · 上加一线",
        notes: [
          { pitch: "F5", id: "F5" },
          { pitch: "G5", id: "G5" },
          { pitch: "E5", id: "E5" },
          { pitch: "D5", id: "D5" }
        ],
        answer: "G5"
      },
      {
        prompt: "点击 <strong>A5（La）</strong> · 上加一间",
        notes: [
          { pitch: "G5", id: "G5" },
          { pitch: "A5", id: "A5" },
          { pitch: "F5", id: "F5" },
          { pitch: "E5", id: "E5" }
        ],
        answer: "A5"
      },
      {
        prompt: "点击 <strong>F5（Fa）</strong> · 第五线",
        notes: [
          { pitch: "G5", id: "G5" },
          { pitch: "D5", id: "D5" },
          { pitch: "F5", id: "F5" },
          { pitch: "E5", id: "E5" }
        ],
        answer: "F5"
      }
    ]
  },
  {
    id: "lesson-07",
    title: "音区综合复习",
    emoji: "🌟",
    intro: "从 <strong>C4</strong> 到 <strong>A5</strong> 混合辨认，练熟高音谱常用音区",
    demoNotes: [
      { pitch: "C4", highlight: true },
      { pitch: "G4", highlight: true },
      { pitch: "C5", highlight: true },
      { pitch: "G5", highlight: true }
    ],
    questions: [
      {
        prompt: "点击 <strong>中央 C（C4）</strong>",
        notes: [
          { pitch: "D4", id: "D4" },
          { pitch: "C4", id: "C4" },
          { pitch: "E4", id: "E4" },
          { pitch: "G4", id: "G4" }
        ],
        answer: "C4"
      },
      {
        prompt: "点击 <strong>B4（Si）</strong> · 第三线",
        notes: [
          { pitch: "A4", id: "A4" },
          { pitch: "C5", id: "C5" },
          { pitch: "B4", id: "B4" },
          { pitch: "G4", id: "G4" }
        ],
        answer: "B4"
      },
      {
        prompt: "点击 <strong>G5</strong>",
        notes: [
          { pitch: "A5", id: "A5" },
          { pitch: "F5", id: "F5" },
          { pitch: "G5", id: "G5" },
          { pitch: "E5", id: "E5" }
        ],
        answer: "G5"
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.SIGHT_LESSONS = SIGHT_LESSONS;
}
