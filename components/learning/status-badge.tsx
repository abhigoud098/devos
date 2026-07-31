import { Badge } from "@/components/ui/badge";
import type { LearningStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const CONFIG: Record<LearningStatus, { label: string; className: string }> = {
  "not-started": { label: "Not started", className: "bg-base-elevated text-ink-muted" },
  "in-progress": { label: "In progress", className: "bg-accent/15 text-accent-strong" },
  completed: { label: "Completed", className: "bg-signal-high/15 text-signal-high" },
  revising: { label: "Revising", className: "bg-signal-mid/15 text-signal-mid" },
};

export function StatusBadge({ status }: { status: LearningStatus }) {
  const { label, className } = CONFIG[status];
  return <Badge className={cn(className)}>{label}</Badge>;
}
