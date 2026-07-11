// The Vault Game — loot engine. QUESTION_FRAMEWORK.md §12.10.
// Two ways in, and the method dictates the tier: the Combination (three
// digits earned by the day's honest acts — verifiable, anti-flattering,
// prediction-tested) rolls the high table; the Skill Crack (attempts earned
// only by sealing) rolls the commons-heavy table; the Master Vault (7-day
// open streak) rolls legendary/mythic. The economy law holds: nothing here
// pays for claimed success — it pays on top of honest acts, like seal draws.

import type { Mode } from "./types";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

/** Loot-only palette (never UI semantics) — the Fortnite ladder, tuned to near-black. */
export const RARITIES: Record<Rarity, { name: string; color: string; glow: string }> = {
  common: { name: "Common", color: "#9aa3ad", glow: "rgba(154,163,173,0.35)" },
  uncommon: { name: "Uncommon", color: "#57c256", glow: "rgba(87,194,86,0.4)" },
  rare: { name: "Rare", color: "#3aa1ff", glow: "rgba(58,161,255,0.45)" },
  epic: { name: "Epic", color: "#b350f2", glow: "rgba(179,80,242,0.5)" },
  legendary: { name: "Legendary", color: "var(--gold)", glow: "rgba(212,175,90,0.55)" },
  mythic: { name: "Mythic", color: "#ffd76a", glow: "rgba(255,215,106,0.7)" },
};

export type VaultItemKind = "bp" | "accent" | "sealskin" | "feature" | "archive";

export interface VaultItem {
  id: string;
  name: string;
  desc: string;
  rarity: Rarity;
  kind: VaultItemKind;
  /** bp payout for kind "bp". */
  bp?: number;
  /** Permanent (vs. until-midnight) for kind "archive". */
  permanent?: boolean;
}

/** Vault-exclusive accents, unlocked by item id, equipable in Settings. */
export const VAULT_ACCENTS: {
  itemId: string;
  mode: Mode;
  pair: { name: string; accent: string; accentInk: string };
}[] = [
  { itemId: "acc-gunmetal", mode: "student", pair: { name: "Gunmetal", accent: "#8fa3ad", accentInk: "#0c1114" } },
  { itemId: "acc-patina", mode: "student", pair: { name: "Patina", accent: "#63b98f", accentInk: "#081209" } },
  { itemId: "acc-cobalt", mode: "student", pair: { name: "Cobalt", accent: "#5aa4e6", accentInk: "#07101a" } },
  { itemId: "acc-amethyst", mode: "teacher", pair: { name: "Amethyst", accent: "#c06bf0", accentInk: "#12071a" } },
  { itemId: "acc-molten", mode: "teacher", pair: { name: "Molten", accent: "#f0954e", accentInk: "#170c05" } },
  { itemId: "acc-sovereign", mode: "teacher", pair: { name: "Sovereign", accent: "#e0b64f", accentInk: "#171106" } },
  { itemId: "acc-first-light", mode: "student", pair: { name: "First Light", accent: "#ffe9a8", accentInk: "#171304" } },
];

// The table. Volume decreases as rarity rises (founder ruling: lots of grey
// and green, fewer blue, fewer purple, least gold).
export const VAULT_LOOT: VaultItem[] = [
  // ---- Common (grey): 10 ----
  { id: "bp-10", name: "Loose Change", desc: "A thin envelope of basis points.", rarity: "common", kind: "bp", bp: 10 },
  { id: "bp-12", name: "Petty Cash", desc: "Small, but it counts.", rarity: "common", kind: "bp", bp: 12 },
  { id: "bp-15", name: "Coin Roll", desc: "Steady money.", rarity: "common", kind: "bp", bp: 15 },
  { id: "bp-18", name: "Folded Note", desc: "Found at the bottom of the vault.", rarity: "common", kind: "bp", bp: 18 },
  { id: "bp-20", name: "Teller's Tip", desc: "The house pays out.", rarity: "common", kind: "bp", bp: 20 },
  { id: "skin-slate", name: "Slate Seal", desc: "A grey-stone seal skin for the cabinet.", rarity: "common", kind: "sealskin" },
  { id: "skin-iron", name: "Iron Seal", desc: "Rough-cast iron, collector's shelf.", rarity: "common", kind: "sealskin" },
  { id: "acc-gunmetal", name: "Gunmetal Accent", desc: "Student mode in cold steel.", rarity: "common", kind: "accent" },
  { id: "bp-8", name: "Vault Dust", desc: "Even the dust in here is worth something.", rarity: "common", kind: "bp", bp: 8 },
  { id: "bp-14", name: "Spare Key Deposit", desc: "Somebody never came back for it.", rarity: "common", kind: "bp", bp: 14 },
  // ---- Uncommon (green): 7 ----
  { id: "bp-25", name: "Sealed Stack", desc: "A banded stack of bp.", rarity: "uncommon", kind: "bp", bp: 25 },
  { id: "bp-30", name: "Client Retainer", desc: "Paid in full.", rarity: "uncommon", kind: "bp", bp: 30 },
  { id: "bp-40", name: "Settled Account", desc: "The ledger smiles.", rarity: "uncommon", kind: "bp", bp: 40 },
  { id: "acc-patina", name: "Patina Accent", desc: "Student mode in aged bronze-green.", rarity: "uncommon", kind: "accent" },
  { id: "skin-verdigris", name: "Verdigris Seal", desc: "Weathered copper seal skin.", rarity: "uncommon", kind: "sealskin" },
  { id: "bp-35", name: "Recovered Deposit", desc: "It was yours all along.", rarity: "uncommon", kind: "bp", bp: 35 },
  { id: "skin-jade", name: "Jade Seal", desc: "Cut stone, cold to the touch.", rarity: "uncommon", kind: "sealskin" },
  // ---- Rare (blue): 6 ----
  { id: "bp-60", name: "Deed Box", desc: "Heavy for its size.", rarity: "rare", kind: "bp", bp: 60 },
  { id: "bp-75", name: "Bearer Bond", desc: "Pays whoever cracked the door.", rarity: "rare", kind: "bp", bp: 75 },
  { id: "bp-90", name: "Numbered Account", desc: "No questions asked.", rarity: "rare", kind: "bp", bp: 90 },
  { id: "acc-cobalt", name: "Cobalt Accent", desc: "Student mode in deep blue steel.", rarity: "rare", kind: "accent" },
  { id: "skin-sapphire", name: "Sapphire Seal", desc: "A jeweler's seal skin.", rarity: "rare", kind: "sealskin" },
  { id: "archive-day", name: "Archive Day-Pass", desc: "The door stands open until midnight — read your sealed records inside.", rarity: "rare", kind: "archive" },
  // ---- Epic (purple): 5 ----
  { id: "bp-120", name: "Estate Envelope", desc: "Old money.", rarity: "epic", kind: "bp", bp: 120 },
  { id: "bp-160", name: "Foreign Ledger", desc: "Converted at a criminal rate — in your favour.", rarity: "epic", kind: "bp", bp: 160 },
  { id: "acc-amethyst", name: "Amethyst Accent", desc: "Teacher mode in royal violet.", rarity: "epic", kind: "accent" },
  { id: "skin-royal", name: "Royal Seal", desc: "Pressed in purple wax.", rarity: "epic", kind: "sealskin" },
  { id: "feat-third-question", name: "The Third Question", desc: "A permanent third custom-question slot in every area.", rarity: "epic", kind: "feature" },
  // ---- Legendary (gold): 4 ----
  { id: "bp-250", name: "The Reserve", desc: "The vault's own float.", rarity: "legendary", kind: "bp", bp: 250 },
  { id: "acc-molten", name: "Molten Accent", desc: "Teacher mode in poured gold-orange.", rarity: "legendary", kind: "accent" },
  { id: "feat-seal-label", name: "The Signet", desc: "Your own words pressed into every seal — a permanent custom seal label.", rarity: "legendary", kind: "feature" },
  { id: "archive-perm", name: "Archive Key", desc: "The archive never closes for you again.", rarity: "legendary", kind: "archive", permanent: true },
  // ---- Mythic (hot gold, Master Vault only): 3 ----
  { id: "bp-500", name: "The Motherlode", desc: "Everything in the back room.", rarity: "mythic", kind: "bp", bp: 500 },
  { id: "acc-first-light", name: "First Light Accent", desc: "Student mode in dawn gold — mythic.", rarity: "mythic", kind: "accent" },
  { id: "acc-sovereign", name: "Sovereign Accent", desc: "Teacher mode in crown gold — mythic.", rarity: "mythic", kind: "accent" },
];

export type CrackMethod = "skill" | "combination" | "master";

/** Rarity weights per method — the method dictates the tier. */
export const METHOD_ODDS: Record<CrackMethod, Record<Rarity, number>> = {
  skill: { common: 55, uncommon: 25, rare: 12, epic: 6, legendary: 2, mythic: 0 },
  combination: { common: 0, uncommon: 35, rare: 35, epic: 20, legendary: 10, mythic: 0 },
  master: { common: 0, uncommon: 0, rare: 0, epic: 40, legendary: 45, mythic: 15 },
};

const UNLOCKABLE_KINDS: VaultItemKind[] = ["accent", "sealskin", "feature"];

/** Roll the table. Owned unlockables fall back to a same-tier bp item so a
 *  win never feels like nothing. */
export function rollLoot(method: CrackMethod, owned: string[], rand: () => number = Math.random): VaultItem {
  const odds = METHOD_ODDS[method];
  const total = RARITY_ORDER.reduce((s, r) => s + odds[r], 0);
  let roll = rand() * total;
  let rarity: Rarity = "common";
  for (const r of RARITY_ORDER) {
    roll -= odds[r];
    if (roll <= 0) {
      rarity = r;
      break;
    }
  }
  const pool = VAULT_LOOT.filter(
    (i) =>
      i.rarity === rarity &&
      !(UNLOCKABLE_KINDS.includes(i.kind) && owned.includes(i.id)) &&
      !(i.kind === "archive" && i.permanent && owned.includes(i.id))
  );
  const bpPool = VAULT_LOOT.filter((i) => i.rarity === rarity && i.kind === "bp");
  const source = pool.length > 0 ? pool : bpPool.length > 0 ? bpPool : VAULT_LOOT.filter((i) => i.kind === "bp");
  return source[Math.floor(rand() * source.length)];
}

/** Angular targets for the skill crack: 3 sweet spots, well separated. */
export function skillTargets(rand: () => number = Math.random): number[] {
  const first = Math.floor(rand() * 120) + 30;
  return [first, (first + 110 + Math.floor(rand() * 40)) % 360, (first + 230 + Math.floor(rand() * 40)) % 360];
}
