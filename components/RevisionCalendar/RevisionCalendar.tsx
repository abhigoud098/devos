"use client";

import { Calendar } from "@/components/ui/calendar";

type Props = {
  history: any[];
  revisions: any[];
};

export default function RevisionCalendar({ history, revisions }: Props) {
  const completedDates = history.map((item) => new Date(item.reviewedAt));

  const pendingDates = revisions.map((item) => new Date(item.entry.date));

  return (
    <div className="rounded-xl border p-4">
      <Calendar
        mode="multiple"
        selected={[...completedDates, ...pendingDates]}
        className="rounded-md"
      />

      <div className="mt-4 space-y-2 text-sm">
        <div>🟢 Completed Reviews</div>

        <div>🟡 Upcoming Reviews</div>
      </div>
    </div>
  );
}
