"use client";

// In-memory app store, shaped like a future API client: the components only
// talk to selectors and actions, so swapping in a real backend is a transport
// change, not a redesign. Mock data seeds it (see mock.ts).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { generateMock, dayOffset } from "./mock";
import {
  balanceOf,
  bountiesFrom,
  chainFrom,
  drawSeal,
  momentumFromChain,
  rankFor,
  resolveWager,
  scoreCandor,
} from "./economy";
import type {
  Area,
  AnswerValue,
  DayRecord,
  LedgerEntry,
  Mission,
  MissionOutcome,
  Mode,
  Prefs,
  Recurrence,
} from "./types";

interface AccentPair {
  accent: string;
  accentInk: string;
  name: string;
  /** Minimum rank index (economy.RANKS) required to equip. 0 = always. */
  rankReq: number;
}

export const ACCENT_PRESETS: Record<Mode, AccentPair[]> = {
  student: [
    { name: "Emerald", accent: "#45b683", accentInk: "#08120c", rankReq: 0 },
    { name: "Jade", accent: "#3fbf9f", accentInk: "#071311", rankReq: 2 },
    { name: "Viridian", accent: "#7cc26b", accentInk: "#0c1207", rankReq: 4 },
  ],
  teacher: [
    { name: "Blood", accent: "#ed5656", accentInk: "#180808", rankReq: 0 },
    { name: "Crimson", accent: "#e4485e", accentInk: "#160709", rankReq: 2 },
    { name: "Garnet", accent: "#f07a5a", accentInk: "#170a06", rankReq: 3 },
  ],
};

interface AppState {
  areas: Area[];
  records: DayRecord[];
  missions: Mission[];
  ledger: LedgerEntry[];
  mode: Mode;
  todayDone: boolean;
  pendingS1: boolean | null;
  prefs: Prefs;
  accents: Record<Mode, AccentPair>;
  setMode: (m: Mode, fade?: boolean) => void;
  setPendingS1: (v: boolean | null) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  setAccent: (mode: Mode, pair: AccentPair) => void;
  addArea: (a: Omit<Area, "id" | "createdAt">) => void;
  completeToday: (opts: {
    areaId: string;
    kind: "full" | "mvd";
    answers: Record<string, AnswerValue>;
  }) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const seed = useMemo(() => generateMock(), []);
  const [areas, setAreas] = useState(seed.areas);
  const [records, setRecords] = useState(seed.records);
  const [missions, setMissions] = useState(seed.missions);
  const [ledger, setLedger] = useState(seed.ledger);
  const [mode, setModeState] = useState<Mode>("student");
  const [todayDone, setTodayDone] = useState(false);
  const [pendingS1, setPendingS1] = useState<boolean | null>(null);
  const [prefs, setPrefsState] = useState<Prefs>({
    rotation: true,
    deepTier: false,
    sound: false,
    hardLines: true,
  });
  const [accents, setAccents] = useState<Record<Mode, AccentPair>>({
    student: ACCENT_PRESETS.student[0],
    teacher: ACCENT_PRESETS.teacher[0],
  });
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setMode = useCallback((m: Mode, fade = true) => {
    const root = document.documentElement;
    if (fade && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("mode-fade");
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => document.body.classList.remove("mode-fade"), 720);
    }
    root.dataset.mode = m;
    setModeState(m);
  }, []);

  // Apply accent overrides for the active mode.
  useEffect(() => {
    const root = document.documentElement;
    const pair = accents[mode];
    root.style.setProperty("--accent", pair.accent);
    root.style.setProperty("--accent-ink", pair.accentInk);
  }, [mode, accents]);

  const setPrefs = useCallback((p: Partial<Prefs>) => setPrefsState((s) => ({ ...s, ...p })), []);
  const setAccent = useCallback(
    (m: Mode, pair: AccentPair) => setAccents((s) => ({ ...s, [m]: pair })),
    []
  );

  const addArea = useCallback((a: Omit<Area, "id" | "createdAt">) => {
    setAreas((s) => [...s, { ...a, id: `a${s.length + 1}-${Date.now()}`, createdAt: dayOffset(0) }]);
  }, []);

  const completeToday = useCallback(
    ({ areaId, kind, answers }: { areaId: string; kind: "full" | "mvd"; answers: Record<string, AnswerValue> }) => {
      const today = dayOffset(0);
      const newEntries: LedgerEntry[] = [];

      // Rule on yesterday's mission from T1 — and pay the wager. The chain is
      // taken before today's verdict lands (the multiplier the bet was riding).
      const t1 = answers.T1;
      if (t1?.kind === "enum") {
        const standing = missions.find((m) => m.date === today && !m.outcome);
        if (standing) {
          const verdict = t1.value as MissionOutcome;
          const res = resolveWager(standing.confidence, verdict, momentumFromChain(chainFrom(missions)));
          newEntries.push({
            date: today,
            book: "judgment",
            source: "resolve",
            bp: res.total,
            note: `${verdict} · called ${standing.confidence}/10`,
          });
        }
        setMissions((ms) =>
          ms.map((m) => (m.date === today && !m.outcome ? { ...m, outcome: t1.value as MissionOutcome } : m))
        );
      }

      // Commit tomorrow's mission from T4/T5/T6.
      const t4 = answers.T4;
      const t5 = answers.T5;
      const t6 = answers.T6;
      if (t4?.kind === "mission") {
        setMissions((ms) => [
          ...ms,
          {
            date: dayOffset(1),
            areaId,
            when: t4.when,
            where: t4.where,
            what: t4.what,
            confidence: t5?.kind === "scale" ? t5.value : 5,
            ifThen: t6?.kind === "line" ? t6.value : undefined,
          },
        ]);
      }

      // Weakness ledger from T3.
      const t3 = answers.T3;
      const weakness =
        t3?.kind === "enum" && t3.note
          ? { text: t3.note, recurrence: t3.value as Recurrence }
          : undefined;

      // Candor pay: the sealed record earns for admission, not achievement.
      const candor = scoreCandor(answers, kind);
      newEntries.push({
        date: today,
        book: "candor",
        source: "candor",
        bp: candor.bp,
        note: kind === "mvd" ? "minimum day sealed" : "record sealed",
      });

      setRecords((rs) => [
        ...rs,
        { date: today, areaId, kind, sealed: true, answers, weakness, seal: drawSeal(today) },
      ]);
      setLedger((l) => [...l, ...newEntries]);
      setTodayDone(true);
    },
    [missions]
  );

  const value: AppState = {
    areas,
    records,
    missions,
    ledger,
    mode,
    todayDone,
    pendingS1,
    prefs,
    accents,
    setMode,
    setPendingS1,
    setPrefs,
    setAccent,
    addArea,
    completeToday,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp outside AppProvider");
  return ctx;
}

// ---- Selectors (pure; components stay dumb) ----

export function useAnalytics() {
  const { missions, records } = useApp();
  return useMemo(() => {
    const judged = missions.filter((m) => m.outcome);
    const last30 = judged.slice(-30);
    const completion =
      last30.length === 0
        ? 0
        : last30.filter((m) => m.outcome === "executed").length / last30.length;

    // Calibration: bucket predictions, compare with actual execution rate.
    const buckets = new Map<number, { n: number; hits: number }>();
    for (const m of judged) {
      const b = buckets.get(m.confidence) ?? { n: 0, hits: 0 };
      b.n += 1;
      if (m.outcome === "executed") b.hits += 1;
      buckets.set(m.confidence, b);
    }
    const calibration = [...buckets.entries()]
      .map(([conf, { n, hits }]) => ({ conf, n, actual: hits / n }))
      .sort((a, b) => a.conf - b.conf);
    const calibrationError =
      judged.length === 0
        ? 0
        : judged.reduce(
            (s, m) => s + Math.abs(m.confidence / 10 - (m.outcome === "executed" ? 1 : m.outcome === "partial" ? 0.5 : 0)),
            0
          ) / judged.length;

    // Weakness recurrence ledger.
    const weaknessCounts = new Map<string, number>();
    for (const r of records) {
      if (r.weakness) weaknessCounts.set(r.weakness.text, (weaknessCounts.get(r.weakness.text) ?? 0) + 1);
    }
    const recurrence = [...weaknessCounts.entries()]
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);

    // Consistency density, last 30 days.
    const density: { date: string; kind: "full" | "mvd" | "none" }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayOffset(-i);
      const rec = records.find((r) => r.date === date);
      density.push({ date, kind: rec ? rec.kind : "none" });
    }

    // Compounding curve: executed ×1.01, partial ×1.005, else flat.
    let v = 1;
    const curve: number[] = [];
    const ideal: number[] = [];
    judged.slice(-48).forEach((m, i) => {
      v *= m.outcome === "executed" ? 1.01 : m.outcome === "partial" ? 1.005 : 1;
      curve.push(v);
      ideal.push(Math.pow(1.01, i + 1));
    });

    return { completion, calibration, calibrationError, recurrence, density, curve, ideal, judgedCount: judged.length };
  }, [missions, records]);
}

export function useYesterdayMission(): Mission | undefined {
  const { missions } = useApp();
  const today = dayOffset(0);
  return missions.find((m) => m.date === today && !m.outcome);
}

/** Everything the economy surfaces need, derived from the three source arrays. */
export function useEconomy() {
  const { ledger, missions, records } = useApp();
  return useMemo(() => {
    const balance = balanceOf(ledger);
    const candorTotal = ledger.filter((e) => e.book === "candor").reduce((s, e) => s + e.bp, 0);
    const judgmentTotal = balance - candorTotal;
    const chain = chainFrom(missions);

    // Cumulative balance by day, for the balance-history chart.
    const byDate = new Map<string, number>();
    for (const e of ledger) byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.bp);
    const history: number[] = [];
    for (const d of [...byDate.keys()].sort()) {
      history.push((history[history.length - 1] ?? 0) + byDate.get(d)!);
    }

    return {
      balance,
      candorTotal,
      judgmentTotal,
      chain,
      momentum: momentumFromChain(chain),
      rank: rankFor(balance),
      bounties: bountiesFrom(records),
      recent: [...ledger].slice(-8).reverse(),
      history,
    };
  }, [ledger, missions, records]);
}

export function useAreaSeries(areaId: string, metricKey: string): number[] {
  const { records } = useApp();
  return useMemo(
    () =>
      records
        .filter((r) => r.areaId === areaId && r.answers.S3?.kind === "count")
        .map((r) => (r.answers.S3 as { kind: "count"; values: Record<string, number> }).values[metricKey])
        .filter((v): v is number => typeof v === "number"),
    [records, areaId, metricKey]
  );
}
