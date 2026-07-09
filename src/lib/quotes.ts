// Hard lines. Chrome only — they never appear inside questions, answers,
// or payout math. Terse, aggressive, no emoji, no exclamation spam.
// Founder's three lead the pool verbatim.

export const HARD_LINES: string[] = [
  "You're only cheating yourself.",
  "Become that 1% better.",
  "Don't spend another year doing the same sh*t.",
  "You said tomorrow yesterday.",
  "The record doesn't lie. You might.",
  "Average is a choice you keep making.",
  "Nobody is coming.",
  "One percent or zero. Pick.",
  "Your excuses are well documented.",
  "Discipline is a receipt, not a mood.",
  "The version of you that quit is watching.",
  "Motivation is weather. Standards are climate.",
  "You already know what you avoided today.",
  "Comfort is the most expensive thing you own.",
  "Do it tired. That's the whole trick.",
  "The gap between you and them is a calendar.",
  "Talent waits. Work doesn't.",
  "You don't need a new plan. You need a witness.",
  "Every skipped day votes for the old you.",
  "Hard now, or hard forever.",
  "The mission doesn't care how you slept.",
  "Prove it or lose it.",
  "Your potential is not an asset. It's a debt.",
  "Stop negotiating with the alarm.",
  "The work you're avoiding is the work.",
  "Winners keep score. That's the difference.",
  "Nothing changes if the record stays clean of effort.",
  "You can't compound what you don't log.",
  "Someone with half your talent is outworking you right now.",
  "Feelings are data, not directions.",
  "The day you dodge is the day that decides.",
  "Consistency is boring. So is losing.",
  "Say less. Log more.",
  "You're not tired. You're untested.",
  "A year from now you'll wish you had today back.",
  "Small stakes, kept daily, beat big promises.",
  "The mirror takes attendance.",
  "Read your own record and try to argue.",
  "Being honest costs less than being behind.",
  "It was never about the day. It's about the chain.",
  "Your future self is reading this record.",
  "The bar doesn't lower because you're busy.",
  "Do the hard call first. Everything after is easy.",
  "What you tolerate, you train.",
  "Zero point zero one. Every day. That's the whole religion.",
  "You've rested enough. That's not the bottleneck.",
  "Losing streaks start quiet.",
  "The correction only works if you do.",
  "Deadlines love the prepared and expose the rest.",
  "Nobody remembers your reasons.",
  "Show up like someone's checking. Someone is: you.",
  "Perfect is a stall tactic.",
  "You keep the promises you write down.",
  "It compounds either way. Choose the direction.",
  "This is the year, or it's another year.",
];

/** Deterministic daily pick per surface — same line all day, different per
 *  surface, no hydration mismatch. */
export function hardLine(salt: string): string {
  const d = new Date();
  const seed = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${salt}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return HARD_LINES[(h >>> 0) % HARD_LINES.length];
}
