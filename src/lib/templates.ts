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
