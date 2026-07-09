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
}

export interface Area {
  id: string;
  name: string;
  goal: string;
  metrics: MetricDef[];
  standards: string[];
  createdAt: string;
}

export type Recurrence = "new" | "repeat" | "chronic";

export interface DayRecord {
  date: string;
  areaId: string;
  kind: "full" | "mvd";
  sealed: boolean;
  answers: Record<string, AnswerValue>;
  weakness?: { text: string; recurrence: Recurrence };
}

export interface Prefs {
  rotation: boolean;
  deepTier: boolean;
  sound: boolean;
}
