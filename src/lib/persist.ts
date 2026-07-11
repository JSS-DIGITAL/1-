// Device-local persistence — the app runs on its own dependency. Everything
// lives in localStorage on the user's device: no backend, no account, no
// cloud bill. Text-only state; a heavy month is tens of KB against a ~5MB cap.
// The Settings export is the backup (iOS can evict browser storage after
// long disuse — export before long absences).

export const PERSIST_KEY = "one-percent-v1";
export const PERSIST_VERSION = 1;

interface Envelope<T> {
  v: number;
  data: T;
}

export function loadState<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    // Prototype rule: version mismatch wipes rather than migrates.
    if (env.v !== PERSIST_VERSION) {
      window.localStorage.removeItem(PERSIST_KEY);
      return null;
    }
    return env.data;
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced write-through (~250ms) — typing in the review never janks. */
export function saveStateDebounced(data: unknown): void {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const env: Envelope<unknown> = { v: PERSIST_VERSION, data };
      window.localStorage.setItem(PERSIST_KEY, JSON.stringify(env));
    } catch {
      // Storage full or blocked — the session keeps working in memory.
    }
  }, 250);
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  window.localStorage.removeItem(PERSIST_KEY);
}
