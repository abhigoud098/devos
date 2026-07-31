"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatHours } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-[12px] text-ink-muted mb-1.5">{label}</p>
        <p className="text-2xl font-mono font-medium text-ink">{value}</p>
      </CardContent>
    </Card>
  );
}

export function LearningStats() {
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  if (!topics) return null;

  const total = topics.length;
  const completed = topics.filter((t) => t.status === "completed").length;
  const totalHours = topics.reduce((sum, t) => sum + t.hoursStudied, 0);
  const avgConfidence = total
    ? (topics.reduce((sum, t) => sum + t.confidence, 0) / total).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat label="Topics tracked" value={String(total)} />
      <Stat label="Completed" value={`${completed}/${total || 0}`} />
      <Stat label="Total hours" value={formatHours(totalHours)} />
      <Stat label="Avg. confidence" value={`${avgConfidence}/5`} />
    </div>
  );
}
