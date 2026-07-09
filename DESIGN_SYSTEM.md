# 1% — DESIGN SYSTEM

**Phase 2 deliverable.** Written as the design plan *before* the build (§6.1), critiqued against generic defaults (§6.2), then finalised with audit results after the build. The token values here are the source of truth; the code derives from this document.

---

## 1 · Concept

One instrument, two states. **Student** is the observatory: calm, spacious, green-graphite — a place to record without judgment. **Teacher** is the review chamber: ember-graphite, denser, sharper — a place where a record is judged and one order is issued. Both are rooms in the same building: shared structure, shared type system, shared spine — different temperature, density and voice.

The user should feel: *"I am entering a system designed to improve me."* Never: *"I opened a diary."*

## 2 · Tokens

### 2.1 Color (all pairs validated ≥ AA against their grounds; script-checked)

**Shared / structural**

| Token | Value | Role |
|---|---|---|
| `--destructive` | `#FF4D42` | Destructive actions only; always paired with icon + explicit verb; never used by Teacher mode styling |
| `--focus` | mode accent | 2px offset focus ring |
| grain | inline SVG `feTurbulence`, ~4% opacity | Atmosphere; kills the flat near-black AI look |

*(Premium pass, 2026-07-09: both modes moved onto a near-black neutral base — the accent is a signal, not a wash — and the economy got its own shared metal.)*

**Student mode** (`data-mode="student"`)

| Token | Value | Contrast on bg | Role |
|---|---|---|---|
| `--bg` | `#0A0C0B` | — | Near-black, faint green temperature |
| `--surface` / `--surface-2` | `#111514` / `#161B19` | — | Neutral cards + sheen |
| `--line` | `#232A27` | — | Hairlines |
| `--ink` | `#E9EDEA` | 16.6 | Primary text |
| `--muted` | `#8FA098` | 7.2 | Secondary text |
| `--accent` | `#45B683` | 7.7 | **Emerald** — record, observation |
| `--accent-ink` | `#08120C` | 7.5 on accent | Text on accent fills |
| `--gold` | `#D3AE64` | 9.4 | Money: bp, rank, momentum, seals |

**Teacher mode** (`data-mode="teacher"`)

| Token | Value | Contrast on bg | Role |
|---|---|---|---|
| `--bg` | `#0D0A0B` | — | Near-black, faint red temperature |
| `--surface` / `--surface-2` | `#151112` / `#1B1516` | — | Neutral cards + sheen |
| `--line` | `#2D2224` | — | Hairlines |
| `--ink` | `#F0EAE8` | 16.6 | Primary text |
| `--muted` | `#A38F8D` | 6.5 | Secondary text |
| `--accent` | `#ED5656` | 5.7 | **Blood** — verdicts, orders, aggression |
| `--accent-ink` | `#180808` | 5.6 on accent | Text on accent fills |
| `--gold` | `#D3AE64` | 9.4 | Money (identical in both modes) |

Seal metals (fixed, both modes, ≥4.5:1 on surfaces): silver `#9BA1A6` · bronze `#B08A50` · gold `#D3AE64` · obsidian `#C27A93`.

**Error semantics (audit §9.4, revised):** the Teacher accent is now genuinely red by founder direction, so hue separation from destructive red is no longer sufficient alone. Mitigation: destructive actions never use solid red fills — they are outlined, carry a named destructive verb + confirm modal, and the prototype currently ships none. The mode test remains carried by density, radius, type weight and the mode banner, per §2.3.

**Customisation architecture:** every visual decision routes through these tokens; both modes are complete token sets swapped by `data-mode` on `<html>`. Accent customisation (Settings) swaps `--accent`/`--accent-ink` pairs from a pre-validated list — each candidate pair ships with its contrast ratio computed against both grounds; pairs under 4.5:1 are not offered. Users can therefore re-skin safely without touching layout or ink tokens.

### 2.2 Typography

| Role | Face | Why |
|---|---|---|
| Display | **Fraunces** (variable: `opsz`, `wght`, `SOFT`, `WONK`) | The mode shift lives in this face: Student renders it `wght 430 / SOFT 100` (rounded, warm); Teacher renders `wght 620 / SOFT 0` (sharp, hard). Same family, different temper — type carries the state, not just hue (audit §9.3). |
| Body / UI | **Archivo** | Disciplined grotesque with more jaw than Inter; 400/500/600. |
| Data | **IBM Plex Mono** | Every numeral in the product is mono and tabular — dates, counters, metrics, chart labels. Numbers are sacred; they get an instrument's typeface. |

Pairings considered: (A) Fraunces + Archivo + Plex Mono — chosen; (B) Instrument Serif + Instrument Sans + JetBrains Mono — rejected: Instrument Serif has one weight, so the mode-morph would fall back to hue, violating the "never hue alone" constraint; (C) Space Grotesk-led — rejected: the most recognisable AI-default face of the moment.

Scale (rem): 0.75 / 0.8125 / 0.9375 / 1.0625 / 1.375 / 1.75 / 2.25 / 3.5. Body 0.9375 (15px), line-height: Student 1.6, Teacher 1.45 (density is a mode signal). Uppercase labels: 0.6875rem, +0.14em tracking, Archivo 600.

### 2.3 Space, radius, density (mode-differentiated — carries the shift for colour-blind users)

| Token | Student | Teacher |
|---|---|---|
| `--radius` | 14px | 5px |
| `--radius-sm` | 10px | 3px |
| `--pad-card` | 24px | 18px |
| `--gap` | 16px | 12px |
| `--rule` | none | 2px accent left-rule on evaluation cards |
| line-height | 1.6 | 1.45 |

Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72.

### 2.4 Motion

| Token | Value | Used for |
|---|---|---|
| `--dur-fast` | 140ms | hover/focus micro |
| `--dur-base` | 240ms | question advance, card entries |
| `--dur-slow` | 420ms | panel reveals |
| Mode Shift | ≤1200ms total | the signature (below) |
| Easing | `cubic-bezier(0.32, 0.72, 0, 1)` | everything except the shift's temperature crossfade (`ease-in-out`) |

Animated: question advance (directional slide+fade), the Mode Shift, the mission-commit moment (card rise + compounding underline draw), analytics count-ups, hover/focus states. Nothing else. Every animation is listed here; anything not listed doesn't move.

`prefers-reduced-motion`: all Motion variants collapse to opacity-only or none; the Mode Shift becomes an instant swap with a static interstitial and a "Continue" button; count-ups render final values.

## 3 · The Vault Seal (signature — boldness is spent here; upgraded in the premium pass)

Timeline (total ~1.65s, tap-to-skip at any point):

| t | Event |
|---|---|
| 0–900ms | **The vault**: door rings appear; the locking ring rotates 70° with a hard overshoot stop; six bolts extend staggered into the frame; a 1.045 scale punch lands the "clunk" |
| ~600ms | Temperature inversion: `data-mode` flips mid-lock; tokens crossfade emerald-black → blood-black |
| 850ms | `SEALED` stamp slams in (scale 1.5 → 1, −3° skew, overshoot ease) |
| 1080–1650ms | The line rises: **"The record is sealed. Only what is written exists."** → auto-continue |

Reverse shift (Teacher → done): everything falls away except the mission card. Line: *"One order on the desk."*

Reduced motion: instant token swap; interstitial rendered static with an explicit Continue button.

## 4 · Layout & shell

- **The spine** (structural brand device): desktop — a 76px vertical rail; the `%` glyph as structural mark at top, nav below, and the current mode wordmark set vertically, reading upward, at the rail's foot. Mobile — slim top band (mode word + %) and a bottom tab bar; Daily Review controls anchor to the bottom edge for one-handed use.
- **Dashboard** ("command centre"): yesterday's mission is the first and largest card, with the did-you-do-it check embedded (answering it *is* starting the review — the most important widget works in one tap). Beside it: today's status. Below: area tiles with mono sparklines; a 30-day consistency density strip.
- **Daily Review**: one question per view, centered column (max 560px); segmented progress bar labeled with question IDs (S1…T6); input control rendered from the question's answer shape — never a bare textarea without shape, hint and progress.
- **History**: month grid of density dots (solid = full review, hollow = MVD, empty = none) + day panel showing the sealed record, verdict, and mission→outcome chain.
- **Analytics**: instrument panels, each answering a Teacher question (completion rate, calibration plot vs the diagonal, weakness recurrence ranked, consistency density, the compounding curve). No decorative charts.
- **Settings**: mode preview, validated accent swaps, question preferences, export stub.

Secondary motif (kept quiet): the **compounding curve** — a line that bends slightly upward — appears as the review progress underline, the analytics hero, and the login fact (1.01³⁶⁵ ≈ 37.8). The `+0.01` chip marks a completed day.

## 5 · Copy voice

- Student copy observes: "Record the day." / "What is on the record?"
- Teacher copy rules: "Verdict." / "One weakness." / "Commit the mission."
- Buttons say exactly what they do and keep their name through the whole flow: `Begin review` → `Seal the record` → `Enter evaluation` → `Commit mission`.
- Sentence case, plain verbs, no emoji, no exclamation marks, no motivation-speak. Numbers get mono. Errors state fact + fix.

## 6 · §6.2 Critique against generic defaults (pre-build)

| Generic default I would produce for any dark dashboard | What this design does instead |
|---|---|
| Pure near-black `#0A0A0A` ground + one acid accent | Temperature-tinted graphites (green / oxblood) + grain atmosphere; the accent is structural, not a pop |
| Inter / Space Grotesk everywhere | Fraunces variable (mode-morphing SOFT axis) + Archivo + Plex Mono; numerals never proportional |
| `rounded-lg` cards with accent bar on the left | Radius is a *mode variable* (14px vs 5px); Teacher's 2px left rule is an evaluation semantic, not decoration |
| Sidebar with icon+label list, logo top-left | The spine: % glyph as structure, vertical mode wordmark reading upward — navigation as identity |
| Streak counter + confetti | Density dots, `+0.01` chip, calibration error — measurement, never celebration |
| shadcn primitives styled by theme | All primitives built from tokens; zero component-library DNA |
| Charts from a library with default palette | Hand-drawn SVG instruments; single-hue + neutral, direct-labeled, mono axis text |

## 7 · Component inventory

Shell (spine, mobile bar) · ModeShift overlay · QuestionView · inputs: Binary, Enum, Scale0-10, Count, List, Line, Text3, Mission (when/where/what) · MissionCard · VerdictChip · AreaTile · DensityStrip / DensityCalendar · Sparkline · CalibrationPlot · RecurrenceBars · CompoundCurve · StatTile · SettingsRow · AccentSwatch (with live contrast readout).

## 8 · Per-screen intent

| Screen | Job | Mode logic |
|---|---|---|
| /login | First impression; the compounding fact | Student temperature |
| / | Command centre; yesterday's mission check is the hero | Student before today's review; Teacher once the mission stands |
| /review | The core loop; §5 flow from QUESTION_FRAMEWORK.md | Student → shift → Teacher |
| /areas | Campaign management | Follows current state |
| /history | The sealed archive | Follows current state |
| /analytics | The Teacher's instruments | Follows current state |
| /settings | Token customisation architecture, preferences | Follows current state |

## 8b · The Economy (added 2026-07-09 — founder decision)

Gamification layer, **premium casino** register: tense, sharp, mono — a trading floor, never a carnival. The prior rule "measurement, never celebration" is superseded by: **measurement *is* the celebration.**

**Currency**: basis points (bp), split into two books — Candor (Student earnings) and Judgment (Teacher earnings). All scoring constants live in `src/lib/economy.ts` (`ECON`).

**Payoff moments & motion spec:**

| Moment | Motion | Reduced motion |
|---|---|---|
| The bet resolves (after T1) | ResolveCard flips in (rotateX 60→0, 380ms, swift-out); payout counts up 900ms; dismissed only by a deliberate **Collect** | Static card, same Collect |
| Commit screen | stake line + candor/resolve/balance ticker (CountUp) | Final values rendered |
| Dashboard economy strip | balance CountUp on mount; momentum chain links | Final values |
| Seal draw | stamp appears on the sealed record; rarity by fixed color (standard/brass/ember/oxblood) | Same, static |

**Copy rules for payoffs**: mono type, lowercase system voice, stated not cheered — `resolved: +21 bp`, `bounty collected`, `broken — rebuild it with a kept promise`. No exclamation marks. No praise adjectives.

**Color**: seal rarities use fixed hexes (independent of mode accent) so a rarity reads identically in both modes. Destructive red remains reserved; no economy element uses it.

**Guardrails carried from the framework amendment**: pay for verifiable/anti-flattering/prediction-tested acts only; no negative balances; MVD pays a base; ranks unlock cosmetics only (accent presets are now earned — contrast guardrails still apply on top).

**Gold rule (premium pass)**: every money element — bp numerals, balance, momentum links, bounty amounts, rank progress, resolve totals — renders in `--gold`, identical in both modes. Money is never a mode signal.

**Hard lines (founder addition)**: aggressive one-liners from `src/lib/quotes.ts` (~55, deterministic daily pick per surface). Chrome only — login, dashboard sub-line, arm screen, failed-verdict resolve card, empty states — never inside questions, answers, or payout math. Mono type, quiet size, no exclamation marks added beyond the lines themselves. User-disableable (Settings → Hard lines). The framework's "no motivational content" rule is narrowed accordingly (see QUESTION_FRAMEWORK §11).

**Unlimited prose (founder addition)**: `line`/`text` answers auto-grow with no character cap; the affordance under each field reads `no limit — say all of it`. Brevity survives as hint-level advice, not enforcement. Structured shapes (binary, enum, scale, count, list, mission) unchanged.

## 8c · Funnel + juice pass (added 2026-07-09, founder feedback round 3)

**The funnel**: `/` is now the marketing landing (aggressive sales register — the one surface where hard
lines are always on and set large); the app lives at `/today`. Top bar: Log in / Sign up; sections: hero
(1.01³⁶⁵ fact), the loop (with the Vault SVG), the wager (static resolve mock), the hard-lines wall,
two speeds, download-the-app (store badge stubs + phone frame + daily-push bullet), footer. `/signup`
mirrors `/login` (both mock).

**Louder lines**: `/today` carries a display-serif quote block (gold "— 1%" attribution); the arm screen
line is display-serif italic. Still `prefs.hardLines`-gated inside the app.

**The juice pack** (casino register holds):
- Micro-pay crumbs — each completed Student question pulses its candor contribution (`candorForQuestion`
  in economy.ts); crumbs + day base sum exactly to the sealed total. Visible money, never new money.
- Rank-up takeover — full-screen gold ring + rank stamp on crossing a threshold ("earned, not given");
  RANKS tuned (Teacher I 1750) so the demo crosses it on one good day.
- Seal reveal on the commit screen — bronze+ draws flip in with odds shown ("bronze seal — 20% draw").
- Balance gold-pulse on change; newest momentum link pops.

**Two speeds**: `prefs.density` — Simple (hides `/today` stat tiles + density card, pre-selects the
Minimum day) vs Operator (everything). Settings "Experience" control + a daily-push stub row (21:00,
prototype stub).

**Horizontal timeline**: History's rail is now sideways — oldest→newest, seal stamps as nodes, verdict
labels, grouped silent-day ticks, auto-scrolled to the newest end; the jump-to-date mini-calendar scrolls
the selected node into view. The strip owns its own `overflow-x-auto`; the page never scrolls sideways.

## 8d · The moat pass (added 2026-07-09, founder feedback round 4)

Category feature parity around the loop (the instantly.ai play), grounded in a research sweep of
Habitica/Streaks/Habitify/Strides feature sets and Duolingo retention mechanics:

- **Measurable goals** (Strides): `Area.target` + gold progress bars on `/areas` and area tiles.
- **Grip** (Habitify "Habit Strength"): composite 0–100 (40% density, 25% momentum, 20% calibration,
  15% completion) — dial in the `/today` strip and on `/analytics`.
- **Weekly Debrief**: framework W1–W5 finally implemented at `/weekly`; W1/W2 pre-filled from the ledger;
  pays +25 bp and stamps the week.
- **Daily objectives** (Duolingo quests): a strip that *visualizes* the loop's own steps; clearing all
  three (resolve, seal, avoidance named) pays +5. No new tracking, one small bonus.
- **Momentum Shield** (streak freeze): **economy-law amendment — bp is now spendable on insurance**
  (150 bp, hold 1, burns on a failed verdict, chain holds via `Mission.shielded`). Ranks and cosmetics
  remain un-buyable. Sinks make the balance real money.
- **Personal Records + Trophies**: leaderboards deliberately excluded (identity: you vs. previous self);
  PR board + 13 computed achievements ("the cabinet") on `/analytics`.
- **Starter packs**: six one-tap area templates.
- **1% Coach (beta)**: deterministic rules only — recurring-weakness quick-picks on T3, completion-rate
  brief on the arm screen. No API, labeled beta.
- **Focus missions** (`/focus`): the timer that *generates S1 evidence* (tap-to-insert chip).
- **Fuel** (`/motivation`): community feed (founder-review moderation queue: pending → approve/reject),
  private collection, save counts, and **pin as today's line** (overrides every hard-line surface via
  `useHardLine`, which merges the user's saved Fuel into the rotation pool).
- **Reminders + integrations**: push time picker (stub) and Apple Health / Calendar / Notion / Zapier
  "coming" chips — moat marketing on the landing's "whole arsenal" grid.
- **Brand**: "1% a day is the floor, not the ceiling" — landing + analytics compounding panel.

## 9 · Audit results (run against the built prototype, all screens screenshotted)

| # | Test | Result | Evidence |
|---|---|---|---|
| 1 | **Template test** | PASS | No shadcn/starter DNA: serif variable display with mode-morphing SOFT axis, temperature-tinted grounds + grain, spine rail with vertical mode wordmark, mono numerals everywhere, hand-drawn SVG instruments. No screen resembles a stock dark dashboard. |
| 2 | **Diary test** | PASS | Copy is terse and instrumental ("Arm the loop", "Seal the record", "One order on the desk"); no gratitude, no cheer, no emoji; the review is a flow of typed controls, not a journal page. |
| 3 | **Mode test** | PASS | Dashboard screenshotted in both states: Student (green-graphite, airier, wght 430/SOFT 100, 14px radii) vs Teacher (ember-graphite, denser, wght 620/SOFT 0, 5px radii, 2px left rules) — distinguishable at a blink *with hue removed*: density, radius, type weight and the spine's mode wordmark all carry the state. |
| 4 | **Error-semantics test** | PASS | Teacher accent `#E2734E` (orange-leaning ember, used structurally) vs destructive `#FF4D42` (pure signal red, outlined buttons with named destructive verbs only). They never co-occur in a component class; the prototype currently ships no destructive action, and the token separation is enforced in the system. |
| 5 | **Blank-editor test** | PASS | Every question renders its shape-matched control (binary, enum, 0–10 scale, count steppers with last values, capped list builder, 140-char lines, 3-sentence text, when/where/what mission) with prompt, hint, ID and progress segments. No bare textarea exists anywhere. |
| 6 | **Squint test** | PASS | One display-size statement per screen (date / question / "The Teacher's instruments"), label-eyebrow hierarchy, mono data islands; verified at screenshot scale. |
| 7 | **Contrast + reduced-motion test** | PASS | All token pairs script-validated ≥ AA (lowest 5.77:1; table in §2.1); Mode Shift has a static variant with explicit "Enter evaluation" button (verified via the `?rm=1` audit override, screenshotted); question transitions collapse to opacity; CountUp renders final values. |
| 8 | **Signature test** | PASS | The Mode Shift temperature inversion is the one bold element (seal stamp → token crossfade → the line, ≤1.2s, skippable). Everything else is quiet; the compounding curve motif stays secondary (login fact, commit underline, analytics). |
| 9 | **Phone test** | PASS | Full review driven at 380×760: full-width tap targets, bottom-reachable controls, no horizontal scroll, progress + IDs visible; MVD path completes in five inputs. |

**Verification record:** full loop driven in-browser (dashboard did-you-do-it → pre-armed S1 → S1–S5 → seal → Mode Shift → sealed record re-presented → T1–T6 → commit screen → dashboard flips to Teacher with tomorrow's order and live-updated stats). Build and lint clean; zero console errors/warnings on the happy path (one locale-dependent hydration mismatch found and fixed by pinning `en-AU`).

## 10 · Deviations & Sources

**From Phase 2 DEFAULTS:**

| DEFAULT | Decision | Why |
|---|---|---|
| Student = green / Teacher = red families | **Kept, tuned** | Student landed on desaturated moss on green-tinted graphite; Teacher on ember `#E2734E` — deliberately orange-leaning to keep distance from signal red (§9.4), inside "crimson/ember/oxblood territory" as briefed. |
| Near-black + acid accent warning | **Acted on** | Escaped via temperature-tinted grounds (not neutral near-black), grain atmosphere, serif display identity, density shift, spine device — per the brief's own escape routes. |
| Student softer / Teacher tighter layout | **Kept, made token-level** | Radius, padding, gap, line-height and the display face's SOFT axis are mode variables — the shift is structural, not cosmetic. |
| Interstitial copy suggestion ("Student record complete…") | **Replaced** | The framework's own ritual line ("The record is sealed. Only what is written exists.") is stronger and is the honesty mechanism, not just theatre. |
| Optional onboarding (8th screen) | **Cut** | The login fact + the arm screen carry first-run comprehension; an onboarding flow would dilute the 7-screen scope. Logged as future work. |
| Three.js / R3F | **Cut** | The atmosphere (layered radial washes + grain) achieves depth at zero bundle/jank cost; a 3D scene would not survive the "earns its place" bar on mid-range mobile. Cutting is the brief's sanctioned outcome. |
| Sound setting | **Present, off** | Stub toggle in Settings, default off, per §4. |
| Auth | **Visual only** | Login is the brand moment; no gate (mock-data constraint makes a gate pure friction). Flagged here per §2.8. |
| Store persistence | **In-memory only** | Refresh resets to mock. Kept deliberately honest to "mock data, no backend"; the store API is repository-shaped so persistence is a transport swap. |
| `?rm=1` query override | **Added** | Testing affordance wrapping `useReducedMotion` so the static Mode Shift variant can be audited without OS settings; documented, harmless in production. |

**21st.dev sourcing log:** catalog scanned with free `search` (queries: "multi step wizard framer motion", "dark dashboard sidebar analytics"; candidates seen: #7821 Multi-step Wizard, #8281 Multi-Step Form, #14941 Dashboard Sidebar, #1205 Stepper). **Zero `get_component` retrievals spent**: every candidate is shadcn-styled scaffolding whose only reusable content (AnimatePresence directional steps, collapsible shell) was cheaper to write directly in the 1% token system than to strip. Everything in this prototype is built from scratch.

**Phase 1 input:** `QUESTION_FRAMEWORK.md` present and consumed — `src/lib/framework.ts` transcribes its IDs, prompts, shapes, trigger routing (ST1 fires when S1 = no), the MVD path, and both ritual lines verbatim. No placeholder questions were needed.
