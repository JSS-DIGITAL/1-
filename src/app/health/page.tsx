"use client";

// Health — calories, macros, water, weight, steps, sleep, workouts, goals.
// Deliberately SEPARATE from the loop (founder ruling): the review never
// reads this, logging pays no bp. Colors: accent + neutrals only — gold is
// money, loot colors are loot. All data device-local, offline food library.

import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Sparkline } from "@/components/charts";
import { Button, Card, Chip, Label } from "@/components/ui";
import {
  ACTIVITY_FACTORS,
  FOOD_LIBRARY,
  kcalOf,
  macrosOf,
  suggestTargets,
  tdee,
  workoutMinutesOf,
  type HealthGoalKind,
} from "@/lib/health";
import { dayOffset } from "@/lib/mock";
import { useApp } from "@/lib/store";
import type { FoodEntry, HealthDay, HealthProfile, MealSlot, SavedFood } from "@/lib/types";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";
const smallField =
  "rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2.5 py-2 text-[0.875rem] text-ink outline-none placeholder:text-muted/45 focus:border-accent";

const MEALS: { id: MealSlot; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snacks" },
];

export default function HealthPage() {
  const { healthDays, healthGoals } = useApp();
  const [date, setDate] = useState(() => dayOffset(0));
  const day = healthDays.find((d) => d.date === date);
  const eaten = kcalOf(day);
  const macros = macrosOf(day);
  const target = healthGoals.kcalTarget;

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Label>Health</Label>
          <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">The machine you run on.</h1>
        </div>
        <span className="type-mono text-[0.625rem] text-muted/70">general wellness numbers — not medical advice</span>
      </div>

      <DaySelector date={date} setDate={setDate} />

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-[var(--gap)]">
          {/* Intake */}
          <Card rule>
            <div className="flex items-baseline justify-between gap-3">
              <Label>Intake</Label>
              <span className="type-mono text-[0.8125rem] text-muted">
                <span className="text-[1.25rem] text-accent">{eaten}</span>
                {target ? ` / ${target} kcal` : " kcal"}
                {target && (
                  <span className={eaten > target ? " text-ink" : ""}>
                    {" "}
                    · {target - eaten >= 0 ? `${target - eaten} left` : `${eaten - target} over`}
                  </span>
                )}
              </span>
            </div>
            {target && (
              <div className="mt-2 h-[6px] w-full rounded-full bg-line/60">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.min(100, (eaten / target) * 100)}%` }}
                />
              </div>
            )}
            <div className="type-mono mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem] text-muted">
              <span>
                protein <span className="text-ink">{macros.protein}g</span>
                {healthGoals.proteinTarget ? ` / ${healthGoals.proteinTarget}g` : ""}
              </span>
              <span>
                carbs <span className="text-ink">{macros.carbs}g</span>
              </span>
              <span>
                fat <span className="text-ink">{macros.fat}g</span>
              </span>
              {workoutMinutesOf(day) > 0 && (
                <span>
                  trained <span className="text-ink">{workoutMinutesOf(day)} min</span>
                </span>
              )}
            </div>
          </Card>

          {MEALS.map((m) => (
            <MealSection key={m.id} meal={m} date={date} day={day} />
          ))}
        </div>

        <div className="min-w-0 space-y-[var(--gap)]">
          <BodyCard date={date} day={day} />
          <GoalsCard />
          <TrendsCard />
        </div>
      </div>
    </Shell>
  );
}

function DaySelector({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const days = Array.from({ length: 7 }, (_, i) => dayOffset(i - 6));
  return (
    <div className="mt-5 flex flex-wrap gap-1.5">
      {days.map((d) => {
        const label = d === dayOffset(0) ? "today" : new Date(`${d}T00:00:00`).toLocaleDateString("en-AU", { weekday: "short" });
        return (
          <button
            key={d}
            onClick={() => setDate(d)}
            className={`type-mono rounded-[var(--radius-sm)] border px-3 py-1.5 text-[0.6875rem] ${
              date === d ? "border-accent bg-accent/10 text-ink" : "border-line text-muted hover:border-muted"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** One meal: entries + quick-pick search + manual add. */
function MealSection({ meal, date, day }: { meal: { id: MealSlot; label: string }; date: string; day: HealthDay | undefined }) {
  const { updateHealthDay, savedFoods, addSavedFood } = useApp();
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState(false);
  const [mName, setMName] = useState("");
  const [mKcal, setMKcal] = useState("");
  const [mProtein, setMProtein] = useState("");
  const [mSave, setMSave] = useState(true);
  const [qty, setQty] = useState(1);

  const entries = (day?.foods ?? []).filter((f) => f.meal === meal.id);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const mine = savedFoods.filter((f) => f.name.toLowerCase().includes(q)).map((f) => ({ ...f, mine: true }));
    const lib = FOOD_LIBRARY.filter((f) => f.name.toLowerCase().includes(q)).map((f) => ({ ...f, mine: false }));
    return [...mine, ...lib].slice(0, 6);
  }, [query, savedFoods]);

  const addFood = (food: SavedFood) => {
    const entry: FoodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: food.name,
      kcal: food.kcal,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      meal: meal.id,
      qty,
    };
    updateHealthDay(date, { foods: [...(day?.foods ?? []), entry] });
    setQuery("");
    setQty(1);
  };

  const addManual = () => {
    const kcal = Number(mKcal);
    if (!mName.trim() || !Number.isFinite(kcal) || kcal <= 0) return;
    const food: SavedFood = { name: mName.trim(), kcal: Math.round(kcal), protein: Number(mProtein) || undefined };
    addFood(food);
    if (mSave) addSavedFood(food);
    setMName("");
    setMKcal("");
    setMProtein("");
    setManual(false);
  };

  const remove = (id: string) => updateHealthDay(date, { foods: (day?.foods ?? []).filter((f) => f.id !== id) });

  const mealKcal = Math.round(entries.reduce((s, f) => s + f.kcal * f.qty, 0));

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Label>{meal.label}</Label>
        <span className="type-mono text-[0.75rem] text-muted">{mealKcal} kcal</span>
      </div>

      {entries.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {entries.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2 text-[0.8125rem]">
              <span className="min-w-0 truncate">
                {f.name}
                {f.qty !== 1 && <span className="type-mono text-muted"> ×{f.qty}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="type-mono text-[0.75rem] text-muted">{Math.round(f.kcal * f.qty)} kcal</span>
                <button aria-label={`Remove ${f.name}`} onClick={() => remove(f.id)} className="text-muted hover:text-ink">
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <div className="flex gap-2">
          <input
            className={`${fieldCls} min-w-0 flex-1`}
            placeholder="Search foods…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex shrink-0 items-center gap-1">
            {[0.5, 1, 2].map((x) => (
              <button
                key={x}
                onClick={() => setQty(x)}
                className={`type-mono rounded-[var(--radius-sm)] border px-2 py-2 text-[0.6875rem] ${
                  qty === x ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
                }`}
              >
                ×{x}
              </button>
            ))}
          </div>
        </div>
        {results.length > 0 && (
          <ul className="mt-1.5 space-y-1">
            {results.map((r) => (
              <li key={`${r.mine}-${r.name}`}>
                <button
                  onClick={() => addFood(r)}
                  className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-left text-[0.8125rem] text-muted hover:border-accent hover:text-ink"
                >
                  <span className="min-w-0 truncate">
                    {r.name}
                    {r.mine && <span className="type-mono ml-1.5 text-[0.5625rem] uppercase tracking-[0.2em] text-accent">mine</span>}
                  </span>
                  <span className="type-mono shrink-0 text-[0.6875rem]">
                    {r.kcal} kcal{r.protein ? ` · ${r.protein}p` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {!manual ? (
          <button
            onClick={() => setManual(true)}
            className="type-mono mt-1.5 text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            + enter manually
          </button>
        ) : (
          <div className="mt-2 space-y-2 rounded-[var(--radius-sm)] border border-line p-2.5">
            <input className={smallField + " w-full"} placeholder="Food name" value={mName} maxLength={60} onChange={(e) => setMName(e.target.value)} />
            <div className="flex gap-2">
              <input className={smallField + " w-28"} type="number" inputMode="numeric" placeholder="kcal" value={mKcal} onChange={(e) => setMKcal(e.target.value)} />
              <input className={smallField + " w-28"} type="number" inputMode="numeric" placeholder="protein g" value={mProtein} onChange={(e) => setMProtein(e.target.value)} />
              <label className="type-mono flex items-center gap-1.5 text-[0.6875rem] text-muted">
                <input type="checkbox" checked={mSave} onChange={(e) => setMSave(e.target.checked)} />
                save to my foods
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={addManual} disabled={!mName.trim() || !mKcal}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setManual(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/** Water, steps, weight, sleep, workouts. */
function BodyCard({ date, day }: { date: string; day: HealthDay | undefined }) {
  const { updateHealthDay, healthGoals } = useApp();
  const [wType, setWType] = useState("");
  const [wMin, setWMin] = useState("");
  const water = day?.waterMl ?? 0;
  const waterTarget = healthGoals.waterTargetMl || 2000;
  const glasses = Math.ceil(waterTarget / 250);

  const num = (v: string) => (v === "" ? undefined : Number(v) || undefined);

  return (
    <Card>
      <Label className="mb-3">Body &amp; habits</Label>

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.875rem] text-ink">Water</span>
        <span className="type-mono text-[0.75rem] text-muted">
          {(water / 1000).toFixed(2).replace(/\.?0+$/, "")}L / {(waterTarget / 1000).toFixed(1)}L
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {Array.from({ length: Math.min(glasses, 16) }, (_, i) => (
          <button
            key={i}
            aria-label={`Glass ${i + 1}`}
            onClick={() => updateHealthDay(date, { waterMl: (i + 1) * 250 === water ? i * 250 : (i + 1) * 250 })}
            className={`h-5 w-3.5 rounded-[3px] border transition-colors ${
              water >= (i + 1) * 250 ? "border-accent bg-accent/60" : "border-line bg-surface-2 hover:border-muted"
            }`}
          />
        ))}
        <span className="type-mono ml-1 text-[0.625rem] text-muted/70">tap a glass · 250ml each</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div>
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Weight kg</span>
          <input
            className={smallField + " mt-1 w-full"}
            type="number"
            inputMode="decimal"
            step="0.1"
            value={day?.weightKg ?? ""}
            placeholder="—"
            onChange={(e) => updateHealthDay(date, { weightKg: num(e.target.value) })}
          />
        </div>
        <div>
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Steps</span>
          <input
            className={smallField + " mt-1 w-full"}
            type="number"
            inputMode="numeric"
            value={day?.steps ?? ""}
            placeholder={healthGoals.stepTarget ? `/ ${healthGoals.stepTarget}` : "—"}
            onChange={(e) => updateHealthDay(date, { steps: num(e.target.value) })}
          />
        </div>
        <div>
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Sleep h</span>
          <input
            className={smallField + " mt-1 w-full"}
            type="number"
            inputMode="decimal"
            step="0.5"
            value={day?.sleepH ?? ""}
            placeholder="—"
            onChange={(e) => updateHealthDay(date, { sleepH: num(e.target.value) })}
          />
        </div>
      </div>

      <div className="mt-4">
        <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Workouts</span>
        {(day?.workouts ?? []).map((w) => (
          <div key={w.id} className="mt-1.5 flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-1.5 text-[0.8125rem]">
            <span>{w.type}</span>
            <span className="flex items-center gap-3">
              <span className="type-mono text-[0.75rem] text-muted">{w.minutes} min</span>
              <button
                aria-label={`Remove ${w.type}`}
                onClick={() => updateHealthDay(date, { workouts: (day?.workouts ?? []).filter((x) => x.id !== w.id) })}
                className="text-muted hover:text-ink"
              >
                ×
              </button>
            </span>
          </div>
        ))}
        <div className="mt-1.5 flex gap-2">
          <input className={smallField + " min-w-0 flex-1"} placeholder="Gym / run / walk…" value={wType} maxLength={30} onChange={(e) => setWType(e.target.value)} />
          <input className={smallField + " w-20"} type="number" inputMode="numeric" placeholder="min" value={wMin} onChange={(e) => setWMin(e.target.value)} />
          <Button
            variant="ghost"
            disabled={!wType.trim() || !Number(wMin)}
            onClick={() => {
              updateHealthDay(date, {
                workouts: [...(day?.workouts ?? []), { id: `${Date.now()}`, type: wType.trim(), minutes: Number(wMin) }],
              });
              setWType("");
              setWMin("");
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Targets + the Mifflin-St Jeor calculator. */
function GoalsCard() {
  const { healthGoals, setHealthGoals } = useApp();
  const [calcOpen, setCalcOpen] = useState(false);
  const [profile, setProfile] = useState<HealthProfile>(
    healthGoals.profile ?? { sex: "male", age: 25, heightCm: 175, weightKg: 78, activity: "moderate" }
  );
  const [goalKind, setGoalKind] = useState<HealthGoalKind>("maintain");
  const suggestion = suggestTargets(profile, goalKind);

  const num = (v: string) => (v === "" ? undefined : Number(v) || undefined);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Label>Goals</Label>
        <button
          onClick={() => setCalcOpen(!calcOpen)}
          className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          {calcOpen ? "close calculator" : "calculate my targets"}
        </button>
      </div>

      {calcOpen && (
        <div className="mt-3 space-y-2 rounded-[var(--radius-sm)] border border-line p-3">
          <div className="flex flex-wrap gap-2">
            {(["male", "female"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setProfile({ ...profile, sex: s })}
                className={`rounded-full border px-3 py-1 text-[0.75rem] capitalize ${profile.sex === s ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Age</span>
              <input className={smallField + " mt-1 w-full"} type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Height cm</span>
              <input className={smallField + " mt-1 w-full"} type="number" value={profile.heightCm} onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Weight kg</span>
              <input className={smallField + " mt-1 w-full"} type="number" value={profile.weightKg} onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) || 0 })} />
            </div>
          </div>
          <select
            className={smallField + " w-full"}
            value={profile.activity}
            onChange={(e) => setProfile({ ...profile, activity: e.target.value as HealthProfile["activity"] })}
          >
            {Object.entries(ACTIVITY_FACTORS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {(["lose", "maintain", "gain"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGoalKind(g)}
                className={`rounded-full border px-3 py-1 text-[0.75rem] capitalize ${goalKind === g ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"}`}
              >
                {g}
              </button>
            ))}
          </div>
          <p className="type-mono text-[0.75rem] text-muted">
            maintenance ≈ <span className="text-ink">{tdee(profile)}</span> kcal · suggested:{" "}
            <span className="text-accent">{suggestion.kcal} kcal</span> · protein{" "}
            <span className="text-accent">{suggestion.protein}g</span>
          </p>
          <Button
            onClick={() => {
              setHealthGoals({ kcalTarget: suggestion.kcal, proteinTarget: suggestion.protein, profile });
              setCalcOpen(false);
            }}
          >
            Apply these targets
          </Button>
          <p className="type-mono text-[0.5625rem] text-muted/70">general wellness estimate — not medical advice.</p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Calories / day</span>
          <input className={smallField + " mt-1 w-full"} type="number" value={healthGoals.kcalTarget ?? ""} placeholder="—" onChange={(e) => setHealthGoals({ kcalTarget: num(e.target.value) })} />
        </div>
        <div>
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Protein g / day</span>
          <input className={smallField + " mt-1 w-full"} type="number" value={healthGoals.proteinTarget ?? ""} placeholder="—" onChange={(e) => setHealthGoals({ proteinTarget: num(e.target.value) })} />
        </div>
        <div>
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Water L / day</span>
          <input
            className={smallField + " mt-1 w-full"}
            type="number"
            step="0.25"
            value={healthGoals.waterTargetMl ? healthGoals.waterTargetMl / 1000 : ""}
            placeholder="2"
            onChange={(e) => setHealthGoals({ waterTargetMl: Math.round((Number(e.target.value) || 2) * 1000) })}
          />
        </div>
        <div>
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Steps / day</span>
          <input className={smallField + " mt-1 w-full"} type="number" value={healthGoals.stepTarget ?? ""} placeholder="—" onChange={(e) => setHealthGoals({ stepTarget: num(e.target.value) })} />
        </div>
        <div className="col-span-2">
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Target weight kg · by when</span>
          <div className="mt-1 flex gap-2">
            <input
              className={smallField + " w-24"}
              type="number"
              step="0.5"
              value={healthGoals.weightTarget?.kg ?? ""}
              placeholder="—"
              onChange={(e) =>
                setHealthGoals({
                  weightTarget: e.target.value ? { kg: Number(e.target.value) || 0, by: healthGoals.weightTarget?.by ?? "" } : undefined,
                })
              }
            />
            <input
              className={smallField + " flex-1"}
              value={healthGoals.weightTarget?.by ?? ""}
              placeholder="e.g. end of quarter"
              maxLength={30}
              disabled={!healthGoals.weightTarget}
              onChange={(e) =>
                healthGoals.weightTarget && setHealthGoals({ weightTarget: { ...healthGoals.weightTarget, by: e.target.value } })
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

/** 7-day calories vs target + 30-day weight line + on-target streak. */
function TrendsCard() {
  const { healthDays, healthGoals } = useApp();
  const target = healthGoals.kcalTarget;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = dayOffset(i - 6);
    return { date, kcal: kcalOf(healthDays.find((d) => d.date === date)) };
  });
  const maxKcal = Math.max(...last7.map((d) => d.kcal), target ?? 0, 1);

  const weights = healthDays
    .filter((d) => d.weightKg !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map((d) => d.weightKg as number);

  let streak = 0;
  if (target) {
    for (let i = 0; ; i++) {
      const d = healthDays.find((x) => x.date === dayOffset(-i));
      const k = kcalOf(d);
      if (i === 0 && k === 0) continue; // today may be unlogged yet
      if (!d || k === 0 || k > target) break;
      streak++;
      if (i > 90) break;
    }
  }

  return (
    <Card>
      <Label className="mb-3">Trends</Label>
      <div className="flex items-end gap-1.5" aria-label="Last 7 days of calories">
        {last7.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-20 w-full items-end rounded-[3px] bg-line/30">
              <div
                className={`w-full rounded-[3px] ${target && d.kcal > target ? "bg-ink/70" : "bg-accent/70"}`}
                style={{ height: `${Math.min(100, (d.kcal / maxKcal) * 100)}%` }}
                title={`${d.kcal} kcal`}
              />
            </div>
            <span className="type-mono text-[0.5625rem] text-muted/70">
              {new Date(`${d.date}T00:00:00`).toLocaleDateString("en-AU", { weekday: "narrow" })}
            </span>
          </div>
        ))}
      </div>
      {target && (
        <p className="type-mono mt-1 text-[0.625rem] text-muted/70">
          bar caps at the biggest day · dark bar = over the {target} kcal target
        </p>
      )}

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Weight · 30d</span>
          {weights.length >= 2 ? (
            <div className="mt-1">
              <Sparkline data={weights} width={170} height={36} />
              <p className="type-mono mt-1 text-[0.6875rem] text-muted">
                {weights[0]}kg → <span className="text-ink">{weights[weights.length - 1]}kg</span>
                {healthGoals.weightTarget ? ` · target ${healthGoals.weightTarget.kg}kg` : ""}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-[0.75rem] text-muted">Two weigh-ins start the line.</p>
          )}
        </div>
        {target && streak > 0 && (
          <div className="text-right">
            <span className="type-mono text-[1.5rem] text-accent">{streak}</span>
            <p className="type-mono text-[0.625rem] text-muted">days on target</p>
          </div>
        )}
      </div>
    </Card>
  );
}
