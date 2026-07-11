// Transcribed from QUESTION_FRAMEWORK.md §1, §3, §7 and the §12 Framework v2
// amendment — sections as thinking pathways, anchors as the data spine.
// IDs, prompts, shapes and routing are the framework's; do not invent here.
//
// v2 laws (founder-locked):
// - Sections are always presented; their triggers are thinking prompts, not
//   mandatory fields. Prose may answer all, some, or none of them.
// - Anchors (shaped questions with metrics) alone gate progression.
// - Student voice is first person (reporting my reality); Teacher voice is
//   second person (evaluating from outside). Never merge.
// - Student observes/records/notices; Teacher evaluates/diagnoses/corrects.

import type { Area, CustomQuestion, Question, Section } from "./types";

export const QUESTIONS: Record<string, Question> = {
  S1: {
    id: "S1",
    mode: "student",
    tier: "core",
    prompt: "Yesterday's mission — did I do it?",
    hint: "Yes or no — “sort of” is a no. Then the proof: something an outsider would accept.",
    shape: { kind: "binary", evidence: true },
    metric: "mission_completion_rate",
    example: "Yes — 40 minutes on the proposal, 6:10–6:50am. The doc timestamp shows it.",
  },
  S2: {
    id: "S2",
    mode: "student",
    tier: "core",
    prompt: "What did I complete today?",
    hint: "List each one — things an outsider could verify: files sent, reps done, calls made. “Worked on X” doesn't count.",
    shape: { kind: "list", max: 5 },
    metric: "output_volume",
    example: "12 cold calls · proposal v2 sent · 5×5 squat @ 100kg",
  },
  S3: {
    id: "S3",
    mode: "student",
    tier: "core",
    prompt: "Log today's numbers.",
    hint: "The area's metrics. Numbers cannot be rewritten by mood.",
    shape: { kind: "count" },
    metric: "output_volume",
  },
  S4: {
    id: "S4",
    mode: "student",
    tier: "core",
    prompt: "What did I avoid or postpone today?",
    hint: "“Nothing” is a legal answer — but the swap is the tell. What filled that time?",
    shape: { kind: "line", secondPrompt: "…and what did I do instead?" },
    metric: "avoidance_incidence",
    example: "Avoided calling the two biggest prospects · did easy follow-up emails instead.",
  },
  S5: {
    id: "S5",
    mode: "student",
    tier: "core",
    prompt: "What condition most affected how I performed today?",
    hint: "Sleep, time, place, people, tools, body — state the fact, then its effect.",
    shape: { kind: "line" },
    metric: "condition_correlates",
    example: "5 hours' sleep — focus collapsed after 2pm, close to zero output after 3.",
  },
  ST1: {
    id: "ST1",
    mode: "student",
    tier: "trigger",
    prompt: "Where was I when the mission's window passed — and what was I doing?",
    hint: "The timeline always contains a decision point. Facts only.",
    shape: { kind: "text" },
    metric: "mission_failure_context",
  },
  T1: {
    id: "T1",
    mode: "teacher",
    tier: "core",
    prompt: "Verdict on yesterday's mission.",
    hint: "“Partial” exists so that “executed” stays expensive.",
    shape: { kind: "enum", options: ["executed", "partial", "failed"], audit: true },
    metric: "mission_completion_rate",
    example: "Partial. 25 of the 40 minutes, then took a call — evidence holds for the 25.",
  },
  T2: {
    id: "T2",
    mode: "teacher",
    tier: "core",
    prompt: "Where in this record is motion without progress?",
    hint: "Point at a line in the record, or state “none”. None-streaks are tracked.",
    shape: { kind: "line" },
    metric: "motion_waste",
    example: "The 90 minutes of “research” produced no artifact and delayed the calls.",
  },
  T3: {
    id: "T3",
    mode: "teacher",
    tier: "core",
    prompt: "Name the single weakness this record exposes.",
    hint: "One. It must be in the record — not a theory about character.",
    shape: { kind: "enum", options: ["new", "repeat", "chronic"], note: true },
    metric: "weakness_recurrence",
    example: "Avoids high-stakes contacts when energy is low — repeat, third time this week.",
  },
  T4: {
    id: "T4",
    mode: "teacher",
    tier: "core",
    prompt: "Set tomorrow's mission.",
    hint: "When, where, what — one sentence a witness could verify.",
    shape: { kind: "mission" },
    metric: "mission_completion_rate",
    example: "6:00am, desk, phone in the drawer: call the three largest prospects before opening email.",
  },
  T5: {
    id: "T5",
    mode: "teacher",
    tier: "core",
    prompt: "Honestly — how likely is completion?",
    hint: "This number meets tomorrow's binary. Chronic 9s that land 40% become visible.",
    shape: { kind: "scale" },
    metric: "calibration_error",
    example: "6 — the evening event makes the morning slot fragile.",
  },
  T6: {
    id: "T6",
    mode: "teacher",
    tier: "core",
    prompt: "Where will it most likely break?",
    hint: "Name the obstacle and the counter-move: “If X, then Y.”",
    shape: { kind: "line" },
    metric: "mission_failure_context",
    example: "If the 6am alarm fails, then the calls happen at 12:00 before lunch — non-negotiable.",
  },
  TR: {
    id: "TR",
    mode: "teacher",
    tier: "core",
    prompt: "Execution Rating — rate today's performance against your own standard.",
    hint: "Based on the evidence reviewed — not on mood. The number is worthless without the why.",
    shape: { kind: "scale", why: true },
    metric: "self_assessment",
    example: "7 — output was real and the mission landed, but the highest-value calls were dodged again.",
  },
};

// ---- Sections: the thinking pathways (§12 Framework v2) ----

export const SECTIONS: Section[] = [
  {
    id: "sec-s1",
    mode: "student",
    name: "The Day",
    purpose: "Reconstruct the day objectively.",
    goal: "What actually happened?",
    triggers: [
      "What did I do today?",
      "What were the main events, actions, or activities that happened?",
      "Where did my time and energy go today?",
      "What took up more time than expected?",
      "What unexpected things affected my day?",
      "What moments, actions, or events were important?",
      "What happened today that is worth remembering?",
    ],
    anchors: [],
    proseId: "SP1",
    placeholder: "Walk back through it, start to finish. Record — don't judge.",
    example:
      "Up 6:10. Proposal work 90 min before touching email. Client call at 11 ran 40 min over and pushed training to the evening. Afternoon went to admin and follow-ups — more than planned. 3pm, unexpected pickup, about an hour gone. Evening: gym done, tomorrow's call list built.",
  },
  {
    id: "sec-s2",
    mode: "student",
    name: "Intentions vs Reality",
    purpose: "Compare intended actions with actual reality.",
    goal: "What was supposed to happen, and what actually happened?",
    triggers: [
      "What was I meant to do today?",
      "What goals, tasks, missions, or outcomes did I intend to complete?",
      "What did I actually complete?",
      "What did I not complete?",
      "What happened differently from my original plan?",
      "Did reality match my intention?",
      "Where was the biggest difference between what I planned and what actually happened?",
    ],
    anchors: ["S1"],
    proseId: "SP2",
    placeholder: "The plan, then the reality. Name the gap — explaining it comes later.",
    example:
      "The plan was three deep-work blocks on the proposal plus training at lunch. Got two blocks; the third died to the client call running over. Training happened, but at night. Biggest gap: I planned zero buffer for that call, and it reshaped the whole afternoon.",
  },
  {
    id: "sec-s3",
    mode: "student",
    name: "Output & Numbers",
    purpose: "Capture measurable output, results, and completed outcomes.",
    goal: "What did my actions actually produce?",
    triggers: [
      "What did I produce today?",
      "What outcomes were created today?",
      "What tasks, missions, or deliverables were completed?",
      "What measurable progress happened today?",
      "What numbers or evidence represent today's output?",
      "Where did my time and energy create the most value?",
      "Where did my time and energy create the least value?",
      "Was my output different from what I expected?",
    ],
    anchors: ["S2", "S3"],
    proseId: "SP3",
    placeholder: "Output, not effort. What would a stranger count?",
    example:
      "Produced: proposal v2 sent, 12 cold calls, call list for tomorrow built. Output was real but narrow — nothing moved on the landing page. The best hour was the first one, before email. The admin block after lunch produced nothing an outsider could point to.",
  },
  {
    id: "sec-s4",
    mode: "student",
    name: "Learning & Change",
    purpose: "Capture learning, discoveries, and observed changes from the day.",
    goal: "What changed, and what did I learn from today's experience?",
    triggers: [
      "What did I learn today?",
      "What did I understand today that I did not understand before?",
      "What changed today?",
      "What improved today?",
      "What became easier, faster, clearer, or more effective?",
      "What mistake or difficulty taught me something?",
      "What did I discover about my process, approach, or performance?",
      "What evidence shows that something changed?",
    ],
    anchors: [],
    proseId: "SP4",
    placeholder: "Discoveries and changes — with the evidence. What to do about them is the Teacher's call.",
    example:
      "Learned the gatekeeper objection dies if I name it first — found it on call 9, worked twice after. Writing the proposal intro got easier — third one this month, took half the time. A mistake that taught something: sent the follow-up without the pricing page again, cost a full reply cycle.",
  },
  {
    id: "sec-s5",
    mode: "student",
    name: "Friction & Avoidance",
    purpose: "Record what was hard, what got in the way, and what was dodged.",
    goal: "What created resistance today?",
    triggers: [
      "What was difficult today?",
      "What slowed my progress?",
      "What prevented me from achieving something?",
      "What problem appeared?",
      "Have I experienced this obstacle before?",
      "What pattern does this obstacle belong to?",
    ],
    anchors: ["S4"],
    proseId: "SP5",
    placeholder: "The friction, the dodge, and what filled the gap. Facts — the diagnosis comes from the Teacher.",
    example:
      "Hard part was the 2pm slump — dragged through the follow-ups at half speed. Avoided calling the two biggest prospects again; did easy admin instead. The proposal blocker was missing case-study numbers — preparation, not knowledge.",
    cause: {
      id: "SP5c",
      prompt: "Was the obstacle mainly —",
      options: ["knowledge", "preparation", "execution", "external"],
    },
  },
  {
    id: "sec-s6",
    mode: "student",
    name: "Conditions",
    purpose: "Record the circumstances that shaped execution — as data, not excuses.",
    goal: "Under what conditions did today happen?",
    triggers: [
      "How did sleep, energy, or my body affect execution?",
      "Did the place, people, or tools around me help or hurt?",
      "What time pressure or schedule reality shaped the day?",
    ],
    anchors: ["S5"],
    proseId: "SP6",
    placeholder: "Conditions are execution data, not excuses. Fact, then effect.",
    example:
      "5 hours' sleep — focus collapsed after 2pm, close to zero output after 3. Worked from the kitchen all afternoon and every walk-through broke the block. The new headset made the calls easier — no redials.",
  },
  {
    id: "sec-s7",
    mode: "student",
    name: "Handoff",
    purpose: "Prepare the report for the Teacher — after this, the record seals.",
    goal: "What does my Teacher need to know before judging this record?",
    triggers: [
      "What is the biggest thing I learned from today?",
      "What is the most important thing to remember?",
      "What does my Teacher need to know before evaluating today?",
    ],
    anchors: [],
    proseId: "SP7",
    placeholder: "The handoff note. After this, the record seals — only what is written exists.",
    example:
      "Teacher should know: the client-call overrun wasn't optional — contract client, real fire. But the prospect calls were avoidable and I knew it at 2pm. Judge the afternoon on that, not on the fire.",
  },
  {
    id: "sec-t1",
    mode: "teacher",
    name: "Verdict & Audit",
    purpose: "Determine execution quality from the sealed record.",
    goal: "What does the evidence say about the performance?",
    triggers: [
      "Looking at today objectively, how did you perform?",
      "Did your actions match the standard you expect from yourself?",
      "Did you execute what you intended to execute?",
      "What evidence proves your performance level?",
      "Where did you perform well?",
      "Where did you underperform?",
      "If someone else reviewed your day, what would they name as the strongest and weakest point?",
    ],
    anchors: ["T1"],
    proseId: "TP1",
    placeholder: "Rule on the record, not the memory. Cite lines.",
    example:
      "Partial. 25 of the 40 minutes, then took the call — evidence holds for the 25. Strongest point: the morning block happened before email, as ordered. Weakest: the two biggest prospects went uncalled for the third day.",
  },
  {
    id: "sec-t2",
    mode: "teacher",
    name: "The Gap",
    purpose: "Find the gap between expectation and reality — and what caused it.",
    goal: "Where is the gap, and what does it reveal?",
    triggers: [
      "What did you expect yourself to accomplish?",
      "What actually happened?",
      "Where was the biggest gap between expectation and reality?",
      "Was the reason legitimate, or was it a failure in your system?",
    ],
    anchors: ["T2"],
    proseId: "TP2",
    placeholder: "Name the gap and its cause. Legitimate constraint or system failure — decide.",
    example:
      "Expected three blocks; the record shows two. The gap wasn't the client call — it was zero buffer around it: planning. The 90 minutes of “research” moved nothing — motion without progress.",
    cause: {
      id: "TP2c",
      prompt: "The gap was mainly —",
      options: ["planning", "execution", "priorities", "knowledge", "discipline", "external"],
    },
  },
  {
    id: "sec-t3",
    mode: "teacher",
    name: "Weakness",
    purpose: "Name the single weakness the record exposes — new, repeat, or chronic.",
    goal: "What is the one limitation that mattered most?",
    triggers: [
      "What was your biggest weakness today?",
      "What mistake had the biggest negative impact?",
      "What behaviour reduced your performance?",
      "What did you do that you know you should not repeat?",
      "What did you fail to do that would have improved your outcome?",
    ],
    anchors: ["T3"],
    proseId: "TP3",
    placeholder: "One weakness, from the record. Recurrence matters more than severity.",
    example:
      "Avoids high-stakes contacts when energy is low — repeat, third time this week. The tell is in the record: biggest prospects uncalled, easy admin sitting in their slot.",
  },
  {
    id: "sec-t4",
    mode: "teacher",
    name: "Correction & Standards",
    purpose: "Convert the weakness into a correction and a standard.",
    goal: "What changes — specifically?",
    triggers: [
      "What specifically needs to change?",
      "What is the smallest correction that creates the biggest improvement?",
      "What behaviour needs to increase — and what needs to decrease?",
      "What system, environment, or process should change?",
      "What standard did you fail to meet — and what standard should you operate at?",
      "What would the next-level version of you have done today?",
    ],
    anchors: [],
    proseId: "TP4",
    placeholder: "Corrections are mechanical: behaviour, system, environment. “Try harder” is not a correction.",
    example:
      "Smallest correction, biggest return: the two hardest calls happen first, before email — no exceptions. System change: phone in the drawer, list printed the night before. The standard that rises: “calls done” now means the hard ones, not the count.",
  },
  {
    id: "sec-t5",
    mode: "teacher",
    name: "Patterns",
    purpose: "Check the record against history — stop repeated cycles.",
    goal: "Is this a day, or is this a pattern?",
    triggers: [
      "Have you faced this problem before?",
      "Did your previous correction work?",
      "What patterns are appearing?",
      "What keeps happening despite knowing it needs to change?",
      "What does your past behaviour reveal about your current system?",
    ],
    anchors: [],
    proseId: "TP5",
    placeholder: "One day is data. Three days is a pattern. Rule on which this is.",
    example:
      "Same problem as Tuesday — third energy-dip dodge this week; the pattern is confirmed, not suspected. The last correction (“call earlier”) half-worked: mornings fixed, afternoons regressed.",
  },
  {
    id: "sec-t6",
    mode: "teacher",
    name: "Final Verdict & Rating",
    purpose: "Compress the review into a final ruling.",
    goal: "What is the verdict — and the one thing that matters?",
    triggers: [
      "What is the biggest lesson from today?",
      "What is the biggest weakness to attack?",
      "What is the one correction that matters most?",
    ],
    anchors: ["TR"],
    proseId: "TP6",
    placeholder: "The lesson, the target, the one correction. Then the number — earned, not felt.",
    example:
      "7/10 — output was real and the mission landed, but the highest-value calls were dodged again and the afternoon leaked. Lesson: energy allocation beats time allocation. The one correction that matters: hard calls first.",
  },
  {
    id: "sec-t7",
    mode: "teacher",
    name: "Mission",
    purpose: "One order on the desk — when, where, what, the stake, the failure plan.",
    goal: "What single action proves improvement tomorrow?",
    triggers: [
      "What is the most important thing to accomplish tomorrow?",
      "What action will prove improvement?",
      "What must not happen again?",
    ],
    anchors: ["T4", "T5", "T6"],
    proseId: "TP7",
    placeholder: "Anything else the order needs — constraints, context, the line you won't cross.",
    example:
      "6:00am, desk, phone in the drawer: call the three largest prospects before opening email. Stake: 7 — the morning is protected but the school run is a risk. If the 6am block collapses, the calls move to 12:00 sharp.",
  },
];

/** Sections for a mode. S1's anchor renders only when a mission exists; ST1
 *  fires inside sec-s2 when S1 = no. Custom questions render in Handoff /
 *  Final Verdict. Anchors alone gate. */
export function sectionsFor(mode: "student" | "teacher"): Section[] {
  return SECTIONS.filter((s) => s.mode === mode);
}

// ---- Per-area resolution: wording is the user's, structure is locked ----

export function effectiveQuestion(id: string, area?: Area): Question | undefined {
  const custom = area?.customQuestions?.find((c) => c.id === id);
  if (custom) {
    return {
      id: custom.id,
      mode: custom.mode,
      tier: "core",
      prompt: custom.prompt,
      hint: custom.hint,
      shape: custom.shape,
      metric: "none",
      example: custom.example,
    };
  }
  const base = QUESTIONS[id];
  if (!base) return undefined;
  const o = area?.overrides?.[id];
  if (!o) return base;
  return {
    ...base,
    prompt: o.prompt?.trim() ? o.prompt : base.prompt,
    hint: o.hint?.trim() ? o.hint : base.hint,
    example: o.example?.trim() ? o.example : base.example,
  };
}

export function effectiveSection(section: Section, area?: Area): Section {
  const o = area?.overrides?.[section.id];
  if (!o) return section;
  return {
    ...section,
    name: o.name?.trim() ? o.name : section.name,
    purpose: o.purpose?.trim() ? o.purpose : section.purpose,
    triggers: o.triggers && o.triggers.length > 0 ? o.triggers : section.triggers,
    placeholder: o.placeholder?.trim() ? o.placeholder : section.placeholder,
    example: o.example?.trim() ? o.example : section.example,
  };
}

export function customsFor(area: Area | undefined, mode: "student" | "teacher"): CustomQuestion[] {
  return (area?.customQuestions ?? []).filter((c) => c.mode === mode);
}

export const MAX_CUSTOM_QUESTIONS = 2;

// ---- Minimum day: the minimum honest record. Per-question flow, anchors
// only — no sections, no prose, no customs. TR stays out: minimal is minimal.

export function mvdStudentSteps(hasMission: boolean): string[] {
  return hasMission ? ["S1", "S2"] : ["S2"];
}

export function mvdTeacherSteps(hasMission: boolean): string[] {
  return hasMission ? ["T1", "T4", "T5"] : ["T4", "T5"];
}

export const MODE_SHIFT_LINE = "The record is sealed. Only what is written exists.";
export const REVERSE_SHIFT_LINE = "One order on the desk.";

/** The Law — shown beside the question editor, plain words. Derived from
 *  QUESTION_FRAMEWORK.md §0 + §4; wording is free, these are not. */
export const THE_LAW: string[] = [
  "Facts, not feelings — a feeling only counts as a condition with an effect.",
  "Everything must be verifiable by an outsider.",
  "No gratitude lists, motivation scores, or mood ratings.",
  "One weakness, one mission — never lists.",
  "The Student observes and records; the Teacher evaluates and corrects.",
  "Answer types are fixed. The wording is yours.",
];