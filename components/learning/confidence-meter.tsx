import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/types";

const HEIGHTS = ["h-1.5", "h-2.5", "h-3.5", "h-4.5", "h-5.5"];

function tone(level: Confidence) {
  if (typeof level === "number" && level <= 2) return "bg-signal-low";
  if (level === 3) return "bg-signal-mid";
  return "bg-signal-high";
}

/**
 * Renders confidence (1–5) as five ascending signal bars, filled up to `level`.
 * Reads like a terminal/network signal indicator — deliberately not a progress
 * ring or a percentage, since confidence here is a felt, discrete rating.
 */
export function ConfidenceMeter({ level, className }: { level: Confidence; className?: string }) {
  const numericLevel = typeof level === "number" ? level : 0;
  return (
    <div className={cn("flex items-end gap-[3px]", className)} title={`Confidence ${level}/5`}>
      {HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-[3.5px] rounded-sm",
            h,
            i < numericLevel ? tone(level) : "bg-base-border"
          )}
        />
      ))}
    </div>
  );
}
