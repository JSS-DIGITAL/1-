// Physical activity — device-local movement tracker. Separate section, same
// founder ruling as Health: logging pays no bp, the review never reads it,
// accent + neutrals only. Distinct from Health's light workout logger — this
// carries an exercise library, sets/reps, a weekly movement goal and streaks.
// Calorie estimates use MET values; general wellness numbers, not medical advice.

import type { ActivityEntry, ActivityGoals, SavedExercise } from "./types";
import { dayOffset } from "./mock";

export const ACTIVITY_CATEGORIES = ["Strength", "Cardio", "Mobility", "Sport"] as const;

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

/** Consecutive days up to today with at least one session. */
export function activityStreakDays(entries: ActivityEntry[]): number {
  const days = new Set(entries.map((e) => e.date));
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = dayOffset(-i);
    if (days.has(d)) streak++;
    else if (i === 0) continue; // today may be unlogged yet
    else break;
  }
  return streak;
}

export function minutesOnDate(entries: ActivityEntry[], date: string): number {
  return entries.filter((e) => e.date === date).reduce((s, e) => s + entryMinutes(e), 0);
}

let counter = 0;
export function activityId(): string {
  counter += 1;
  return `act-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}
