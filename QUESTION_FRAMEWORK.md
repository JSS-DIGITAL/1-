# 1% — QUESTION FRAMEWORK

**Version 1.0 · Phase 1 deliverable · The contract Phase 2 builds against.**

---

## 0 · Operating rules (read before the questions)

The loop: **Experience → Student records reality → Mode Shift → Teacher evaluates the record → corrections + one next mission → better execution tomorrow.**

Five rules govern everything below:

1. **The Evidence Rule.** The Teacher may only evaluate what the Student wrote. *If it is not in the record, it did not happen.* This is the system's honesty engine: flattering-by-omission punishes you (unrecorded wins earn no credit), and inflating punishes you (claims must survive the Teacher's audit). Honest recording becomes the cheapest strategy.
2. **One primary area per day.** The user holds multiple improvement areas, but each daily review runs against one chosen focus area (default: yesterday's). Scoreboard numbers (S3) may be logged for other active areas in seconds, but questions, evaluation and the mission belong to the day's focus. One mission beats five.
3. **One mission per day.** Singular, always. The Teacher's entire output compresses into one verifiable order.
4. **Answer shapes are enforced.** Every question declares its shape (§8 vocabulary). Numbers and lists become trends; walls of text become noise. Phase 2 must render the input control from the shape, never a blank editor.
5. **The record is sealed.** Once the Student finishes, the record cannot be edited. Ever.

**Answer-shape vocabulary** (used throughout, binding for Phase 2):
`binary` · `enum(a/b/c)` · `scale-0-10` · `count` (number with unit) · `list≤5` (short items) · `line` (≤140 chars) · `text≤3` (max 3 sentences) · `mission` (structured: when + where + what, one sentence).

---

## 1 · Student Mode Framework

*Voice: first person. Job: record reality. Zero judgment — evaluation words ("good", "bad", "should") are out of scope for this mode. The Student is a camera with a notebook.*

### 1.1 Core (every day, in order)

---

**S1 — Mission check** *(asked only when a mission exists from the previous session)*

> Yesterday's mission: did I execute it — yes or no? What is the evidence?

- **Purpose:** convert yesterday's commitment into a hard binary outcome; feeds completion rate and calibration.
- **Shape:** `binary` + `line` (evidence).
- **Guards against:** the quiet death of commitments — missions that dissolve unexamined.
- **Strong:** "Yes — 40 min on the proposal, 6:10–6:50am, doc timestamp shows it." **Weak:** "Sort of, I thought about it a lot." (Binary forces the coward's "sort of" into a no.)

---

**S2 — Output inventory**

> What did I complete today? List evidence a stranger could verify — artifacts, numbers, submissions. Not activities.

- **Purpose:** separate output from effort; builds the day's factual spine that every Teacher question leans on.
- **Shape:** `list≤5`.
- **Guards against:** busyness masquerading as progress ("worked on X" is an activity, not an item).
- **Strong:** "12 cold calls · proposal v2 sent · 5×5 squat @ 100kg." **Weak:** "Worked on outreach most of the day." (Not listable, not verifiable — the shape rejects it.)

---

**S3 — Scoreboard**

> Log today's numbers.

- **Purpose:** trendable quantities. Each area defines 1–3 metrics at creation (calls made, sets × volume, minutes of active practice, words written). The Student logs values; the system builds the trend.
- **Shape:** `count` per metric.
- **Guards against:** narrative drift — numbers cannot be rewritten by mood.
- **Strong:** "Calls: 12 · Booked: 2." **Weak:** "Decent numbers today." (Not a number; the control only accepts numbers.)

---

**S4 — Avoidance log**

> What did I avoid or postpone today — and what did I do instead?

- **Purpose:** surface the dodge *and* its replacement behaviour; the "instead" clause is the tell that distinguishes real constraint from comfortable escape.
- **Shape:** `line` + `line`.
- **Guards against:** self-serving amnesia; avoidance is the single highest-signal daily fact for the Teacher.
- **Strong:** "Avoided calling the two biggest prospects · did easy follow-up emails instead." **Weak:** "Nothing avoided." (Permitted — but three consecutive "nothing" answers trigger the escalation variant, §9.)

---

**S5 — Conditions**

> Which condition most shaped execution today — sleep, time, place, people, tools, body? State the fact and its effect.

- **Purpose:** feelings and circumstances enter as *execution data*, never as subject matter; over 90 days this exposes condition→performance correlations no single day shows.
- **Shape:** `line`.
- **Guards against:** both extremes — ignoring real conditions (macho) and using conditions as blanket excuses (the effect must be stated specifically).
- **Strong:** "5h sleep — focus collapsed after 2pm, zero output after that." **Weak:** "Felt off today." (A mood, not a condition + effect; the phrasing demands the pair.)

**Student core total: ≈ 2.5–3 minutes.**

### 1.2 Deep tier (optional, user-pulled, max 2×/week)

**SD1 — Surprise scan**
> What happened today that I did not expect — better or worse?
- **Purpose:** surprise = model error = the day's cheapest learning signal; secondary calibration input. **Shape:** `line`. **Guards against:** confirmation bias — days that only confirm what you already believed teach nothing.

**SD2 — Turning-point replay**
> Pick the day's turning point. Reconstruct the five minutes before it — facts only.
- **Purpose:** micro-resolution on the moment that decided the day; where habits actually live. **Shape:** `text≤3`. **Guards against:** whole-day summaries that blur the one decisive moment.

### 1.3 Trigger questions (fire on conditions, replace the nearest-purpose core slot)

**ST1 — Miss timeline** *(fires when S1 = no)*
> Where was I when the mission's window passed, and what was I doing?
- **Purpose:** locate the failure in space and time — systems diagnosis, not character diagnosis. **Shape:** `text≤3`. **Guards against:** "I just didn't get to it" — the timeline always contains a decision point.

**ST2 — Win anatomy** *(fires on a personal record / target exceeded)*
> What was different this time — preparation, conditions, or method? Name it precisely.
- **Shape:** `enum(preparation/conditions/method)` + `line`. **Purpose:** make wins reproducible instead of celebrated. **Guards against:** attributing wins to form ("I was on fire") instead of mechanism.

**ST3 — Baseline** *(fires once: first session in a new area)*
> Record the starting numbers you will measure against.
- **Shape:** `count` per metric. **Purpose:** every later trend needs a day-zero anchor. **Guards against:** retrospective baseline inflation ("I was basically at X when I started").

---

## 2 · The Mode Shift

The boundary is a ritual with four beats. Phase 2 stages it; on paper it works identically.

1. **Seal.** The Student record locks. A visible, irreversible act — the day's facts are now evidence, not memory.
2. **The line.** One sentence, always the same: ***"The record is sealed. Only what is written exists."***
3. **Re-read.** The sealed record is re-presented whole, and read once top to bottom — formatted as a report handed to you about someone you coach. Not skimmed: read.
4. **Verdict first.** The Teacher's opening act is T1's verdict — evaluation begins with a ruling, not with commentary.

The reverse shift (Teacher → done) has one beat: the mission alone remains on screen. ***"One order on the desk. Everything else stays here."***

Why this works: re-reading your own words as an inspector engages distanced evaluation (the same mechanism as distanced self-talk); the seal prevents retroactive face-saving edits; "only what is written exists" makes tomorrow's Student more honest, because tomorrow's Teacher is blind to everything unrecorded.

---

## 3 · Teacher Mode Framework

*Voice: second person — the Teacher addresses the person in the record ("You said X was the priority — what did you actually do?"). Terse. Verdicts, then orders. The Teacher evaluates the record, never the memory.*

### 3.1 Core (every day, in order)

---

**T1 — Verdict**

> The record claims the mission was executed / missed. Verdict: executed, partial, or failed — and would the evidence survive an outside audit?

- **Purpose:** an honest ruling on yesterday, and an audit of the Student's own claim; the completion datum that feeds every long-term metric.
- **Shape:** `enum(executed/partial/failed)` + `binary` (evidence holds?).
- **Guards against:** grade inflation — "partial" exists so that "executed" stays expensive.
- **Strong:** "Partial. 25 of 40 minutes, then took a call. Evidence holds for the 25." **Weak:** "Executed, basically." (The audit binary calls the bluff.)

---

**T2 — Motion audit**

> Where in this record is motion without progress — activity that moved nothing?

- **Purpose:** separate busyness from progress using only the record's own S2/S3 facts.
- **Shape:** `line` (or explicit "none").
- **Guards against:** productive-feeling days that produce nothing; three consecutive "none" answers trigger escalation (§9).
- **Strong:** "The 90 minutes 'researching tools' produced no artifact and delayed the calls." **Weak:** "It was all pretty useful." (Must point at a line in the record or state "none" — which is tracked.)

---

**T3 — Weakness diagnosis**

> Name the single weakness this record exposes. Is it new, a repeat, or chronic?

- **Purpose:** one causal diagnosis per day; the recurrence tag builds the weakness ledger that exposes patterns before the user feels them.
- **Shape:** `line` + `enum(new/repeat/chronic)`.
- **Guards against:** shotgun self-criticism (five vague flaws = zero targets) and rumination (the weakness is in the record, not in the self).
- **Strong:** "Avoids high-stakes contacts when energy is low — repeat, third time this week." **Weak:** "Just need more discipline." (Not in the record, not specific, not falsifiable.)

---

**T4 — Tomorrow's mission**

> Set tomorrow's mission: when, where, what — one sentence a witness could verify.

- **Purpose:** the Teacher's entire output compressed into one implementation intention.
- **Shape:** `mission` (when + where + what).
- **Guards against:** vague intentions ("be more focused") — the three slots physically reject them.
- **Strong:** "6:00am, desk, phone in drawer: call the three largest prospects before opening email." **Weak:** "Do better on outreach tomorrow." (No when, no where, no verifiable what.)

---

**T5 — Confidence call**

> Honestly: how likely is completion — 0 to 10?

- **Purpose:** the prediction half of the calibration engine; tomorrow's S1 is the outcome half. Over 30 days this yields the most honest metric a person can track: calibration error.
- **Shape:** `scale-0-10`.
- **Guards against:** performative optimism — a 9 that fails costs visible calibration points, so inflated confidence becomes measurable, not just embarrassing.
- **Strong:** "6 — evening event makes the morning slot fragile." **Weak:** "10!" (Allowed. It will meet tomorrow's binary.)

---

**T6 — Failure plan**

> Where will this mission most likely break, and what is the if-then response?

- **Purpose:** obstacle + counter-move as an if-then pair — the form of implementation intention with the strongest evidence base.
- **Shape:** `line` ("If X, then Y").
- **Guards against:** missions that die on first contact with the ordinary day.
- **Strong:** "If the 6am alarm fails, then the calls happen at 12:00 before lunch, non-negotiable." **Weak:** "I'll try to push through." (No trigger, no response.)

**Teacher core total: ≈ 3–3.5 minutes.**

### 3.2 Trigger questions

**TT1 — System change order** *(fires when T3 tags a weakness `chronic` — 3rd+ appearance)*
> This weakness has survived three corrections. Effort has failed. What system change removes the conditions it needs — no promises of trying harder?
- **Shape:** `text≤3`. **Purpose:** force the jump from willpower to environment/system design. **Guards against:** the repeat-repent-repeat loop.

**TT2 — Mission shrink** *(fires after 2 consecutive failed missions; replaces T4)*
> The mission is too big for current conditions. Shrink it to a version that cannot fail in under ten minutes. That is tomorrow's mission.
- **Shape:** `mission`. **Purpose:** break failure spirals by shrinking scope, not raising stakes. **Guards against:** the death spiral where each failure produces a more heroic, less plausible mission.

**TT3 — Win attribution** *(fires with ST2 — record day / target exceeded)*
> Was this skill, system, or luck? What gets standardised so it repeats?
- **Shape:** `enum(skill/system/luck)` + `line`. **Purpose:** separate decision quality from outcome luck on the upside, where delusion is most pleasant. **Guards against:** building a self-image on variance.

---

## 4 · Questions That Must Not Exist

Categories that would corrupt the system, each with the reason it is poison here:

1. **Gratitude prompts** ("three things you're grateful for") — mood regulation, not performance analysis; imports a different product's soul.
2. **Feeling-as-subject questions** ("How do you feel about today?") — feelings are admissible only as execution data (S5); as subject matter they convert analysis into journaling.
3. **Motivation ratings** ("How motivated are you, 1–10?") — unactionable, unfalsifiable, and trains the user to consult mood before acting.
4. **Vanity effort metrics** ("How many hours did you work?") — hours are input, not output; rewarding them manufactures busyness (S2/S3 exist precisely to replace this).
5. **Global day scores** ("Rate your day 0–10") — a mood proxy wearing a number's clothes; trends in it track weather, not performance. (T5's 0–10 survives because it is a *prediction* checked against a binary outcome — a forecast, not a feeling.)
6. **Unbounded reflection** ("Reflect on your journey") — no answer shape, no evidence, pure rumination bait.
7. **Identity-directed whys** ("Why am I like this?" / "Why do I always fail?") — points the blade at self-worth instead of systems; the framework's whys interrogate plans and conditions only (ST1, TT1).
8. **Affirmations / manifestation prompts** ("Visualise your success") — belief without evidence is the exact delusion this system exists to kill.
9. **Comparison-to-others questions** ("Are you ahead of your peers?") — the only sanctioned opponent is the previous self; social comparison imports noise and ego.
10. **Advice-to-past-self prompts** ("What would you tell yourself a year ago?") — nostalgia theatre; produces wisdom-flavoured text with zero forward action.
11. **Attendance-streak worship** ("Don't break the chain of showing up!") — attendance is not improvement; record density is measured but never guilt-gamified. *(Amended by §11: a momentum chain of __kept promises__ — consecutive executed missions — is permitted, because it rewards doing what you said, not showing up. Attendance streaks remain banned.)*
12. **Open brainstorms** ("List everything you could improve") — breadth destroys the one-weakness, one-mission discipline that makes the loop executable.

---

## 5 · Daily Flow

| Stage | Content | Est. time |
|---|---|---|
| 0 · Arm | Choose focus area (defaults to yesterday's) | 10 s |
| 1 · Student | S1 → S2 → S3 → S4 → S5 (+ triggers/deep if fired/pulled) | 2.5–3 min |
| 2 · Mode Shift | Seal → the line → re-read the record → enter Teacher | 30–45 s |
| 3 · Teacher | T1 → T2 → T3 → T4 → T5 → T6 (+ triggers) | 3–3.5 min |
| 4 · Commit | Mission alone on screen; done | 10 s |

**Typical day: ≈ 6.5–8 minutes.** Trigger days add ≤ 90 seconds. Within budget.

### Minimum Viable Day (≤ 3 minutes, for tired Tuesdays)

The MVD produces a thin record instead of a broken habit. Five fields, nothing else:

1. **S1** mission check (binary + one-line evidence)
2. **S2-lite** one completed thing (`line`; "nothing" is a legal, recorded answer)
3. **T1** verdict (enum)
4. **T4** tomorrow's mission (`mission`)
5. **T5** confidence (`scale-0-10`)

The Mode Shift still happens — compressed to the seal + the line. MVD days are tagged in the record; more than 3 MVDs in a week is surfaced at the weekly review as a fact, not a scolding.

---

## 6 · Weekly & Monthly Review

### Weekly (~12 minutes, end of week)

**W1 — Mission ledger**
> Count: missions set vs missions executed this week.
- `count` + `count` → completion rate. Feeds: mission_completion_rate.

**W2 — Calibration check**
> Compare the week's confidence calls against actual completions. Overconfident, underconfident, or calibrated?
- `enum(over/under/calibrated)`. Feeds: calibration_error.

**W3 — Target selection**
> Which weakness appeared two or more times? Name ONE as next week's target.
- `line`. The chosen weakness becomes next week's standing lens (§9). Feeds: weakness_recurrence.

**W4 — Standards ratchet**
> Did last week's raised standard hold? And what was easy this week that should no longer count as work? Raise that bar — one measurable line.
- `binary` + `line`. The ratchet question: standards rise where difficulty has quietly evaporated. Feeds: standards_ratchet.

**W5 — Stop / Start / Continue**
> One stop, one start, one continue — each justified by a line from this week's records.
- 3 × `line`. The classic AAR close, constrained to evidence.

### Monthly (≤ 30 minutes, first review of the month)

**M1 — Trend read**
> For each area: numbers now vs day one. Rising, flat, or falling — by the data, not the feel.
- `enum(rising/flat/falling)` per area. Feeds: output_volume trends.

**M2 — Kill list**
> Which weakness died this month? Name the correction that killed it.
- `line`. The compounding proof: corrections that worked become doctrine.

**M3 — Survivor analysis**
> Which weakness survived every correction? The correction method failed — what different class of fix does it need?
- `text≤3`. Blames the method, never the person (anti-rumination by construction).

**M4 — Standards audit**
> List the standards raised this month. Which held? Which regressed silently?
- `list≤5`. Feeds: standards_ratchet integrity.

**M5 — Calibration trend**
> Is calibration error shrinking? Do your 8/10 predictions actually land ~80%?
- `binary` + `count`. Feeds: calibration_error (long horizon).

**M6 — Portfolio decision**
> For each area: persist, pivot, or pause — decided from M1's trend.
- `enum(persist/pivot/pause)` per area. The monthly strategic act.

**M7 — Distance measurement**
> Read your day-one record start to finish. Name the clearest difference in execution — not in mood.
- `line`. The compounding made visible; evidence-reading, not nostalgia (the difference must be an execution fact).

---

## 7 · Question Metadata Schema

The contract for Phase 2. Every kept question, its routing, and the long-term metric it feeds.

| ID | Mode | Tier | Purpose (one line) | Answer shape | Feeds metric |
|---|---|---|---|---|---|
| S1 | Student | core (conditional: mission exists) | Binary outcome of yesterday's commitment + evidence | binary + line | mission_completion_rate, calibration_error |
| S2 | Student | core | Verifiable outputs, not activities | list≤5 | output_volume |
| S3 | Student | core | Area-defined metric values | count × metrics | output_volume (trends) |
| S4 | Student | core | Avoidance + replacement behaviour | line + line | avoidance_incidence |
| S5 | Student | core | Condition → effect on execution | line | condition_correlates |
| SD1 | Student | deep | Surprise = model error detection | line | calibration_error (secondary) |
| SD2 | Student | deep | Micro-replay of the day's turning point | text≤3 | weakness_recurrence (context) |
| ST1 | Student | trigger (S1 = no) | Locate the miss in space/time | text≤3 | mission_failure_context |
| ST2 | Student | trigger (record/PR day) | Isolate what made the win happen | enum + line | win_attribution |
| ST3 | Student | trigger (new area) | Day-zero baseline numbers | count × metrics | output_volume (anchor) |
| T1 | Teacher | core | Verdict on mission + evidence audit | enum(executed/partial/failed) + binary | mission_completion_rate |
| T2 | Teacher | core | Busyness vs progress separation | line / "none" | motion_waste |
| T3 | Teacher | core | Single weakness + recurrence tag | line + enum(new/repeat/chronic) | weakness_recurrence |
| T4 | Teacher | core | Tomorrow's implementation intention | mission | mission_completion_rate |
| T5 | Teacher | core | Prediction for calibration | scale-0-10 | calibration_error |
| T6 | Teacher | core | Obstacle + if-then counter | line | mission_failure_context |
| TT1 | Teacher | trigger (T3 = chronic) | Forced system redesign | text≤3 | system_changes |
| TT2 | Teacher | trigger (2 consecutive fails; replaces T4) | Shrink mission below failure threshold | mission | mission_completion_rate (recovery) |
| TT3 | Teacher | trigger (record/PR day) | Skill/system/luck attribution | enum + line | win_attribution |
| W1 | Teacher | weekly | Missions set vs executed | count + count | mission_completion_rate |
| W2 | Teacher | weekly | Weekly calibration self-check | enum(over/under/calibrated) | calibration_error |
| W3 | Teacher | weekly | Choose next week's single target | line | weakness_recurrence |
| W4 | Teacher | weekly | Ratchet check + raise one standard | binary + line | standards_ratchet |
| W5 | Teacher | weekly | Stop/start/continue with evidence | 3 × line | behaviour_changes |
| M1 | Teacher | monthly | Per-area trend verdicts | enum per area | output_volume |
| M2 | Teacher | monthly | Weakness eliminated + what killed it | line | weakness_recurrence |
| M3 | Teacher | monthly | Chronic weakness → method change | text≤3 | system_changes |
| M4 | Teacher | monthly | Standards held vs regressed | list≤5 | standards_ratchet |
| M5 | Teacher | monthly | Calibration error trajectory | binary + count | calibration_error |
| M6 | Teacher | monthly | Persist/pivot/pause per area | enum per area | portfolio_decisions |
| M7 | Teacher | monthly | Day-one vs now, in execution terms | line | compounding_evidence |

**31 questions kept.** Core daily load: 11 (5 Student + 6 Teacher). Long-term metrics defined: mission_completion_rate, calibration_error, output_volume, avoidance_incidence, condition_correlates, weakness_recurrence, standards_ratchet, motion_waste, win_attribution, system_changes, mission_failure_context, behaviour_changes, portfolio_decisions, compounding_evidence.

---

## 8 · Rotation & Fatigue Strategy

Daily questions die by autopilot within weeks. Four defences:

1. **Fixed semantic IDs, rotating phrasings.** Each core question keeps its ID and metric forever (data stays comparable) but carries 3 pre-audited phrasing variants rotated weekly. Example, S4: *A.* "What did I avoid or postpone today — and what did I do instead?" *B.* "Which task got traded for an easier one today?" *C.* "If someone shadowed me all day, what would they say I sidestepped?" All feed `avoidance_incidence`.
2. **Escalation on coasting.** Rule: the same literal answer (or "none"/"nothing") on the same question 3 days running fires the hardest variant next day and flags the question in the weekly review. Coasting is legal; *invisible* coasting is not.
3. **Triggers keep the set alive.** ST/TT questions fire on conditions, so hard days and record days automatically feel different from routine days — novelty exactly when attention matters most.
4. **The weekly lens.** W3's chosen target weakness is displayed as a standing banner over next week's daily loop; S4 and T3 are read against it. The question set is static; the *context* rotates weekly, which is where freshness actually comes from.

Deep tier is user-pulled (never pushed) and capped at 2×/week to preserve its bite. Quarterly, the user is prompted once to audit the question set itself against this document's tests — the framework eats its own dog food.

---

## 9 · Audit Log

### Stage 1 — Pool

**96 candidates generated** (Student 34, Teacher 38, weekly/monthly 24) → **31 kept** (3.1× cut ratio).

### Stage 2 — Founder v1 disposition (every original audited)

| Founder question | Verdict | Reason |
|---|---|---|
| What did I do today? | **Cut → replaced by S2 + S3** | Unbounded narrative; fails Evidence and Brevity tests. "Completed + numbers" is the auditable form. |
| What did I fail at? | **Rewritten → S4 + T3** | "Fail" framing points at self-worth (fails Delusion/anti-rumination); avoidance + single-weakness framing surfaces the same information mechanically. |
| What improved? | **Cut → M1/M7** | Improvement is invisible at day resolution; asking daily manufactures noise or lies. It is computed monthly from trends instead. |
| What did I learn? | **Rewritten → SD1** | "Learned" invites platitudes (fails Evidence); "what surprised me" is the observable form of a model update. |
| What patterns did I notice? | **Cut → W3** | Humans confabulate daily patterns; real patterns are a 7/30-day computation. Moved to weekly where the data exists. |
| What challenges did I face? | **Rewritten → S5 + ST1** | "Challenges" blends conditions with excuses; split into conditions-as-fact (S5) and miss-timeline (ST1). |
| What was done well? (Teacher) | **Cut → TT3** | A daily praise slot fills with filler by week two (fails Repetition); wins get analysed only when they occur, and for mechanism, not comfort. |
| What needs correction? | **Kept in spirit → T3** | Hardened to *one* weakness + recurrence tag; a list of corrections is a list of nothing. |
| What standard must increase? | **Moved daily → weekly (W4)** | Daily ratcheting inflates standards faster than they can be tested; a standard needs a week of load before it earns raising. |
| What is tomorrow's mission? | **Kept, hardened → T4+T5+T6** | The founder's best question. Upgraded with when/where/what shape, a confidence call, and an if-then failure plan. |
| Did I actually move closer to my goal? | **Rewritten → T2 (daily) + M1 (monthly)** | As phrased it invites vibes ("I think so"); daily form asks where motion produced nothing, monthly form checks the numbers. |

### Notable cuts from the wider pool (selection)

- "Rate today's focus 1–10" — global mood proxy (Must-Not-Exist #5).
- "What would I repeat exactly as done today?" — ≥80% overlap with TT3 (Duplication test).
- "Did today's work meet the area's standard?" (daily) — overlapped T3's diagnosis; standards live weekly at W4.
- "What am I pretending not to know?" — powerful but unanswerable on demand daily (fails Repetition; its job is done by S4's "instead" clause).
- "How many hours did I work?" — vanity input metric (Must-Not-Exist #4).
- "What drained my energy?" — mood-subject phrasing; S5 covers the admissible version (condition + effect).
- "Who helped or hindered me today?" — social attribution; noise for a solo loop (Domain test failure for solitary domains).
- "What's the one thing I'm most proud of?" — comfort question; rewards flattering answers (Delusion test).
- "If today repeated 100 times, would the goal be reached?" — rhetorically strong, analytically empty; the honest answer is always "no" by day three (Repetition test).
- "What did I consume vs create?" — moralises input; S2's output inventory carries the signal without the sermon.

### Stage 3 — Adversarial pass (tired, self-deceiving user, 11 core questions)

| Q | Coasting answer attempted | Why it stays visible |
|---|---|---|
| S1 | "Sort of did it" | Shape is binary; "sort of" must become no. Evidence line exposes empty yeses to tomorrow's T1 audit. |
| S2 | "Worked on the project" | Not a listable artifact; the list control demands items, and thin lists are themselves data. |
| S3 | Skip the numbers | Number fields with yesterday's value shown; a blank is recorded as a blank — visible in weekly density. |
| S4 | "Nothing avoided" | Legal once; 3× consecutive fires the escalation variant and flags the weekly review. |
| S5 | "Felt tired" | Phrasing demands fact + effect; "tired" without an execution consequence doesn't fit the slot. |
| T1 | "Executed, mostly" | Enum has `partial` precisely so `executed` stays expensive; the evidence-audit binary is a second lock. |
| T2 | "It was all useful" | Must cite a record line or declare "none" — and "none" streaks are tracked. |
| T3 | "Need more discipline" | Weakness must be *in the record*; recurrence tag forces comparison with the ledger, where "discipline" repeats become chronic → TT1 fires. |
| T4 | "Try harder on calls" | Mission shape physically requires when + where + what. |
| T5 | Always answer 8 | Calibration error makes chronic 8s that land 40% visible within two weeks — the gaming *is* the data. |
| T6 | "I'll push through" | If-then shape requires a named trigger and response. |
| MVD | Coast every day on MVD | MVD days are tagged; >3/week surfaces at W-review as fact. A thin record is a win over no record; an all-thin month is visible. |

**Result:** no core question can be coasted invisibly. Every evasion route either fails the input shape or leaves a trackable trace.

### Domain spot-check (verbatim, three unrelated domains)

| Q | Fitness | Freelance business | Learning Spanish |
|---|---|---|---|
| S2 | "5×5 squat @ 100kg, 20-min row" | "Proposal v2 sent, 12 cold calls" | "Anki 142 cards, 15-min tutor call" |
| S4 | "Avoided last squat set · extra curls instead" | "Avoided the two biggest prospects · easy emails instead" | "Avoided speaking drill · passive video instead" |
| T3 | "Cuts depth when unwatched — chronic" | "Avoids high-stakes contacts — repeat" | "Never produces sentences, only recognises — repeat" |
| T4 | "6am, gym, before phone: 3×5 @ 102.5kg full depth" | "9am, desk, phone in drawer: call 3 largest prospects" | "7pm, kitchen, timer on: 10 spoken sentences recorded" |
| T6 | "If gym is packed, then squats move to rack 2, same session" | "If no answer, then voicemail + calendar follow-up, not email" | "If tutor cancels, then self-record the 10 sentences anyway" |

All pass verbatim — no domain-specific rewording required.

### Expert conflicts resolved (per brief §2)

1. **Coach vs systems designer — daily standards ratchet.** Coach wanted standards pressure daily; systems designer showed daily ratchets produce untested standards and noisy data. *Resolution: ratchet weekly (W4), tested against a full week of load.*
2. **Psychologist vs coach — failure framing.** Coach wanted "what did you fail at" bluntness; psychologist showed failure-framing triggers identity rumination in exactly the users who need the system most. *Resolution: avoidance framing (S4) + single-weakness diagnosis (T3) — same information, mechanical target.*
3. **Learning scientist vs systems designer — calibration depth.** Learning scientist wanted per-prediction expectation logs across the day; systems designer ruled it blows the time budget. *Resolution: one prediction per day (T5 vs S1) — the cheapest possible calibration engine — plus SD1 as an optional secondary signal.*
4. **Coach vs psychologist — praise.** Coach wanted a daily "what was done well" slot for morale; psychologist and repetition test showed it decays into filler. *Resolution: wins are analysed (TT3) exactly when they occur; morale comes from the trend lines, which are real.*

---

## 10 · Deviations from DEFAULTS

| DEFAULT | Decision | Reason / rejected alternatives |
|---|---|---|
| Voice split (Student first person / Teacher second person) | **Kept** | Distanced self-talk measurably improves evaluative objectivity; the second-person Teacher voice is also what makes the Evidence Rule feel like an audit rather than self-criticism. Rejected: third-person naming ("What did Jugraj do?") — crosses from mode into persona, violating Fixed #2. |
| ≤8–10 min daily budget | **Kept, landed at ~6.5–8 min** | Estimated per stage in §5. |
| Mode-shift ritual (re-read as coach's report) | **Kept + extended** | Added the seal and the line "Only what is written exists" — this converts the ritual from theatre into the system's honesty enforcement mechanism. |
| §7 output structure | **Kept with one merge** | Trigger questions are documented inside each mode's framework rather than a separate section — they replace core slots at runtime, so they belong with their mode. |
| Founder's section counts (6 Student / 5 Teacher) | **Changed: 5 + 6** | The extra Teacher slot is the commit block (T4/T5/T6) — the output end deserves the weight; the Student's job is faster by design. |
| Daily standards question | **Moved to weekly (W4)** | Expert conflict #1 above. |
| Calibration principle | **Implemented as T5↔S1 engine** | One prediction, one outcome, daily. Rejected: multi-prediction expectation journals (time budget) and post-hoc "what did you expect?" (memory rewrites expectations after outcomes — the prediction must be logged *before*). |
| — (addition) | **Area-defined scoreboard metrics (S3/ST3)** | Not in the brief. Without user-defined per-area numbers, "domain-agnostic" forces all questions into prose and kills trendability. The metrics are defined once at area creation; the question stays verbatim across domains. |
| — (addition) | **One primary area + one mission per day (Rule 2/3)** | The brief's own language ("one next mission") applied strictly; per-area daily missions would multiply the budget by area count and dilute implementation-intention effects. |
| — (addition) | **MVD tagging + weekly surfacing** | The brief requires an MVD; tagging prevents the MVD from silently becoming the product. |

---

## 11 · Amendment (2026-07-09): The Economy

**Founder decision, deliberately reversing the launch guardrail:** 1% now carries a heavy incentive layer ("the economy") to drive landing and retention. The questions above are unchanged; the economy attaches to their outputs. Its law, which protects the system's honesty engine:

> **Pay only for what is verifiable, anti-flattering, or prediction-tested — never for claimed success alone.**

- **The Wager**: T5's confidence call is a stake; the next day's T1 verdict resolves it under a proper-scoring-flavored payout, so the honest call is always the best play. The dopamine mechanism and the calibration mechanism are the same feature.
- **Candor pay**: the Student earns for admission, not achievement — naming an avoidance (S4) pays; "nothing" pays zero. Honest answering is now literally more rewarding than flattering answering (this operationalises the §5 hunting target directly).
- **Momentum**: a multiplier chain of kept promises (executed missions), broken by a failed verdict or an unjudged day — see the amended Must-Not-Exist #11.
- **Bounties**: chronic weaknesses (T3, 3+ flags) carry bounties, paid when the weakness stays silent for 14 days — corrections are the weapon.
- **Seals, ranks, cosmetics**: variable-ratio seal draws reward the act of sealing; ranks unlock cosmetics only. No mechanic is purchasable.
- **Unchanged protections**: no negative balances, no shame copy, MVD still pays a base (thin record beats no record), and the currency — basis points — never touches question content or ordering.

**Known residual risk** (accepted for prototype): self-report gaming cannot be fully prevented in a solo product; the calibration scoring and evidence audits are mitigation, not proof.

**Further founder deviations (premium pass, same day):**
- **Unlimited prose answers.** The `line`/`text` shapes no longer enforce character caps; boxes auto-grow and advertise "no limit". Brevity remains *advice* (hints unchanged) — the Brevity test now reads "answerable well in a few sentences", not "enforced by the box".
- **Hard lines.** Must-Not-Exist §4 is narrowed: motivational content is banned *inside the loop* (questions, answers, payouts) but permitted in the chrome as terse, aggressive one-liners (login, dashboard, arm screen, failed verdicts, empty states), user-disableable. Rationale: the founder wants the product to punch; the loop's analytical integrity is preserved by keeping the lines out of the questions and the math.

## Definition-of-done check

- Every kept question audited (Stage 2 dispositions + §8 tests applied; failures rewritten or cut) ✅
- Audit log: pool 96 → 31, named cuts with reasons, adversarial pass documented ✅
- Daily core ≈ 6.5–8 min, per-stage estimates in §5 ✅
- Core spot-checked verbatim: fitness / freelance business / Spanish ✅
- No kept question violates §4 Must-Not-Exist categories (checked; T5's scale justified against #5) ✅
- MVD variant defined (≤3 min, 5 fields) ✅
- Metadata schema covers 31/31 kept questions ✅
- Deviations complete ✅
