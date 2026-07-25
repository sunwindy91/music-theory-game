# English Tencent Survey — paste-ready (I72 thin slice)

> **Purpose**: Duplicate the Chinese Tencent form in English in ~10 minutes.  
> **CN live form**: https://wj.qq.com/s2/27402422/a11b/  
> **EN live form**: https://wj.qq.com/s2/27402528/b2ad/ · wired in `core/features.js` → `SURVEY_URL_EN` (**v1.7.24**).  
> **Site wiring**: `survey.html` (language pick) → CN or EN Tencent URL; `survey-en.html` auto-jumps when `SURVEY_URL_EN` is set.

---

## How to create the EN form (腾讯问卷)

1. Open 腾讯问卷 → **复制** the existing CN form `27402422`, or **新建** a blank form.
2. Set title / description from the blocks below.
3. Add questions in the **same order** (field parity with CN).
4. Publish → copy share URL (`https://wj.qq.com/s2/.../.../`).
5. Tell the agent the URL (or paste into `SURVEY_URL_EN` yourself). Redeploy so `survey-en.html` auto-jumps.

**Privacy**: keep answers visible to author only (same as CN).

---

## Form title

```
Music Theory Buddy · Playtest Feedback
```

## Form description / intro

```
Thanks for trying 乐理小达人 (Music Theory Buddy)!
About 2 minutes · ~7 questions. Submit goes straight to the author’s Tencent Survey inbox (default: author-only).
Your “one thing to fix” helps prioritize the next update.
```

---

## Questions (paste in order)

### Q1 · Name / nickname *(short text · required)*

**Title:** Name / nickname

**Hint (optional):** So the author knows who left the note.

---

### Q2 · Do you know the author? *(single choice · required)*

**Title:** Do you know the author?

**Options:**

1. Family
2. Friend
3. Music buddy (hostel / dorm music circle)
4. Don’t know them / stranger

---

### Q3 · How did you enter? *(single choice · required)*

**Title:** Which path did you try first?

**Options:**

1. Learn (learning path / lessons)
2. Play (spirit map / performance)
3. Both

---

### Q4 · Confused on a principle? *(single choice or short text · recommended)*

**Title:** Did any music-theory idea feel confusing?

**Options (single choice):**

1. Yes — I wasn’t sure *why* something worked
2. A little — I could guess but not explain
3. No — mostly clear
4. Skipped theory / mostly played

**Follow-up (optional short text):** If yes, which idea? (e.g. intervals, major vs minor, reading notes)

---

### Q5 · Chord: why major / minor? *(single choice · recommended)*

**Title:** In the spirit map, did you understand *why* a major vs minor triad matters (ammo / enemy resistance)?

**Options:**

1. Yes — the “why” clicked
2. Partly — I used it but couldn’t explain
3. No — felt random / unclear
4. Didn’t reach chord combat yet

---

### Q6 · Want more of… *(multi-select · optional)*

**Title:** What do you want more of next?

**Options:**

1. Teach / learning path
2. Battle / spirit map combat
3. Sight-reading
4. Perform (instruments)

---

### Q7 · One thing to fix *(long text · required)*

**Title:** One thing you’d most like fixed or improved

**Hint:** Be specific if you can (phone controls, a confusing screen, a boss fight, unlock pacing…).

---

### Q8 · How far did you play? *(single choice · required)*

**Title:** How far did you get?

**Options:**

1. Home / dual gate only
2. A few learning lessons
3. Spirit map practice room (a wave or two)
4. Campaign / expedition nodes
5. Beat a lord / deeper run
6. Other / not sure

---

### Q9 · Would you open again? *(single choice · required)* + optional why

**Title:** Would you open this again?

**Options:**

1. Yes
2. Maybe
3. No

**Follow-up (optional short / long text):** Why? (optional)

---

### Q10 · Optional contact *(short text · optional)*

**Title:** Contact (optional)

**Hint:** WeChat / email / Discord — only if you’re okay being reached about follow-up.

---

## After publish — wire the site

In `core/features.js`:

```js
const SURVEY_URL_EN = "https://wj.qq.com/s2/27402528/b2ad/";
```

**Done (v1.7.24).** Then:

- Local: refresh `survey-en.html` — should auto-jump like CN.
- Production: say **我授权你 push** so Pages gets the constant.

---

## Field parity checklist (CN ↔ EN)

| # | CN intent | EN title above |
|---|-----------|----------------|
| 1 | 姓名/昵称 | Name / nickname |
| 2 | 是否认识作者（家人/朋友/音乐搭子宿舍/不认识） | Family / Friend / Music buddy / Don’t know |
| 3 | 入口：学/玩/都试了 | Learn / Play / Both |
| 4 | 原理是否懵 | Confused on a principle? |
| 5 | 和弦为何大小调 | Chord why major/minor? |
| 6 | 还想要：教/战/识谱/演奏 | Teach / battle / sight / perform |
| 7 | 最想改一点 | One thing to fix |
| 8 | 玩到哪 | How far did you play? |
| 9 | 还会打开吗 + 可选原因 | Would open again? + why |
| 10 | 可选联系方式 | Optional contact |
