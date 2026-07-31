"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteTopic } from "@/lib/learning-repo";
import { nextPendingRevision } from "@/lib/revision";
import { useLearningStore } from "@/store/learning-store";
import { ConfidenceMeter } from "./confidence-meter";
import { StatusBadge } from "./status-badge";
import { LearningEmptyState } from "./empty-state";
import { LearningSkeleton } from "./skeleton";
import { formatHours } from "@/lib/utils";

export function LearningTable() {
  const { search, statusFilter, technologyFilter, openCreateDialog, openEditDialog } =
    useLearningStore();

  const topics = useLiveQuery(() => db.learningTopics.orderBy("updatedAt").reverse().toArray(), []);

  const filtered = useMemo(() => {
    if (!topics) return undefined;
    return topics.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (technologyFilter !== "all" && t.technology !== technologyFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${t.technology} ${t.topic} ${t.subtopic ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [topics, search, statusFilter, technologyFilter]);

  if (filtered === undefined) return <LearningSkeleton />;
  if (topics && topics.length === 0) return <LearningEmptyState onCreate={openCreateDialog} />;
  if (filtered.length === 0) {
    return (
      <p className="text-center text-[13px] text-ink-muted py-16">
        No topics match your filters.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-base-border">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-base-border bg-base-raised/60 text-[11.5px] uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-2.5 font-medium">Topic</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Confidence</th>
            <th className="px-4 py-2.5 font-medium">Hours</th>
            <th className="px-4 py-2.5 font-medium">Next revision</th>
            <th className="px-4 py-2.5 font-medium w-16" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => {
            const next = nextPendingRevision(t.revisionSchedule);
            return (
              <tr
                key={t.id}
                className="border-b border-base-border last:border-0 bg-base-raised hover:bg-base-elevated/50 transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{t.topic}</div>
                  <div className="text-[12px] text-ink-faint font-mono">
                    {t.technology}
                    {t.subtopic ? ` · ${t.subtopic}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3">
                  <ConfidenceMeter level={t.confidence} />
                </td>
                <td className="px-4 py-3 font-mono text-ink-muted">
                  {formatHours(t.hoursStudied)}
                </td>
                <td className="px-4 py-3 font-mono text-ink-muted">
                  {next ? format(parseISO(next.date), "MMM d") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      aria-label={`Edit ${t.topic}`}
                      onClick={() => openEditDialog(t.id)}
                      className="rounded-md p-1.5 text-ink-muted hover:text-ink hover:bg-base-border/50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label={`Delete ${t.topic}`}
                      onClick={() => deleteTopic(t.id)}
                      className="rounded-md p-1.5 text-ink-muted hover:text-signal-low hover:bg-signal-low/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
