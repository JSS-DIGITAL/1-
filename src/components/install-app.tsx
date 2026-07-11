"use client";

// "Install the app" — captures the browser's install prompt (Chromium) and
// falls back to Add-to-Home-Screen instructions on iOS. Renders nothing when
// already installed or unsupported-and-not-iOS.

import { useEffect, useState } from "react";
import { Button } from "./ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallApp() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return <p className="type-mono text-[0.75rem] text-muted">installed — you&apos;re running the app.</p>;
  }
  if (deferred) {
    return (
      <Button
        variant="ghost"
        onClick={async () => {
          await deferred.prompt();
          setDeferred(null);
        }}
      >
        Install the app
      </Button>
    );
  }
  if (isIos) {
    return (
      <p className="text-[0.8125rem] text-muted">
        On iPhone: tap <span className="text-ink">Share</span> →{" "}
        <span className="text-ink">Add to Home Screen</span> — full screen, its own icon, works offline.
      </p>
    );
  }
  return (
    <p className="text-[0.8125rem] text-muted">
      In Chrome or Edge, use the browser menu → <span className="text-ink">Install app</span>.
    </p>
  );
}
