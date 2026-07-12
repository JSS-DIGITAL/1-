"use client";

// Shared board for the two "things to quit" sections — Bad habits (/habits)
// and Recovery (/recovery). One engine, two framings via QUIT_COPY[kind].
// Separate from the loop and the economy (founder ruling): no bp, accent +
// neutrals only, all device-local. Not medical or clinical advice.

import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Card, Label } from "@/components/ui";
import { dayOffset } from "@/lib/mock";
import { useApp } from "@/lib/store";
import {
  MILESTONES,
  QUIT_COPY,
  cleanSince,
  currentStreakDays,
  emptyQuit,
  hoursSaved,
  labelMilestone,
  longestStreakDays,
  makeRelapse,
  makeUrge,
  moneySaved,
  nextMilestone,
  reachedMilestones,
  resistedRate,
  unitsAvoided,
} from "@/lib/quit";
import type { Quit, QuitKind } from "@/lib/types";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";
const smallField =
  "rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2.5 py-2 text-[0.875rem] text-ink outline-none placeholder:text-muted/45 focus:border-accent";
const labelCls = "type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted";

export function QuitBoard({ kind }: { kind: QuitKind }) {
  const { quits } = useApp();
  const copy = QUIT_COPY[kind];
  const mine = quits.filter((q) => q.kind === kind);
  const active = mine.filter((q) => !q.archived);
  const archived = mine.filter((q) => q.archived);

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Label>{copy.section}</Label>
          <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">{copy.title}</h1>
        </div>
        <span className="type-mono text-[0.625rem] text-muted/70">private tracker — not medical advice</span>
      </div>

      {copy.helpLine && (
        <p className="mt-4 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-4 py-3 text-[0.8125rem] text-muted">
          {copy.helpLine}
        </p>
      )}

      <AddQuit kind={kind} />

      <div className="mt-[var(--gap)] space-y-[var(--gap)]">
        {active.length === 0 ? (
          <Card>
            <p className="text-[0.9375rem] text-muted">{copy.emptyLine}</p>
          </Card>
        ) : (
          active.map((q) => <QuitCard key={q.id} quit={q} />)
        )}
      </div>

      {archived.length > 0 && (
        <div className="mt-[var(--gap)]">
          <Label className="mb-2">Archived</Label>
          <div className="space-y-2">
            {archived.map((q) => (
              <QuitCard key={q.id} quit={q} />
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}

function AddQuit({ kind }: { kind: QuitKind }) {
  const { addQuit } = useApp();
  const copy = QUIT_COPY[kind];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startedAt, setStartedAt] = useState(dayOffset(0));
  const [detail, setDetail] = useState(false);
  const [unit, setUnit] = useState("");
  const [perDay, setPerDay] = useState("");
  const [cost, setCost] = useState("");
  const [minutes, setMinutes] = useState("");
  const [reason, setReason] = useState("");

  const reset = () => {
    setName("");
    setStartedAt(dayOffset(0));
    setDetail(false);
    setUnit("");
    setPerDay("");
    setCost("");
    setMinutes("");
    setReason("");
    setOpen(false);
  };

  const submit = () => {
    if (!name.trim()) return;
    const q = emptyQuit(kind, name, startedAt);
    q.unit = unit.trim() || undefined;
    q.perDay = perDay ? Number(perDay) || undefined : undefined;
    q.costPerUnit = cost ? Number(cost) || undefined : undefined;
    q.minutesPerUnit = minutes ? Number(minutes) || undefined : undefined;
    q.reason = reason.trim() || undefined;
    addQuit(q);
    reset();
  };

  if (!open) {
    return (
      <div className="mt-5">
        <Button onClick={() => setOpen(true)}>+ {copy.addVerb}</Button>
      </div>
    );
  }

  return (
    <Card className="mt-5">
      <Label className="mb-3">{copy.addVerb}</Label>
      <div className="space-y-3">
        <input className={fieldCls} placeholder={copy.namePlaceholder} value={name} maxLength={60} autoFocus onChange={(e) => setName(e.target.value)} />
        <div className="flex flex-wrap items-center gap-2">
          <span className={labelCls}>Quit date</span>
          <input className={smallField} type="date" max={dayOffset(0)} value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
        </div>

        {!detail ? (
          <button
            onClick={() => setDetail(true)}
            className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            + add the numbers (units/day, cost, time) to track what you save
          </button>
        ) : (
          <div className="space-y-2 rounded-[var(--radius-sm)] border border-line p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <span className={labelCls}>Unit</span>
                <input className={smallField + " mt-1 w-full"} placeholder="drinks" value={unit} maxLength={16} onChange={(e) => setUnit(e.target.value)} />
              </div>
              <div>
                <span className={labelCls}>Per day</span>
                <input className={smallField + " mt-1 w-full"} type="number" inputMode="decimal" placeholder="4" value={perDay} onChange={(e) => setPerDay(e.target.value)} />
              </div>
              <div>
                <span className={labelCls}>$ / unit</span>
                <input className={smallField + " mt-1 w-full"} type="number" inputMode="decimal" placeholder="6" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
              <div>
                <span className={labelCls}>Min / unit</span>
                <input className={smallField + " mt-1 w-full"} type="number" inputMode="numeric" placeholder="0" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              </div>
            </div>
            <div>
              <span className={labelCls}>Why you're quitting</span>
              <input className={smallField + " mt-1 w-full"} placeholder="the reason you'll read on a hard day" value={reason} maxLength={100} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={submit} disabled={!name.trim()}>
            Start the count
          </Button>
          <Button variant="ghost" onClick={reset}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}

function QuitCard({ quit }: { quit: Quit }) {
  const { updateQuit, removeQuit, logRelapse, setQuitCheckin, logUrge } = useApp();
  const copy = QUIT_COPY[quit.kind];
  const days = currentStreakDays(quit);
  const longest = longestStreakDays(quit);
  const money = moneySaved(quit);
  const hours = hoursSaved(quit);
  const avoided = unitsAvoided(quit);
  const reached = reachedMilestones(quit);
  const next = nextMilestone(quit);
  const rate = resistedRate(quit);
  const since = cleanSince(quit);

  const [urgeOpen, setUrgeOpen] = useState(false);
  const [relapseOpen, setRelapseOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const strip = useMemo(() => {
    const relapseDays = new Set(quit.relapses.map((r) => r.date));
    return Array.from({ length: 14 }, (_, i) => {
      const d = dayOffset(i - 13);
      const isRelapse = relapseDays.has(d);
      const before = d < quit.startedAt;
      const explicit = quit.checkins[d];
      const clean = explicit !== undefined ? explicit : !isRelapse && !before && d >= since;
      return { date: d, isRelapse, before, clean };
    });
  }, [quit, since]);

  return (
    <Card className={quit.archived ? "opacity-70" : ""}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="type-display text-[1.25rem] leading-tight">{quit.name}</h2>
          {quit.reason && <p className="mt-0.5 text-[0.8125rem] text-muted">{quit.reason}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <div className="type-mono text-[2rem] leading-none text-accent">{days}</div>
            <div className="type-mono text-[0.625rem] text-muted">{copy.streakLabel}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="type-mono mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem] text-muted">
        {money > 0 && (
          <span>
            saved <span className="text-ink">${money.toLocaleString()}</span>
          </span>
        )}
        {hours > 0 && (
          <span>
            reclaimed <span className="text-ink">{hours}h</span>
          </span>
        )}
        {avoided > 0 && quit.unit && (
          <span>
            avoided <span className="text-ink">{avoided.toLocaleString()}</span> {quit.unit}
          </span>
        )}
        <span>
          longest <span className="text-ink">{longest}d</span>
        </span>
        {rate !== null && (
          <span>
            urges held <span className="text-ink">{Math.round(rate * 100)}%</span>
          </span>
        )}
      </div>

      {/* Milestones */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {MILESTONES.map((m) => {
          const done = reached.includes(m);
          return (
            <span
              key={m}
              className={`type-mono rounded-full border px-2 py-0.5 text-[0.625rem] ${
                done ? "border-accent/60 bg-accent/10 text-accent" : "border-line text-muted/50"
              }`}
              title={done ? `${labelMilestone(m)} reached` : `${labelMilestone(m)} — not yet`}
            >
              {labelMilestone(m)}
            </span>
          );
        })}
        {next && (
          <span className="type-mono text-[0.625rem] text-muted/70">· {next - days}d to {labelMilestone(next)}</span>
        )}
      </div>

      {/* Daily clean log */}
      <div className="mt-4">
        <span className={labelCls}>Last 14 days · tap to mark</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {strip.map((s) => (
            <button
              key={s.date}
              aria-label={`${s.date}: ${s.isRelapse ? "slip" : s.clean ? "clean" : "not clean"}`}
              title={s.date + (s.isRelapse ? " · slip" : "")}
              onClick={() => setQuitCheckin(quit.id, s.date, !s.clean)}
              className={`h-6 w-4 rounded-[3px] border transition-colors ${
                s.isRelapse
                  ? "border-destructive/60 bg-destructive/25"
                  : s.clean
                    ? "border-accent bg-accent/60"
                    : "border-line bg-surface-2 hover:border-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => { setUrgeOpen(!urgeOpen); setRelapseOpen(false); }}>
          Log an urge
        </Button>
        <Button variant="ghost" onClick={() => { setRelapseOpen(!relapseOpen); setUrgeOpen(false); }}>
          {copy.relapseVerb}
        </Button>
        <button
          onClick={() => updateQuit(quit.id, { archived: !quit.archived })}
          className="type-mono ml-auto text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          {quit.archived ? "restore" : "archive"}
        </button>
        {confirmDelete ? (
          <button onClick={() => removeQuit(quit.id)} className="type-mono text-[0.6875rem] text-destructive underline underline-offset-2">
            confirm delete
          </button>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-destructive">
            delete
          </button>
        )}
      </div>

      {urgeOpen && <UrgeForm quit={quit} onDone={() => setUrgeOpen(false)} onLog={(u) => logUrge(quit.id, u)} />}
      {relapseOpen && <RelapseForm onDone={() => setRelapseOpen(false)} onLog={(r) => { logRelapse(quit.id, r); setRelapseOpen(false); }} />}
    </Card>
  );
}

function UrgeForm({ quit, onDone, onLog }: { quit: Quit; onDone: () => void; onLog: (u: ReturnType<typeof makeUrge>) => void }) {
  const [intensity, setIntensity] = useState(3);
  const [trigger, setTrigger] = useState("");
  return (
    <div className="mt-3 space-y-3 rounded-[var(--radius-sm)] border border-line p-3">
      <div>
        <span className={labelCls}>How strong? {intensity}/5</span>
        <div className="mt-1.5 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setIntensity(n)}
              className={`type-mono h-8 w-8 rounded-[var(--radius-sm)] border text-[0.75rem] ${
                intensity === n ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <input className={smallField + " w-full"} placeholder="Trigger (optional) — e.g. stress, after dinner" value={trigger} maxLength={40} onChange={(e) => setTrigger(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { onLog(makeUrge(intensity, true, trigger)); onDone(); }}>
          I held the line
        </Button>
        <Button variant="ghost" onClick={() => { onLog(makeUrge(intensity, false, trigger)); onDone(); }}>
          I gave in
        </Button>
      </div>
      <p className="type-mono text-[0.625rem] text-muted/70">
        {quit.kind === "addiction" ? "Every urge you name is data — and most pass in minutes." : "Naming the urge is half the battle."}
      </p>
    </div>
  );
}

function RelapseForm({ onDone, onLog }: { onDone: () => void; onLog: (r: ReturnType<typeof makeRelapse>) => void }) {
  const [date, setDate] = useState(dayOffset(0));
  const [trigger, setTrigger] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="mt-3 space-y-3 rounded-[var(--radius-sm)] border border-destructive/40 p-3">
      <p className="text-[0.8125rem] text-muted">A slip resets the counter — not the progress. Log it honestly and start again.</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className={labelCls}>When</span>
        <input className={smallField} type="date" max={dayOffset(0)} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <input className={smallField + " w-full"} placeholder="What triggered it? (optional)" value={trigger} maxLength={40} onChange={(e) => setTrigger(e.target.value)} />
      <input className={smallField + " w-full"} placeholder="A note to your future self (optional)" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => onLog(makeRelapse(date, trigger, note))}>
          Log it &amp; reset
        </Button>
        <Button variant="quiet" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
