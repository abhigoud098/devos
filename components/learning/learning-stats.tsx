"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/stat-card";
import { formatHours } from "@/lib/utils";
import { BookOpen, CheckCircle2, Timer, Star } from "lucide-react";

export function LearningStats() {
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  if (!topics) return null;

  const total = topics.length;
  const completed = topics.filter((t) => t.status === "completed").length;
  const totalHours = topics.reduce((sum, t) => sum + (t.hoursStudied || 0), 0);
  const avgConfidence = total
    ? (
        topics.reduce(
          (sum, t) =>
            sum + (typeof t.confidence === "number" ? t.confidence : 0),
          0,
        ) / total
      ).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        title="Topics Tracked"
        value={String(total)}
        icon={BookOpen}
        iconColor="text-blue-500 bg-blue-500/10"
      />
      <StatCard
        title="Completed"
        value={`${completed}/${total || 0}`}
        icon={CheckCircle2}
        iconColor="text-signal-high bg-signal-high/10"
      />
      <StatCard
        title="Total Study Hours"
        value={formatHours(totalHours)}
        icon={Timer}
        iconColor="text-amber-500 bg-amber-500/10"
      />
      <StatCard
        title="Avg. Confidence"
        value={`${avgConfidence}/5`}
        icon={Star}
        iconColor="text-accent bg-accent/10"
      />
    </div>
  );
}
