"use client";

// The app store — device-local persistence, no backend. State hydrates from
// localStorage on mount and writes through on every change (see persist.ts);
// the app runs entirely on the user's own device. Components only talk to
// selectors and actions, so a real backend later is a transport change, not
// a redesign. Mock data is demo-only (Settings → load demo data).

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { generateMock, dayOffset } from "./mock";
import { clearState, loadState, PERSIST_KEY, saveStateDebounced } from "./persist";
import { retryQueuedSignups } from "./signup";
import {
  achievementsFrom,
  balanceOf,
  bountiesFrom,
  chainFrom,
  drawSeal,
  ECON,
  gripFrom,
  isNoneText,
  momentumFromChain,
  noneCountOf,
  outcomeScore,
  personalRecordsFrom,
  rankFor,
  resolveWager,
  scoreCandor,
} from "./economy";
import { rollLoot, type CrackMethod, type VaultItem } from "./vault";
import { SEED_FUEL } from "./motivation";
import { candorForQuestion } from "./economy";
import { HARD_LINES } from "./quotes";
import type {
  Account,
  ActivityEntry,
  ActivityGoals,
  Area,
  AnswerValue,
  Bill,
  BudgetCategory,
  BudgetSettings,
  DayRecord,
  FocusLog,
  HealthDay,
  HealthGoals,
  LedgerEntry,
  Mission,
  MissionOutcome,
  Mode,
  MotivationItem,
  Prefs,
  Quit,
  Recurrence,
  Relapse,
  SavedExercise,
  SavedFood,
  SavingsGoal,
  Transaction,
  Urge,
  VaultState,
} from "./types";
import { DEFAULT_HEALTH_GOALS, emptyHealthDay } from "./health";
import { DEFAULT_ACTIVITY_GOALS } from "./activity";
import { DEFAULT_BUDGET_SETTINGS, DEFAULT_CATEGORIES } from "./budget";

export interface AccentPair {
  accent: string;
  accentInk: string;
  name: string;
  /** Minimum rank index (economy.RANKS) required to equip. 0 = always. */
  rankReq: number;
}

/** Everything that survives a refresh — the whole app, on the user's device. */
export interface Persisted {
  areas: Area[];
  records: DayRecord[];
  missions: Mission[];
  ledger: LedgerEntry[];
  fuel: MotivationItem[];
  savedFuelIds: string[];
  focusLogs: FocusLog[];
  prefs: Prefs;
  accents: Record<Mode, AccentPair>;
  vault: VaultState;
  shieldHeld: boolean;
  pinnedLine: string | null;
  weeklyDoneWeek: string | null;
  account: Account | null;
  healthDays: HealthDay[];
  healthGoals: HealthGoals;
  savedFoods: SavedFood[];
  quits: Quit[];
  activityEntries: ActivityEntry[];
  activityGoals: ActivityGoals;
  savedExercises: SavedExercise[];
  budgetCategories: BudgetCategory[];
  transactions: Transaction[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  budgetSettings: BudgetSettings;
}

/** Guest sessions ("try free") never write to the device. Tab-scoped. */
export const GUEST_FLAG = "one-percent-guest";
export function isGuestSession(): boolean {
  return typeof window !== "undefined" && window.sessionStorage.getItem(GUEST_FLAG) === "1";
}

/** Day one, for real: one clean area, nothing invented. */
function makeEmptyArea(): Area {
  return {
    id: "a1",
    name: "Universal",
    goal: "Get 1% better at the thing that matters",
    metrics: [{ key: "minutes", label: "Focused minutes", unit: "min" }],
    standards: [],
    createdAt: dayOffset(0),
  };
}

function makeEmptyVault(): VaultState {
  return {
    attempts: 0,
    digits: { seal: false, candor: false, calibration: false },
    digitValues: [0, 0, 0],
    streak: 0,
    masterAvailable: false,
    unlocks: [],
  };
}

const weekKeyOf = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return String(Math.floor((d.getTime() / 86400000 + 4) / 7));
};

// SSR renders once with empty defaults; the real hydrate runs before paint.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

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
  rankUp: import("./types").RankInfo | null;
  clearRankUp: () => void;
  fuel: MotivationItem[];
  savedFuelIds: string[];
  shieldHeld: boolean;
  focusLogs: FocusLog[];
  weeklyDone: boolean;
  pinnedLine: string | null;
  buyShield: () => void;
  addFuel: (text: string, share: boolean) => void;
  approveFuel: (id: string) => void;
  rejectFuel: (id: string) => void;
  saveFuel: (id: string) => void;
  pinLine: (text: string | null) => void;
  addFocusLog: (minutes: number, missionWhat: string) => void;
  completeWeekly: (targetWeakness: string) => void;
  setMode: (m: Mode, fade?: boolean) => void;
  setPendingS1: (v: boolean | null) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  setAccent: (mode: Mode, pair: AccentPair) => void;
  addArea: (a: Omit<Area, "id" | "createdAt">) => void;
  updateArea: (id: string, patch: Partial<Omit<Area, "id" | "createdAt">>) => void;
  /** The Vault Game (§12.10). */
  vault: VaultState;
  spendVaultAttempt: () => boolean;
  openVault: (method: CrackMethod) => VaultItem | null;
  /** Health (separate section — no loop/economy contact). */
  healthDays: HealthDay[];
  healthGoals: HealthGoals;
  savedFoods: SavedFood[];
  updateHealthDay: (date: string, patch: Partial<Omit<HealthDay, "date">>) => void;
  setHealthGoals: (patch: Partial<HealthGoals>) => void;
  addSavedFood: (food: SavedFood) => void;
  /** Quit engine — bad habits + addiction (separate section; no loop/economy). */
  quits: Quit[];
  addQuit: (quit: Quit) => void;
  updateQuit: (id: string, patch: Partial<Omit<Quit, "id" | "kind" | "createdAt">>) => void;
  removeQuit: (id: string) => void;
  logRelapse: (id: string, relapse: Relapse) => void;
  setQuitCheckin: (id: string, date: string, clean: boolean) => void;
  logUrge: (id: string, urge: Urge) => void;
  /** Physical activity (separate section; no loop/economy). */
  activityEntries: ActivityEntry[];
  activityGoals: ActivityGoals;
  savedExercises: SavedExercise[];
  addActivityEntry: (entry: ActivityEntry) => void;
  removeActivityEntry: (id: string) => void;
  setActivityGoals: (patch: Partial<ActivityGoals>) => void;
  addSavedExercise: (ex: SavedExercise) => void;
  /** Budget (separate section; no loop/economy). */
  budgetCategories: BudgetCategory[];
  transactions: Transaction[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  budgetSettings: BudgetSettings;
  addCategory: (cat: BudgetCategory) => void;
  updateCategory: (id: string, patch: Partial<Omit<BudgetCategory, "id">>) => void;
  removeCategory: (id: string) => void;
  addTransaction: (txn: Transaction) => void;
  removeTransaction: (id: string) => void;
  addBill: (bill: Bill) => void;
  updateBill: (id: string, patch: Partial<Omit<Bill, "id">>) => void;
  removeBill: (id: string) => void;
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (id: string, patch: Partial<Omit<SavingsGoal, "id">>) => void;
  removeSavingsGoal: (id: string) => void;
  setBudgetSettings: (patch: Partial<BudgetSettings>) => void;
  /** Device-local persistence controls (Settings → data). */
  hydrated: boolean;
  loadDemo: () => void;
  wipeAll: () => void;
  importData: (data: unknown) => boolean;
  exportSnapshot: () => Persisted;
  /** Community registration + guest mode ("try free" saves nothing). */
  account: Account | null;
  isGuest: boolean;
  setAccount: (a: Account | null) => void;
  completeToday: (opts: {
    areaId: string;
    kind: "full" | "mvd";
    answers: Record<string, AnswerValue>;
    burnShield?: boolean;
  }) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [areas, setAreas] = useState<Area[]>(() => [makeEmptyArea()]);
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [mode, setModeState] = useState<Mode>("student");
  const [todayDone, setTodayDone] = useState(false);
  const [pendingS1, setPendingS1] = useState<boolean | null>(null);
  const [prefs, setPrefsState] = useState<Prefs>({
    rotation: true,
    deepTier: false,
    sound: false,
    hardLines: true,
    density: "operator",
    dailyPush: true,
    pushTime: "21:00",
  });
  const [rankUp, setRankUp] = useState<ReturnType<typeof rankFor> | null>(null);
  const [fuel, setFuel] = useState<MotivationItem[]>(SEED_FUEL);
  const [savedFuelIds, setSavedFuelIds] = useState<string[]>([]);
  const [shieldHeld, setShieldHeld] = useState(false);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [weeklyDoneWeek, setWeeklyDoneWeek] = useState<string | null>(null);
  const weeklyDone = weeklyDoneWeek === weekKeyOf(dayOffset(0));
  const [pinnedLine, setPinnedLine] = useState<string | null>(null);
  const [vault, setVault] = useState<VaultState>(() => makeEmptyVault());
  const [account, setAccountState] = useState<Account | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [healthDays, setHealthDays] = useState<HealthDay[]>([]);
  const [healthGoals, setHealthGoalsState] = useState<HealthGoals>(DEFAULT_HEALTH_GOALS);
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
  const [quits, setQuits] = useState<Quit[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [activityGoals, setActivityGoalsState] = useState<ActivityGoals>(DEFAULT_ACTIVITY_GOALS);
  const [savedExercises, setSavedExercises] = useState<SavedExercise[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgetSettings, setBudgetSettingsState] = useState<BudgetSettings>(DEFAULT_BUDGET_SETTINGS);

  const applySaved = useCallback((saved: Persisted) => {
    const today = dayOffset(0);
    setAreas(saved.areas?.length ? saved.areas : [makeEmptyArea()]);
    setRecords(saved.records ?? []);
    setMissions(saved.missions ?? []);
    setLedger(saved.ledger ?? []);
    setFuel(saved.fuel?.length ? saved.fuel : SEED_FUEL);
    setSavedFuelIds(saved.savedFuelIds ?? []);
    setFocusLogs(saved.focusLogs ?? []);
    if (saved.prefs) setPrefsState((p) => ({ ...p, ...saved.prefs }));
    if (saved.accents) setAccents(saved.accents);
    setShieldHeld(Boolean(saved.shieldHeld));
    setPinnedLine(saved.pinnedLine ?? null);
    setWeeklyDoneWeek(saved.weeklyDoneWeek ?? null);
    setAccountState(saved.account ?? null);
    setHealthDays(saved.healthDays ?? []);
    setHealthGoalsState(saved.healthGoals ?? DEFAULT_HEALTH_GOALS);
    setSavedFoods(saved.savedFoods ?? []);
    setQuits(saved.quits ?? []);
    setActivityEntries(saved.activityEntries ?? []);
    setActivityGoalsState(saved.activityGoals ?? DEFAULT_ACTIVITY_GOALS);
    setSavedExercises(saved.savedExercises ?? []);
    setBudgetCategories(saved.budgetCategories?.length ? saved.budgetCategories : DEFAULT_CATEGORIES);
    setTransactions(saved.transactions ?? []);
    setBills(saved.bills ?? []);
    setSavingsGoals(saved.savingsGoals ?? []);
    setBudgetSettingsState(saved.budgetSettings ?? DEFAULT_BUDGET_SETTINGS);
    const v = saved.vault ?? makeEmptyVault();
    // Yesterday's honesty doesn't open tonight's vault: stale digits reset.
    setVault(
      v.digitsDate === today
        ? v
        : { ...v, digits: { seal: false, candor: false, calibration: false }, digitValues: [0, 0, 0], digitsDate: undefined }
    );
    setTodayDone((saved.records ?? []).some((r) => r.date === today));
  }, []);

  // ---- Hydrate from the device, once, before paint. Guests get a blank
  // in-memory world and never touch what's stored on this device. ----
  useIsoLayoutEffect(() => {
    if (isGuestSession()) {
      setIsGuest(true);
    } else {
      const saved = loadState<Persisted>();
      if (saved) applySaved(saved);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Registrations that failed offline get another shot each load.
  useEffect(() => {
    if (hydrated && !isGuest) void retryQueuedSignups();
  }, [hydrated, isGuest]);

  // ---- Other tabs win: adopt their writes instead of clobbering them ----
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PERSIST_KEY || !e.newValue || isGuestSession()) return;
      const saved = loadState<Persisted>();
      if (saved) applySaved(saved);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applySaved]);

  // ---- Midnight rollover: an open app crosses the date line correctly ----
  const [currentDay, setCurrentDay] = useState(() => dayOffset(0));
  useEffect(() => {
    const iv = setInterval(() => {
      const d = dayOffset(0);
      setCurrentDay((prev) => (prev === d ? prev : d));
    }, 60_000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    setTodayDone(records.some((r) => r.date === currentDay));
    setVault((v) =>
      !v.digitsDate || v.digitsDate === currentDay
        ? v
        : { ...v, digits: { seal: false, candor: false, calibration: false }, digitValues: [0, 0, 0], digitsDate: undefined }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, hydrated]);
  const [accents, setAccents] = useState<Record<Mode, AccentPair>>({
    student: ACCENT_PRESETS.student[0],
    teacher: ACCENT_PRESETS.teacher[0],
  });
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Write-through: every change lands on the device (debounced).
  // Guests never write — "try free" saves nothing, by design. ----
  const snapshot: Persisted = {
    areas,
    records,
    missions,
    ledger,
    fuel,
    savedFuelIds,
    focusLogs,
    prefs,
    accents,
    vault,
    shieldHeld,
    pinnedLine,
    weeklyDoneWeek,
    account,
    healthDays,
    healthGoals,
    savedFoods,
    quits,
    activityEntries,
    activityGoals,
    savedExercises,
    budgetCategories,
    transactions,
    bills,
    savingsGoals,
    budgetSettings,
  };
  useEffect(() => {
    if (!hydrated || isGuest) return;
    saveStateDebounced(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isGuest, areas, records, missions, ledger, fuel, savedFuelIds, focusLogs, prefs, accents, vault, shieldHeld, pinnedLine, weeklyDoneWeek, account, healthDays, healthGoals, savedFoods, quits, activityEntries, activityGoals, savedExercises, budgetCategories, transactions, bills, savingsGoals, budgetSettings]);

  // ---- Health actions (separate section; loop and economy never touch it) ----

  const updateHealthDay = useCallback((date: string, patch: Partial<Omit<HealthDay, "date">>) => {
    setHealthDays((days) => {
      const existing = days.find((d) => d.date === date);
      if (existing) return days.map((d) => (d.date === date ? { ...d, ...patch } : d));
      return [...days, { ...emptyHealthDay(date), ...patch }];
    });
  }, []);

  const setHealthGoals = useCallback((patch: Partial<HealthGoals>) => {
    setHealthGoalsState((g) => ({ ...g, ...patch }));
  }, []);

  const addSavedFood = useCallback((food: SavedFood) => {
    setSavedFoods((s) => {
      const key = food.name.trim().toLowerCase();
      if (!key) return s;
      return [...s.filter((f) => f.name.trim().toLowerCase() !== key), { ...food, name: food.name.trim() }];
    });
  }, []);

  // ---- Quit engine actions (bad habits + addiction; no loop/economy) ----

  const addQuit = useCallback((quit: Quit) => setQuits((q) => [...q, quit]), []);

  const updateQuit = useCallback(
    (id: string, patch: Partial<Omit<Quit, "id" | "kind" | "createdAt">>) =>
      setQuits((q) => q.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    []
  );

  const removeQuit = useCallback((id: string) => setQuits((q) => q.filter((x) => x.id !== id)), []);

  const logRelapse = useCallback(
    (id: string, relapse: Relapse) =>
      setQuits((q) => q.map((x) => (x.id === id ? { ...x, relapses: [...x.relapses, relapse] } : x))),
    []
  );

  const setQuitCheckin = useCallback(
    (id: string, date: string, clean: boolean) =>
      setQuits((q) => q.map((x) => (x.id === id ? { ...x, checkins: { ...x.checkins, [date]: clean } } : x))),
    []
  );

  const logUrge = useCallback(
    (id: string, urge: Urge) =>
      setQuits((q) => q.map((x) => (x.id === id ? { ...x, urges: [...x.urges, urge] } : x))),
    []
  );

  // ---- Physical activity actions (no loop/economy) ----

  const addActivityEntry = useCallback((entry: ActivityEntry) => setActivityEntries((e) => [...e, entry]), []);

  const removeActivityEntry = useCallback(
    (id: string) => setActivityEntries((e) => e.filter((x) => x.id !== id)),
    []
  );

  const setActivityGoals = useCallback(
    (patch: Partial<ActivityGoals>) => setActivityGoalsState((g) => ({ ...g, ...patch })),
    []
  );

  const addSavedExercise = useCallback((ex: SavedExercise) => {
    setSavedExercises((s) => {
      const key = ex.name.trim().toLowerCase();
      if (!key) return s;
      return [...s.filter((f) => f.name.trim().toLowerCase() !== key), { ...ex, name: ex.name.trim() }];
    });
  }, []);

  // ---- Budget actions (separate section; no loop/economy) ----

  const addCategory = useCallback((cat: BudgetCategory) => setBudgetCategories((c) => [...c, cat]), []);
  const updateCategory = useCallback(
    (id: string, patch: Partial<Omit<BudgetCategory, "id">>) =>
      setBudgetCategories((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    []
  );
  const removeCategory = useCallback((id: string) => {
    setBudgetCategories((c) => c.filter((x) => x.id !== id));
    // Orphan the category on its transactions rather than deleting the money record.
    setTransactions((t) => t.map((x) => (x.categoryId === id ? { ...x, categoryId: undefined } : x)));
  }, []);

  const addTransaction = useCallback((txn: Transaction) => setTransactions((t) => [...t, txn]), []);
  const removeTransaction = useCallback((id: string) => setTransactions((t) => t.filter((x) => x.id !== id)), []);

  const addBill = useCallback((bill: Bill) => setBills((b) => [...b, bill]), []);
  const updateBill = useCallback(
    (id: string, patch: Partial<Omit<Bill, "id">>) => setBills((b) => b.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    []
  );
  const removeBill = useCallback((id: string) => setBills((b) => b.filter((x) => x.id !== id)), []);

  const addSavingsGoal = useCallback((goal: SavingsGoal) => setSavingsGoals((g) => [...g, goal]), []);
  const updateSavingsGoal = useCallback(
    (id: string, patch: Partial<Omit<SavingsGoal, "id">>) =>
      setSavingsGoals((g) => g.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    []
  );
  const removeSavingsGoal = useCallback((id: string) => setSavingsGoals((g) => g.filter((x) => x.id !== id)), []);

  const setBudgetSettings = useCallback(
    (patch: Partial<BudgetSettings>) => setBudgetSettingsState((s) => ({ ...s, ...patch })),
    []
  );

  /** The full snapshot — Settings export uses this so backups miss nothing. */
  const exportSnapshot = useCallback((): Persisted => snapshot, [snapshot]);

  /** Registration lands here: account saved, persistence stays/becomes on. */
  const setAccount = useCallback((a: Account | null) => {
    setAccountState(a);
    if (a && typeof window !== "undefined") {
      window.sessionStorage.removeItem(GUEST_FLAG);
      setIsGuest(false);
    }
  }, []);

  // ---- Data controls (Settings): demo world, clean slate, backup import ----

  const loadDemo = useCallback(() => {
    const seed = generateMock();
    setAreas(seed.areas);
    setRecords(seed.records);
    setMissions(seed.missions);
    setLedger(seed.ledger);
    setFuel(SEED_FUEL);
    setSavedFuelIds([]);
    setFocusLogs([]);
    setShieldHeld(false);
    setPinnedLine(null);
    setWeeklyDoneWeek(null);
    setVault({
      attempts: 1,
      digits: { seal: true, candor: true, calibration: false },
      digitValues: [7, 3, 4],
      digitsDate: dayOffset(0),
      lastOpen: dayOffset(-1),
      streak: 6,
      masterAvailable: false,
      unlocks: [],
    });
    // Demo health: ten days, weight trending down, believable intake.
    const demoDays: HealthDay[] = [];
    for (let i = 9; i >= 0; i--) {
      const date = dayOffset(-i);
      const kcalBase = 1900 + ((i * 137) % 600);
      demoDays.push({
        date,
        foods: [
          { id: `d${i}-1`, name: "Oats (1 cup cooked)", kcal: 160, protein: 6, carbs: 27, fat: 3, meal: "breakfast", qty: 1 },
          { id: `d${i}-2`, name: "Chicken & rice bowl", kcal: 550, protein: 40, carbs: 60, fat: 12, meal: "lunch", qty: 1 },
          { id: `d${i}-3`, name: "Steak (200g cooked)", kcal: 440, protein: 56, carbs: 0, fat: 24, meal: "dinner", qty: 1 },
          { id: `d${i}-4`, name: "Protein shake (1 scoop + water)", kcal: 120, protein: 25, carbs: 3, fat: 1, meal: "snack", qty: 1 },
          { id: `d${i}-5`, name: "Filler", kcal: kcalBase - 1270, protein: 10, carbs: 40, fat: 12, meal: "snack", qty: 1 },
        ],
        waterMl: 1500 + ((i * 250) % 1500),
        steps: 6000 + ((i * 913) % 6000),
        weightKg: +(84 - (9 - i) * 0.16).toFixed(1),
        sleepH: 6.5 + ((i * 0.5) % 2),
        workouts: i % 2 === 0 ? [{ id: `w${i}`, type: "Gym", minutes: 55 }] : [],
      });
    }
    setHealthDays(demoDays);
    setHealthGoalsState({
      kcalTarget: 2200,
      proteinTarget: 160,
      waterTargetMl: 3000,
      stepTarget: 8000,
      weightTarget: { kg: 80, by: "end of quarter" },
      profile: { sex: "male", age: 28, heightCm: 180, weightKg: 84, activity: "moderate" },
    });
    setSavedFoods([]);
    // Demo quits: one clean run, one with a slip 12 days back.
    setQuits([
      {
        id: "demo-hab-1",
        kind: "habit",
        name: "Doomscrolling before bed",
        startedAt: dayOffset(-23),
        createdAt: dayOffset(-23),
        unit: "hours",
        perDay: 1.5,
        costPerUnit: 0,
        minutesPerUnit: 60,
        reason: "Sleep and mornings",
        relapses: [],
        urges: [
          { id: "demo-ug-1", at: Date.now() - 3 * 86400000, intensity: 3, trigger: "boredom", resisted: true },
          { id: "demo-ug-2", at: Date.now() - 86400000, intensity: 4, trigger: "stress", resisted: true },
        ],
        checkins: {},
      },
      {
        id: "demo-rec-1",
        kind: "addiction",
        name: "Alcohol",
        startedAt: dayOffset(-40),
        createdAt: dayOffset(-40),
        unit: "drinks",
        perDay: 4,
        costPerUnit: 6,
        minutesPerUnit: 0,
        reason: "Health and clarity",
        relapses: [{ id: "demo-rl-1", date: dayOffset(-12), trigger: "party", note: "reset and kept going" }],
        urges: [{ id: "demo-ug-3", at: Date.now() - 2 * 86400000, intensity: 2, trigger: "social", resisted: true }],
        checkins: {},
      },
    ]);
    // Demo activity: five sessions across the last week.
    setActivityEntries([
      { id: "demo-act-1", date: dayOffset(-6), name: "Running", category: "Cardio", minutes: 35, intensity: "moderate" },
      { id: "demo-act-2", date: dayOffset(-5), name: "Squat", category: "Strength", sets: [{ reps: 8, weightKg: 80 }, { reps: 8, weightKg: 80 }, { reps: 6, weightKg: 85 }], intensity: "hard" },
      { id: "demo-act-3", date: dayOffset(-3), name: "Yoga", category: "Mobility", minutes: 40, intensity: "easy" },
      { id: "demo-act-4", date: dayOffset(-1), name: "Cycling", category: "Cardio", minutes: 50, intensity: "moderate" },
      { id: "demo-act-5", date: dayOffset(0), name: "Bench press", category: "Strength", sets: [{ reps: 10, weightKg: 60 }, { reps: 8, weightKg: 65 }], intensity: "hard" },
    ]);
    setActivityGoalsState({ weeklyMinutes: 150, weeklySessions: 4 });
    setSavedExercises([]);
    // Demo budget: an income, a few capped categories, this month's spend, bills, a goal.
    setBudgetCategories([
      { id: "cat-rent", name: "Rent / Mortgage", kind: "expense", limit: 2200 },
      { id: "cat-groceries", name: "Groceries", kind: "expense", limit: 700 },
      { id: "cat-transport", name: "Transport", kind: "expense", limit: 250 },
      { id: "cat-utilities", name: "Utilities", kind: "expense", limit: 300 },
      { id: "cat-dining", name: "Dining out", kind: "expense", limit: 300 },
      { id: "cat-entertainment", name: "Entertainment", kind: "expense", limit: 150 },
      { id: "cat-subscriptions", name: "Subscriptions", kind: "expense", limit: 80 },
      { id: "cat-shopping", name: "Shopping", kind: "expense", limit: 200 },
      { id: "cat-income", name: "Income", kind: "income" },
    ]);
    setTransactions([
      { id: "tx-1", date: dayOffset(-1), amount: 2200, kind: "expense", categoryId: "cat-rent", note: "Rent" },
      { id: "tx-2", date: dayOffset(-2), amount: 96.4, kind: "expense", categoryId: "cat-groceries", note: "Woolies" },
      { id: "tx-3", date: dayOffset(-4), amount: 82.15, kind: "expense", categoryId: "cat-groceries", note: "Coles" },
      { id: "tx-4", date: dayOffset(-3), amount: 64, kind: "expense", categoryId: "cat-transport", note: "Fuel" },
      { id: "tx-5", date: dayOffset(-5), amount: 128, kind: "expense", categoryId: "cat-dining", note: "Dinner out" },
      { id: "tx-6", date: dayOffset(-2), amount: 220, kind: "expense", categoryId: "cat-utilities", note: "Electricity" },
      { id: "tx-7", date: dayOffset(-6), amount: 175, kind: "expense", categoryId: "cat-shopping", note: "Shoes" },
      { id: "tx-8", date: dayOffset(-7), amount: 6000, kind: "income", categoryId: "cat-income", note: "Salary" },
    ]);
    setBills([
      { id: "bill-1", name: "Rent", amount: 2200, dueDay: 1, cadence: "monthly", categoryId: "cat-rent", active: true },
      { id: "bill-2", name: "Netflix", amount: 25, dueDay: 12, cadence: "monthly", categoryId: "cat-subscriptions", active: true },
      { id: "bill-3", name: "Gym", amount: 22, dueDay: 20, cadence: "weekly", categoryId: "cat-health", active: true },
    ]);
    setSavingsGoals([
      { id: "goal-1", name: "Emergency fund", target: 10000, saved: 3400, by: "end of year" },
      { id: "goal-2", name: "Japan trip", target: 5000, saved: 1250, by: "next spring" },
    ]);
    setBudgetSettingsState({ monthlyIncome: 6000, currencySymbol: "$" });
    setTodayDone(false);
  }, []);

  const wipeAll = useCallback(() => {
    clearState();
    setAccountState(null);
    setAreas([makeEmptyArea()]);
    setRecords([]);
    setMissions([]);
    setLedger([]);
    setFuel(SEED_FUEL);
    setSavedFuelIds([]);
    setFocusLogs([]);
    setShieldHeld(false);
    setPinnedLine(null);
    setWeeklyDoneWeek(null);
    setVault(makeEmptyVault());
    setHealthDays([]);
    setHealthGoalsState(DEFAULT_HEALTH_GOALS);
    setSavedFoods([]);
    setQuits([]);
    setActivityEntries([]);
    setActivityGoalsState(DEFAULT_ACTIVITY_GOALS);
    setSavedExercises([]);
    setBudgetCategories(DEFAULT_CATEGORIES);
    setTransactions([]);
    setBills([]);
    setSavingsGoals([]);
    setBudgetSettingsState(DEFAULT_BUDGET_SETTINGS);
    setTodayDone(false);
  }, []);

  const importData = useCallback((data: unknown): boolean => {
    const d = data as Partial<Persisted>;
    if (!d || !Array.isArray(d.areas) || !Array.isArray(d.records) || !Array.isArray(d.missions) || !Array.isArray(d.ledger))
      return false;
    setAreas(d.areas.length > 0 ? d.areas : [makeEmptyArea()]);
    setRecords(d.records);
    setMissions(d.missions);
    setLedger(d.ledger);
    if (Array.isArray(d.fuel) && d.fuel.length > 0) setFuel(d.fuel);
    if (Array.isArray(d.savedFuelIds)) setSavedFuelIds(d.savedFuelIds);
    if (Array.isArray(d.focusLogs)) setFocusLogs(d.focusLogs);
    if (d.prefs) setPrefsState((p) => ({ ...p, ...d.prefs }));
    if (d.accents) setAccents(d.accents);
    if (d.vault) setVault(d.vault);
    if (Array.isArray(d.healthDays)) setHealthDays(d.healthDays);
    if (d.healthGoals) setHealthGoalsState(d.healthGoals);
    if (Array.isArray(d.savedFoods)) setSavedFoods(d.savedFoods);
    if (Array.isArray(d.quits)) setQuits(d.quits);
    if (Array.isArray(d.activityEntries)) setActivityEntries(d.activityEntries);
    if (d.activityGoals) setActivityGoalsState(d.activityGoals);
    if (Array.isArray(d.savedExercises)) setSavedExercises(d.savedExercises);
    if (Array.isArray(d.budgetCategories)) setBudgetCategories(d.budgetCategories.length ? d.budgetCategories : DEFAULT_CATEGORIES);
    if (Array.isArray(d.transactions)) setTransactions(d.transactions);
    if (Array.isArray(d.bills)) setBills(d.bills);
    if (Array.isArray(d.savingsGoals)) setSavingsGoals(d.savingsGoals);
    if (d.budgetSettings) setBudgetSettingsState(d.budgetSettings);
    setWeeklyDoneWeek(d.weeklyDoneWeek ?? null);
    setTodayDone(d.records.some((r) => r.date === dayOffset(0)));
    return true;
  }, []);

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

  /** Per-area edits — question overrides, custom questions, targets. */
  const updateArea = useCallback((id: string, patch: Partial<Omit<Area, "id" | "createdAt">>) => {
    setAreas((s) => s.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  // ---- The Vault Game (§12.10): attempts are earned by sealing; the method
  // dictates the loot tier; one open per day (the Master Vault is exempt). ----

  const spendVaultAttempt = useCallback((): boolean => {
    if (vault.attempts <= 0) return false;
    setVault((v) => ({ ...v, attempts: Math.max(0, v.attempts - 1) }));
    return true;
  }, [vault.attempts]);

  const openVault = useCallback(
    (method: CrackMethod): VaultItem | null => {
      const today = dayOffset(0);
      if (method === "master") {
        if (!vault.masterAvailable) return null;
      } else {
        if (vault.lastOpen === today) return null;
        if (
          method === "combination" &&
          !(vault.digits.seal && vault.digits.candor && vault.digits.calibration)
        )
          return null;
      }
      const item = rollLoot(method, vault.unlocks);
      if (item.kind === "bp" && item.bp) {
        setLedger((l) => [
          ...l,
          { date: today, book: "judgment", source: "vault", bp: item.bp ?? 0, note: `vault cracked · ${item.name}` },
        ]);
      }
      setVault((v) => {
        const unlockable =
          item.kind === "accent" ||
          item.kind === "sealskin" ||
          item.kind === "feature" ||
          (item.kind === "archive" && item.permanent);
        const unlocks = unlockable && !v.unlocks.includes(item.id) ? [...v.unlocks, item.id] : v.unlocks;
        const opensArchive = item.kind === "archive" || method === "combination" || method === "master";
        const archiveUntil = opensArchive ? today : v.archiveUntil;
        if (method === "master") return { ...v, unlocks, archiveUntil, masterAvailable: false, streak: 0 };
        const streak = v.lastOpen === dayOffset(-1) ? v.streak + 1 : 1;
        return { ...v, unlocks, archiveUntil, lastOpen: today, streak, masterAvailable: v.masterAvailable || streak >= 7 };
      });
      return item;
    },
    [vault]
  );

  const completeToday = useCallback(
    ({
      areaId,
      kind,
      answers,
      burnShield,
    }: {
      areaId: string;
      kind: "full" | "mvd";
      answers: Record<string, AnswerValue>;
      /** A failed verdict with a shield held: the shield burns, the chain holds. */
      burnShield?: boolean;
    }) => {
      const today = dayOffset(0);
      const newEntries: LedgerEntry[] = [];

      // Rule on yesterday's mission from T1 — and pay the wager. The chain is
      // taken before today's verdict lands (the multiplier the bet was riding).
      const t1 = answers.T1;
      if (t1?.kind === "enum") {
        const standing = missions.find((m) => m.date === today && !m.outcome);
        const verdict = t1.value as MissionOutcome;
        if (standing) {
          const res = resolveWager(standing.confidence, verdict, momentumFromChain(chainFrom(missions)));
          newEntries.push({
            date: today,
            book: "judgment",
            source: "resolve",
            bp: res.total,
            note: `${verdict} · called ${standing.confidence}/10`,
          });
        }
        const shielded = Boolean(burnShield && verdict === "failed" && shieldHeld);
        setMissions((ms) =>
          ms.map((m) =>
            m.date === today && !m.outcome
              ? { ...m, outcome: verdict, shielded: shielded || undefined }
              : m
          )
        );
        if (shielded) setShieldHeld(false);
      }

      // Day cleared: bet resolved + record sealed + avoidance named honestly.
      if (t1?.kind === "enum" && candorForQuestion("S4", answers, kind) > 0) {
        newEntries.push({
          date: today,
          book: "judgment",
          source: "objectives",
          bp: ECON.dayClearedPay,
          note: "day cleared — all three objectives",
        });
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

      // The Signet (legendary vault unlock): the user's words on the seal.
      const seal = drawSeal(today);
      if (prefs.customSealLabel?.trim()) seal.label = prefs.customSealLabel.trim();

      // The Vault Game: sealing earns a skill attempt and tonight's digits —
      // seal (verifiable act), candor (real avoidance named), calibration
      // (the wager landed within ±2). Digit values derive from the day.
      const s4v = answers.S4;
      const candorDigit = s4v?.kind === "line" && s4v.value.trim().length > 0 && !isNoneText(s4v.value);
      const standingForDigits = missions.find((m) => m.date === today && !m.outcome);
      const calibrationDigit = Boolean(
        standingForDigits &&
          t1?.kind === "enum" &&
          Math.abs(standingForDigits.confidence - outcomeScore(t1.value as MissionOutcome) * 10) <= 2
      );
      setVault((v) => ({
        ...v,
        attempts: Math.min(3, v.attempts + 1),
        digits: { seal: true, candor: candorDigit, calibration: calibrationDigit },
        digitsDate: today,
        digitValues: [
          candor.bp % 10,
          chainFrom(missions) % 10,
          (balanceOf(ledger) + candor.bp) % 10,
        ],
      }));

      setRecords((rs) => [
        ...rs,
        {
          date: today,
          areaId,
          kind,
          sealed: true,
          answers,
          weakness,
          seal,
          noneCount: noneCountOf(answers),
        },
      ]);
      const prevRank = rankFor(balanceOf(ledger));
      const nextRank = rankFor(balanceOf([...ledger, ...newEntries]));
      if (nextRank.index > prevRank.index) setRankUp(nextRank);
      setLedger((l) => [...l, ...newEntries]);
      setTodayDone(true);
    },
    [missions, ledger, shieldHeld, prefs.customSealLabel]
  );

  const clearRankUp = useCallback(() => setRankUp(null), []);

  // ---- The moat: shields, fuel, focus, weekly ----

  const buyShield = useCallback(() => {
    if (shieldHeld) return;
    if (balanceOf(ledger) < ECON.shieldCost) return;
    setLedger((l) => [
      ...l,
      { date: dayOffset(0), book: "judgment", source: "shield", bp: -ECON.shieldCost, note: "momentum shield purchased" },
    ]);
    setShieldHeld(true);
  }, [shieldHeld, ledger]);

  const addFuel = useCallback((text: string, share: boolean) => {
    const item: MotivationItem = {
      id: `u-${Date.now()}`,
      text: text.trim(),
      author: "you",
      source: "user",
      visibility: share ? "pending" : "private",
      saves: 0,
      addedAt: dayOffset(0),
    };
    setFuel((f) => [item, ...f]);
  }, []);

  const approveFuel = useCallback((id: string) => {
    setFuel((f) => f.map((i) => (i.id === id ? { ...i, visibility: "public" } : i)));
  }, []);

  const rejectFuel = useCallback((id: string) => {
    setFuel((f) => f.map((i) => (i.id === id ? { ...i, visibility: "private" } : i)));
  }, []);

  const saveFuel = useCallback((id: string) => {
    setSavedFuelIds((s) => (s.includes(id) ? s : [...s, id]));
    setFuel((f) => f.map((i) => (i.id === id ? { ...i, saves: i.saves + 1 } : i)));
  }, []);

  const pinLine = useCallback((text: string | null) => setPinnedLine(text), []);

  const addFocusLog = useCallback((minutes: number, missionWhat: string) => {
    setFocusLogs((l) => [...l, { date: dayOffset(0), minutes, missionWhat }]);
  }, []);

  const completeWeekly = useCallback((targetWeakness: string) => {
    if (weeklyDone) return;
    setLedger((l) => [
      ...l,
      {
        date: dayOffset(0),
        book: "candor",
        source: "weekly",
        bp: ECON.weeklyDebriefPay,
        note: `weekly debrief · target: ${targetWeakness.slice(0, 60)}`,
      },
    ]);
    setWeeklyDoneWeek(weekKeyOf(dayOffset(0)));
  }, [weeklyDone]);

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
    rankUp,
    clearRankUp,
    fuel,
    savedFuelIds,
    shieldHeld,
    focusLogs,
    weeklyDone,
    pinnedLine,
    buyShield,
    addFuel,
    approveFuel,
    rejectFuel,
    saveFuel,
    pinLine,
    addFocusLog,
    completeWeekly,
    setMode,
    setPendingS1,
    setPrefs,
    setAccent,
    addArea,
    updateArea,
    vault,
    spendVaultAttempt,
    openVault,
    healthDays,
    healthGoals,
    savedFoods,
    updateHealthDay,
    setHealthGoals,
    addSavedFood,
    quits,
    addQuit,
    updateQuit,
    removeQuit,
    logRelapse,
    setQuitCheckin,
    logUrge,
    activityEntries,
    activityGoals,
    savedExercises,
    addActivityEntry,
    removeActivityEntry,
    setActivityGoals,
    addSavedExercise,
    budgetCategories,
    transactions,
    bills,
    savingsGoals,
    budgetSettings,
    addCategory,
    updateCategory,
    removeCategory,
    addTransaction,
    removeTransaction,
    addBill,
    updateBill,
    removeBill,
    addSavingsGoal,
    updateSavingsGoal,
    removeSavingsGoal,
    setBudgetSettings,
    hydrated,
    loadDemo,
    wipeAll,
    importData,
    exportSnapshot,
    account,
    isGuest,
    setAccount,
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
  const { ledger, missions, records, weeklyDone } = useApp();
  return useMemo(() => {
    const balance = balanceOf(ledger);
    const candorTotal = ledger.filter((e) => e.book === "candor").reduce((s, e) => s + e.bp, 0);
    const judgmentTotal = balance - candorTotal;
    const chain = chainFrom(missions);
    const rank = rankFor(balance);
    const bounties = bountiesFrom(records);

    // Cumulative balance by day, for the balance-history chart.
    const byDate = new Map<string, number>();
    for (const e of ledger) byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.bp);
    const history: number[] = [];
    for (const d of [...byDate.keys()].sort()) {
      history.push((history[history.length - 1] ?? 0) + byDate.get(d)!);
    }

    // Grip inputs.
    let density30 = 0;
    for (let i = 0; i < 30; i++) {
      if (records.some((r) => r.date === dayOffset(-i))) density30++;
    }
    density30 /= 30;
    const judged = missions.filter((m) => m.outcome);
    const completion =
      judged.length === 0 ? 0 : judged.filter((m) => m.outcome === "executed").length / judged.length;
    const calibrationError =
      judged.length === 0
        ? 0
        : judged.reduce(
            (s, m) =>
              s + Math.abs(m.confidence / 10 - (m.outcome === "executed" ? 1 : m.outcome === "partial" ? 0.5 : 0)),
            0
          ) / judged.length;

    const prs = personalRecordsFrom(missions, records, ledger);

    return {
      balance,
      candorTotal,
      judgmentTotal,
      chain,
      momentum: momentumFromChain(chain),
      rank,
      nextRankGap: rank.next ? rank.next.min - balance : null,
      bounties,
      recent: [...ledger].slice(-8).reverse(),
      history,
      grip: gripFrom({ density30, chain, calibrationError, completion }),
      prs,
      achievements: achievementsFrom({
        records,
        missions,
        bounties,
        prs,
        rankIndex: rank.index,
        weeklyDone,
      }),
    };
  }, [ledger, missions, records, weeklyDone]);
}

/** Today's hard line: a pinned Fuel item wins; otherwise a deterministic pick
 *  from the built-in lines merged with the user's saved/private Fuel. */
export function useHardLine(salt: string): string {
  const { pinnedLine, fuel, savedFuelIds } = useApp();
  if (pinnedLine) return pinnedLine;
  const mine = fuel
    .filter((i) => i.source === "user" || savedFuelIds.includes(i.id))
    .map((i) => i.text);
  const pool = [...HARD_LINES, ...mine];
  const d = new Date();
  const seed = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${salt}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return pool[(h >>> 0) % pool.length];
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
