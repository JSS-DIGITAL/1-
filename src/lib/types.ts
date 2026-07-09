// Data contracts. Shaped so a real backend can replace the mock store
// without redesign: every entity is serialisable, keyed, and dated.

export type Mode = "student" | "teacher";

export type MetricDef = { key: string; label: string; unit: string };

export type AnswerShape =
  | { kind: "binary"; evidence?: boolean }
  | { kind: "enum"; options: string[]; note?: boolean }
  | { kind: "scale" } // 0–10
  | { kind: "count" } // values per area metric
  | { kind: "list"; max: number }
  | { kind: "line"; secondPrompt?: string }
  | { kind: "text" } // ≤3 sentences
  | { kind: "mission" }; // when + where + what

export interface Question {
  id: string;
  mode: Mode;
  tier: "core" | "deep" | "trigger";
  prompt: string;
  hint?: string;
  shape: AnswerShape;
  metric: string;
}

export type AnswerValue =
  | { kind: "binary"; value: boolean; evidence?: string }
  | { kind: "enum"; value: string; note?: string }
  | { kind: "scale"; value: number }
  | { kind: "count"; values: Record<string, number> }
  | { kind: "list"; items: string[] }
  | { kind: "line"; value: string; second?: string }
  | { kind: "text"; value: string }
  | { kind: "mission"; when: string; where: string; what: string };

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
}

// ---- The economy ----

export type LedgerBook = "candor" | "judgment";

export interface LedgerEntry {
  date: string;
  book: LedgerBook;
  source: "candor" | "resolve" | "bounty" | "shield" | "weekly" | "objectives";
  bp: number;
  note: string;
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
}
