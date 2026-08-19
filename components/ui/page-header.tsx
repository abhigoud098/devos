import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  kicker,
  title,
  description,
  children,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-base-border/70 mb-6",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        {kicker && (
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            {kicker}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-ink-muted max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
