// Quit engine — device-local tracking for bad habits and addiction recovery.
// Deliberately separate from the loop and the economy (founder ruling, same as
// Health): logging pays nothing, the review never reads this, colors are accent
// + neutrals only. One data model powers both sections; QUIT_COPY carries the
// two framings. General wellness support — not medical or clinical advice.

import type { Quit, QuitKind, Relapse, Urge } from "./types";
import { dayOffset } from "./mock";

/** Whole days between two ISO dates (a - b), floored at 0. */
function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T00:00:00`).getTime();
  const b = new Date(`${bIso}T00:00:00`).getTime();
  return Math.max(0, Math.round((a - b) / 86400000));
}

/** The date the current clean run began: day after the last relapse, else startedAt. */
export function cleanSince(quit: Quit): string {
  if (quit.relapses.length === 0) return quit.startedAt;
  const last = quit.relapses.reduce((m, r) => (r.date > m ? r.date : m), quit.relapses[0].date);
  const after = dayOffsetFrom(last, 1);
  // If they set a quit date later than the last slip, respect the later one.
  return after > quit.startedAt ? after : quit.startedAt;
}

function dayOffsetFrom(iso: string, offset: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + offset);
  // Format from local parts — toISOString() would shift the date across the
  // UTC boundary and quietly break the day-after-relapse math.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Days clean in the current run (0 on the first day). */
export function currentStreakDays(quit: Quit): number {
  return daysBetween(dayOffset(0), cleanSince(quit));
}

/** The longest clean run ever — spans between consecutive relapses (and now). */
export function longestStreakDays(quit: Quit): number {
  const bounds = [quit.startedAt, ...quit.relapses.map((r) => dayOffsetFrom(r.date, 1)), dayOffset(0)]
    .filter((d, i, a) => a.indexOf(d) === i)
    .sort();
  const relapseDates = quit.relapses.map((r) => r.date).sort();
  let best = currentStreakDays(quit);
  let runStart = bounds[0];
  for (const rd of relapseDates) {
    best = Math.max(best, daysBetween(rd, runStart));
    runStart = dayOffsetFrom(rd, 1);
  }
  return best;
}

const perDayUnits = (quit: Quit) => (quit.perDay ?? 0) * currentStreakDays(quit);

/** Dollars not spent since the clean run began. */
export function moneySaved(quit: Quit): number {
  if (!quit.perDay || !quit.costPerUnit) return 0;
  return Math.round(perDayUnits(quit) * quit.costPerUnit);
}

/** Hours reclaimed since the clean run began. */
export function hoursSaved(quit: Quit): number {
  if (!quit.perDay || !quit.minutesPerUnit) return 0;
  return Math.round((perDayUnits(quit) * quit.minutesPerUnit) / 60);
}

/** Units avoided since the clean run began (e.g. cigarettes not smoked). */
export function unitsAvoided(quit: Quit): number {
  return Math.round(perDayUnits(quit));
}

export const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365] as const;

export function reachedMilestones(quit: Quit): number[] {
  const d = currentStreakDays(quit);
  return MILESTONES.filter((m) => d >= m);
}

export function nextMilestone(quit: Quit): number | null {
  const d = currentStreakDays(quit);
  return MILESTONES.find((m) => m > d) ?? null;
}

/** Share of logged urges that were resisted (0–1), or null if none logged. */
export function resistedRate(quit: Quit): number | null {
  if (quit.urges.length === 0) return null;
  return quit.urges.filter((u) => u.resisted).length / quit.urges.length;
}

export function labelMilestone(days: number): string {
  if (days >= 365) return "1 year";
  if (days >= 30) return `${Math.round(days / 30)} mo`;
  return `${days}d`;
}

let counter = 0;
export function uid(prefix = "q"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyQuit(kind: QuitKind, name: string, startedAt: string): Quit {
  return {
    id: uid(kind === "habit" ? "hab" : "rec"),
    kind,
    name: name.trim(),
    startedAt,
    createdAt: dayOffset(0),
    relapses: [],
    urges: [],
    checkins: {},
  };
}

export function makeRelapse(date: string, trigger?: string, note?: string): Relapse {
  return { id: uid("rl"), date, trigger: trigger?.trim() || undefined, note: note?.trim() || undefined };
}

export function makeUrge(intensity: number, resisted: boolean, trigger?: string): Urge {
  return { id: uid("ug"), at: Date.now(), intensity, resisted, trigger: trigger?.trim() || undefined };
}

// ---- The two framings ----

export interface QuitCopy {
  section: string; // nav / page eyebrow
  title: string; // page headline
  addVerb: string; // "Break a habit" / "Start recovery"
  namePlaceholder: string;
  streakLabel: string; // "days clean" / "days sober"
  relapseVerb: string; // "I slipped" / "I relapsed"
  emptyLine: string;
  /** Shown only on the addiction page — supportive, non-clinical. */
  helpLine?: string;
}

export const QUIT_COPY: Record<QuitKind, QuitCopy> = {
  habit: {
    section: "Bad habits",
    title: "The things you're done carrying.",
    addVerb: "Break a habit",
    namePlaceholder: "e.g. Doomscrolling, late-night snacking, biting nails",
    streakLabel: "days free",
    relapseVerb: "I slipped",
    emptyLine: "Name a habit you're breaking. The counter starts the day you quit.",
  },
  addiction: {
    section: "Recovery",
    title: "One clean day, then the next.",
    addVerb: "Start recovery",
    namePlaceholder: "e.g. Alcohol, nicotine, gambling",
    streakLabel: "days clean",
    relapseVerb: "I relapsed",
    emptyLine: "Name what you're recovering from. Every clean day counts, starting now.",
    helpLine:
      "This is a private tracker, not treatment. If you're struggling, reach out to a doctor or a support line — you don't have to do it alone.",
  },
};
