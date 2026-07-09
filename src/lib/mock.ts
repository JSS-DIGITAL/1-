// Deterministic 48-day mock history. Seeded PRNG so server and client render
// identically. The data tells a real story: early overconfidence (9s landing
// ~50%) improving into calibration, one chronic weakness still open, one
// killed (bounty paid) — and the ledger earned day by day alongside.

import type { Area, DayRecord, LedgerEntry, Mission, MissionOutcome } from "./types";
import { bountiesFrom, drawSeal, ECON, momentumFromChain, resolveWager, scoreCandor } from "./economy";

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dayOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return iso(d);
}

export const AREAS: Area[] = [
  {
    id: "a0",
    name: "Universal",
    goal: "Get 1% better at the thing only you know about",
    metrics: [
      { key: "focus", label: "Focused minutes", unit: "min" },
      { key: "shipped", label: "Outputs shipped", unit: "items" },
    ],
    standards: ["Show up. Record. Correct."],
    createdAt: dayOffset(-48),
    target: { metricKey: "focus", value: 60, by: "daily" },
  },
  {
    id: "a1",
    name: "Sales outreach",
    goal: "10 discovery calls booked per month",
    metrics: [
      { key: "calls", label: "Calls made", unit: "calls" },
      { key: "booked", label: "Meetings booked", unit: "mtgs" },
    ],
    standards: ["Hard calls before email", "No pitch without research"],
    createdAt: dayOffset(-48),
    target: { metricKey: "booked", value: 10, by: "end of month" },
  },
  {
    id: "a2",
    name: "Strength training",
    goal: "Squat 140 kg by December",
    metrics: [
      { key: "volume", label: "Total volume", unit: "kg" },
      { key: "sets", label: "Working sets", unit: "sets" },
    ],
    standards: ["Full depth or it doesn't count", "Log every set"],
    createdAt: dayOffset(-48),
    target: { metricKey: "volume", value: 5700, by: "quarter end" },
  },
  {
    id: "a3",
    name: "Spanish",
    goal: "B2 conversation by year end",
    metrics: [
      { key: "minutes", label: "Active practice", unit: "min" },
      { key: "spoken", label: "Sentences spoken", unit: "sent" },
    ],
    standards: ["Production before recognition"],
    createdAt: dayOffset(-40),
    target: { metricKey: "minutes", value: 40, by: "daily by December" },
  },
];

// `earlyOnly` weaknesses stop recurring in the late phase — that is how a
// bounty gets killed in the mock story.
const WEAKNESS_POOL: Record<string, { text: string; weight: number; earlyOnly?: boolean }[]> = {
  a0: [
    { text: "Starts the day without a named target", weight: 4 },
    { text: "Confuses planning with doing", weight: 3 },
    { text: "Lets the phone set the agenda", weight: 2 },
  ],
  a1: [
    { text: "Avoids high-stakes contacts when energy is low", weight: 5 },
    { text: "Research runs long as a stall tactic", weight: 4, earlyOnly: true },
    { text: "Starts the day in email instead of calls", weight: 3 },
    { text: "Follow-ups drift past 48 hours", weight: 1 },
  ],
  a2: [
    { text: "Cuts depth on the last working set", weight: 3 },
    { text: "Skips logging when the session runs late", weight: 2 },
    { text: "Warm-up stretches into scrolling", weight: 1 },
  ],
  a3: [
    { text: "Recognises but never produces sentences", weight: 4 },
    { text: "Trades speaking drills for passive video", weight: 2 },
  ],
};

const MISSION_POOL: Record<string, { when: string; where: string; what: string }[]> = {
  a0: [
    { when: "7:00", where: "desk", what: "One hour on the single most avoided task, phone in another room" },
    { when: "6:30", where: "anywhere quiet", what: "Name the day's one output and finish it before noon" },
  ],
  a1: [
    { when: "6:00", where: "desk", what: "Call the three largest prospects before opening email" },
    { when: "9:00", where: "desk", what: "12 cold calls, hard list first, no email until done" },
    { when: "8:30", where: "office", what: "Send the proposal and book its follow-up call" },
  ],
  a2: [
    { when: "6:30", where: "gym", what: "3×5 squats at target weight, full depth, logged" },
    { when: "7:00", where: "gym", what: "Top set + 2 back-offs before any accessories" },
  ],
  a3: [
    { when: "19:00", where: "kitchen", what: "Record 10 spoken sentences before any video" },
    { when: "19:30", where: "desk", what: "25 minutes tutor prep: write 8 questions aloud" },
  ],
};

const AVOIDANCE_POOL = [
  ["the two biggest prospects on the list", "easy follow-up emails"],
  ["the last working set", "extra accessory work"],
  ["speaking practice", "passive video"],
  ["the pricing conversation", "polishing slides"],
  ["nothing", ""],
  ["the cold list", "reorganising the CRM"],
];

const CONDITION_POOL = [
  "5h sleep — focus collapsed after 14:00",
  "No meetings all morning — deep block held",
  "Gym packed at 6 — lost 20 min waiting on the rack",
  "Travel day — only the minimum landed",
  "Slept 8h — best block of the week before 9am",
  "Phone in the room — three context breaks in the first hour",
];

export interface MockData {
  areas: Area[];
  records: DayRecord[];
  missions: Mission[];
  ledger: LedgerEntry[];
}

export function generateMock(): MockData {
  const rand = mulberry32(20260709);
  const records: DayRecord[] = [];
  const missions: Mission[] = [];
  const ledger: LedgerEntry[] = [];
  const weaknessCount: Record<string, number> = {};
  let chain = 0; // consecutive kept promises

  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const weighted = (areaId: string, phase: "early" | "late") => {
    const pool = WEAKNESS_POOL[areaId].filter((w) => phase === "early" || !w.earlyOnly);
    const total = pool.reduce((s, w) => s + w.weight, 0);
    let r = rand() * total;
    for (const w of pool) {
      r -= w.weight;
      if (r <= 0) return w.text;
    }
    return pool[0].text;
  };

  let pendingMission: Mission | null = null;

  for (let i = 48; i >= 1; i--) {
    const date = dayOffset(-i);
    const phase = i > 24 ? "early" : "late";
    const skip = rand() < (phase === "early" ? 0.12 : 0.05);

    if (skip) {
      // A day with no record. The pending mission dies unjudged → failed.
      if (pendingMission) {
        pendingMission.outcome = "failed";
        pendingMission = null;
        chain = 0;
      }
      continue;
    }

    const r = rand();
    const areaId = r < 0.12 ? "a0" : r < 0.6 ? "a1" : r < 0.84 ? "a2" : "a3";
    const mvd = rand() < (phase === "early" ? 0.18 : 0.08);

    // Rule on the pending mission (this day's S1/T1) — and pay the wager.
    let outcome: MissionOutcome | undefined;
    if (pendingMission) {
      const pExec = phase === "early" ? 0.5 : 0.74;
      const roll = rand();
      outcome = roll < pExec ? "executed" : roll < pExec + 0.16 ? "partial" : "failed";
      pendingMission.outcome = outcome;
      const res = resolveWager(pendingMission.confidence, outcome, momentumFromChain(chain));
      ledger.push({
        date,
        book: "judgment",
        source: "resolve",
        bp: res.total,
        note: `${outcome} · called ${pendingMission.confidence}/10`,
      });
      chain = outcome === "executed" ? chain + 1 : 0;
    }

    // Commit tomorrow's mission (yesterday's commit becomes today's standing one).
    const conf =
      phase === "early" ? 8 + Math.floor(rand() * 2) : 5 + Math.floor(rand() * 4);
    const mTemplate = pick(MISSION_POOL[areaId]);
    const mission: Mission = {
      date: dayOffset(-i + 1),
      areaId,
      ...mTemplate,
      confidence: conf,
      ifThen: "If the slot collapses, then it moves to 12:00 — non-negotiable",
      outcome: undefined,
    };
    missions.push(mission);

    const weakness = weighted(areaId, phase);
    weaknessCount[weakness] = (weaknessCount[weakness] ?? 0) + 1;
    const recurrence =
      weaknessCount[weakness] >= 3 ? "chronic" : weaknessCount[weakness] === 2 ? "repeat" : "new";

    const area = AREAS.find((a) => a.id === areaId)!;
    const progress = (48 - i) / 48;
    const values: Record<string, number> = {};
    for (const m of area.metrics) {
      const base =
        m.key === "calls" ? 8 + progress * 6 : m.key === "booked" ? 1 + progress * 1.6
        : m.key === "volume" ? 4800 + progress * 900 : m.key === "sets" ? 12 + progress * 4
        : m.key === "minutes" ? 20 + progress * 18 : m.key === "focus" ? 35 + progress * 30
        : m.key === "shipped" ? 1 + progress * 2 : 6 + progress * 8;
      values[m.key] = Math.round(base + (rand() - 0.5) * base * 0.25);
    }

    const avoid = pick(AVOIDANCE_POOL);
    const record: DayRecord = {
      date,
      areaId,
      kind: mvd ? "mvd" : "full",
      sealed: true,
      seal: drawSeal(date),
      answers: {
        ...(outcome
          ? {
              S1: {
                kind: "binary",
                value: outcome !== "failed",
                evidence: outcome === "executed" ? "Timestamped in the log" : outcome === "partial" ? "Partial evidence only" : "No evidence — window passed",
              },
              T1: { kind: "enum", value: outcome },
            }
          : {}),
        S2: { kind: "list", items: [pick(["Proposal v2 sent", "12 cold calls", "5×5 @ 100kg", "Anki 142 cards", "3 follow-ups closed", "Top set +2.5kg"])] },
        S3: { kind: "count", values },
        ...(mvd
          ? {}
          : {
              S4: { kind: "line", value: avoid[0], second: avoid[1] },
              S5: { kind: "line", value: pick(CONDITION_POOL) },
              T2: { kind: "line", value: pick(["The 90-min research block produced no artifact", "none", "CRM tidying displaced the call block", "none"]) },
              T3: { kind: "enum", value: recurrence, note: weakness },
              T6: { kind: "line", value: "If the 6:00 alarm fails, then the block moves to 12:00" },
            }),
        T4: { kind: "mission", when: mission.when, where: mission.where, what: mission.what },
        T5: { kind: "scale", value: conf },
      },
      weakness: mvd ? undefined : { text: weakness, recurrence },
    };
    records.push(record);

    const candor = scoreCandor(record.answers, record.kind);
    ledger.push({
      date,
      book: "candor",
      source: "candor",
      bp: candor.bp,
      note: record.kind === "mvd" ? "minimum day sealed" : "record sealed",
    });

    pendingMission = mission;
  }

  // Pay any bounty the history has already killed (chronic weakness gone
  // quiet for the kill window).
  for (const b of bountiesFrom(records)) {
    if (b.status === "killed") {
      ledger.push({
        date: dayOffset(-1),
        book: "judgment",
        source: "bounty",
        bp: ECON.bountyPay,
        note: `bounty collected: ${b.text}`,
      });
    }
  }

  return { areas: AREAS, records, missions, ledger };
}
