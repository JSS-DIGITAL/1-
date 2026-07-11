// Health — device-local calorie/macro tracking, goals and trends.
// Deliberately separate from the loop and the economy (founder ruling):
// logging pays nothing, the review never reads this. Food data is a curated
// offline library + the user's own saved foods — no external API, no keys.
// Targets use Mifflin-St Jeor; general wellness numbers, not medical advice.

import type { HealthDay, HealthGoals, HealthProfile, SavedFood } from "./types";

/** ~60 common foods & meals, kcal + macros per typical serving (AU-flavored). */
export const FOOD_LIBRARY: SavedFood[] = [
  // breakfast basics
  { name: "Oats (1 cup cooked)", kcal: 160, protein: 6, carbs: 27, fat: 3 },
  { name: "Egg (1 large)", kcal: 74, protein: 6, carbs: 0, fat: 5 },
  { name: "Scrambled eggs (2) + butter", kcal: 200, protein: 13, carbs: 1, fat: 15 },
  { name: "Toast (1 slice, wholegrain)", kcal: 90, protein: 4, carbs: 15, fat: 1 },
  { name: "Peanut butter (1 tbsp)", kcal: 95, protein: 4, carbs: 3, fat: 8 },
  { name: "Greek yoghurt (170g)", kcal: 100, protein: 17, carbs: 6, fat: 1 },
  { name: "Banana", kcal: 105, protein: 1, carbs: 27, fat: 0 },
  { name: "Apple", kcal: 95, protein: 0, carbs: 25, fat: 0 },
  { name: "Berries (1 cup)", kcal: 85, protein: 1, carbs: 21, fat: 0 },
  { name: "Muesli + milk (bowl)", kcal: 340, protein: 12, carbs: 52, fat: 9 },
  { name: "Smashed avo on toast", kcal: 350, protein: 8, carbs: 32, fat: 21 },
  { name: "Banana bread (slice)", kcal: 320, protein: 5, carbs: 45, fat: 13 },
  // proteins
  { name: "Chicken breast (100g cooked)", kcal: 165, protein: 31, carbs: 0, fat: 4 },
  { name: "Chicken thigh (100g cooked)", kcal: 210, protein: 26, carbs: 0, fat: 11 },
  { name: "Beef mince lean (100g cooked)", kcal: 215, protein: 27, carbs: 0, fat: 11 },
  { name: "Steak (200g cooked)", kcal: 440, protein: 56, carbs: 0, fat: 24 },
  { name: "Salmon fillet (150g)", kcal: 310, protein: 33, carbs: 0, fat: 19 },
  { name: "Tuna (can, in springwater)", kcal: 105, protein: 24, carbs: 0, fat: 1 },
  { name: "Lamb chop (100g)", kcal: 260, protein: 25, carbs: 0, fat: 18 },
  { name: "Tofu (150g)", kcal: 115, protein: 12, carbs: 3, fat: 7 },
  { name: "Protein shake (1 scoop + water)", kcal: 120, protein: 25, carbs: 3, fat: 1 },
  { name: "Protein bar", kcal: 220, protein: 20, carbs: 22, fat: 8 },
  // carbs & sides
  { name: "White rice (1 cup cooked)", kcal: 205, protein: 4, carbs: 45, fat: 0 },
  { name: "Brown rice (1 cup cooked)", kcal: 215, protein: 5, carbs: 45, fat: 2 },
  { name: "Pasta (1 cup cooked)", kcal: 220, protein: 8, carbs: 43, fat: 1 },
  { name: "Potato (medium, baked)", kcal: 160, protein: 4, carbs: 37, fat: 0 },
  { name: "Sweet potato (medium)", kcal: 115, protein: 2, carbs: 27, fat: 0 },
  { name: "Hot chips (medium serve)", kcal: 430, protein: 5, carbs: 55, fat: 21 },
  { name: "Bread roll", kcal: 150, protein: 5, carbs: 28, fat: 2 },
  { name: "Wrap / tortilla", kcal: 170, protein: 5, carbs: 28, fat: 4 },
  // veg & salads
  { name: "Mixed salad (bowl, no dressing)", kcal: 50, protein: 2, carbs: 8, fat: 1 },
  { name: "Steamed veg (1 cup)", kcal: 60, protein: 3, carbs: 11, fat: 0 },
  { name: "Caesar salad (with chicken)", kcal: 550, protein: 35, carbs: 18, fat: 38 },
  // meals
  { name: "Chicken & rice bowl", kcal: 550, protein: 40, carbs: 60, fat: 12 },
  { name: "Spaghetti bolognese (plate)", kcal: 650, protein: 32, carbs: 70, fat: 25 },
  { name: "Stir fry (chicken + veg + rice)", kcal: 600, protein: 35, carbs: 65, fat: 18 },
  { name: "Butter chicken + rice", kcal: 780, protein: 35, carbs: 75, fat: 36 },
  { name: "Pad thai", kcal: 700, protein: 25, carbs: 85, fat: 28 },
  { name: "Sushi roll (1 whole)", kcal: 300, protein: 12, carbs: 55, fat: 4 },
  { name: "Poke bowl", kcal: 560, protein: 30, carbs: 65, fat: 18 },
  { name: "Burrito", kcal: 650, protein: 28, carbs: 70, fat: 27 },
  { name: "Ham & cheese sandwich", kcal: 360, protein: 18, carbs: 35, fat: 15 },
  { name: "Chicken schnitzel + chips", kcal: 900, protein: 45, carbs: 75, fat: 45 },
  { name: "Meat pie", kcal: 450, protein: 15, carbs: 40, fat: 25 },
  { name: "Sausage roll", kcal: 380, protein: 10, carbs: 30, fat: 24 },
  // takeaway
  { name: "Big Mac", kcal: 550, protein: 25, carbs: 45, fat: 30 },
  { name: "Cheeseburger", kcal: 300, protein: 15, carbs: 32, fat: 13 },
  { name: "Large fries", kcal: 460, protein: 6, carbs: 59, fat: 22 },
  { name: "Pizza (2 slices)", kcal: 570, protein: 22, carbs: 60, fat: 26 },
  { name: "Kebab (lamb, full)", kcal: 750, protein: 40, carbs: 60, fat: 38 },
  { name: "Fried chicken (3 pieces)", kcal: 720, protein: 45, carbs: 25, fat: 48 },
  // drinks & snacks
  { name: "Flat white (full cream)", kcal: 120, protein: 6, carbs: 9, fat: 6 },
  { name: "Flat white (skim)", kcal: 70, protein: 6, carbs: 9, fat: 0 },
  { name: "Long black / espresso", kcal: 5, protein: 0, carbs: 0, fat: 0 },
  { name: "Soft drink (can)", kcal: 150, protein: 0, carbs: 39, fat: 0 },
  { name: "Beer (schooner)", kcal: 160, protein: 1, carbs: 12, fat: 0 },
  { name: "Red wine (glass)", kcal: 125, protein: 0, carbs: 4, fat: 0 },
  { name: "Milk (1 cup, full cream)", kcal: 150, protein: 8, carbs: 12, fat: 8 },
  { name: "Almonds (30g handful)", kcal: 175, protein: 6, carbs: 6, fat: 15 },
  { name: "Chocolate (row, 25g)", kcal: 135, protein: 2, carbs: 15, fat: 8 },
  { name: "Chips (small bag)", kcal: 250, protein: 3, carbs: 25, fat: 15 },
  { name: "Ice cream (2 scoops)", kcal: 275, protein: 5, carbs: 32, fat: 14 },
  { name: "Muffin (cafe)", kcal: 420, protein: 6, carbs: 55, fat: 19 },
];

export const ACTIVITY_FACTORS: Record<HealthProfile["activity"], { factor: number; label: string }> = {
  sedentary: { factor: 1.2, label: "Sedentary — desk day, little movement" },
  light: { factor: 1.375, label: "Light — walks, 1–2 sessions/week" },
  moderate: { factor: 1.55, label: "Moderate — training 3–5 days/week" },
  active: { factor: 1.725, label: "Active — hard training 6–7 days/week" },
  athlete: { factor: 1.9, label: "Athlete — physical job + training" },
};

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function bmrMifflinStJeor(p: HealthProfile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === "male" ? base + 5 : base - 161);
}

export function tdee(p: HealthProfile): number {
  return Math.round(bmrMifflinStJeor(p) * ACTIVITY_FACTORS[p.activity].factor);
}

export type HealthGoalKind = "lose" | "maintain" | "gain";

/** Suggested daily targets. Protein: 1.6 g/kg maintain, 2.0 lose, 1.8 gain. */
export function suggestTargets(p: HealthProfile, goal: HealthGoalKind): { kcal: number; protein: number } {
  const t = tdee(p);
  const kcal = goal === "lose" ? Math.max(1200, t - 500) : goal === "gain" ? t + 300 : t;
  const gPerKg = goal === "lose" ? 2.0 : goal === "gain" ? 1.8 : 1.6;
  return { kcal, protein: Math.round(p.weightKg * gPerKg) };
}

// ---- Day totals ----

export function kcalOf(day: HealthDay | undefined): number {
  if (!day) return 0;
  return Math.round(day.foods.reduce((s, f) => s + f.kcal * f.qty, 0));
}

export function macrosOf(day: HealthDay | undefined): { protein: number; carbs: number; fat: number } {
  if (!day) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Math.round(day.foods.reduce((s, f) => s + (f.protein ?? 0) * f.qty, 0)),
    carbs: Math.round(day.foods.reduce((s, f) => s + (f.carbs ?? 0) * f.qty, 0)),
    fat: Math.round(day.foods.reduce((s, f) => s + (f.fat ?? 0) * f.qty, 0)),
  };
}

export function workoutMinutesOf(day: HealthDay | undefined): number {
  if (!day) return 0;
  return day.workouts.reduce((s, w) => s + w.minutes, 0);
}

export function emptyHealthDay(date: string): HealthDay {
  return { date, foods: [], waterMl: 0, workouts: [] };
}

export const DEFAULT_HEALTH_GOALS: HealthGoals = { waterTargetMl: 2000 };
