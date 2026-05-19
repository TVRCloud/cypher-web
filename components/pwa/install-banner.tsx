"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/_ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";

const DISMISSED_KEY = "pwa-banner-dismissed";

export function InstallBanner() {
  const { installState, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(DISMISSED_KEY);
  });

  const visible = installState === "available" && !dismissed;

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }

  async function handleInstall() {
    await install();
    setVisible(false);
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Download size={15} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Install Cypher</p>
          <p className="text-xs text-muted-foreground">Add to your home screen for quick access</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" onClick={() => void handleInstall()} className="h-7 text-xs px-3">
            Install
          </Button>
          <button
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
