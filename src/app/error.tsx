"use client";

// Route error boundary — a crash never becomes a blank white screen.
// The record is on the device; reloading cannot lose it.

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="atmosphere grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-md">
        <p className="type-mono text-[0.6875rem] uppercase tracking-[0.3em] text-muted">system fault</p>
        <h1 className="type-display mt-3 text-[2rem] leading-tight">Something broke. The record didn&apos;t.</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          Your entries live on this device and survive this. Reload and continue — if it keeps happening,
          export a backup from Settings and tell the founder.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-[var(--radius-sm)] border border-accent bg-accent/10 px-6 py-3 text-[0.9375rem] font-medium text-ink"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/today")}
            className="rounded-[var(--radius-sm)] border border-line px-6 py-3 text-[0.9375rem] text-muted hover:text-ink"
          >
            Back to Today
          </button>
        </div>
      </div>
    </div>
  );
}
