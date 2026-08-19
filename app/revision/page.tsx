"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  Brain,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Target,
} from "lucide-react";

import { db } from "@/lib/db";
import { getRevisionSummary, type DueRevision } from "@/lib/revision";
import { markRevisionDone } from "@/lib/learning-repo";
import {
  requestRevisionNotificationPermission,
  sendRevisionNotification,
} from "@/lib/revision-notification";
import { calculateRevisionStreak } from "@/lib/revision-streak";
import {
  getRevisionHistory,
  getRevisionStats,
  saveRevisionHistory,
  saveRevisionStats,
} from "@/lib/revision-storage";

import RevisionCalendar from "@/components/RevisionCalendar/RevisionCalendar";
import RetentionGraph from "@/components/RetentionGraph/RetentionGraph";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

type RevisionStats = {
  completedToday: number;
  totalCompleted: number;
  streak: number;
  accuracy: number;
  lastCompletedDate: string | null;
};

type RevisionHistory = {
  id: string;
  topicId: string;
  topic: string;
  technology: string;
  reviewedAt: string;
  revisionDay: number;
};

const DEFAULT_STATS: RevisionStats = {
  completedToday: 0,
  totalCompleted: 0,
  streak: 0,
  accuracy: 0,
  lastCompletedDate: null,
};

export default function RevisionPage() {
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);
  const [stats, setStats] = useState<RevisionStats>(DEFAULT_STATS);
  const [history, setHistory] = useState<RevisionHistory[]>([]);

  useEffect(() => {
    const savedStats = getRevisionStats();
    const savedHistory = getRevisionHistory();

    if (savedStats) {
      const today = new Date().toISOString().split("T")[0];
      if (savedStats.lastCompletedDate !== today) {
        setStats({
          ...savedStats,
          completedToday: 0,
          accuracy: 0,
        });
      } else {
        setStats(savedStats);
      }
    }

    if (savedHistory) {
      setHistory(savedHistory);
    }
  }, []);

  useEffect(() => {
    saveRevisionStats(stats);
  }, [stats]);

  useEffect(() => {
    saveRevisionHistory(history);
  }, [history]);

  const summary = useMemo(() => {
    if (!topics) {
      return {
        dueToday: [],
        overdue: [],
        upcoming: [],
        completed: [],
      };
    }
    return getRevisionSummary(topics);
  }, [topics]);

  const pendingRevisions: DueRevision[] = [
    ...summary.dueToday,
    ...summary.overdue,
  ];

  const activeRevisionTopics = useMemo(() => {
    return (
      topics?.filter(
        (topic) =>
          topic.needRevision &&
          topic.revisionSchedule.some((revision) => !revision.done),
      ) ?? []
    );
  }, [topics]);

  const allRevisionCompleted =
    topics &&
    topics.length > 0 &&
    topics.every(
      (topic) =>
        !topic.needRevision ||
        topic.revisionSchedule.every((revision) => revision.done),
    );

  const streak = useMemo(() => {
    return calculateRevisionStreak(history);
  }, [history]);

  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      streak,
    }));
  }, [streak]);

  useEffect(() => {
    async function notify() {
      const allowed = await requestRevisionNotificationPermission();
      if (!allowed) return;

      const data = await db.learningTopics.toArray();
      const result = getRevisionSummary(data);
      const count = result.dueToday.length + result.overdue.length;
      if (count) {
        sendRevisionNotification(count);
      }
    }
    notify();
  }, []);

  function addRevisionHistory(
    topicId: string,
    topic: string,
    technology: string,
    revisionDay: number,
  ) {
    const item: RevisionHistory = {
      id: crypto.randomUUID(),
      topicId,
      topic,
      technology,
      reviewedAt: new Date().toISOString(),
      revisionDay,
    };
    setHistory((prev) => [item, ...prev]);
  }

  function updateRevisionStats() {
    const today = new Date().toISOString().split("T")[0];
    setStats((prev) => {
      const totalCompleted = prev.totalCompleted + 1;
      return {
        ...prev,
        completedToday: prev.completedToday + 1,
        totalCompleted,
        accuracy: Math.min(
          100,
          Math.round(
            (totalCompleted / Math.max(totalCompleted, history.length + 1)) * 100,
          ),
        ),
        lastCompletedDate: today,
      };
    });
  }

  async function handleCompleteRevision(
    topic: DueRevision["topic"],
    entry: DueRevision["entry"],
  ) {
    const alreadyDone = history.some(
      (item) =>
        item.topicId === topic.id && item.revisionDay === entry.offsetDays,
    );
    if (alreadyDone) return;

    await markRevisionDone(topic.id, entry.date);

    const updatedSchedule = topic.revisionSchedule.map((revision) =>
      revision.id === entry.id
        ? {
            ...revision,
            done: true,
          }
        : revision,
    );

    const completedAll = updatedSchedule.every((revision) => revision.done);
    if (completedAll) {
      await db.learningTopics.update(topic.id, {
        needRevision: false,
      });
    }

    addRevisionHistory(
      topic.id,
      topic.topic,
      topic.technology,
      entry.offsetDays,
    );

    updateRevisionStats();
  }

  const totalCompleted =
    topics?.reduce(
      (sum, topic) =>
        sum + topic.revisionSchedule.filter((revision) => revision.done).length,
      0,
    ) ?? 0;

  const totalRevision =
    topics?.reduce((sum, topic) => sum + topic.revisionSchedule.length, 0) ?? 0;

  const retention =
    totalRevision === 0
      ? 0
      : Math.round((totalCompleted / totalRevision) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Memory Engine"
        title="Smart Revision"
        description="Strengthen long-term retention using spaced repetition algorithms. Review topics at the optimal moment of forgetting."
      />

      {/* 2. STATS */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Due Today"
          value={summary.dueToday.length}
          icon={CalendarClock}
          iconColor="text-accent bg-accent/10"
        />
        <StatCard
          title="Completed Total"
          value={totalCompleted}
          icon={CheckCircle2}
          iconColor="text-signal-high bg-signal-high/10"
        />
        <StatCard
          title="Active Streak"
          value={`${stats.streak}d`}
          icon={Flame}
          iconColor="text-orange-500 bg-orange-500/10"
        />
        <StatCard
          title="Retention Rate"
          value={`${retention}%`}
          icon={TrendingUp}
          iconColor="text-blue-500 bg-blue-500/10"
        />
      </section>

      {/* 3. CALENDAR & RETENTION CHARTS */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2 pb-3 border-b border-base-border/70">
              <CalendarDays className="h-4 w-4 text-accent" />
              <h2 className="text-base font-bold text-ink">Revision Calendar</h2>
            </div>
            <RevisionCalendar history={history} revisions={pendingRevisions} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2 pb-3 border-b border-base-border/70">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <h2 className="text-base font-bold text-ink">Retention Curve</h2>
            </div>
            <RetentionGraph history={history} />
          </CardContent>
        </Card>
      </section>

      {/* 4. ACTIVE REVISION PROGRESS & TOPICS */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-base-border/70 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Spaced Repetition Queue</h2>
                <p className="text-xs text-ink-muted">
                  Follow Leitner revision intervals: Day 0, Day 1, Day 3, Day 7, Day 14, Day 30.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {allRevisionCompleted ? (
              <EmptyState
                icon={CheckCircle2}
                title="All revision cycles completed! 🎉"
                description="Your memory retention is rock solid. Add new topics from the Learning Hub to start another cycle."
              />
            ) : activeRevisionTopics.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="No active revisions scheduled"
                description="When adding or editing a topic in the Learning Hub, toggle 'Need Revision?' to automatically create spaced repetition cycles."
              />
            ) : (
              activeRevisionTopics.map((topic) => {
                const completed = topic.revisionSchedule.filter((r) => r.done).length;
                const total = topic.revisionSchedule.length;
                const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
                const nextRevision = topic.revisionSchedule.find((r) => !r.done);

                return (
                  <div
                    key={topic.id}
                    className="rounded-2xl border border-base-border/80 bg-base-raised/40 p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="rounded-md bg-base-elevated px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                          {topic.technology}
                        </span>
                        <h3 className="font-bold text-base text-ink mt-1">{topic.topic}</h3>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-semibold text-ink">
                          {completed}/{total} cycles
                        </span>
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-elevated">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Schedule Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {topic.revisionSchedule
                        .filter((revision) => !revision.done)
                        .map((revision) => {
                          const isNext = nextRevision?.id === revision.id;

                          return (
                            <div
                              key={revision.id}
                              className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                                isNext
                                  ? "border-accent/40 bg-accent/5 ring-1 ring-accent/20"
                                  : "border-base-border/70 bg-base-raised/60"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Clock3 className={`h-4 w-4 shrink-0 ${isNext ? "text-accent" : "text-ink-muted"}`} />
                                <div className="truncate">
                                  <p className="font-semibold text-ink truncate">
                                    {revision.offsetDays === 0 ? "First Review" : `Day +${revision.offsetDays}`}
                                  </p>
                                  <p className="text-[10px] text-ink-muted">
                                    {format(new Date(revision.date), "MMM d, yyyy")}
                                  </p>
                                </div>
                              </div>

                              {isNext && (
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 text-xs gap-1 bg-signal-high text-white hover:bg-signal-high/90 shrink-0"
                                  onClick={() => handleCompleteRevision(topic, revision)}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Done
                                </Button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
