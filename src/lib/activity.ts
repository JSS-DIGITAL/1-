// Physical activity — device-local movement tracker. Separate section, same
// founder ruling as Health: logging pays no bp, the review never reads it,
// accent + neutrals only. Distinct from Health's light workout logger — this
// carries an exercise library, sets/reps, a weekly movement goal and streaks.
// Calorie estimates use MET values; general wellness numbers, not medical advice.

import type { ActivityEntry, ActivityGoals, HealthDay, RecoveryDay, SavedExercise } from "./types";
import { dayOffset } from "./mock";

export const ACTIVITY_CATEGORIES = ["Strength", "Cardio", "Mobility", "Sport", "Recovery"] as const;

/** ~40 common movements. met = metabolic equivalent (rough); kind drives logging shape. */
export const EXERCISE_LIBRARY: SavedExercise[] = [
  // Strength
  { name: "Squat", category: "Strength", kind: "reps", met: 5 },
  { name: "Deadlift", category: "Strength", kind: "reps", met: 6 },
  { name: "Bench press", category: "Strength", kind: "reps", met: 5 },
  { name: "Overhead press", category: "Strength", kind: "reps", met: 5 },
  { name: "Barbell row", category: "Strength", kind: "reps", met: 5 },
  { name: "Pull-up", category: "Strength", kind: "reps", met: 6 },
  { name: "Push-up", category: "Strength", kind: "reps", met: 4 },
  { name: "Lunge", category: "Strength", kind: "reps", met: 4 },
  { name: "Dumbbell curl", category: "Strength", kind: "reps", met: 3.5 },
  { name: "Plank", category: "Strength", kind: "time", met: 3.5 },
  { name: "Kettlebell swing", category: "Strength", kind: "reps", met: 6 },
  { name: "Leg press", category: "Strength", kind: "reps", met: 5 },
  { name: "Dips", category: "Strength", kind: "reps", met: 5 },
  { name: "Hip thrust", category: "Strength", kind: "reps", met: 5 },
  // Cardio
  { name: "Running", category: "Cardio", kind: "time", met: 9.8 },
  { name: "Walking (brisk)", category: "Cardio", kind: "time", met: 4.3 },
  { name: "Cycling", category: "Cardio", kind: "time", met: 7.5 },
  { name: "Rowing (erg)", category: "Cardio", kind: "time", met: 7 },
  { name: "Swimming", category: "Cardio", kind: "time", met: 8 },
  { name: "Jump rope", category: "Cardio", kind: "time", met: 11 },
  { name: "Elliptical", category: "Cardio", kind: "time", met: 5 },
  { name: "Stair climber", category: "Cardio", kind: "time", met: 8 },
  { name: "HIIT circuit", category: "Cardio", kind: "time", met: 8 },
  { name: "Incline treadmill", category: "Cardio", kind: "time", met: 6 },
  { name: "Hiking", category: "Cardio", kind: "time", met: 6 },
  // Mobility
  { name: "Yoga", category: "Mobility", kind: "time", met: 3 },
  { name: "Stretching", category: "Mobility", kind: "time", met: 2.3 },
  { name: "Pilates", category: "Mobility", kind: "time", met: 3.5 },
  { name: "Foam rolling", category: "Mobility", kind: "time", met: 2 },
  { name: "Mobility flow", category: "Mobility", kind: "time", met: 2.8 },
  // Sport
  { name: "Football / soccer", category: "Sport", kind: "time", met: 7 },
  { name: "Basketball", category: "Sport", kind: "time", met: 6.5 },
  { name: "Tennis", category: "Sport", kind: "time", met: 7 },
  { name: "Boxing", category: "Sport", kind: "time", met: 9 },
  { name: "Martial arts", category: "Sport", kind: "time", met: 10 },
  { name: "Golf (walking)", category: "Sport", kind: "time", met: 4.3 },
  { name: "Cricket", category: "Sport", kind: "time", met: 5 },
  { name: "Netball", category: "Sport", kind: "time", met: 6 },
  { name: "Surfing", category: "Sport", kind: "time", met: 5 },
  { name: "Climbing", category: "Sport", kind: "time", met: 8 },
  // Recovery — rest is training
  { name: "Sauna", category: "Recovery", kind: "time", met: 1.5 },
  { name: "Ice bath / cold plunge", category: "Recovery", kind: "time", met: 1.5 },
  { name: "Massage / massage gun", category: "Recovery", kind: "time", met: 1.3 },
  { name: "Nap", category: "Recovery", kind: "time", met: 1 },
  { name: "Breathwork", category: "Recovery", kind: "time", met: 1.2 },
  { name: "Meditation", category: "Recovery", kind: "time", met: 1 },
  { name: "Easy walk (recovery)", category: "Recovery", kind: "time", met: 2.8 },
  { name: "Contrast shower", category: "Recovery", kind: "time", met: 1.5 },
];

export const DEFAULT_ACTIVITY_GOALS: ActivityGoals = { weeklyMinutes: 150, weeklySessions: 4 };

/** Rough kcal for a timed entry via MET: kcal = MET × 3.5 × kg / 200 × minutes. */
export function kcalEstimate(entry: ActivityEntry, weightKg = 75): number {
  const met = EXERCISE_LIBRARY.find((e) => e.name === entry.name)?.met ?? 4;
  const mins = entry.minutes ?? 0;
  if (!mins) return 0;
  return Math.round(((met * 3.5 * weightKg) / 200) * mins);
}

export function entryMinutes(entry: ActivityEntry): number {
  return entry.minutes ?? 0;
}

/** ISO dates for the current Mon–Sun week (or last 7 days ending today). */
export function last7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => dayOffset(i - 6));
}

export function weeklyMinutes(entries: ActivityEntry[]): number {
  const week = new Set(last7Dates());
  return entries.filter((e) => week.has(e.date)).reduce((s, e) => s + entryMinutes(e), 0);
}

export function weeklySessions(entries: ActivityEntry[]): number {
  const week = new Set(last7Dates());
  const days = new Set(entries.filter((e) => week.has(e.date)).map((e) => e.date));
  return days.size;
}

/**
 * Consecutive days up to today with at least one session — or a deliberately
 * marked rest day. Rest is training: a marked rest day keeps the streak alive.
 */
export function activityStreakDays(entries: ActivityEntry[], recoveryDays: RecoveryDay[] = []): number {
  const days = new Set(entries.map((e) => e.date));
  const rests = new Set(recoveryDays.filter((r) => r.rest).map((r) => r.date));
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = dayOffset(-i);
    if (days.has(d) || rests.has(d)) streak++;
    else if (i === 0) continue; // today may be unlogged yet
    else break;
  }
  return streak;
}

// ---- Rest & recovery (rest is training) ----

/** True when the entry is actual training, not a recovery modality. */
function isTraining(e: ActivityEntry): boolean {
  return e.category !== "Recovery";
}

/**
 * Training days in a row up to today. A marked rest day — or any day without
 * a training session — breaks the chain (that's the point of resting).
 */
export function consecutiveTrainingDays(entries: ActivityEntry[], recoveryDays: RecoveryDay[] = []): number {
  const days = new Set(entries.filter(isTraining).map((e) => e.date));
  const rests = new Set(recoveryDays.filter((r) => r.rest).map((r) => r.date));
  let run = 0;
  for (let i = 0; i < 60; i++) {
    const d = dayOffset(-i);
    if (rests.has(d)) break;
    if (days.has(d)) run++;
    else if (i === 0) continue; // today may be unlogged yet
    else break;
  }
  return run;
}

/** Weighted 7-day training load: hard = 2, moderate = 1, easy = 0.5 per session. */
export function trainingLoad7d(entries: ActivityEntry[]): number {
  const week = new Set(last7Dates());
  return entries
    .filter((e) => week.has(e.date) && isTraining(e))
    .reduce((s, e) => s + (e.intensity === "hard" ? 2 : e.intensity === "easy" ? 0.5 : 1), 0);
}

/** Mean logged sleep over the last 7 days; null until there are 2+ logs. */
export function avgSleep7d(healthDays: HealthDay[]): number | null {
  const week = new Set(last7Dates());
  const hs = healthDays.filter((d) => week.has(d.date) && d.sleepH !== undefined).map((d) => d.sleepH as number);
  if (hs.length < 2) return null;
  return Math.round((hs.reduce((s, h) => s + h, 0) / hs.length) * 10) / 10;
}

/** Today's soreness, falling back to yesterday's. */
export function latestSoreness(recoveryDays: RecoveryDay[]): number | undefined {
  return (
    recoveryDays.find((r) => r.date === dayOffset(0))?.soreness ??
    recoveryDays.find((r) => r.date === dayOffset(-1))?.soreness
  );
}

export type RecoveryLevel = "fresh" | "steady" | "rest";

/**
 * Rule-based recovery verdict. Rest advised when any strain signal fires;
 * fresh when the load is genuinely light; steady otherwise.
 */
export function recoveryStatus(input: {
  consecutive: number;
  load: number;
  sleepAvg: number | null;
  soreness?: number;
}): { level: RecoveryLevel; reasons: string[] } {
  const reasons: string[] = [];
  if (input.consecutive >= 4) reasons.push(`${input.consecutive} training days in a row — schedule a rest day`);
  if (input.load >= 10) reasons.push("heavy 7-day training load");
  if (input.soreness !== undefined && input.soreness >= 4) reasons.push("soreness is high — let it settle");
  if (input.sleepAvg !== null && input.sleepAvg < 6) reasons.push(`avg sleep ${input.sleepAvg}h — aim for 7+`);
  if (reasons.length > 0) return { level: "rest", reasons };
  if (input.load <= 3 && (input.soreness ?? 1) <= 2) {
    return { level: "fresh", reasons: ["load is light and the body feels good — train"] };
  }
  return { level: "steady", reasons: ["load is manageable — keep an eye on sleep and soreness"] };
}

export function minutesOnDate(entries: ActivityEntry[], date: string): number {
  return entries.filter((e) => e.date === date).reduce((s, e) => s + entryMinutes(e), 0);
}

let counter = 0;
export function activityId(): string {
  counter += 1;
  return `act-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}
