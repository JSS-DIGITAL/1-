"use client";

// Improvement areas — campaigns, each with its own goal, standards and metrics.

import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Sparkline } from "@/components/charts";
import { Button, Card, Chip, Label } from "@/components/ui";
import { AREA_TEMPLATES } from "@/lib/templates";
import { useApp, useAreaSeries } from "@/lib/store";
import type { Area } from "@/lib/types";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";

export default function AreasPage() {
  const { areas, records, addArea } = useApp();
  const [adding, setAdding] = useState(false);

  // /areas?new=1 opens the form directly (the dashboard + arm-screen add links).
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("new")) return;
    const t = setTimeout(() => setAdding(true), 0);
    return () => clearTimeout(t);
  }, []);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [metric, setMetric] = useState("");

  const create = () => {
    if (!name.trim() || !goal.trim() || !metric.trim()) return;
    addArea({
      name: name.trim(),
      goal: goal.trim(),
      metrics: [{ key: metric.trim().toLowerCase().replace(/\s+/g, "_"), label: metric.trim(), unit: "" }],
      standards: [],
    });
    setName("");
    setGoal("");
    setMetric("");
    setAdding(false);
  };

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Label>Improvement areas</Label>
          <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">The campaigns.</h1>
        </div>
        {!adding && (
          <Button variant="ghost" onClick={() => setAdding(true)}>
            New area
          </Button>
        )}
      </div>

      {adding && (
        <Card className="mt-6 max-w-lg space-y-3">
          <Label>New area</Label>
          <input className={fieldCls} placeholder="Name — something you perform in" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          <input className={fieldCls} placeholder="Goal — measurable, dated" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={80} />
          <input className={fieldCls} placeholder="First metric to track (e.g. calls made)" value={metric} onChange={(e) => setMetric(e.target.value)} maxLength={30} />
          <div className="flex gap-2">
            <Button onClick={create} disabled={!name.trim() || !goal.trim() || !metric.trim()}>
              Create area
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Starter packs — one-tap areas. */}
      <div className="mt-6">
        <Label className="mb-2">Starter packs</Label>
        <div className="flex flex-wrap gap-2">
          {AREA_TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => addArea(t)}
              disabled={areas.some((a) => a.name === t.name)}
              className="rounded-full border border-line px-4 py-1.5 text-[0.8125rem] text-muted transition-colors duration-[var(--dur-fast)] hover:border-accent hover:text-ink disabled:opacity-40"
              title={t.goal}
            >
              + {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-[var(--gap)] md:grid-cols-2">
        {areas.map((a) => (
          <AreaCard key={a.id} area={a} count={records.filter((r) => r.areaId === a.id).length} />
        ))}
      </div>
    </Shell>
  );
}

function AreaCard({ area, count }: { area: Area; count: number }) {
  const series = useAreaSeries(area.id, area.metrics[0]?.key ?? "");
  const targetSeries = useAreaSeries(area.id, area.target?.metricKey ?? area.metrics[0]?.key ?? "");
  const latest = targetSeries[targetSeries.length - 1];
  const progress =
    area.target && latest !== undefined ? Math.min(1, Math.max(0, latest / area.target.value)) : null;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="type-display text-[1.375rem]">{area.name}</h2>
          <p className="mt-1 text-[0.875rem] text-muted">{area.goal}</p>
        </div>
        <Chip>
          <span className="type-mono">{count}</span>&nbsp;records
        </Chip>
      </div>

      {area.target && progress !== null && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-3">
            <Label>Target · {area.target.metricKey}</Label>
            <span className="type-mono text-[0.75rem]" style={{ color: "var(--gold)" }}>
              {latest} / {area.target.value} · {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="mt-1.5 h-[5px] w-full rounded-full bg-line/60">
            <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: "var(--gold)" }} />
          </div>
          <p className="type-mono mt-1 text-[0.625rem] text-muted">by {area.target.by}</p>
        </div>
      )}

      {area.standards.length > 0 && (
        <div className="mt-4">
          <Label className="mb-1.5">Standards</Label>
          <ul className="space-y-1 text-[0.8125rem] text-ink/90">
            {area.standards.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-accent">—</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <Label className="mb-1">{area.metrics[0]?.label}</Label>
          <Sparkline data={series.slice(-20)} width={170} height={32} />
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {area.metrics.map((m) => (
            <Chip key={m.key}>{m.label}</Chip>
          ))}
        </div>
      </div>
    </Card>
  );
}
