"use client";

// Analytics — not a fitness tracker. Every panel answers a question the
// Teacher would ask. Metrics come from the framework's metadata schema.

import { Shell } from "@/components/shell";
import { CalibrationPlot, CompoundCurve, CountUp, DensityStrip, RecurrenceBars } from "@/components/charts";
import { Card, Label, StatTile } from "@/components/ui";
import { useAnalytics } from "@/lib/store";

export default function AnalyticsPage() {
  const a = useAnalytics();
  const fullDays = a.density.filter((d) => d.kind === "full").length;
  const mvdDays = a.density.filter((d) => d.kind === "mvd").length;

  return (
    <Shell>
      <Label>Analytics</Label>
      <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">The Teacher&apos;s instruments.</h1>

      <div className="mt-6 grid grid-cols-2 gap-[var(--gap)] md:grid-cols-4">
        <StatTile
          label="Missions executed · 30d"
          value={`${Math.round(a.completion * 100)}%`}
          detail="do you do what you say?"
        />
        <StatTile
          label="Calibration error"
          value={a.calibrationError.toFixed(2)}
          detail="0 = your word is data"
        />
        <StatTile label="Judged missions" value={String(a.judgedCount)} detail="the sample behind the numbers" />
        <StatTile
          label="Records · 30d"
          value={`${fullDays + mvdDays}`}
          detail={`${fullDays} full · ${mvdDays} minimum`}
        />
      </div>

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] lg:grid-cols-2">
        <Card>
          <Label className="mb-1">Is your word data?</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            Every confidence call (T5) against what actually happened (T1). Dots above the diagonal:
            underconfident. Below: overconfident.
          </p>
          <CalibrationPlot points={a.calibration} />
        </Card>

        <Card>
          <Label className="mb-1">What keeps recurring?</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            Weaknesses named by the Teacher (T3), counted across the ledger. Three or more flags means the
            correction method has failed — a system change is due.
          </p>
          <RecurrenceBars items={a.recurrence} />
        </Card>

        <Card>
          <Label className="mb-1">Is it compounding?</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            Executed day ×1.01, partial ×1.005, missed ×1. Your curve is currently at{" "}
            <span className="type-mono text-ink">
              ×<CountUp to={a.curve[a.curve.length - 1] ?? 1} decimals={3} />
            </span>
            .
          </p>
          <CompoundCurve curve={a.curve} ideal={a.ideal} />
        </Card>

        <Card>
          <Label className="mb-1">Do you show up?</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            Record density, last 30 days. A thin record beats no record; a gap is also data. No streaks —
            attendance is measured, never worshipped.
          </p>
          <DensityStrip days={a.density} />
          <div className="type-mono mt-4 border-t border-line pt-3 text-[0.75rem] text-muted">
            {fullDays} full · {mvdDays} minimum · {30 - fullDays - mvdDays} absent
          </div>
        </Card>
      </div>
    </Shell>
  );
}
