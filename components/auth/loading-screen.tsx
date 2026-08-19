"use client";

import { Brain } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <Brain className="h-12 w-12 animate-pulse text-accent" />
          <div className="absolute -inset-4 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-ink">DevOS</p>
          <p className="text-xs text-ink-muted mt-0.5">Loading your workspace…</p>
        </div>
      </div>
    </main>
  );
}
