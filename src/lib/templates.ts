// Starter packs — one-tap areas with metrics, standards and a measurable
// target prefilled. The custom form stays for everything else.

import type { Area } from "./types";

export type AreaTemplate = Omit<Area, "id" | "createdAt">;

export const AREA_TEMPLATES: AreaTemplate[] = [
  {
    name: "Sales",
    goal: "Book 10 discovery calls a month",
    metrics: [
      { key: "calls", label: "Calls made", unit: "calls" },
      { key: "booked", label: "Meetings booked", unit: "mtgs" },
    ],
    standards: ["Hard calls before email", "No pitch without research"],
    target: { metricKey: "booked", value: 10, by: "end of month" },
    // Domain-tuned benchmarks (QUESTION_FRAMEWORK.md §9 domain spot-check).
    overrides: {
      S2: { example: "12 cold calls · proposal v2 sent · 2 meetings booked" },
      S4: { example: "Avoided the two biggest prospects · easy follow-up emails instead." },
      T4: { example: "9am, desk, phone in drawer: call the 3 largest prospects before opening email." },
    },
  },
  {
    name: "Strength",
    goal: "Add 20 kg to the main lift this quarter",
    metrics: [
      { key: "volume", label: "Total volume", unit: "kg" },
      { key: "sets", label: "Working sets", unit: "sets" },
    ],
    standards: ["Full depth or it doesn't count", "Log every set"],
    target: { metricKey: "volume", value: 6000, by: "quarter end" },
    overrides: {
      S2: { example: "5×5 squat @ 100kg · 20-min row · every set logged" },
      S4: { example: "Avoided the last squat set · extra curls instead." },
      T4: { example: "6am, gym, before phone: 3×5 @ 102.5kg, full depth." },
    },
  },
  {
    name: "Language",
    goal: "Hold a 15-minute conversation by year end",
    metrics: [
      { key: "minutes", label: "Active practice", unit: "min" },
      { key: "spoken", label: "Sentences spoken", unit: "sent" },
    ],
    standards: ["Production before recognition"],
    target: { metricKey: "minutes", value: 45, by: "daily by December" },
    overrides: {
      S2: { example: "Anki 142 cards · 15-min tutor call · 10 spoken sentences recorded" },
      S4: { example: "Avoided the speaking drill · passive video instead." },
      T4: { example: "7pm, kitchen, timer on: 10 spoken sentences recorded." },
    },
  },
  {
    name: "Study",
    goal: "Pass the exam with margin, not luck",
    metrics: [
      { key: "focus", label: "Focused minutes", unit: "min" },
      { key: "problems", label: "Problems solved", unit: "done" },
    ],
    standards: ["Practice problems before re-reading", "Closed-book recall first"],
    target: { metricKey: "problems", value: 20, by: "daily by exam week" },
  },
  {
    name: "Content",
    goal: "Publish twice a week without fail",
    metrics: [
      { key: "published", label: "Pieces published", unit: "posts" },
      { key: "drafts", label: "Drafts advanced", unit: "drafts" },
    ],
    standards: ["Ship before you polish", "One hook rewritten per piece"],
    target: { metricKey: "published", value: 8, by: "end of month" },
  },
  {
    name: "Deep Work",
    goal: "Three protected hours a day on the one thing",
    metrics: [
      { key: "focus", label: "Focused minutes", unit: "min" },
      { key: "shipped", label: "Outputs shipped", unit: "items" },
    ],
    standards: ["Phone in another room", "First block before any inbox"],
    target: { metricKey: "focus", value: 180, by: "daily" },
  },
];
