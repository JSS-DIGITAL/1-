"use client";

// Improvement areas — campaigns, each with its own goal, standards and metrics.

import { useState } from "react";
import { Shell } from "@/components/shell";
import { Sparkline } from "@/components/charts";
import { Button, Card, Chip, Label } from "@/components/ui";
import { useApp, useAreaSeries } from "@/lib/store";
import type { Area } from "@/lib/types";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";

export default function AreasPage() {
  const { areas, records, addArea } = useApp();
  const [adding, setAdding] = useState(false);
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
