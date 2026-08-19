import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-base-border bg-base-raised/30 p-8 text-center",
        className,
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-elevated text-ink-muted ring-1 ring-base-border">
        <Icon className="h-6 w-6 text-accent" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-ink-muted max-w-sm leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
