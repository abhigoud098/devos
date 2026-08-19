"use client";

import { useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Brain,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

import { db } from "@/lib/db";
import { deleteTopic, updateTopic } from "@/lib/learning-repo";
import { useLearningStore } from "@/store/learning-store";
import { StatusBadge } from "@/components/learning/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type Props = {
  onAddRevision: (topic: {
    id: string;
    technology: string;
    topic: string;
  }) => void;
  highlightId?: string | null;
};

export function LearningTable({ onAddRevision, highlightId }: Props) {
  const { search, statusFilter, technologyFilter, openEditDialog, openCreateDialog } =
    useLearningStore();
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  const rawTopics = useLiveQuery(
    () =>
      db.learningTopics
        .filter((item) => {
          const revisionCompleted =
            item.revisionSchedule?.length > 0 &&
            item.revisionSchedule.every((revision) => revision.done);
          return !revisionCompleted;
        })
        .toArray(),
    [],
  );

  const topics = rawTopics?.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTech = item.technology.toLowerCase().includes(q);
      const matchTopic = item.topic.toLowerCase().includes(q);
      const matchSub = item.subtopic?.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchTech && !matchTopic && !matchSub && !matchNotes) {
        return false;
      }
    }

    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }

    if (technologyFilter !== "all" && item.technology !== technologyFilter) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (highlightId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightId, topics]);

  if (!topics) {
    return (
      <div className="py-12 text-center text-xs text-ink-muted">
        Loading learning topics...
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={
          search || statusFilter !== "all" || technologyFilter !== "all"
            ? "No matching topics found"
            : "No active learning topics yet"
        }
        description={
          search || statusFilter !== "all" || technologyFilter !== "all"
            ? "Try resetting your search query or filters to see more results."
            : "Track technologies, study schedules, and spaced repetition by adding your first topic."
        }
        action={
          <Button size="sm" onClick={openCreateDialog}>
            Add First Topic
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. MOBILE CARD VIEW (Visible on mobile/tablet) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {topics.map((item) => {
          const isHighlighted = highlightId === item.id;
          let formattedSchedule = "Not scheduled";

          if (item.scheduledDate) {
            try {
              const dateObj = parseISO(item.scheduledDate);
              if (isToday(dateObj)) {
                formattedSchedule = item.scheduledTime
                  ? `Today at ${item.scheduledTime}`
                  : "Today";
              } else if (isTomorrow(dateObj)) {
                formattedSchedule = item.scheduledTime
                  ? `Tomorrow at ${item.scheduledTime}`
                  : "Tomorrow";
              } else {
                formattedSchedule = format(dateObj, "MMM d, yyyy");
              }
            } catch (e) {
              formattedSchedule = item.scheduledDate;
            }
          }

          return (
            <div
              key={item.id}
              ref={isHighlighted ? highlightedRef : undefined}
              className={cn(
                "rounded-2xl border border-base-border/80 bg-base-raised/60 p-4 space-y-3 transition-all",
                isHighlighted && "ring-2 ring-accent border-accent/40 bg-accent/5",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded-md bg-base-elevated px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                    {item.technology}
                  </span>
                  <h3 className="font-bold text-sm text-ink mt-1.5 flex items-center gap-1.5">
                    {item.topic}
                    {isHighlighted && (
                      <span className="rounded-full bg-accent px-1.5 py-0.2 text-[9px] text-white font-bold">
                        Selected
                      </span>
                    )}
                  </h3>
                  {item.subtopic && (
                    <p className="text-xs text-ink-muted mt-0.5">{item.subtopic}</p>
                  )}
                </div>

                <StatusBadge status={item.status} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-base-border/60 text-xs">
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  <span>{formattedSchedule}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-ink-muted"
                    onClick={() => openEditDialog(item.id)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-accent"
                    onClick={() =>
                      onAddRevision({
                        id: item.id,
                        technology: item.technology,
                        topic: item.topic,
                      })
                    }
                  >
                    <Brain className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-signal-low"
                    onClick={async () => {
                      if (window.confirm(`Delete topic "${item.topic}"?`)) {
                        await deleteTopic(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. DESKTOP TABLE VIEW (Visible on md and up) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-base-border/70 bg-card/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-base-border/80 text-xs text-ink-muted bg-base-elevated/40">
              <th className="p-3.5 font-semibold">Technology</th>
              <th className="p-3.5 font-semibold">Topic & Subtopic</th>
              <th className="p-3.5 font-semibold">Scheduled Study</th>
              <th className="p-3.5 font-semibold">Status</th>
              <th className="p-3.5 font-semibold">Confidence</th>
              <th className="p-3.5 font-semibold">Hours</th>
              <th className="p-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-base-border/60">
            {topics.map((item) => {
              const isHighlighted = highlightId === item.id;
              let formattedSchedule = "Not scheduled";
              let scheduleBadgeClass = "text-ink-faint bg-base-elevated/50";

              if (item.scheduledDate) {
                try {
                  const dateObj = parseISO(item.scheduledDate);
                  if (isToday(dateObj)) {
                    formattedSchedule = item.scheduledTime
                      ? `Today • ${item.scheduledTime}`
                      : "Today";
                    scheduleBadgeClass = "text-accent bg-accent/15 font-semibold";
                  } else if (isTomorrow(dateObj)) {
                    formattedSchedule = item.scheduledTime
                      ? `Tomorrow • ${item.scheduledTime}`
                      : "Tomorrow";
                    scheduleBadgeClass = "text-blue-400 bg-blue-500/15";
                  } else {
                    const dateStr = format(dateObj, "MMM d, yyyy");
                    formattedSchedule = item.scheduledTime
                      ? `${dateStr} • ${item.scheduledTime}`
                      : dateStr;
                    scheduleBadgeClass = "text-ink-muted bg-base-elevated";
                  }
                } catch (e) {
                  formattedSchedule = item.scheduledDate;
                }
              }

              return (
                <tr
                  key={item.id}
                  ref={isHighlighted ? (highlightedRef as any) : undefined}
                  className={cn(
                    "transition-colors",
                    isHighlighted
                      ? "bg-accent/15 ring-2 ring-accent ring-inset"
                      : "hover:bg-base-elevated/40",
                  )}
                >
                  <td className="p-3.5 font-semibold text-ink">
                    <span className="rounded-md bg-base-elevated px-2.5 py-1 text-xs text-ink font-medium">
                      {item.technology}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="font-medium text-ink flex items-center gap-2">
                      {item.topic}
                      {isHighlighted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                          <Sparkles className="h-3 w-3" />
                          Selected
                        </span>
                      )}
                    </div>
                    {item.subtopic && (
                      <div className="text-xs text-ink-muted mt-0.5">{item.subtopic}</div>
                    )}
                  </td>

                  <td className="p-3.5">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs",
                        scheduleBadgeClass,
                      )}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formattedSchedule}</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="p-3.5">
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                      {item.confidence === "NA" ? "N/A" : `${item.confidence}/5`}
                    </span>
                  </td>

                  <td className="p-3.5 text-xs font-mono text-ink-muted">
                    {item.hoursStudied ? `${item.hoursStudied}h` : "0h"}
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Edit topic"
                        className="h-8 w-8 p-0 text-ink-muted hover:text-ink hover:bg-base-elevated"
                        onClick={() => openEditDialog(item.id)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        title="Add revision cycle"
                        className="h-8 w-8 p-0 text-accent hover:bg-accent/10"
                        onClick={() =>
                          onAddRevision({
                            id: item.id,
                            technology: item.technology,
                            topic: item.topic,
                          })
                        }
                      >
                        <Brain className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        title="Delete topic"
                        className="h-8 w-8 p-0 text-signal-low hover:bg-signal-low/10"
                        onClick={async () => {
                          if (window.confirm(`Delete topic "${item.topic}"?`)) {
                            await deleteTopic(item.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
