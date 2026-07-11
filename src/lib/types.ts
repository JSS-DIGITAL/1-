// Data contracts. Shaped so a real backend can replace the mock store
// without redesign: every entity is serialisable, keyed, and dated.

export type Mode = "student" | "teacher";

export type MetricDef = { key: string; label: string; unit: string };

export type AnswerShape =
  | { kind: "binary"; evidence?: boolean }
  | { kind: "enum"; options: string[]; note?: boolean; audit?: boolean }
  | { kind: "scale"; why?: boolean } // 0–10; why = required evidence-anchored explanation
  | { kind: "count" } // values per area metric
  | { kind: "list"; max: number }
  | { kind: "line"; secondPrompt?: string }
  | { kind: "text" } // free prose, no cap
  | { kind: "mission" }; // when + where + what

export interface Question {
  id: string;
  mode: Mode;
  tier: "core" | "deep" | "trigger";
  prompt: string;
  hint?: string;
  shape: AnswerShape;
  metric: string;
  /** Founder-authored benchmark answer — tap-to-reveal in the flow. */
  example?: string;
}

export type AnswerValue =
  | { kind: "binary"; value: boolean; evidence?: string }
  | { kind: "enum"; value: string; note?: string; audit?: boolean }
  | { kind: "scale"; value: number; why?: string }
  | { kind: "count"; values: Record<string, number> }
  | { kind: "list"; items: string[] }
  | { kind: "line"; value: string; second?: string }
  | { kind: "text"; value: string }
  | { kind: "mission"; when: string; where: string; what: string };

// ---- Framework v2: sections + per-area customization ----

/** A section screen: a category of thinking. Triggers are prompts, not fields —
 *  the prose response may address all, some, or none. Anchors alone gate. */
export interface Section {
  id: string;
  mode: Mode;
  name: string;
  /** One line under the name: what this section is for. */
  purpose: string;
  /** The thinking goal, quoted: the single question behind the cluster. */
  goal: string;
  /** Thinking triggers — visible prompts above the prose field. */
  triggers: string[];
  /** Required shaped question ids rendered inside this section. */
  anchors: string[];
  /** DayRecord.answers key for this section's prose (kind: "text"). */
  proseId: string;
  placeholder: string;
  /** Founder-authored benchmark answer for the section prose. */
  example?: string;
  /** Optional one-tap cause picker (skippable, never gates). */
  cause?: { id: string; prompt: string; options: string[] };
}

/** Per-area rewording of a question or section. Structure (ids, shapes,
 *  metrics, order) is locked; wording is the user's. */
export interface QuestionOverride {
  prompt?: string;
  hint?: string;
  example?: string;
  name?: string;
  purpose?: string;
  triggers?: string[];
  placeholder?: string;
}

/** A user-added question (max 2 per area). Never pays bp, never gates. */
export interface CustomQuestion {
  id: string; // "C1" | "C2"
  mode: Mode;
  prompt: string;
  hint?: string;
  example?: string;
  shape: { kind: "line" } | { kind: "text" };
}

export type MissionOutcome = "executed" | "partial" | "failed";

export interface Mission {
  /** The day the mission is FOR (YYYY-MM-DD). Committed the evening before. */
  date: string;
  areaId: string;
  when: string;
  where: string;
  what: string;
  confidence: number; // 0–10, the calibration prediction
  ifThen?: string;
  outcome?: MissionOutcome; // ruled by the next day's Teacher (T1)
  /** A Momentum Shield burned on this failure — the chain holds through it. */
  shielded?: boolean;
}

export interface Area {
  id: string;
  name: string;
  goal: string;
  metrics: MetricDef[];
  standards: string[];
  createdAt: string;
  /** Measurable target (Strides-style): metric must reach `value` by `by`. */
  target?: { metricKey: string; value: number; by: string };
  /** Per-area rewording, keyed by question id or section id. */
  overrides?: Record<string, QuestionOverride>;
  /** User-added questions, max 2 per area. */
  customQuestions?: CustomQuestion[];
}

export type Recurrence = "new" | "repeat" | "chronic";

export type SealRarity = "standard" | "brass" | "ember" | "oxblood";

export interface Seal {
  rarity: SealRarity;
  label: string;
}

export interface DayRecord {
  date: string;
  areaId: string;
  kind: "full" | "mvd";
  sealed: boolean;
  answers: Record<string, AnswerValue>;
  weakness?: { text: string; recurrence: Recurrence };
  seal?: Seal;
  /** How many text answers were an explicit "none" — tracked, never shamed. */
  noneCount?: number;
}

// ---- The economy ----

export type LedgerBook = "candor" | "judgment";

export interface LedgerEntry {
  date: string;
  book: LedgerBook;
  source: "candor" | "resolve" | "bounty" | "shield" | "weekly" | "objectives" | "vault";
  bp: number;
  note: string;
}

// ---- The Vault Game (QUESTION_FRAMEWORK.md §12.10) ----

/** Tonight's combination: three digits earned by the day's honest acts. */
export interface VaultDigits {
  /** Verifiable: the record was sealed today. */
  seal: boolean;
  /** Anti-flattering: a real avoidance named in S4 (not "none"). */
  candor: boolean;
  /** Prediction-tested: the wager landed within ±2 of the outcome. */
  calibration: boolean;
}

export interface VaultState {
  /** Skill-crack attempts in the bank (earned by sealing; capped). */
  attempts: number;
  digits: VaultDigits;
  /** The day the digits were earned — stale digits reset on hydrate. */
  digitsDate?: string;
  /** The combination's displayed digit values (derived from the day). */
  digitValues: [number, number, number];
  /** Date of the last successful open (one open per day, master exempt). */
  lastOpen?: string;
  /** Consecutive days with an open; 7 arms the Master Vault. */
  streak: number;
  masterAvailable: boolean;
  /** Item ids of owned unlockables (accents, seal skins, features, archive key). */
  unlocks: string[];
  /** The archive stands open through this date (YYYY-MM-DD). */
  archiveUntil?: string;
}

/** A Fuel item — motivation, private or community. Public requires founder review. */
export interface MotivationItem {
  id: string;
  text: string;
  author: string;
  source: "seed" | "user";
  visibility: "private" | "pending" | "public";
  saves: number;
  addedAt: string;
}

export interface FocusLog {
  date: string;
  minutes: number;
  missionWhat: string;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  earned: boolean;
}

export interface PersonalRecords {
  longestChain: number;
  bestDayBp: number;
  bestWeekBp: number;
  recordsLogged: number;
}

export interface Bounty {
  text: string;
  count: number;
  status: "open" | "killed";
  lastSeen: string;
}

export interface RankInfo {
  name: string;
  index: number;
  min: number;
  next?: { name: string; min: number };
  /** 0–1 toward the next rank (1 when at top rank). */
  progress: number;
}

export interface ResolveResult {
  confidence: number;
  outcome: MissionOutcome;
  executionPay: number;
  calibrationBonus: number;
  momentum: number;
  total: number;
}

export interface Prefs {
  rotation: boolean;
  deepTier: boolean;
  sound: boolean;
  /** Aggressive one-liners in the chrome. Never inside questions or payouts. */
  hardLines: boolean;
  /** Two-speed UX: simple = essentials + Minimum-day default; operator = every instrument. */
  density: "simple" | "operator";
  /** Stub — no real notifications in the prototype. */
  dailyPush: boolean;
  /** Reminder time for the push stub (HH:MM). */
  pushTime: string;
  /** The Signet (legendary vault unlock): your words on every seal. */
  customSealLabel?: string;
}
