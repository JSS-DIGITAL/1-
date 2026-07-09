"use client";

// The Weekly Debrief — QUESTION_FRAMEWORK.md §6 W1–W5, finally in the app.
// W1/W2 arrive pre-filled from the ledger; completing the debrief pays
// +25 bp and stamps the week.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { Button, Card, Chip, Label } from "@/components/ui";
import { useApp, useEconomy } from "@/lib/store";
import { dayOffset } from "@/lib/mock";
import { ECON } from "@/lib/economy";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent min-h-[3rem] resize-none";

export default function WeeklyPage() {
  const router = useRouter();
  const { missions, weeklyDone, completeWeekly } = useApp();
  const econ = useEconomy();
  const [target, setTarget] = useState("");
  const [calVerdict, setCalVerdict] = useState<string>();
  const [ratchet, setRatchet] = useState("");
  const [ssc, setSsc] = useState({ stop: "", start: "", cont: "" });
  const [done, setDone] = useState(false);

  // W1/W2 prefills: the last 7 days of judged missions.
  const week = useMemo(() => {
    const cutoff = dayOffset(-7);
    const judged = missions.filter((m) => m.outcome && m.date >= cutoff);
    const executed = judged.filter((m) => m.outcome === "executed").length;
    const avgConf =
      judged.length === 0 ? 0 : judged.reduce((s, m) => s + m.confidence, 0) / judged.length;
    const actual = judged.length === 0 ? 0 : executed / judged.length;
    return { set: judged.length, executed, avgConf, actual };
  }, [missions]);

  const suggestion =
    week.avgConf / 10 > week.actual + 0.1
      ? "overconfident"
      : week.avgConf / 10 < week.actual - 0.1
        ? "underconfident"
        : "calibrated";

  const openBounties = econ.bounties.filter((b) => b.status === "open");
  const canFinish = Boolean(target.trim() && calVerdict && ratchet.trim());

  if (weeklyDone || done) {
    return (
      <Shell>
        <Card className="mx-auto max-w-md text-center">
          <Chip tone="accent">week stamped</Chip>
          <p className="type-display mt-4 text-[1.375rem]">Debrief filed.</p>
          <p className="type-mono mt-2 text-[0.75rem]" style={{ color: "var(--gold)" }}>
            +{ECON.weeklyDebriefPay} bp · candor
          </p>
          <Button className="mt-6" onClick={() => router.push("/today")}>
            Return to the system
          </Button>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Label>Weekly debrief</Label>
      <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">Close the week.</h1>
      <p className="mt-2 max-w-xl text-[0.875rem] text-muted">
        Twelve minutes, once a week. The ledger did the counting — you do the ruling.
      </p>

      <div className="mt-6 grid max-w-2xl gap-[var(--gap)]">
        <Card>
          <Label className="mb-1">W1 · Mission ledger</Label>
          <p className="text-[0.8125rem] text-muted">Counted for you, from the record:</p>
          <div className="type-mono mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.9375rem]">
            <span>
              set <span className="text-ink">{week.set}</span>
            </span>
            <span>
              executed <span className="text-accent">{week.executed}</span>
            </span>
            <span>
              rate{" "}
              <span style={{ color: "var(--gold)" }}>
                {week.set === 0 ? "—" : `${Math.round((week.executed / week.set) * 100)}%`}
              </span>
            </span>
          </div>
        </Card>

        <Card>
          <Label className="mb-1">W2 · Calibration check</Label>
          <p className="text-[0.8125rem] text-muted">
            You averaged <span className="type-mono text-ink">{week.avgConf.toFixed(1)}/10</span> confidence;
            you executed <span className="type-mono text-ink">{Math.round(week.actual * 100)}%</span>. The
            numbers say: <span className="text-accent">{suggestion}</span>. Your ruling?
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["overconfident", "underconfident", "calibrated"].map((o) => (
              <button
                key={o}
                onClick={() => setCalVerdict(o)}
                className={`rounded-[var(--radius-sm)] border py-2.5 text-[0.8125rem] ${
                  calVerdict === o ? "border-accent bg-accent text-accent-ink font-medium" : "border-line bg-surface-2 text-ink"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <Label className="mb-1">W3 · Next week&apos;s target</Label>
          <p className="text-[0.8125rem] text-muted">
            Which weakness appeared two or more times? Name ONE as next week&apos;s target.
          </p>
          {openBounties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {openBounties.slice(0, 3).map((b) => (
                <button
                  key={b.text}
                  onClick={() => setTarget(b.text)}
                  className={`rounded-full border px-3 py-1.5 text-[0.75rem] ${
                    target === b.text ? "border-accent text-accent" : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {b.text} · {b.count}×
                </button>
              ))}
            </div>
          )}
          <textarea
            className={`${fieldCls} mt-3`}
            rows={1}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="One target. It becomes next week's lens."
          />
        </Card>

        <Card>
          <Label className="mb-1">W4 · Standards ratchet</Label>
          <p className="text-[0.8125rem] text-muted">
            What was easy this week that should no longer count as work? Raise that bar — one measurable line.
          </p>
          <textarea
            className={`${fieldCls} mt-3`}
            rows={1}
            value={ratchet}
            onChange={(e) => setRatchet(e.target.value)}
            placeholder="e.g. 10 calls is the floor now, not the win"
          />
        </Card>

        <Card>
          <Label className="mb-1">W5 · Stop / Start / Continue</Label>
          <div className="mt-3 space-y-2.5">
            {(["stop", "start", "cont"] as const).map((k) => (
              <div key={k}>
                <span className="type-mono text-[0.6875rem] uppercase tracking-[0.15em] text-muted">
                  {k === "cont" ? "continue" : k}
                </span>
                <textarea
                  className={`${fieldCls} mt-1`}
                  rows={1}
                  value={ssc[k]}
                  onChange={(e) => setSsc((s) => ({ ...s, [k]: e.target.value }))}
                  placeholder="Earn it with a line from this week's records"
                />
              </div>
            ))}
          </div>
        </Card>

        <Button
          disabled={!canFinish}
          onClick={() => {
            completeWeekly(target);
            setDone(true);
          }}
        >
          Stamp the week · +{ECON.weeklyDebriefPay} bp
        </Button>
      </div>
    </Shell>
  );
}
