import Link from "next/link";

// 404 in system styling — even the dead ends stay in voice.

export default function NotFound() {
  return (
    <div className="atmosphere grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-md">
        <p className="type-mono text-[0.6875rem] uppercase tracking-[0.3em] text-muted">not in the record</p>
        <h1 className="type-display mt-3 text-[2.5rem] leading-tight">404</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          Only what is written exists — and this page isn&apos;t written.
        </p>
        <Link
          href="/today"
          className="mt-6 inline-block rounded-[var(--radius-sm)] border border-accent bg-accent/10 px-6 py-3 text-[0.9375rem] font-medium text-ink"
        >
          Back to Today
        </Link>
      </div>
    </div>
  );
}
