# 1% — personal performance system

**The floor, not the ceiling.** Live at [one-percent-eta.vercel.app](https://one-percent-eta.vercel.app) (soon `onepercent.jssdigital.com.au`).

One person, two mental states. The **Student** records the day — facts, numbers, what was dodged. The record **seals into the vault**, permanently. The **Teacher** reads it like a coach reading a report: one weakness, one mission for tomorrow, one stake on your own word. The economy pays for honesty and calibration — never for claimed success.

## Stack

Next.js (App Router) · Tailwind · Framer Motion · device-local persistence (localStorage — no backend, no accounts server; signups flow to the founder's n8n pipeline) · installable PWA.

## Run

```bash
npm install
npm run dev   # port 3030
```

## The two contracts

Read these before changing anything — every decision and founder deviation is logged with reasoning:

- [`QUESTION_FRAMEWORK.md`](QUESTION_FRAMEWORK.md) — the question set, the honesty-engine law, the economy amendments (§11–12).
- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — tokens, the mode system, and a running log of every visual pass (§8a–8j).

## Deploys

Push to `main` → Vercel auto-deploys (project `one-percent`). Manual: `npx vercel deploy --prod`.
