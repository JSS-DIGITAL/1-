// Transcribed from QUESTION_FRAMEWORK.md §1, §3, §7 — the Phase 1 contract.
// IDs, prompts, shapes and routing are the framework's; do not invent here.

import type { Question } from "./types";

export const QUESTIONS: Record<string, Question> = {
  S1: {
    id: "S1",
    mode: "student",
    tier: "core",
    prompt: "Yesterday's mission: did I execute it?",
    hint: "Yes or no. Then the evidence — something an outside audit would accept.",
    shape: { kind: "binary", evidence: true },
    metric: "mission_completion_rate",
  },
  S2: {
    id: "S2",
    mode: "student",
    tier: "core",
    prompt: "What did I complete today?",
    hint: "Evidence a stranger could verify — artifacts, numbers, submissions. Not activities.",
    shape: { kind: "list", max: 5 },
    metric: "output_volume",
  },
  S3: {
    id: "S3",
    mode: "student",
    tier: "core",
    prompt: "Log today's numbers.",
    hint: "The area's metrics. Numbers cannot be rewritten by mood.",
    shape: { kind: "count" },
    metric: "output_volume",
  },
  S4: {
    id: "S4",
    mode: "student",
    tier: "core",
    prompt: "What did I avoid or postpone today?",
    hint: "And name what filled that time instead. The replacement is the tell.",
    shape: { kind: "line", secondPrompt: "…and what did I do instead?" },
    metric: "avoidance_incidence",
  },
  S5: {
    id: "S5",
    mode: "student",
    tier: "core",
    prompt: "Which condition most shaped execution today?",
    hint: "Sleep, time, place, people, tools, body. State the fact and its effect.",
    shape: { kind: "line" },
    metric: "condition_correlates",
  },
  ST1: {
    id: "ST1",
    mode: "student",
    tier: "trigger",
    prompt: "Where was I when the mission's window passed — and what was I doing?",
    hint: "The timeline always contains a decision point. Facts only.",
    shape: { kind: "text" },
    metric: "mission_failure_context",
  },
  T1: {
    id: "T1",
    mode: "teacher",
    tier: "core",
    prompt: "Verdict on yesterday's mission.",
    hint: "Would the evidence in this record survive an outside audit?",
    shape: { kind: "enum", options: ["executed", "partial", "failed"] },
    metric: "mission_completion_rate",
  },
  T2: {
    id: "T2",
    mode: "teacher",
    tier: "core",
    prompt: "Where in this record is motion without progress?",
    hint: "Point at a line in the record, or state “none”. None-streaks are tracked.",
    shape: { kind: "line" },
    metric: "motion_waste",
  },
  T3: {
    id: "T3",
    mode: "teacher",
    tier: "core",
    prompt: "Name the single weakness this record exposes.",
    hint: "One. It must be in the record — not a theory about character.",
    shape: { kind: "enum", options: ["new", "repeat", "chronic"], note: true },
    metric: "weakness_recurrence",
  },
  T4: {
    id: "T4",
    mode: "teacher",
    tier: "core",
    prompt: "Set tomorrow's mission.",
    hint: "When, where, what — one sentence a witness could verify.",
    shape: { kind: "mission" },
    metric: "mission_completion_rate",
  },
  T5: {
    id: "T5",
    mode: "teacher",
    tier: "core",
    prompt: "Honestly — how likely is completion?",
    hint: "This number meets tomorrow's binary. Chronic 9s that land 40% become visible.",
    shape: { kind: "scale" },
    metric: "calibration_error",
  },
  T6: {
    id: "T6",
    mode: "teacher",
    tier: "core",
    prompt: "Where will it most likely break?",
    hint: "Name the obstacle and the counter-move: “If X, then Y.”",
    shape: { kind: "line" },
    metric: "mission_failure_context",
  },
};

/** Full-day Student sequence. S1 only when a mission exists; ST1 fires when S1 = no. */
export function studentSteps(opts: { hasMission: boolean; s1No: boolean; mvd: boolean }): string[] {
  if (opts.mvd) return opts.hasMission ? ["S1", "S2"] : ["S2"];
  const steps: string[] = [];
  if (opts.hasMission) steps.push("S1");
  steps.push("S2", "S3", "S4");
  if (opts.s1No) steps.push("ST1");
  steps.push("S5");
  return steps;
}

/** Teacher sequence. T1 only when a mission existed to be judged. */
export function teacherSteps(opts: { hasMission: boolean; mvd: boolean }): string[] {
  if (opts.mvd) return opts.hasMission ? ["T1", "T4", "T5"] : ["T4", "T5"];
  const steps: string[] = [];
  if (opts.hasMission) steps.push("T1");
  steps.push("T2", "T3", "T4", "T5", "T6");
  return steps;
}

export const MODE_SHIFT_LINE = "The record is sealed. Only what is written exists.";
export const REVERSE_SHIFT_LINE = "One order on the desk.";
