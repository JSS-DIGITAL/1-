"use client";

import { useReducedMotion } from "framer-motion";

/** OS-level prefers-reduced-motion, plus a `?rm=1` override so the static
 *  variants can be exercised and audited without changing OS settings. */
export function usePrefersReduced(): boolean {
  const os = useReducedMotion();
  const forced =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("rm");
  return Boolean(os) || forced;
}
