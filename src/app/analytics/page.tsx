"use client";

// Analytics — not a fitness tracker. Every panel answers a question the
// Teacher would ask. Metrics come from the framework's metadata schema.

import { Shell } from "@/components/shell";
import { CalibrationPlot, CompoundCurve, CountUp, DensityStrip, RecurrenceBars, Sparkline } from "@/components/charts";
import { BountyCard, GripDial, PRBoard, TrophyCabinet } from "@/components/economy-ui";
import { noneCountOf, RANKS } from "@/lib/economy";
import { Card, Label, StatTile } from "@/components/ui";
import { useAnalytics, useApp, useEconomy } from "@/lib/store";

export default function AnalyticsPage() {
  const { records } = useApp();
  const a = useAnalytics();
  const econ = useEconomy();
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
        <StatTile
          label="“None” answers · 30d"
          value={String(records.slice(-30).reduce((s, r) => s + (r.noneCount ?? noneCountOf(r.answers)), 0))}
          detail="explicit nothing — legal, and tracked"
        />
      </div>

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] lg:grid-cols-2">
        <Card>
          <Label className="mb-1">Are you honest, and are you right?</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            The two books. Candor pays the Student for admission; Judgment pays the Teacher for verdicts,
            calibration and kills.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1">Candor</Label>
              <div className="type-mono text-[1.6rem] leading-none">{econ.candorTotal}<span className="ml-1 text-[0.75rem] text-muted">bp</span></div>
            </div>
            <div>
              <Label className="mb-1">Judgment</Label>
              <div className="type-mono text-[1.6rem] leading-none">{econ.judgmentTotal}<span className="ml-1 text-[0.75rem] text-muted">bp</span></div>
            </div>
          </div>
          <div className="mt-4 border-t border-line pt-3">
            <Label className="mb-2">Balance history</Label>
            <Sparkline data={econ.history} width={300} height={44} />
          </div>
          <div className="type-mono mt-3 space-y-1 border-t border-line pt-3 text-[0.6875rem] text-muted">
            {econ.recent.slice(0, 4).map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">{e.note}</span>
                <span className="shrink-0 text-ink">+{e.bp}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Label className="mb-1">What are you hunting?</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            Chronic weaknesses carry bounties. A bounty dies when the weakness stays silent for 14 days —
            corrections are the weapon.
          </p>
          <div className="space-y-3">
            {econ.bounties.map((b) => (
              <BountyCard key={b.text} bounty={b} />
            ))}
            {econ.bounties.length === 0 && (
              <p className="text-[0.8125rem] text-muted">No chronic weaknesses on the board.</p>
            )}
          </div>
        </Card>

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
            1%/day is the <span className="text-ink">floor, not the ceiling</span> — honest calls and kept
            promises compound faster. Executed ×1.01, partial ×1.005, missed ×1. Your curve:{" "}
            <span className="type-mono text-ink">
              ×<CountUp to={a.curve[a.curve.length - 1] ?? 1} decimals={3} />
            </span>
            .
          </p>
          <CompoundCurve curve={a.curve} ideal={a.ideal} />
        </Card>

        <Card>
          <Label className="mb-1">How locked in are you?</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            Grip is the composite: 40% record density, 25% momentum, 20% calibration, 15% completion.
          </p>
          <GripDial grip={econ.grip} size={90} />
          <div className="mt-4 border-t border-line pt-4">
            <Label className="mb-2">The ladder</Label>
            <div className="space-y-1.5">
              {RANKS.map((r, i) => (
                <div key={r.name} className="type-mono flex items-center justify-between text-[0.75rem]">
                  <span className={i <= econ.rank.index ? "text-ink" : "text-muted/50"}>
                    {i <= econ.rank.index ? "◆" : "◇"} {r.name}
                  </span>
                  <span className={i <= econ.rank.index ? "" : "text-muted/50"} style={i <= econ.rank.index ? { color: "var(--gold)" } : undefined}>
                    {r.min} bp
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <Label className="mb-1">You vs. previous self — the only board</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            No leaderboards. No strangers. The records that matter are yours to beat.
          </p>
          <PRBoard prs={econ.prs} />
        </Card>

        <Card>
          <Label className="mb-1">The cabinet</Label>
          <p className="mb-4 text-[0.8125rem] text-muted">
            {econ.achievements.filter((x) => x.earned).length} of {econ.achievements.length} earned. None are
            purchasable.
          </p>
          <TrophyCabinet achievements={econ.achievements} />
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
