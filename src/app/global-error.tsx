"use client";

// Root-level boundary (replaces the whole document when layout itself fails).

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0c0b", color: "#e8ece9", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>Something broke. The record didn&apos;t.</h1>
            <p style={{ opacity: 0.7, lineHeight: 1.5, marginBottom: 24 }}>
              Your entries live on this device and survive this. Reload to continue.
            </p>
            <button
              onClick={reset}
              style={{
                background: "#45b683",
                color: "#08120c",
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
