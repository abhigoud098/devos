"use client";

import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  history: any[];
  revisions: any[];
};

export default function RevisionCalendar({ history, revisions }: Props) {
  const completedDates = useMemo(() => {
    return (history || []).map((item) => new Date(item.reviewedAt));
  }, [history]);

  const pendingDates = useMemo(() => {
    return (revisions || []).map((item) => new Date(item.entry.date));
  }, [revisions]);

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-full flex justify-center overflow-x-auto py-1">
        <Calendar
          mode="multiple"
          selected={[...completedDates, ...pendingDates]}
          className="w-full max-w-full"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-base-border/60 w-full">
        <div className="flex items-center gap-2 font-medium text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-high ring-2 ring-signal-high/20" />
          <span>Completed ({completedDates.length})</span>
        </div>

        <div className="flex items-center gap-2 font-medium text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
          <span>Upcoming ({pendingDates.length})</span>
        </div>
      </div>
    </div>
  );
}
