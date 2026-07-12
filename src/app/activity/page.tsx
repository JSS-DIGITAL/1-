"use client";

// Physical activity — a dedicated movement tracker. Separate section, same
// founder ruling as Health: logging pays no bp, the review never reads it,
// accent + neutrals only, device-local. Exercise library + sets/reps, a weekly
// movement goal, and a streak/trend. General wellness numbers — not medical advice.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Button, Card, Chip, Label } from "@/components/ui";
import {
  ACTIVITY_CATEGORIES,
  DEFAULT_ACTIVITY_GOALS,
  EXERCISE_LIBRARY,
  activityId,
  activityStreakDays,
  avgSleep7d,
  consecutiveTrainingDays,
  entryMinutes,
  latestSoreness,
  minutesOnDate,
  recoveryStatus,
  trainingLoad7d,
  weeklyMinutes,
  weeklySessions,
} from "@/lib/activity";
import { dayOffset } from "@/lib/mock";
import { useApp } from "@/lib/store";
import type { ActivityEntry, ActivityIntensity, ActivitySet, SavedExercise } from "@/lib/types";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";
const smallField =
  "rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2.5 py-2 text-[0.875rem] text-ink outline-none placeholder:text-muted/45 focus:border-accent";
const labelCls = "type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted";
const INTENSITIES: ActivityIntensity[] = ["easy", "moderate", "hard"];

export default function ActivityPage() {
  const { activityEntries } = useApp();
  const [date, setDate] = useState(() => dayOffset(0));
  const dayEntries = activityEntries.filter((e) => e.date === date);

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Label>Movement</Label>
          <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">Bodies are built by showing up.</h1>
        </div>
        <span className="type-mono text-[0.625rem] text-muted/70">general wellness — not medical advice</span>
      </div>

      <DaySelector date={date} setDate={setDate} />

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-[var(--gap)]">
          <LogSession date={date} />
          <DayList date={date} entries={dayEntries} />
        </div>
        <div className="min-w-0 space-y-[var(--gap)]">
          <RecoveryCard date={date} />
          <WeeklyGoalCard />
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

function LogSession({ date }: { date: string }) {
  const { addActivityEntry, savedExercises, addSavedExercise } = useApp();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<SavedExercise | null>(null);
  const [minutes, setMinutes] = useState("");
  const [sets, setSets] = useState<ActivitySet[]>([{ reps: undefined, weightKg: undefined }]);
  const [intensity, setIntensity] = useState<ActivityIntensity>("moderate");
  const [note, setNote] = useState("");
  const [saveCustom, setSaveCustom] = useState(true);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const mine = savedExercises.filter((e) => e.name.toLowerCase().includes(q)).map((e) => ({ ...e, mine: true }));
    const lib = EXERCISE_LIBRARY.filter((e) => e.name.toLowerCase().includes(q)).map((e) => ({ ...e, mine: false }));
    return [...mine, ...lib].slice(0, 7);
  }, [query, savedExercises]);

  const isCustom = query.trim().length > 0 && !picked;
  const kind = picked?.kind ?? "time";

  const choose = (ex: SavedExercise) => {
    setPicked(ex);
    setQuery(ex.name);
  };

  const reset = () => {
    setQuery("");
    setPicked(null);
    setMinutes("");
    setSets([{ reps: undefined, weightKg: undefined }]);
    setIntensity("moderate");
    setNote("");
  };

  const submit = () => {
    const name = (picked?.name ?? query).trim();
    if (!name) return;
    const category = picked?.category ?? "Cardio";
    const usableSets = sets.filter((s) => s.reps || s.weightKg);
    const entry: ActivityEntry = {
      id: activityId(),
      date,
      name,
      category,
      minutes: minutes ? Number(minutes) || undefined : undefined,
      sets: kind === "reps" && usableSets.length > 0 ? usableSets : undefined,
      intensity,
      note: note.trim() || undefined,
    };
    addActivityEntry(entry);
    if (isCustom && saveCustom) {
      addSavedExercise({ name, category: "Cardio", kind: minutes ? "time" : "reps" });
    }
    reset();
  };

  const setSet = (i: number, patch: Partial<ActivitySet>) =>
    setSets((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <Card rule>
      <Label className="mb-3">Log a session</Label>
      <div className="space-y-3">
        <div className="relative">
          <input
            className={fieldCls}
            placeholder="Search exercises — squat, running, yoga…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPicked(null); }}
          />
          {results.length > 0 && !picked && (
            <ul className="mt-1.5 space-y-1">
              {results.map((r) => (
                <li key={`${r.mine}-${r.name}`}>
                  <button
                    onClick={() => choose(r)}
                    className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-left text-[0.8125rem] text-muted hover:border-accent hover:text-ink"
                  >
                    <span className="min-w-0 truncate">
                      {r.name}
                      {r.mine && <span className="type-mono ml-1.5 text-[0.5625rem] uppercase tracking-[0.2em] text-accent">mine</span>}
                    </span>
                    <span className="type-mono shrink-0 text-[0.625rem]">{r.category} · {r.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(picked || isCustom) && (
          <>
            {picked && (
              <div className="flex items-center gap-2">
                <Chip tone="accent">{picked.category}</Chip>
                <span className="type-mono text-[0.6875rem] text-muted">logs {picked.kind === "reps" ? "sets × reps" : "minutes"}</span>
              </div>
            )}

            {kind === "reps" ? (
              <div>
                <span className={labelCls}>Sets</span>
                <div className="mt-1.5 space-y-1.5">
                  {sets.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="type-mono w-5 text-[0.75rem] text-muted">{i + 1}</span>
                      <input className={smallField + " w-24"} type="number" inputMode="numeric" placeholder="reps" value={s.reps ?? ""} onChange={(e) => setSet(i, { reps: Number(e.target.value) || undefined })} />
                      <span className="type-mono text-[0.75rem] text-muted">×</span>
                      <input className={smallField + " w-24"} type="number" inputMode="decimal" placeholder="kg" value={s.weightKg ?? ""} onChange={(e) => setSet(i, { weightKg: Number(e.target.value) || undefined })} />
                      {sets.length > 1 && (
                        <button aria-label="Remove set" onClick={() => setSets((x) => x.filter((_, j) => j !== i))} className="text-muted hover:text-ink">×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => setSets((s) => [...s, { reps: undefined, weightKg: undefined }])} className="type-mono mt-1.5 text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink">
                  + add set
                </button>
                <div className="mt-2">
                  <span className={labelCls}>Minutes (optional)</span>
                  <input className={smallField + " mt-1 w-28"} type="number" inputMode="numeric" placeholder="min" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <span className={labelCls}>Minutes</span>
                <input className={smallField + " mt-1 w-full"} type="number" inputMode="numeric" placeholder="how long?" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              </div>
            )}

            <div>
              <span className={labelCls}>Intensity</span>
              <div className="mt-1.5 flex gap-1.5">
                {INTENSITIES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setIntensity(n)}
                    className={`type-mono rounded-full border px-3 py-1 text-[0.75rem] capitalize ${
                      intensity === n ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <input className={smallField + " w-full"} placeholder="Note (optional)" value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} />

            {isCustom && (
              <label className="type-mono flex items-center gap-1.5 text-[0.6875rem] text-muted">
                <input type="checkbox" checked={saveCustom} onChange={(e) => setSaveCustom(e.target.checked)} />
                save &quot;{query.trim()}&quot; to my exercises
              </label>
            )}

            <div className="flex gap-2">
              <Button onClick={submit} disabled={!(picked?.name ?? query).trim()}>
                Add session
              </Button>
              <Button variant="ghost" onClick={reset}>
                Clear
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function DayList({ date, entries }: { date: string; entries: ActivityEntry[] }) {
  const { removeActivityEntry, recoveryDays } = useApp();
  const total = minutesOnDate(entries, date);
  const isRest = recoveryDays.find((r) => r.date === date)?.rest ?? false;

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2">
          <Label>This day</Label>
          {isRest && <Chip tone="accent">rest day</Chip>}
        </span>
        <span className="type-mono text-[0.75rem] text-muted">
          {entries.length} session{entries.length === 1 ? "" : "s"}
          {total > 0 && <span> · <span className="text-ink">{total} min</span></span>}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="mt-2 text-[0.875rem] text-muted">
          {isRest ? "Deliberate rest — the streak holds. Recovery is where the gains land." : "Nothing logged yet. Even ten minutes counts."}
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {entries.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2 text-[0.8125rem]">
              <div className="min-w-0">
                <span className="text-ink">{e.name}</span>
                <span className="type-mono ml-2 text-[0.625rem] text-muted">{e.category}</span>
                <div className="type-mono mt-0.5 text-[0.6875rem] text-muted">
                  {e.sets && e.sets.length > 0 && (
                    <span>{e.sets.map((s) => `${s.reps ?? "—"}${s.weightKg ? `×${s.weightKg}kg` : ""}`).join(", ")}</span>
                  )}
                  {e.minutes ? <span>{e.sets && e.sets.length > 0 ? " · " : ""}{e.minutes} min</span> : null}
                  {e.intensity && <span> · {e.intensity}</span>}
                  {e.note && <span className="text-muted/70"> · {e.note}</span>}
                </div>
              </div>
              <button aria-label={`Remove ${e.name}`} onClick={() => removeActivityEntry(e.id)} className="shrink-0 text-muted hover:text-ink">×</button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** Rest & recovery — rest-day marking, soreness, and a rule-based verdict. */
function RecoveryCard({ date }: { date: string }) {
  const { activityEntries, recoveryDays, healthDays, updateRecoveryDay } = useApp();
  const day = recoveryDays.find((r) => r.date === date);
  const consecutive = consecutiveTrainingDays(activityEntries, recoveryDays);
  const load = trainingLoad7d(activityEntries);
  const sleepAvg = avgSleep7d(healthDays);
  const soreness = latestSoreness(recoveryDays);
  const status = recoveryStatus({ consecutive, load, sleepAvg, soreness });
  const isToday = date === dayOffset(0);

  return (
    <Card rule>
      <div className="flex items-baseline justify-between gap-3">
        <Label>Rest &amp; recovery</Label>
        <span
          className={`type-mono rounded-full border px-2.5 py-0.5 text-[0.625rem] uppercase tracking-[0.15em] ${
            status.level === "rest"
              ? "border-destructive/50 text-destructive"
              : "border-accent/50 text-accent"
          }`}
        >
          {status.level === "rest" ? "rest advised" : status.level}
        </span>
      </div>

      <ul className="mt-2 space-y-1">
        {status.reasons.map((r) => (
          <li key={r} className={`text-[0.8125rem] ${status.level === "rest" ? "text-ink" : "text-muted"}`}>
            {r}
          </li>
        ))}
      </ul>

      <div className="type-mono mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3 text-[0.75rem] text-muted">
        <span>
          streak load <span className="text-ink">{consecutive}</span> day{consecutive === 1 ? "" : "s"} training
        </span>
        <span>
          7-day load <span className="text-ink">{load}</span>
        </span>
        <span>
          sleep{" "}
          {sleepAvg !== null ? (
            <span className={sleepAvg < 6 ? "text-destructive" : "text-ink"}>{sleepAvg}h avg</span>
          ) : (
            <Link href="/health" className="underline decoration-dotted underline-offset-2 hover:text-ink">
              log it in Health →
            </Link>
          )}
        </span>
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <button
          onClick={() => updateRecoveryDay(date, { rest: !day?.rest })}
          className={`type-mono w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[0.75rem] transition-colors ${
            day?.rest ? "border-accent bg-accent/10 text-ink" : "border-line text-muted hover:border-muted"
          }`}
        >
          {day?.rest
            ? `✓ ${isToday ? "today is" : "marked as"} a deliberate rest day — streak holds`
            : `mark ${isToday ? "today" : "this day"} as a deliberate rest day`}
        </button>

        <div className="mt-3">
          <span className={labelCls}>Soreness — 1 fresh · 5 wrecked</span>
          <div className="mt-1.5 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => updateRecoveryDay(date, { soreness: day?.soreness === n ? undefined : n })}
                className={`type-mono flex-1 rounded-[var(--radius-sm)] border px-0 py-1.5 text-[0.8125rem] ${
                  day?.soreness === n
                    ? n >= 4
                      ? "border-destructive bg-destructive/10 text-ink"
                      : "border-accent bg-accent/10 text-ink"
                    : "border-line text-muted hover:border-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="type-mono mt-3 text-[0.5625rem] text-muted/70">rest is training — not medical advice.</p>
    </Card>
  );
}

function WeeklyGoalCard() {
  const { activityEntries, activityGoals, setActivityGoals } = useApp();
  const [edit, setEdit] = useState(false);
  const mins = weeklyMinutes(activityEntries);
  const sessions = weeklySessions(activityEntries);
  const minTarget = activityGoals.weeklyMinutes ?? DEFAULT_ACTIVITY_GOALS.weeklyMinutes!;
  const sessTarget = activityGoals.weeklySessions ?? DEFAULT_ACTIVITY_GOALS.weeklySessions!;
  const num = (v: string) => (v === "" ? undefined : Number(v) || undefined);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Label>This week</Label>
        <button onClick={() => setEdit(!edit)} className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink">
          {edit ? "done" : "edit goal"}
        </button>
      </div>

      <Meter label="Minutes moved" value={mins} target={minTarget} suffix="min" />
      <Meter label="Days active" value={sessions} target={sessTarget} suffix="days" />

      {edit && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
          <div>
            <span className={labelCls}>Minutes / week</span>
            <input className={smallField + " mt-1 w-full"} type="number" inputMode="numeric" value={activityGoals.weeklyMinutes ?? ""} placeholder="150" onChange={(e) => setActivityGoals({ weeklyMinutes: num(e.target.value) })} />
          </div>
          <div>
            <span className={labelCls}>Days / week</span>
            <input className={smallField + " mt-1 w-full"} type="number" inputMode="numeric" value={activityGoals.weeklySessions ?? ""} placeholder="4" onChange={(e) => setActivityGoals({ weeklySessions: num(e.target.value) })} />
          </div>
          <p className="type-mono col-span-2 text-[0.625rem] text-muted/70">WHO suggests ≥150 active minutes a week — a sensible floor.</p>
        </div>
      )}
    </Card>
  );
}

function Meter({ label, value, target, suffix }: { label: string; value: number; target: number; suffix: string }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.875rem] text-ink">{label}</span>
        <span className="type-mono text-[0.75rem] text-muted">
          <span className="text-[1.05rem] text-accent">{Math.round(value)}</span> / {target} {suffix}
        </span>
      </div>
      <div className="mt-1.5 h-[6px] w-full rounded-full bg-line/60">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TrendsCard() {
  const { activityEntries, recoveryDays } = useApp();
  const streak = activityStreakDays(activityEntries, recoveryDays);
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = dayOffset(i - 6);
      return { date, minutes: activityEntries.filter((e) => e.date === date).reduce((s, e) => s + entryMinutes(e), 0) };
    });
  }, [activityEntries]);
  const max = Math.max(...last7.map((d) => d.minutes), 1);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Label>Trends</Label>
        {streak > 0 && (
          <span className="type-mono text-[0.75rem] text-muted">
            <span className="text-[1.05rem] text-accent">{streak}</span> day{streak === 1 ? "" : "s"} in a row
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-1.5" aria-label="Last 7 days of active minutes">
        {last7.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end rounded-[3px] bg-line/30">
              <div
                className="w-full rounded-[3px] bg-accent/70"
                style={{ height: `${Math.max(d.minutes > 0 ? 6 : 0, (d.minutes / max) * 100)}%` }}
                title={`${d.minutes} min`}
              />
            </div>
            <span className="type-mono text-[0.5625rem] text-muted/70">
              {new Date(`${d.date}T00:00:00`).toLocaleDateString("en-AU", { weekday: "narrow" })}
            </span>
          </div>
        ))}
      </div>
      <p className="type-mono mt-1 text-[0.625rem] text-muted/70">active minutes per day · last 7 days</p>
    </Card>
  );
}
