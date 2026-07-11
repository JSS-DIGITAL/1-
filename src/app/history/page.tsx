"use client";

// History — the sealed archive as a real timeline: horizontal, oldest left to
// newest right, auto-scrolled to today. Silent days stay on the rail as honest
// ticks. The mini-calendar dropdown jumps to exact dates further back.

import { useEffect, useMemo, useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { Card, Chip, Label } from "@/components/ui";
import { SealStamp, SEAL_COLORS, SEAL_NAMES } from "@/components/economy-ui";
import { isNoneText, SEAL_ORDER } from "@/lib/economy";
import { SECTIONS } from "@/lib/framework";
import { useApp } from "@/lib/store";
import { dayOffset, iso } from "@/lib/mock";
import type { AnswerValue, DayRecord, Mission } from "@/lib/types";

type TimelineItem =
  | { type: "day"; date: string; record: DayRecord; mission?: Mission }
  | { type: "gap"; count: number; key: string };

export default function HistoryPage() {
  const { records, missions, areas } = useApp();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [calCursor, setCalCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const stripRef = useRef<HTMLDivElement>(null);

  // Oldest → newest, left → right.
  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    let gap = 0;
    for (let i = 48; i >= 0; i--) {
      const date = dayOffset(-i);
      const rec = records.find((r) => r.date === date);
      if (rec) {
        if (gap > 0) items.push({ type: "gap", count: gap, key: `gap-${date}` });
        gap = 0;
        items.push({ type: "day", date, record: rec, mission: missions.find((m) => m.date === date) });
      } else {
        gap++;
      }
    }
    return items;
  }, [records, missions]);

  const dayItems = timeline.filter((t): t is Extract<TimelineItem, { type: "day" }> => t.type === "day");
  const sel = selected ?? dayItems[dayItems.length - 1]?.date;
  const record = records.find((r) => r.date === sel);
  const missionFor = missions.find((m) => m.date === sel);
  const area = areas.find((a) => a.id === record?.areaId);

  // Start at the newest end; keep the selected node in view on jumps.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const node = strip.querySelector<HTMLElement>(`[data-date="${sel}"]`);
    if (node) node.scrollIntoView({ inline: "center", block: "nearest" });
    else strip.scrollTo({ left: strip.scrollWidth });
  }, [sel]);

  const calDays = useMemo(() => {
    const first = new Date(calCursor.y, calCursor.m, 1);
    const days: { date: string; dayNum: number; kind: "full" | "mvd" | "none" }[] = [];
    const cur = new Date(first);
    while (cur.getMonth() === calCursor.m) {
      const dISO = iso(cur);
      const rec = records.find((r) => r.date === dISO);
      days.push({ date: dISO, dayNum: cur.getDate(), kind: rec ? rec.kind : "none" });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [calCursor, records]);

  const monthLabel = new Date(calCursor.y, calCursor.m, 1).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });

  return (
    <Shell>
      <Label>History</Label>
      <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">The sealed archive.</h1>

      <Card className="mt-6 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <Label>Timeline</Label>
          <button
            onClick={() => setCalOpen(!calOpen)}
            className="type-mono rounded-[var(--radius-sm)] border border-line px-2.5 py-1 text-[0.6875rem] text-muted hover:border-muted hover:text-ink"
          >
            jump to date {calOpen ? "▴" : "▾"}
          </button>
        </div>

        {calOpen && (
          <div className="mt-3 max-w-sm rounded-[var(--radius-sm)] border border-line bg-surface-2 p-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                aria-label="Previous month"
                onClick={() => setCalCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}
                className="type-mono px-2 text-muted hover:text-ink"
              >
                ←
              </button>
              <span className="type-mono text-[0.75rem] text-ink">{monthLabel}</span>
              <button
                aria-label="Next month"
                onClick={() => setCalCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}
                className="type-mono px-2 text-muted hover:text-ink"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((d) => (
                <button
                  key={d.date}
                  disabled={d.kind === "none"}
                  onClick={() => {
                    setSelected(d.date);
                    setCalOpen(false);
                  }}
                  className={`type-mono flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[3px] text-[0.625rem] ${
                    d.kind === "none"
                      ? "text-muted/40"
                      : sel === d.date
                        ? "border border-accent text-ink"
                        : "text-ink hover:bg-surface"
                  }`}
                >
                  {d.dayNum}
                  <span
                    className={`h-1 w-1 rounded-full ${
                      d.kind === "full" ? "bg-accent" : d.kind === "mvd" ? "border border-accent/80" : "bg-transparent"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The rail — sideways, like a real one. */}
        <div ref={stripRef} className="mt-5 overflow-x-auto pb-2">
          <div className="relative flex min-w-max items-start pt-1">
            <span className="absolute left-0 right-0 top-[17px] h-px bg-line" aria-hidden />
            {timeline.map((item) =>
              item.type === "gap" ? (
                <div key={item.key} className="relative flex w-12 shrink-0 flex-col items-center">
                  <span className="mt-[15px] h-[5px] w-5 rounded-full bg-line/70" aria-hidden />
                  <span className="type-mono mt-2 text-[0.5625rem] text-muted/50">
                    ×{item.count} silent
                  </span>
                </div>
              ) : (
                <button
                  key={item.date}
                  data-date={item.date}
                  onClick={() => setSelected(item.date)}
                  className="relative flex w-[176px] shrink-0 flex-col items-center px-1.5 text-left"
                >
                  <span className="relative z-10 rounded-full bg-surface">
                    {item.record.seal ? (
                      <SealStamp seal={item.record.seal} size={34} />
                    ) : (
                      <span className="mt-2 block h-3 w-3 rounded-full bg-accent" />
                    )}
                  </span>
                  <span
                    className={`mt-2 w-full rounded-[var(--radius-sm)] border p-2.5 transition-colors duration-[var(--dur-fast)] ${
                      sel === item.date ? "border-accent bg-surface-2" : "border-line hover:border-muted"
                    }`}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="type-mono text-[0.625rem] text-muted">{item.date.slice(5)}</span>
                      {item.mission?.outcome && (
                        <span
                          className={`type-mono text-[0.5625rem] uppercase tracking-[0.12em] ${
                            item.mission.outcome === "executed" ? "text-accent" : "text-muted"
                          }`}
                        >
                          {item.mission.outcome}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.75rem] text-ink">
                      {areas.find((a) => a.id === item.record.areaId)?.name}
                      {item.record.kind === "mvd" && (
                        <span className="type-mono ml-1.5 text-[0.5625rem] text-muted">min</span>
                      )}
                    </span>
                    {item.mission && (
                      <span className="mt-0.5 line-clamp-2 block text-[0.6875rem] leading-snug text-muted">
                        {item.mission.what}
                      </span>
                    )}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-3 border-t border-line pt-3">
          <Label className="mb-2">Seal collection</Label>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {SEAL_ORDER.map((rarity) => {
              const n = records.filter((r) => r.seal?.rarity === rarity).length;
              return (
                <span
                  key={rarity}
                  className="type-mono flex items-center gap-1.5 text-[0.6875rem]"
                  style={{ color: SEAL_COLORS[rarity] }}
                >
                  <SealStamp seal={{ rarity, label: SEAL_NAMES[rarity] }} size={18} />
                  {n}× {SEAL_NAMES[rarity]}
                </span>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="mt-[var(--gap)]">
        {record ? (
          <Card rule className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label>{record.date}</Label>
                <h2 className="type-display mt-1 text-[1.375rem]">{area?.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Chip>{record.kind === "mvd" ? "minimum day" : "full review"}</Chip>
                {record.seal ? (
                  <span className="flex items-center gap-1.5">
                    <SealStamp seal={record.seal} size={30} />
                    <span
                      className="type-mono text-[0.625rem] uppercase tracking-[0.15em]"
                      style={{ color: SEAL_COLORS[record.seal.rarity] }}
                    >
                      {SEAL_NAMES[record.seal.rarity]}
                    </span>
                  </span>
                ) : (
                  <Chip tone="accent">sealed</Chip>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {missionFor && (
                <Row label="Mission for this day">
                  <span className="type-mono text-[0.75rem] text-accent">
                    {missionFor.when} · {missionFor.where}
                  </span>{" "}
                  {missionFor.what}
                  {missionFor.outcome && (
                    <Chip className="ml-2" tone={missionFor.outcome === "executed" ? "accent" : "line"}>
                      {missionFor.outcome} · called {missionFor.confidence}/10
                    </Chip>
                  )}
                </Row>
              )}
              {record.answers.S1?.kind === "binary" && (
                <Row label="Mission claim">
                  {record.answers.S1.value ? "Done" : "Not done"}
                  {record.answers.S1.evidence ? ` — ${record.answers.S1.evidence}` : ""}
                </Row>
              )}
              <AnswerRow label="Completed" v={record.answers.S2} />
              <NumbersRow v={record.answers.S3} />
              <AnswerRow label="Avoided" v={record.answers.S4} />
              <AnswerRow label="Conditions" v={record.answers.S5} />
              {/* Framework v2: the section prose, labeled by section name. */}
              {SECTIONS.filter((s) => record.answers[s.proseId]?.kind === "text").map((s) => {
                const p = record.answers[s.proseId];
                if (p?.kind !== "text" || !p.value.trim()) return null;
                return (
                  <Row key={s.proseId} label={s.name}>
                    {p.value}
                    {isNoneText(p.value) && (
                      <span className="type-mono ml-2 text-[0.625rem] text-muted/60">· none — tracked</span>
                    )}
                  </Row>
                );
              })}
              <AnswerRow label="Motion without progress" v={record.answers.T2} />
              {record.weakness && (
                <Row label="Weakness">
                  {record.weakness.text}{" "}
                  <Chip className="ml-1" tone={record.weakness.recurrence === "chronic" ? "accent" : "line"}>
                    {record.weakness.recurrence}
                  </Chip>
                </Row>
              )}
              {record.answers.TR?.kind === "scale" && (
                <Row label="Execution Rating">
                  <span className="type-mono" style={{ color: "var(--gold)" }}>
                    {record.answers.TR.value}/10
                  </span>
                  {record.answers.TR.why ? ` — ${record.answers.TR.why}` : ""}
                </Row>
              )}
              {["C1", "C2", "C3"].map((cid) => {
                const v = record.answers[cid];
                if (!v || (v.kind !== "line" && v.kind !== "text") || !v.value.trim()) return null;
                return (
                  <Row key={cid} label={`Your question (${cid})`}>
                    {v.value}
                  </Row>
                );
              })}
              <AnswerRow label="Committed that evening" v={record.answers.T4} />
              {(record.noneCount ?? 0) > 0 && (
                <Row label="Explicit nones">
                  <span className="type-mono text-[0.8125rem]">{record.noneCount} — legal, and on the books</span>
                </Row>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-[0.875rem] text-muted">No record this day. The gap is also data.</p>
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
        <span className="type-mono text-[0.75rem] text-accent">
          {v.when} · {v.where}
        </span>{" "}
        {v.what}
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
