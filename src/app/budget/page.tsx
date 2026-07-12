"use client";

// Budget — a manual, device-local money tracker. Separate section, same founder
// ruling as Health: no bp, the loop/economy never read it, guests don't persist.
// Real dollars use accent + neutrals (gold stays reserved for the bp economy);
// over-budget uses the destructive token. General tracking — not financial advice.

import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Card, Chip, Label } from "@/components/ui";
import {
  budgetId,
  cashflowByMonth,
  currentMonthKey,
  fmtMoney,
  goalPct,
  incomeInMonth,
  leftToSpend,
  monthLabel,
  monthlyBillsTotal,
  recentMonths,
  spendingBreakdown,
  spentByCategory,
  spentInMonth,
  txnsInMonth,
} from "@/lib/budget";
import { dayOffset } from "@/lib/mock";
import { useApp } from "@/lib/store";
import type { Bill, BillCadence, BudgetCategory, SavingsGoal, Transaction, TxnKind } from "@/lib/types";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";
const smallField =
  "rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2.5 py-2 text-[0.875rem] text-ink outline-none placeholder:text-muted/45 focus:border-accent";
const labelCls = "type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted";

export default function BudgetPage() {
  const { budgetSettings } = useApp();
  const sym = budgetSettings.currencySymbol;
  const [month, setMonth] = useState(() => currentMonthKey());

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Label>Budget</Label>
          <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">Every dollar gets a job.</h1>
        </div>
        <span className="type-mono text-[0.625rem] text-muted/70">device-local — not financial advice</span>
      </div>

      <MonthSelector month={month} setMonth={setMonth} />

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-[var(--gap)]">
          <OverviewCard month={month} sym={sym} />
          <CategoriesCard month={month} sym={sym} />
          <TransactionsCard month={month} sym={sym} />
        </div>
        <div className="min-w-0 space-y-[var(--gap)]">
          <BillsCard sym={sym} />
          <GoalsCard sym={sym} />
          <TrendsCard sym={sym} />
        </div>
      </div>
    </Shell>
  );
}

function MonthSelector({ month, setMonth }: { month: string; setMonth: (m: string) => void }) {
  const months = recentMonths(6);
  return (
    <div className="mt-5 flex flex-wrap gap-1.5">
      {months.map((m) => (
        <button
          key={m}
          onClick={() => setMonth(m)}
          className={`type-mono rounded-[var(--radius-sm)] border px-3 py-1.5 text-[0.6875rem] ${
            month === m ? "border-accent bg-accent/10 text-ink" : "border-line text-muted hover:border-muted"
          }`}
        >
          {m === currentMonthKey() ? "this month" : monthLabel(m)}
        </button>
      ))}
    </div>
  );
}

function OverviewCard({ month, sym }: { month: string; sym: string }) {
  const { transactions, budgetSettings, setBudgetSettings } = useApp();
  const [editIncome, setEditIncome] = useState(false);
  const income = budgetSettings.monthlyIncome ?? incomeInMonth(transactions, month);
  const spent = spentInMonth(transactions, month);
  const left = leftToSpend(transactions, budgetSettings, month);
  const pct = income > 0 ? Math.min(100, (spent / income) * 100) : 0;
  const over = left < 0;

  return (
    <Card rule>
      <div className="flex items-baseline justify-between gap-3">
        <Label>{month === currentMonthKey() ? "This month" : monthLabel(month)}</Label>
        <button
          onClick={() => setEditIncome(!editIncome)}
          className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          {editIncome ? "done" : "set income"}
        </button>
      </div>

      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <div className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Left to spend</div>
          <div className={`type-mono text-[2rem] leading-none ${over ? "text-destructive" : "text-accent"}`}>
            {fmtMoney(left, sym)}
          </div>
        </div>
        <div className="type-mono text-right text-[0.75rem] text-muted">
          <div>income <span className="text-ink">{fmtMoney(income, sym)}</span></div>
          <div>spent <span className="text-ink">{fmtMoney(spent, sym)}</span></div>
        </div>
      </div>

      <div className="mt-3 h-[6px] w-full rounded-full bg-line/60">
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && <p className="type-mono mt-2 text-[0.6875rem] text-destructive">You&apos;re over your income this month by {fmtMoney(-left, sym)}.</p>}

      {editIncome && (
        <div className="mt-3 border-t border-line pt-3">
          <span className={labelCls}>Planned monthly income</span>
          <input
            className={smallField + " mt-1 w-full"}
            type="number"
            inputMode="decimal"
            placeholder="leave blank to use logged income"
            value={budgetSettings.monthlyIncome ?? ""}
            onChange={(e) => setBudgetSettings({ monthlyIncome: e.target.value === "" ? undefined : Number(e.target.value) || undefined })}
          />
        </div>
      )}
    </Card>
  );
}

function CategoriesCard({ month, sym }: { month: string; sym: string }) {
  const { budgetCategories, transactions, addCategory, updateCategory, removeCategory } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const cats = budgetCategories.filter((c) => c.kind === "expense");

  const submit = () => {
    if (!name.trim()) return;
    addCategory({ id: budgetId("cat"), name: name.trim(), kind: "expense", limit: limit ? Number(limit) || undefined : undefined });
    setName("");
    setLimit("");
    setAdding(false);
  };

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Label>Categories</Label>
        <button onClick={() => setAdding(!adding)} className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink">
          {adding ? "cancel" : "+ add category"}
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {cats.map((c) => (
          <CategoryRow key={c.id} cat={c} spent={spentByCategory(transactions, c.id, month)} sym={sym} onLimit={(v) => updateCategory(c.id, { limit: v })} onRemove={() => removeCategory(c.id)} />
        ))}
      </div>

      {adding && (
        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3">
          <div className="min-w-0 flex-1">
            <span className={labelCls}>Name</span>
            <input className={smallField + " mt-1 w-full"} placeholder="e.g. Pets" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <span className={labelCls}>Monthly limit</span>
            <input className={smallField + " mt-1 w-28"} type="number" inputMode="decimal" placeholder="optional" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={!name.trim()}>Add</Button>
        </div>
      )}
    </Card>
  );
}

function CategoryRow({ cat, spent, sym, onLimit, onRemove }: { cat: BudgetCategory; spent: number; sym: string; onLimit: (v: number | undefined) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  const limit = cat.limit;
  const pct = limit && limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const over = limit !== undefined && spent > limit;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[0.875rem] text-ink">{cat.name}</span>
        <span className="type-mono shrink-0 text-[0.75rem] text-muted">
          <span className={over ? "text-destructive" : "text-ink"}>{fmtMoney(spent, sym)}</span>
          {limit !== undefined ? ` / ${fmtMoney(limit, sym)}` : ""}
          <button onClick={() => setEditing(!editing)} className="ml-2 underline decoration-dotted underline-offset-2 hover:text-ink">
            {editing ? "done" : "edit"}
          </button>
        </span>
      </div>
      {limit !== undefined && (
        <div className="mt-1.5 h-[5px] w-full rounded-full bg-line/50">
          <div className={`h-full rounded-full ${over ? "bg-destructive" : "bg-accent/70"}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {editing && (
        <div className="mt-2 flex items-center gap-2">
          <span className={labelCls}>Limit</span>
          <input
            className={smallField + " w-28"}
            type="number"
            inputMode="decimal"
            placeholder="none"
            value={limit ?? ""}
            onChange={(e) => onLimit(e.target.value === "" ? undefined : Number(e.target.value) || undefined)}
          />
          <button onClick={onRemove} className="type-mono ml-auto text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-destructive">
            remove
          </button>
        </div>
      )}
    </div>
  );
}

function TransactionsCard({ month, sym }: { month: string; sym: string }) {
  const { transactions, budgetCategories, addTransaction, removeTransaction } = useApp();
  const [kind, setKind] = useState<TxnKind>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(() => dayOffset(0));
  const [note, setNote] = useState("");

  const cats = budgetCategories.filter((c) => c.kind === kind);
  const rows = useMemo(
    () => txnsInMonth(transactions, month).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, month]
  );
  const nameOf = (id?: string) => budgetCategories.find((c) => c.id === id)?.name ?? "Uncategorised";

  const submit = () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return;
    const txn: Transaction = {
      id: budgetId("tx"),
      date,
      amount: Math.round(amt * 100) / 100,
      kind,
      categoryId: categoryId || undefined,
      note: note.trim() || undefined,
    };
    addTransaction(txn);
    setAmount("");
    setNote("");
  };

  return (
    <Card>
      <Label className="mb-3">Transactions</Label>

      <div className="space-y-2 rounded-[var(--radius-sm)] border border-line p-3">
        <div className="flex gap-1.5">
          {(["expense", "income"] as const).map((k) => (
            <button
              key={k}
              onClick={() => { setKind(k); setCategoryId(""); }}
              className={`type-mono flex-1 rounded-[var(--radius-sm)] border px-3 py-1.5 text-[0.75rem] capitalize ${
                kind === k ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={smallField + " w-28"} type="number" inputMode="decimal" placeholder={`${sym} amount`} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className={smallField + " min-w-0 flex-1"} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Category…</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input className={smallField + " w-40"} type="date" max={dayOffset(0)} value={date} onChange={(e) => setDate(e.target.value)} />
          <input className={smallField + " min-w-0 flex-1"} placeholder="Note (optional)" value={note} maxLength={40} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button onClick={submit} disabled={!amount || Number(amount) <= 0}>Add {kind}</Button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-[0.875rem] text-muted">Nothing logged this month yet.</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {rows.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2 text-[0.8125rem]">
              <div className="min-w-0">
                <span className="text-ink">{t.note || nameOf(t.categoryId)}</span>
                <div className="type-mono text-[0.625rem] text-muted">
                  {nameOf(t.categoryId)} · {new Date(`${t.date}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-3">
                <span className={`type-mono text-[0.8125rem] ${t.kind === "income" ? "text-accent" : "text-ink"}`}>
                  {t.kind === "income" ? "+" : "−"}{fmtMoney(t.amount, sym)}
                </span>
                <button aria-label="Remove" onClick={() => removeTransaction(t.id)} className="text-muted hover:text-ink">×</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function BillsCard({ sym }: { sym: string }) {
  const { bills, budgetCategories, addBill, updateBill, removeBill } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [cadence, setCadence] = useState<BillCadence>("monthly");
  const total = monthlyBillsTotal(bills);
  const nameOf = (id?: string) => budgetCategories.find((c) => c.id === id)?.name;

  const submit = () => {
    const amt = Number(amount);
    if (!name.trim() || !Number.isFinite(amt) || amt <= 0) return;
    const bill: Bill = {
      id: budgetId("bill"),
      name: name.trim(),
      amount: Math.round(amt * 100) / 100,
      dueDay: Math.min(31, Math.max(1, Number(dueDay) || 1)),
      cadence,
      active: true,
    };
    addBill(bill);
    setName("");
    setAmount("");
    setDueDay("1");
    setCadence("monthly");
    setAdding(false);
  };

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Label>Bills &amp; subscriptions</Label>
        <span className="type-mono text-[0.75rem] text-muted">
          <span className="text-accent">{fmtMoney(total, sym)}</span>/mo
        </span>
      </div>

      {bills.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {bills.map((b) => (
            <li key={b.id} className={`flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2 text-[0.8125rem] ${b.active ? "" : "opacity-50"}`}>
              <div className="min-w-0">
                <span className="text-ink">{b.name}</span>
                <div className="type-mono text-[0.625rem] text-muted">
                  {b.cadence === "monthly" ? `day ${b.dueDay}` : b.cadence} · {fmtMoney(b.amount, sym)}
                  {nameOf(b.categoryId) ? ` · ${nameOf(b.categoryId)}` : ""}
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <button onClick={() => updateBill(b.id, { active: !b.active })} className="type-mono text-[0.625rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink">
                  {b.active ? "pause" : "resume"}
                </button>
                <button aria-label="Remove" onClick={() => removeBill(b.id)} className="text-muted hover:text-ink">×</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {!adding ? (
        <button onClick={() => setAdding(true)} className="type-mono mt-3 text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink">
          + add a bill
        </button>
      ) : (
        <div className="mt-3 space-y-2 rounded-[var(--radius-sm)] border border-line p-3">
          <input className={smallField + " w-full"} placeholder="Name — e.g. Spotify" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <input className={smallField + " w-24"} type="number" inputMode="decimal" placeholder={`${sym} amt`} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input className={smallField + " w-20"} type="number" inputMode="numeric" placeholder="due day" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
            <select className={smallField + " min-w-0 flex-1"} value={cadence} onChange={(e) => setCadence(e.target.value as BillCadence)}>
              <option value="weekly">weekly</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={!name.trim() || !amount}>Add</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function GoalsCard({ sym }: { sym: string }) {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, removeSavingsGoal } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [by, setBy] = useState("");

  const submit = () => {
    const t = Number(target);
    if (!name.trim() || !Number.isFinite(t) || t <= 0) return;
    addSavingsGoal({ id: budgetId("goal"), name: name.trim(), target: Math.round(t), saved: 0, by: by.trim() || undefined });
    setName("");
    setTarget("");
    setBy("");
    setAdding(false);
  };

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Label>Savings goals</Label>
        <button onClick={() => setAdding(!adding)} className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink">
          {adding ? "cancel" : "+ add goal"}
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {savingsGoals.map((g) => (
          <GoalRow key={g.id} goal={g} sym={sym} onAdd={(amt) => updateSavingsGoal(g.id, { saved: Math.max(0, g.saved + amt) })} onRemove={() => removeSavingsGoal(g.id)} />
        ))}
        {savingsGoals.length === 0 && !adding && <p className="text-[0.875rem] text-muted">No goals yet. Name one and start stacking.</p>}
      </div>

      {adding && (
        <div className="mt-3 space-y-2 rounded-[var(--radius-sm)] border border-line p-3">
          <input className={smallField + " w-full"} placeholder="Goal — e.g. New laptop" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <input className={smallField + " w-28"} type="number" inputMode="decimal" placeholder={`${sym} target`} value={target} onChange={(e) => setTarget(e.target.value)} />
            <input className={smallField + " min-w-0 flex-1"} placeholder="by when (optional)" value={by} maxLength={24} onChange={(e) => setBy(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={!name.trim() || !target}>Add goal</Button>
        </div>
      )}
    </Card>
  );
}

function GoalRow({ goal, sym, onAdd, onRemove }: { goal: SavingsGoal; sym: string; onAdd: (amt: number) => void; onRemove: () => void }) {
  const [contrib, setContrib] = useState("");
  const pct = goalPct(goal);
  const done = goal.saved >= goal.target;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[0.875rem] text-ink">
          {goal.name}
          {goal.by && <span className="type-mono ml-1.5 text-[0.625rem] text-muted">by {goal.by}</span>}
        </span>
        <span className="type-mono shrink-0 text-[0.75rem] text-muted">
          <span className="text-accent">{fmtMoney(goal.saved, sym)}</span> / {fmtMoney(goal.target, sym)}
        </span>
      </div>
      <div className="mt-1.5 h-[6px] w-full rounded-full bg-line/50">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {done ? (
          <Chip tone="accent">reached 🎉</Chip>
        ) : (
          <>
            <input className={smallField + " w-24"} type="number" inputMode="decimal" placeholder={`+ ${sym}`} value={contrib} onChange={(e) => setContrib(e.target.value)} />
            <button
              onClick={() => { const a = Number(contrib); if (a) { onAdd(a); setContrib(""); } }}
              disabled={!contrib || Number(contrib) === 0}
              className="type-mono rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[0.75rem] text-muted hover:border-accent hover:text-ink disabled:opacity-40"
            >
              add
            </button>
          </>
        )}
        <button onClick={onRemove} className="type-mono ml-auto text-[0.625rem] text-muted underline decoration-dotted underline-offset-2 hover:text-destructive">
          remove
        </button>
      </div>
    </div>
  );
}

function TrendsCard({ sym }: { sym: string }) {
  const { transactions, budgetCategories } = useApp();
  const month = currentMonthKey();
  const breakdown = useMemo(() => spendingBreakdown(transactions, budgetCategories, month).slice(0, 6), [transactions, budgetCategories, month]);
  const maxCat = Math.max(...breakdown.map((b) => b.amount), 1);
  const flow = useMemo(() => cashflowByMonth(transactions, 6), [transactions]);
  const maxFlow = Math.max(...flow.flatMap((f) => [f.income, f.expense]), 1);

  return (
    <Card>
      <Label className="mb-3">Trends</Label>

      <span className={labelCls}>Where it went · this month</span>
      {breakdown.length === 0 ? (
        <p className="mt-1 text-[0.8125rem] text-muted">No spending logged yet.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {breakdown.map((b) => (
            <div key={b.id}>
              <div className="mb-0.5 flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[0.8125rem] text-ink">{b.name}</span>
                <span className="type-mono shrink-0 text-[0.6875rem] text-muted">{fmtMoney(b.amount, sym)}</span>
              </div>
              <div className="h-[6px] w-full rounded-full bg-line/50">
                <div className="h-full rounded-full bg-accent/70" style={{ width: `${(b.amount / maxCat) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <span className={labelCls}>Cashflow · 6 months</span>
        <div className="mt-2 flex items-end gap-2" aria-label="Income vs expense by month">
          {flow.map((f) => (
            <div key={f.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end justify-center gap-0.5">
                <div className="w-1/2 rounded-t-[2px] bg-accent/70" style={{ height: `${(f.income / maxFlow) * 100}%` }} title={`income ${fmtMoney(f.income, sym)}`} />
                <div className="w-1/2 rounded-t-[2px] bg-ink/40" style={{ height: `${(f.expense / maxFlow) * 100}%` }} title={`spent ${fmtMoney(f.expense, sym)}`} />
              </div>
              <span className="type-mono text-[0.5625rem] text-muted/70">{monthLabel(f.month).slice(0, 3)}</span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-4 text-[0.625rem] text-muted">
          <span className="flex items-center gap-1.5"><span className="inline-block h-[2px] w-4 bg-accent/70" /> income</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-[2px] w-4 bg-ink/40" /> spent</span>
        </div>
      </div>
    </Card>
  );
}
