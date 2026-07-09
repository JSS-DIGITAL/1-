"use client";

// History — the sealed archive. Density calendar + any day's full record,
// with the mission→outcome chain visible.

import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Card, Chip, Label } from "@/components/ui";
import { useApp } from "@/lib/store";
import { dayOffset } from "@/lib/mock";
import type { AnswerValue } from "@/lib/types";

export default function HistoryPage() {
  const { records, missions, areas } = useApp();
  const days = useMemo(() => {
    const out: { date: string; kind: "full" | "mvd" | "none"; dayNum: number }[] = [];
    for (let i = 41; i >= 0; i--) {
      const date = dayOffset(-i);
      const rec = records.find((r) => r.date === date);
      out.push({ date, kind: rec ? rec.kind : "none", dayNum: Number(date.slice(8)) });
    }
    return out;
  }, [records]);

  const firstRecorded = days.find((d) => d.kind !== "none")?.date;
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const sel = selected ?? days.filter((d) => d.kind !== "none").slice(-1)[0]?.date ?? firstRecorded;
  const record = records.find((r) => r.date === sel);
  const missionFor = missions.find((m) => m.date === sel);
  const area = areas.find((a) => a.id === record?.areaId);

  return (
    <Shell>
      <Label>History</Label>
      <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">The sealed archive.</h1>

      <div className="mt-6 grid items-start gap-[var(--gap)] lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card>
          <Label className="mb-3">Last six weeks</Label>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelected(d.date)}
                title={`${d.date} — ${d.kind === "none" ? "no record" : d.kind === "mvd" ? "minimum day" : "full review"}`}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border text-[0.6875rem] transition-colors duration-[var(--dur-fast)] ${
                  sel === d.date ? "border-accent" : "border-transparent hover:border-line"
                }`}
              >
                <span className="type-mono text-muted">{d.dayNum}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    d.kind === "full" ? "bg-accent" : d.kind === "mvd" ? "border border-accent/80" : "bg-line"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-[0.6875rem] text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> full</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-accent/80" /> minimum</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-line" /> none</span>
          </div>
        </Card>

        {record ? (
          <Card rule>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label>{record.date}</Label>
                <h2 className="type-display mt-1 text-[1.375rem]">{area?.name}</h2>
              </div>
              <div className="flex gap-2">
                <Chip>{record.kind === "mvd" ? "minimum day" : "full review"}</Chip>
                <Chip tone="accent">sealed</Chip>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {missionFor && (
                <Row label="Mission for this day">
                  <span className="type-mono text-[0.75rem] text-accent">{missionFor.when} · {missionFor.where}</span>{" "}
                  {missionFor.what}
                  {missionFor.outcome && (
                    <Chip className="ml-2" tone={missionFor.outcome === "executed" ? "accent" : "line"}>
                      {missionFor.outcome} · called {missionFor.confidence}/10
                    </Chip>
                  )}
                </Row>
              )}
              <AnswerRow label="Completed" v={record.answers.S2} />
              <NumbersRow v={record.answers.S3} />
              <AnswerRow label="Avoided" v={record.answers.S4} />
              <AnswerRow label="Conditions" v={record.answers.S5} />
              <AnswerRow label="Motion without progress" v={record.answers.T2} />
              {record.weakness && (
                <Row label="Weakness">
                  {record.weakness.text}{" "}
                  <Chip className="ml-1" tone={record.weakness.recurrence === "chronic" ? "accent" : "line"}>
                    {record.weakness.recurrence}
                  </Chip>
                </Row>
              )}
              <AnswerRow label="Committed that evening" v={record.answers.T4} />
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-[0.875rem] text-muted">No record this day. The gap is also data.</p>
            <Button className="mt-4" variant="ghost" onClick={() => setSelected(undefined)}>
              Jump to latest record
            </Button>
          </Card>
        )}
      </div>
    </Shell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-line pt-3 first:border-0 first:pt-0 md:grid-cols-[170px_1fr] md:gap-4">
      <span className="type-mono text-[0.75rem] text-muted">{label}</span>
      <span className="text-[0.875rem] leading-relaxed text-ink">{children}</span>
    </div>
  );
}

function AnswerRow({ label, v }: { label: string; v: AnswerValue | undefined }) {
  if (!v) return null;
  let content: React.ReactNode = null;
  if (v.kind === "list") content = v.items.join(" · ");
  if (v.kind === "line") content = `${v.value}${v.second ? ` → instead: ${v.second}` : ""}`;
  if (v.kind === "text") content = v.value;
  if (v.kind === "mission")
    content = (
      <>
        <span className="type-mono text-[0.75rem] text-accent">{v.when} · {v.where}</span> {v.what}
      </>
    );
  if (!content) return null;
  return <Row label={label}>{content}</Row>;
}

function NumbersRow({ v }: { v: AnswerValue | undefined }) {
  if (v?.kind !== "count") return null;
  return (
    <Row label="Numbers">
      <span className="type-mono text-[0.8125rem]">
        {Object.entries(v.values)
          .map(([k, n]) => `${k} ${n}`)
          .join("  ·  ")}
      </span>
    </Row>
  );
}
