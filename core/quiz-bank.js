/**
 * 题库 · 80+ 道选择题
 * 格式：{ type, difficulty, text, hint?, options, answer, topicId? }
 */
const QUIZ_BANK = [
  // ══ 音名识别 ×17 ══
  { type: "音名识别", difficulty: 1, topicId: "theory-notes", text: "高音谱号下，第一线是什么音？", hint: "线音从下到上：E G B D F", options: ["E（Mi）", "G（Sol）", "C（Do）", "F（Fa）"], answer: 0 },
  { type: "音名识别", difficulty: 1, topicId: "theory-notes", text: "低音谱号下，第二线是什么音？", options: ["G（Sol）", "B（Si）", "D（Re）", "A（La）"], answer: 2 },
  { type: "音名识别", difficulty: 1, topicId: "theory-notes", text: "高音谱号下，第三线是什么音？", options: ["A（La）", "B（Si）", "G（Sol）", "D（Re）"], answer: 1 },
  { type: "音名识别", difficulty: 1, topicId: "theory-notes", text: "高音谱号下，第二间是什么音？", hint: "间音：F A C E", options: ["F（Fa）", "A（La）", "C（Do）", "E（Mi）"], answer: 1 },
  { type: "音名识别", difficulty: 1, topicId: "theory-notes", text: "中央 C 又叫什么？", options: ["C3", "C4", "C5", "C2"], answer: 1 },
  { type: "音名识别", difficulty: 1, topicId: "theory-notes", text: "从 C 到 D 升高几个半音？", options: ["0 个", "1 个", "2 个", "3 个"], answer: 1 },
  { type: "音名识别", difficulty: 2, topicId: "theory-notes", text: "下列哪个音名带升号？", options: ["F", "F♯", "G♭", "E♭"], answer: 1 },
  { type: "音名识别", difficulty: 2, topicId: "theory-notes", text: "C 大调中，B 音与 C 音之间相差几个半音？", hint: "B 到 C 是相邻音", options: ["0 个", "1 个", "2 个", "3 个"], answer: 1 },
  { type: "音名识别", difficulty: 2, topicId: "theory-notes", text: "高音谱号下，第五线是什么音？", options: ["D（Re）", "E（Mi）", "F（Fa）", "G（Sol）"], answer: 2 },
  { type: "音名识别", difficulty: 2, topicId: "theory-notes", text: "低音谱号下，第一线是什么音？", options: ["G（Sol）", "B（Si）", "D（Re）", "A（La）"], answer: 0 },
  { type: "音名识别", difficulty: 2, topicId: "theory-notes", text: "E♭ 与 D♯ 是什么关系？", options: ["不同音", "等音", "相差全音", "相差半音"], answer: 1 },
  { type: "音名识别", difficulty: 2, topicId: "theory-notes", text: "一个八度包含几个半音？", options: ["6 个", "8 个", "12 个", "7 个"], answer: 2 },
  { type: "音名识别", difficulty: 3, topicId: "theory-notes", text: "下列哪组是等音（同音异名）关系？", options: ["C 与 D", "F♯ 与 G♭", "E 与 F", "G 与 A"], answer: 1 },
  { type: "音名识别", difficulty: 3, topicId: "theory-notes", text: "高音谱号下，下加二线是什么音？", hint: "下加线从中央 C 往下数", options: ["A（La）", "B（Si）", "G（Sol）", "D（Re）"], answer: 0 },
  { type: "音名识别", difficulty: 3, topicId: "theory-notes", text: "C♯ 与 D♭ 是什么关系？", options: ["相差半音", "等音", "相差全音", "纯一度"], answer: 1 },
  { type: "音名识别", difficulty: 3, topicId: "theory-notes", text: "自然大调音阶中，Mi 到 Fa 之间是？", options: ["全音", "半音", "小三度", "大三度"], answer: 1 },
  { type: "音名识别", difficulty: 3, topicId: "theory-notes", text: "B♭ 大调中，主音是？", options: ["A", "B♭", "F", "E♭"], answer: 1 },

  // ══ 音程识别 ×17 ══
  { type: "音程识别", difficulty: 1, topicId: "theory-intervals", text: "从 C 到 D 是什么音程？", options: ["纯一度", "大二度", "小三度", "纯四度"], answer: 1 },
  { type: "音程识别", difficulty: 1, topicId: "theory-intervals", text: "从 C 到 E 是什么音程？", hint: "C→D→E 共 4 个半音", options: ["大二度", "小三度", "大三度", "纯四度"], answer: 2 },
  { type: "音程识别", difficulty: 1, topicId: "theory-intervals", text: "从 C 到 C（高八度）包含几个半音？", options: ["6 个", "8 个", "10 个", "12 个"], answer: 3 },
  { type: "音程识别", difficulty: 1, topicId: "theory-intervals", text: "纯一度是指？", options: ["同音", "相邻半音", "相邻全音", "纯八度"], answer: 0 },
  { type: "音程识别", difficulty: 1, topicId: "theory-intervals", text: "从 G 到 B 是什么音程？", options: ["大二度", "小三度", "大三度", "纯四度"], answer: 2 },
  { type: "音程识别", difficulty: 1, topicId: "theory-intervals", text: "从 E 到 F 是什么音程？", options: ["大二度", "小二度", "小三度", "纯一度"], answer: 1 },
  { type: "音程识别", difficulty: 2, topicId: "theory-intervals", text: "从 C 到 F 是什么音程？", options: ["大三度", "纯四度", "纯五度", "大六度"], answer: 1 },
  { type: "音程识别", difficulty: 2, topicId: "theory-intervals", text: "从 C 到 G 是什么音程？", options: ["纯四度", "增四度", "纯五度", "小六度"], answer: 2 },
  { type: "音程识别", difficulty: 2, topicId: "theory-intervals", text: "从 D 到 A 是什么音程？", options: ["纯四度", "纯五度", "大六度", "小七度"], answer: 1 },
  { type: "音程识别", difficulty: 2, topicId: "theory-intervals", text: "从 F 到 A 是什么音程？", options: ["大二度", "小三度", "大三度", "纯四度"], answer: 2 },
  { type: "音程识别", difficulty: 2, topicId: "theory-intervals", text: "增四度又称什么？", options: ["三全音", "完全四度", "减五度", "大六度"], answer: 0 },
  { type: "音程识别", difficulty: 2, topicId: "theory-intervals", text: "从 A 到 C 是什么音程？", options: ["大二度", "小三度", "大三度", "纯四度"], answer: 1 },
  { type: "音程识别", difficulty: 3, topicId: "theory-intervals", text: "从 C 到 A 是什么音程？", options: ["纯五度", "小六度", "大六度", "小七度"], answer: 2 },
  { type: "音程识别", difficulty: 3, topicId: "theory-intervals", text: "从 C 到高八度 C 是什么音程？", options: ["小七度", "大七度", "纯八度", "增八度"], answer: 2 },
  { type: "音程识别", difficulty: 3, topicId: "theory-intervals", text: "从 C 到 B 是什么音程？", options: ["大六度", "小七度", "大七度", "纯八度"], answer: 2 },
  { type: "音程识别", difficulty: 3, topicId: "theory-intervals", text: "C 到 E♭ 是什么音程？", options: ["大二度", "小三度", "大三度", "纯四度"], answer: 1 },
  { type: "音程识别", difficulty: 3, topicId: "theory-intervals", text: "完全协和音程不包括？", options: ["纯一度", "纯四度", "大六度", "纯八度"], answer: 2 },

  // ══ 节奏型识别 ×17 ══
  { type: "节奏型识别", difficulty: 1, text: "一个四分音符的时值等于几个八分音符？", options: ["1 个", "2 个", "3 个", "4 个"], answer: 1 },
  { type: "节奏型识别", difficulty: 1, text: "一个全音符的时值等于几个四分音符？", options: ["2 个", "3 个", "4 个", "8 个"], answer: 2 },
  { type: "节奏型识别", difficulty: 1, text: "一个二分音符的时值等于几个四分音符？", options: ["1 个", "2 个", "3 个", "4 个"], answer: 1 },
  { type: "节奏型识别", difficulty: 1, text: "4/4 拍号的含义是？", options: ["每小节 4 拍，四分音符为一拍", "每小节 4 拍，八分音符为一拍", "每小节 2 拍", "每小节 8 拍"], answer: 0 },
  { type: "节奏型识别", difficulty: 1, text: "休止符的作用是？", options: ["升高半音", "降低半音", "表示静音", "延长音符"], answer: 2 },
  { type: "节奏型识别", difficulty: 1, text: "3/4 拍每小节有几拍？", options: ["2 拍", "3 拍", "4 拍", "6 拍"], answer: 1 },
  { type: "节奏型识别", difficulty: 2, text: "附点四分音符的时值等于？", options: ["1 个四分 + 1 个八分", "2 个四分", "1 个二分", "2 个八分"], answer: 0 },
  { type: "节奏型识别", difficulty: 2, text: "4/4 拍中，一小节最多能容纳几个四分音符？", options: ["2 个", "3 个", "4 个", "8 个"], answer: 2 },
  { type: "节奏型识别", difficulty: 2, text: "两个八分音符等于几个四分音符？", options: ["1/2 个", "1 个", "2 个", "4 个"], answer: 1 },
  { type: "节奏型识别", difficulty: 2, text: "2/4 拍适合什么风格的节奏感？", options: ["华尔兹", "进行曲", "摇滚", "自由节奏"], answer: 1 },
  { type: "节奏型识别", difficulty: 2, text: "附点二分音符等于几个四分音符？", options: ["2 个", "3 个", "4 个", "6 个"], answer: 1 },
  { type: "节奏型识别", difficulty: 2, text: "十六分音符的时值是四分音符的？", options: ["1/2", "1/4", "1/8", "1/16"], answer: 1 },
  { type: "节奏型识别", difficulty: 3, text: "三连音的含义是？", options: ["三个音占两拍的时值", "三个音占三拍的时值", "三个音占一拍", "三个音占四拍"], answer: 0 },
  { type: "节奏型识别", difficulty: 3, text: "6/8 拍是以几分音符为一拍？", hint: "复合拍号：每拍含三个八分音符", options: ["四分音符", "八分音符", "附点四分音符", "二分音符"], answer: 2 },
  { type: "节奏型识别", difficulty: 3, text: "切分节奏的特点是？", options: ["强拍落在正拍上", "强拍落在弱拍上", "没有强弱", "只有全音符"], answer: 1 },
  { type: "节奏型识别", difficulty: 3, text: "9/8 拍每小节有几个附点四分音符拍？", options: ["2 个", "3 个", "4 个", "6 个"], answer: 1 },
  { type: "节奏型识别", difficulty: 3, text: "Syncopation（切分）常见于？", options: ["古典慢板", "爵士与流行", "宗教圣歌", "无节奏音乐"], answer: 1 },

  // ══ 调号识别 ×17 ══
  { type: "调号识别", difficulty: 1, text: "C 大调有几个升降号？", options: ["0 个", "1 个升号", "1 个降号", "2 个升号"], answer: 0 },
  { type: "调号识别", difficulty: 1, text: "G 大调的调号是什么？", hint: "G 大调只有一个升号", options: ["无升降号", "1 个升号（F♯）", "1 个降号（B♭）", "2 个升号"], answer: 1 },
  { type: "调号识别", difficulty: 1, text: "大调音阶由几种音级组成？", options: ["5 种", "6 种", "7 种", "8 种"], answer: 2 },
  { type: "调号识别", difficulty: 1, text: "F 大调有几个降号？", options: ["0 个", "1 个", "2 个", "3 个"], answer: 1 },
  { type: "调号识别", difficulty: 1, text: "调号写在谱号的？", options: ["后面", "前面", "下方", "任意位置"], answer: 0 },
  { type: "调名识别", difficulty: 1, text: "A 小调与哪个大调共用调号？", options: ["G 大调", "C 大调", "F 大调", "D 大调"], answer: 1 },
  { type: "调号识别", difficulty: 2, text: "F 大调的调号是什么？", options: ["1 个升号", "1 个降号（B♭）", "2 个降号", "3 个升号"], answer: 1 },
  { type: "调号识别", difficulty: 2, text: "D 大调有几个升号？", options: ["1 个", "2 个", "3 个", "4 个"], answer: 1 },
  { type: "调号识别", difficulty: 2, text: "关系小调是指？", options: ["同主音大小调", "同调号大小调", "相差半音", "无关联"], answer: 1 },
  { type: "调号识别", difficulty: 2, text: "C 大调的关系小调是？", options: ["C 小调", "A 小调", "E 小调", "D 小调"], answer: 1 },
  { type: "调号识别", difficulty: 2, text: "G 大调的关系小调是？", options: ["G 小调", "E 小调", "B 小调", "D 小调"], answer: 1 },
  { type: "调号识别", difficulty: 2, text: "升号顺序口诀中，第一个升号是？", options: ["C♯", "F♯", "G♯", "D♯"], answer: 1 },
  { type: "调号识别", difficulty: 3, text: "E 大调有几个升号？", options: ["3 个", "4 个", "5 个", "6 个"], answer: 1 },
  { type: "调号识别", difficulty: 3, text: "Bb 大调有几个降号？", options: ["1 个", "2 个", "3 个", "4 个"], answer: 1 },
  { type: "调号识别", difficulty: 3, text: "A 大调有几个升号？", options: ["2 个", "3 个", "4 个", "5 个"], answer: 1 },
  { type: "调号识别", difficulty: 3, text: "降号顺序中，最后一个常见降号是？", options: ["B♭", "E♭", "A♭", "D♭"], answer: 0 },
  { type: "调号识别", difficulty: 3, text: "同主音大小调的关系是？", options: ["调号相同", "主音相同，调号不同", "音阶相同", "无关系"], answer: 1 },

  // ══ 和弦识别 ×17 ══
  { type: "和弦识别", difficulty: 1, topicId: "theory-triads", text: "C 大三和弦由哪三个音组成？", options: ["C D E", "C E G", "C F A", "C E A"], answer: 1 },
  { type: "和弦识别", difficulty: 1, topicId: "theory-triads", text: "G 大三和弦由哪三个音组成？", options: ["G B D", "G A B", "G C E", "G D F"], answer: 0 },
  { type: "和弦识别", difficulty: 1, topicId: "theory-triads", text: "三和弦有几个音？", options: ["2 个", "3 个", "4 个", "5 个"], answer: 1 },
  { type: "和弦识别", difficulty: 1, topicId: "theory-triads", text: "F 大三和弦的组成音是？", options: ["F A C", "F G A", "F A♭ C", "F G B"], answer: 0 },
  { type: "和弦识别", difficulty: 1, topicId: "theory-triads", text: "和弦根音是指？", options: ["最高的音", "最低的音", "中间的音", "任意音"], answer: 1 },
  { type: "和弦识别", difficulty: 1, topicId: "theory-triads", text: "Em 和弦是什么性质？", options: ["大三和弦", "小三和弦", "属七和弦", "减和弦"], answer: 1 },
  { type: "和弦识别", difficulty: 2, topicId: "theory-triads", text: "A 小三和弦由哪三个音组成？", options: ["A C E", "A C♯ E", "A B D", "A D F"], answer: 0 },
  { type: "和弦识别", difficulty: 2, topicId: "theory-triads", text: "D 小三和弦的组成音是？", options: ["D F A", "D F♯ A", "D G B", "D E A"], answer: 0 },
  { type: "和弦识别", difficulty: 2, topicId: "theory-triads", text: "C 和弦转位后，E 在最低音称为？", options: ["原位", "第一转位", "第二转位", "第三转位"], answer: 1 },
  { type: "和弦识别", difficulty: 2, topicId: "theory-triads", text: "属七和弦包含几个音？", options: ["3 个", "4 个", "5 个", "7 个"], answer: 1 },
  { type: "和弦识别", difficulty: 2, topicId: "theory-triads", text: "Bdim 是什么和弦？", options: ["大三和弦", "小三和弦", "减三和弦", "增三和弦"], answer: 2 },
  { type: "和弦识别", difficulty: 2, topicId: "theory-triads", text: "I - IV - V 进行常见于？", options: ["仅爵士", "大量流行与古典", "仅电子音乐", "无调性音乐"], answer: 1 },
  { type: "和弦识别", difficulty: 3, topicId: "theory-triads", text: "C 属七和弦（C7）包含哪个音？", options: ["B", "B♭", "E♭", "F♯"], answer: 1 },
  { type: "和弦识别", difficulty: 3, topicId: "theory-triads", text: "减三和弦的音程结构是？", hint: "根音 → 小三度 → 再小三度", options: ["大三度 + 小三度", "小三度 + 小三度", "小三度 + 大三度", "大三度 + 大三度"], answer: 1 },
  { type: "和弦识别", difficulty: 3, topicId: "theory-triads", text: "增三和弦的音程结构是？", options: ["大三度 + 大三度", "小三度 + 小三度", "大三度 + 小三度", "纯五度 + 大三度"], answer: 0 },
  { type: "和弦识别", difficulty: 3, topicId: "theory-triads", text: "G7 和弦中，七音是？", options: ["G", "B", "D", "F"], answer: 3 },
  { type: "和弦识别", difficulty: 3, topicId: "theory-triads", text: "C 大调中的 V 级和弦是？", options: ["C", "F", "G", "Am"], answer: 2 },

  // ══ 钢琴入门 ×6 ══
  { type: "钢琴入门", difficulty: 1, topicId: "intro-piano", text: "钢琴白键的基本音名循环是？", options: ["C D E F G A B", "A B C D E F G", "C E G B D F A", "Do Re Mi Sol La Si Do"], answer: 0 },
  { type: "钢琴入门", difficulty: 1, topicId: "intro-piano", text: "中央 C 的作用是？", options: ["定位音区", "仅用于低音区", "只在黑键上", "仅爵士乐使用"], answer: 0 },
  { type: "钢琴入门", difficulty: 1, topicId: "intro-piano", text: "相邻两个白键 E 与 F 之间相差？", options: ["半音", "全音", "纯四度", "纯五度"], answer: 0 },
  { type: "钢琴入门", difficulty: 2, topicId: "intro-piano", text: "从 C4 到 C5 跨越几个半音？", options: ["6 个", "8 个", "12 个", "7 个"], answer: 2 },
  { type: "钢琴入门", difficulty: 2, topicId: "intro-piano", text: "黑键 F# 可记作？", options: ["G♭", "E♯", "F♭", "A♭"], answer: 0 },
  { type: "钢琴入门", difficulty: 2, topicId: "intro-piano", text: "一组八度包含几个白键？", options: ["5 个", "6 个", "7 个", "8 个"], answer: 2 },

  // ══ 吉他入门 ×6 ══
  { type: "吉他入门", difficulty: 1, topicId: "intro-guitar", text: "吉他最粗的六弦空弦音是？", options: ["E", "A", "D", "G"], answer: 0 },
  { type: "吉他入门", difficulty: 1, topicId: "intro-guitar", text: "从一弦到六弦，空弦音顺序是？", options: ["E A D G B E", "G B E A D G", "C F A D G C", "A D G C E A"], answer: 0 },
  { type: "吉他入门", difficulty: 1, topicId: "intro-guitar", text: "吉他每上一品（品格）音高？", options: ["升高半音", "降低半音", "升高全音", "不变"], answer: 0 },
  { type: "吉他入门", difficulty: 2, topicId: "intro-guitar", text: "C 大三和弦组成音是？", options: ["C E G", "C D E", "C F A", "C G B"], answer: 0 },
  { type: "吉他入门", difficulty: 2, topicId: "intro-guitar", text: "Em 小三和弦组成音是？", options: ["E G B", "E G# B", "E A C", "E B D"], answer: 0 },
  { type: "吉他入门", difficulty: 2, topicId: "intro-guitar", text: "开放和弦是指？", options: ["含空弦音的和弦按法", "只用闷音", "不用左手", "只弹单音"], answer: 0 },

  // ══ 调号专题 theory-keys ×8 ══
  { type: "调号识别", difficulty: 1, topicId: "theory-keys", text: "Bb 大调有几个降号？", options: ["1 个", "2 个", "3 个", "4 个"], answer: 1 },
  { type: "调号识别", difficulty: 1, topicId: "theory-keys", text: "A 大调有几个升号？", options: ["1 个", "2 个", "3 个", "4 个"], answer: 2 },
  { type: "调号识别", difficulty: 2, topicId: "theory-keys", text: "E 大调有几个升号？", options: ["3 个", "4 个", "5 个", "6 个"], answer: 1 },
  { type: "调号识别", difficulty: 2, topicId: "theory-keys", text: "升号出现的顺序第一个是？", options: ["C", "F", "G", "B"], answer: 1 },
  { type: "调号识别", difficulty: 2, topicId: "theory-keys", text: "降号出现的顺序第一个是？", options: ["E", "B", "F", "A"], answer: 1 },
  { type: "调号识别", difficulty: 3, topicId: "theory-keys", text: "3 个升号是什么大调？", options: ["A 大调", "D 大调", "E 大调", "G 大调"], answer: 0 },
  { type: "调号识别", difficulty: 3, topicId: "theory-keys", text: "2 个降号是什么大调？", options: ["F 大调", "Bb 大调", "Eb 大调", "Ab 大调"], answer: 1 },
  { type: "调号识别", difficulty: 3, topicId: "theory-keys", text: "同主音大小调的关系是？", options: ["相差小三度", "调号相同", "相差大三度", "无关系"], answer: 0 },

  // ══ 拍号专题 theory-meter ×8 ══
  { type: "节奏型识别", difficulty: 1, topicId: "theory-meter", text: "2/4 拍每小节几拍？", options: ["2 拍", "3 拍", "4 拍", "6 拍"], answer: 0 },
  { type: "节奏型识别", difficulty: 1, topicId: "theory-meter", text: "一个二分音符等于几个四分音符？", options: ["1 个", "2 个", "3 个", "4 个"], answer: 1 },
  { type: "节奏型识别", difficulty: 1, topicId: "theory-meter", text: "一个全音符等于几个四分音符？", options: ["2 个", "3 个", "4 个", "8 个"], answer: 2 },
  { type: "节奏型识别", difficulty: 2, topicId: "theory-meter", text: "6/8 拍是以几分音符为一拍？", hint: "复合拍", options: ["四分音符", "八分音符", "附点四分音符", "二分音符"], answer: 2 },
  { type: "节奏型识别", difficulty: 2, topicId: "theory-meter", text: "三连音的含义是？", options: ["三个音占两拍的时值", "三个音占一拍", "三个音占三拍", "三个音占四拍"], answer: 0 },
  { type: "节奏型识别", difficulty: 2, topicId: "theory-meter", text: "弱起小节是指？", options: ["第一拍是强拍", "第一拍从弱拍开始", "没有小节线", "只有一拍"], answer: 1 },
  { type: "节奏型识别", difficulty: 3, topicId: "theory-meter", text: "切分节奏的特点是？", options: ["重音在强拍上", "重音在弱拍或拍间", "没有重音", "只有全音符"], answer: 1 },
  { type: "节奏型识别", difficulty: 3, topicId: "theory-meter", text: "9/8 拍通常每小节几组八分音符？", options: ["2 组", "3 组", "4 组", "9 组"], answer: 1 },

  // ══ 补充综合题 ×7 ══
  { type: "音名识别", difficulty: 2, topicId: "theory-notes", text: "低音谱号又叫？", options: ["高音谱号", "F 谱号", "C 谱号", "G 谱号"], answer: 1 },
  { type: "音程识别", difficulty: 2, topicId: "theory-intervals", text: "纯五度包含几个半音？", options: ["5 个", "6 个", "7 个", "8 个"], answer: 2 },
  { type: "和弦识别", difficulty: 2, topicId: "theory-triads", text: "Dm 小三和弦组成音是？", options: ["D F A", "D F# A", "D G B", "D E A"], answer: 0 },
  { type: "调号识别", difficulty: 2, topicId: "theory-keys", text: "C 大调与 a 小调的关系？", options: ["同主音", "关系大小调", "相差半音", "无关系"], answer: 1 },
  { type: "节奏型识别", difficulty: 2, topicId: "theory-meter", text: "4/4 拍适合什么感觉？", options: ["华尔兹", "进行曲/流行", "只有快板", "没有强弱"], answer: 1 },
  { type: "钢琴入门", difficulty: 1, topicId: "intro-piano", text: "一组八度有几个黑键？", options: ["3 个", "5 个", "7 个", "12 个"], answer: 1 },
  { type: "吉他入门", difficulty: 2, topicId: "intro-guitar", text: "G 大三和弦组成音是？", options: ["G B D", "G A B", "G C E", "G D F"], answer: 0 }
];

// 修正误标 type 的题目
QUIZ_BANK.forEach(q => {
  if (q.type === "调名识别") q.type = "调号识别";
});

QUIZ_BANK.forEach((q, i) => {
  q.id = `q${String(i + 1).padStart(3, "0")}`;
});

if (typeof window !== "undefined") {
  window.QUIZ_BANK = QUIZ_BANK;
  window.QUESTIONS = QUIZ_BANK;
}
