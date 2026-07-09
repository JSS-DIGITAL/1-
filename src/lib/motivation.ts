// Seed Fuel — the community feed's starting stock. User submissions marked
// "share publicly" join the pending queue until the founder approves them.

import type { MotivationItem } from "./types";

export const SEED_FUEL: MotivationItem[] = [
  { id: "f1", text: "Nobody is coming. Good. You needed the reps anyway.", author: "@no.days.off", source: "seed", visibility: "public", saves: 412, addedAt: "2026-05-02" },
  { id: "f2", text: "You don't need a better plan. You need a witnessed one.", author: "@quietoperator", source: "seed", visibility: "public", saves: 388, addedAt: "2026-05-11" },
  { id: "f3", text: "Discipline is just remembering what you want most, daily, in writing.", author: "@ledgerhead", source: "seed", visibility: "public", saves: 341, addedAt: "2026-04-20" },
  { id: "f4", text: "The gym doesn't care. The record doesn't care. That's why they work.", author: "@ironclerk", source: "seed", visibility: "public", saves: 305, addedAt: "2026-05-19" },
  { id: "f5", text: "Every day you don't record is a day your excuses go unaudited.", author: "@audityourself", source: "seed", visibility: "public", saves: 288, addedAt: "2026-06-01" },
  { id: "f6", text: "Small promises, kept loudly to yourself, rebuild everything.", author: "@rebuild.era", source: "seed", visibility: "public", saves: 264, addedAt: "2026-05-27" },
  { id: "f7", text: "Your future self is reading your record. Write something worth reading.", author: "@onepercent", source: "seed", visibility: "public", saves: 251, addedAt: "2026-04-14" },
  { id: "f8", text: "Motivation got you to download the app. Standards keep you in it.", author: "@standardsonly", source: "seed", visibility: "public", saves: 237, addedAt: "2026-06-09" },
  { id: "f9", text: "You said one percent. So find the one percent. It's always there.", author: "@floornotceiling", source: "seed", visibility: "public", saves: 219, addedAt: "2026-06-15" },
  { id: "f10", text: "Bet on yourself with a number, not a feeling.", author: "@thewager", source: "seed", visibility: "public", saves: 198, addedAt: "2026-06-20" },
  { id: "f11", text: "Hard days build the chain. Easy days just carry it.", author: "@chainholder", source: "seed", visibility: "public", saves: 176, addedAt: "2026-06-25" },
  { id: "f12", text: "The vault remembers what the mirror forgives.", author: "@sealedrecord", source: "seed", visibility: "public", saves: 158, addedAt: "2026-07-01" },
];
