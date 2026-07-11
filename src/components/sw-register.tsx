"use client";

// Registers the service worker (production only) — the install layer of the PWA.

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // No SW = no offline shell; the app still works.
    });
  }, []);
  return null;
}
