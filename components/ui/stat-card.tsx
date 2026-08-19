import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  iconColor?: string;
  badge?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconColor = "text-accent bg-accent/10",
  badge,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:border-base-borderStrong/80 hover:shadow-md",
        className,
      )}
      {...props}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
          {badge}
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-ink-muted">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{value}</p>
          {(description || trend) && (
            <p className="mt-1 text-[11px] text-ink-faint">
              {trend && <span className="text-signal-high font-medium mr-1">{trend}</span>}
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
