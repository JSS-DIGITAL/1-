// The economy. One law governs every payout: pay for what is verifiable,
// anti-flattering, or prediction-tested — never for claimed success alone.
// All tuning constants live in ECON; retune there, nowhere else.

import type {
  AnswerValue,
  Bounty,
  DayRecord,
  LedgerEntry,
  Mission,
  MissionOutcome,
  RankInfo,
  ResolveResult,
  Seal,
  SealRarity,
} from "./types";

export const ECON = {
  executionPayMax: 15,
  calibrationBonusMax: 10,
  momentumStep: 0.1,
  momentumChainCap: 10, // chain of 10+ kept promises → ×2
  candor: {
    fullBase: 5,
    mvdBase: 2,
    avoidanceNamed: 3,
    insteadNamed: 1,
    condition: 2,
    perItem: 1,
    itemsMax: 3,
    metricsLogged: 2,
    evidence: 2,
  },
  bountyPay: 100,
  bountyKillWindowDays: 14,
} as const;

// ---- The Wager ----

export function outcomeScore(outcome: MissionOutcome): number {
  return outcome === "executed" ? 1 : outcome === "partial" ? 0.5 : 0;
}

export function momentumFromChain(chain: number): number {
  return 1 + ECON.momentumStep * Math.min(chain, ECON.momentumChainCap);
}

/** Consecutive `executed` outcomes at the tail of the judged missions. */
export function chainFrom(missions: Mission[]): number {
  const judged = missions.filter((m) => m.outcome).sort((a, b) => a.date.localeCompare(b.date));
  let chain = 0;
  for (let i = judged.length - 1; i >= 0; i--) {
    if (judged[i].outcome === "executed") chain++;
    else break;
  }
  return chain;
}

/** Proper-scoring-flavored payout: the honest confidence call maximises EV.
 *  Calling 9 and failing pays ~0; sandbagging a sure thing forfeits bonus. */
export function resolveWager(
  confidence: number,
  outcome: MissionOutcome,
  momentum: number
): ResolveResult {
  const s = outcomeScore(outcome);
  const executionPay = Math.round(ECON.executionPayMax * s);
  const calibrationBonus = Math.round(
    ECON.calibrationBonusMax * (1 - Math.pow(confidence / 10 - s, 2))
  );
  const total = Math.round((executionPay + calibrationBonus) * momentum);
  return { confidence, outcome, executionPay, calibrationBonus, momentum, total };
}

// ---- Candor pay: admission, not achievement ----

const NOTHING = /^\s*(nothing|none|n\/a|no)\s*\.?\s*$/i;

export interface CandorBreakdown {
  bp: number;
  lines: { label: string; bp: number }[];
}

export function scoreCandor(
  answers: Record<string, AnswerValue>,
  kind: "full" | "mvd"
): CandorBreakdown {
  const c = ECON.candor;
  const lines: { label: string; bp: number }[] = [];
  lines.push({ label: kind === "full" ? "full record" : "minimum day", bp: kind === "full" ? c.fullBase : c.mvdBase });

  const s1 = answers.S1;
  if (s1?.kind === "binary" && s1.evidence?.trim()) lines.push({ label: "evidence given", bp: c.evidence });

  const s2 = answers.S2;
  if (s2?.kind === "list" && s2.items.length > 0)
    lines.push({ label: "outputs listed", bp: Math.min(s2.items.length, c.itemsMax) * c.perItem });
  if (s2?.kind === "line" && s2.value.trim() && !NOTHING.test(s2.value))
    lines.push({ label: "output named", bp: c.perItem });

  const s3 = answers.S3;
  if (s3?.kind === "count" && Object.keys(s3.values).length > 0)
    lines.push({ label: "numbers logged", bp: c.metricsLogged });

  const s4 = answers.S4;
  if (s4?.kind === "line" && s4.value.trim() && !NOTHING.test(s4.value)) {
    lines.push({ label: "avoidance named", bp: c.avoidanceNamed });
    if (s4.second?.trim()) lines.push({ label: "replacement named", bp: c.insteadNamed });
  }

  const s5 = answers.S5;
  if (s5?.kind === "line" && s5.value.trim() && !NOTHING.test(s5.value))
    lines.push({ label: "condition stated", bp: c.condition });

  return { bp: lines.reduce((s, l) => s + l.bp, 0), lines };
}

// ---- Seals: variable-ratio reward on the honest act of sealing ----

// Metals, not mode colours — money and trophies read the same in both rooms.
const SEAL_TABLE: { rarity: SealRarity; label: string; weight: number }[] = [
  { rarity: "standard", label: "Silver seal", weight: 70 },
  { rarity: "brass", label: "Bronze seal", weight: 20 },
  { rarity: "ember", label: "Gold seal", weight: 8 },
  { rarity: "oxblood", label: "Obsidian seal", weight: 2 },
];

/** Deterministic per-date draw (hydration- and reload-safe). */
export function drawSeal(dateSeed: string): Seal {
  let h = 2166136261;
  for (let i = 0; i < dateSeed.length; i++) {
    h ^= dateSeed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const roll = (h >>> 0) % 100;
  let acc = 0;
  for (const s of SEAL_TABLE) {
    acc += s.weight;
    if (roll < acc) return { rarity: s.rarity, label: s.label };
  }
  return { rarity: "standard", label: "Standard seal" };
}

export const SEAL_ORDER: SealRarity[] = ["standard", "brass", "ember", "oxblood"];

// ---- Bounties: chronic weaknesses become named enemies ----

export function bountiesFrom(records: DayRecord[]): Bounty[] {
  const byText = new Map<string, { count: number; lastSeen: string }>();
  let latest = "";
  for (const r of records) {
    if (r.date > latest) latest = r.date;
    if (!r.weakness) continue;
    const cur = byText.get(r.weakness.text) ?? { count: 0, lastSeen: "" };
    cur.count += 1;
    if (r.date > cur.lastSeen) cur.lastSeen = r.date;
    byText.set(r.weakness.text, cur);
  }
  const windowStart = shiftDate(latest, -ECON.bountyKillWindowDays);
  return [...byText.entries()]
    .filter(([, v]) => v.count >= 3)
    .map(([text, v]) => ({
      text,
      count: v.count,
      lastSeen: v.lastSeen,
      status: (v.lastSeen < windowStart ? "killed" : "open") as Bounty["status"],
    }))
    .sort((a, b) => b.count - a.count);
}

function shiftDate(iso: string, days: number): string {
  if (!iso) return iso;
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// ---- Ranks: Student → Teacher ladder, cosmetic unlocks only ----

export const RANKS = [
  { name: "Student I", min: 0 },
  { name: "Student II", min: 300 },
  { name: "Student III", min: 700 },
  { name: "Examiner", min: 1200 },
  { name: "Teacher I", min: 1800 },
  { name: "Teacher II", min: 2600 },
] as const;

export function rankFor(totalBp: number): RankInfo {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (totalBp >= RANKS[i].min) index = i;
  }
  const next = RANKS[index + 1];
  const progress = next ? (totalBp - RANKS[index].min) / (next.min - RANKS[index].min) : 1;
  return {
    name: RANKS[index].name,
    index,
    min: RANKS[index].min,
    next: next ? { name: next.name, min: next.min } : undefined,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

export function balanceOf(ledger: LedgerEntry[]): number {
  return ledger.reduce((s, e) => s + e.bp, 0);
}
