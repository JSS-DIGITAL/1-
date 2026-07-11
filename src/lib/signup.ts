// Community registration — posts to the founder's n8n lead pipeline (a NEW
// workflow; existing ones untouched). No password is collected or sent: real
// auth + cross-device sync arrive with the Supabase upgrade. Failed posts are
// queued on-device and retried on the next app load, so a flaky connection
// never loses a signup.

const WEBHOOK_URL = "https://jssdigital.app.n8n.cloud/webhook/one-percent-signup";
const QUEUE_KEY = "one-percent-signup-queue";

export interface SignupPayload {
  email: string;
  name?: string;
  source: string; // "signup" | "login" | retry
}

async function post(payload: SignupPayload): Promise<boolean> {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function readQueue(): SignupPayload[] {
  try {
    return JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? "[]") as SignupPayload[];
  } catch {
    return [];
  }
}

/** Register; on failure the payload is queued for the next load. */
export async function registerSignup(payload: SignupPayload): Promise<void> {
  if (await post(payload)) return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify([...readQueue(), payload]));
  } catch {
    /* storage blocked — nothing else to do */
  }
}

/** Fire-and-forget retry of queued registrations (called once per app load). */
export async function retryQueuedSignups(): Promise<void> {
  if (typeof window === "undefined") return;
  const queue = readQueue();
  if (queue.length === 0) return;
  const still: SignupPayload[] = [];
  for (const p of queue) {
    if (!(await post({ ...p, source: `${p.source}-retry` }))) still.push(p);
  }
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(still));
}
