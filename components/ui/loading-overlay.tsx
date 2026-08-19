"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Brain } from "lucide-react";

export function LoadingOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    const start = Date.now();
    const duration = 600;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);

    const timeout = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 700);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <Brain className="h-12 w-12 animate-pulse text-accent" />
          <div className="absolute -inset-4 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-ink">DevOS</p>
          <p className="text-xs text-ink-muted mt-0.5">Loading your workspace…</p>
        </div>

        <div className="h-1 w-40 overflow-hidden rounded-full bg-base-border">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
