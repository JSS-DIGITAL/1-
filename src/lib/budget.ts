// Budget — device-local, manual money tracker. Separate section, same founder
// ruling as Health: no bp, the loop/economy never read it, guests don't persist.
// Real dollars use accent + neutrals (gold is reserved for the bp economy).
// Envelope categories, transactions, recurring bills, savings goals, trends.
// General money tracking — not financial advice.

import type {
  Bill,
  BudgetCategory,
  BudgetSettings,
  SavingsGoal,
  Transaction,
} from "./types";

export const DEFAULT_BUDGET_SETTINGS: BudgetSettings = { currencySymbol: "$" };

/** Sensible starter categories (limits left blank — the user sets their own). */
export const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: "cat-rent", name: "Rent / Mortgage", kind: "expense" },
  { id: "cat-groceries", name: "Groceries", kind: "expense" },
  { id: "cat-transport", name: "Transport", kind: "expense" },
  { id: "cat-utilities", name: "Utilities", kind: "expense" },
  { id: "cat-dining", name: "Dining out", kind: "expense" },
  { id: "cat-entertainment", name: "Entertainment", kind: "expense" },
  { id: "cat-subscriptions", name: "Subscriptions", kind: "expense" },
  { id: "cat-health", name: "Health", kind: "expense" },
  { id: "cat-shopping", name: "Shopping", kind: "expense" },
  { id: "cat-other", name: "Other", kind: "expense" },
  { id: "cat-income", name: "Income", kind: "income" },
];

// ---- Month helpers ----

/** "YYYY-MM" from an ISO date (or full "YYYY-MM-DD"). */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function currentMonthKey(): string {
  return monthKey(isoToday());
}

function isoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-AU", { month: "short", year: "numeric" });
}

/** The current month plus the previous n-1 months, newest first. */
export function recentMonths(n: number): string[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

// ---- Transaction aggregates ----

export function txnsInMonth(txns: Transaction[], month: string): Transaction[] {
  return txns.filter((t) => monthKey(t.date) === month);
}

export function spentInMonth(txns: Transaction[], month: string): number {
  return round(txnsInMonth(txns, month).filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0));
}

export function incomeInMonth(txns: Transaction[], month: string): number {
  return round(txnsInMonth(txns, month).filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0));
}

export function spentByCategory(txns: Transaction[], categoryId: string, month: string): number {
  return round(
    txnsInMonth(txns, month)
      .filter((t) => t.kind === "expense" && t.categoryId === categoryId)
      .reduce((s, t) => s + t.amount, 0)
  );
}

/** Sum of all expense-category monthly limits. */
export function totalBudgeted(categories: BudgetCategory[]): number {
  return round(categories.filter((c) => c.kind === "expense").reduce((s, c) => s + (c.limit ?? 0), 0));
}

/**
 * Money left to spend this month: planned income (settings, else logged income)
 * minus what's been spent.
 */
export function leftToSpend(
  txns: Transaction[],
  settings: BudgetSettings,
  month: string
): number {
  const income = settings.monthlyIncome ?? incomeInMonth(txns, month);
  return round(income - spentInMonth(txns, month));
}

/** Spending grouped by category for a month, largest first. */
export function spendingBreakdown(
  txns: Transaction[],
  categories: BudgetCategory[],
  month: string
): { id: string; name: string; amount: number }[] {
  const nameOf = (id?: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorised";
  const map = new Map<string, { id: string; name: string; amount: number }>();
  for (const t of txnsInMonth(txns, month)) {
    if (t.kind !== "expense") continue;
    const id = t.categoryId ?? "uncat";
    const row = map.get(id) ?? { id, name: nameOf(t.categoryId), amount: 0 };
    row.amount = round(row.amount + t.amount);
    map.set(id, row);
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

/** Income vs expense per month, oldest → newest (for the cashflow chart). */
export function cashflowByMonth(
  txns: Transaction[],
  n: number
): { month: string; income: number; expense: number }[] {
  return recentMonths(n)
    .map((m) => ({ month: m, income: incomeInMonth(txns, m), expense: spentInMonth(txns, m) }))
    .reverse();
}

// ---- Bills ----

/** A bill's cost normalised to a monthly figure. */
export function monthlyAmount(bill: Bill): number {
  if (bill.cadence === "weekly") return (bill.amount * 52) / 12;
  if (bill.cadence === "yearly") return bill.amount / 12;
  return bill.amount;
}

export function monthlyBillsTotal(bills: Bill[]): number {
  return round(bills.filter((b) => b.active).reduce((s, b) => s + monthlyAmount(b), 0));
}

/** Active monthly bills due within the next `days` (by day-of-month). */
export function upcomingBills(bills: Bill[], days = 7): Bill[] {
  const today = new Date().getDate();
  return bills
    .filter((b) => b.active && b.cadence === "monthly")
    .filter((b) => {
      const diff = (b.dueDay - today + 31) % 31;
      return diff <= days;
    })
    .sort((a, b) => ((a.dueDay - today + 31) % 31) - ((b.dueDay - today + 31) % 31));
}

// ---- Goals ----

export function goalPct(goal: SavingsGoal): number {
  if (goal.target <= 0) return 0;
  return Math.min(100, Math.round((goal.saved / goal.target) * 100));
}

// ---- Formatting + ids ----

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** "$1,234" or "$1,234.50" — trims a trailing ".00". */
export function fmtMoney(n: number, symbol = "$"): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${neg ? "−" : ""}${symbol}${s}`;
}

let counter = 0;
export function budgetId(prefix = "bg"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}
