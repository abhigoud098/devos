"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format, isToday, isPast } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  Brain,
  Target,
  TrendingUp,
  History,
  RotateCcw,
  CalendarDays,
  BarChart3,
} from "lucide-react";

import { db } from "@/lib/db";
import { collectDueRevisions } from "@/lib/revision";
import { markRevisionDone } from "@/lib/learning-repo";
import {
  requestRevisionNotificationPermission,
  sendRevisionNotification,
} from "@/lib/revision-notification";
import { calculateRevisionStreak } from "@/lib/revision-streak";
import RevisionCalendar from "@/components/RevisionCalendar/RevisionCalendar";
import RetentionGraph from "@/components/RetentionGraph/RetentionGraph";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function RevisionPage() {
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  const [stats, setStats] = useState<RevisionStats>({
    completedToday: 0,
    totalCompleted: 0,
    streak: 0,
    accuracy: 0,
    lastCompletedDate: null,
  });

  const [history, setHistory] = useState<RevisionHistory[]>([]);

  const revisions = topics ? collectDueRevisions(topics) : [];

  const dueToday = useMemo(
    () => revisions.filter((r) => isToday(new Date(r.entry.date))),
    [revisions],
  );

  const overdue = useMemo(
    () =>
      revisions.filter(
        (r) =>
          isPast(new Date(r.entry.date)) && !isToday(new Date(r.entry.date)),
      ),
    [revisions],
  );

  const totalTopics = topics?.length ?? 0;

  /*
    LOAD DATA
  */

  useEffect(() => {
    const savedStats = localStorage.getItem("revision-stats");

    const savedHistory = localStorage.getItem("revision-history");

    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  /*
    SAVE DATA
  */

  useEffect(() => {
    localStorage.setItem("revision-stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("revision-history", JSON.stringify(history));
  }, [history]);

  /*
    NOTIFICATION CHECK
  */

  useEffect(() => {
    async function checkReminder() {
      const allowed = await requestRevisionNotificationPermission();

      if (!allowed) return;

      const data = await db.learningTopics.toArray();

      const pending = collectDueRevisions(data);

      if (pending.length) {
        sendRevisionNotification(pending.length);
      }
    }

    checkReminder();
  }, []);

  /*
    REAL STREAK
  */

  const realStreak = useMemo(() => {
    return calculateRevisionStreak(history);
  }, [history]);

  /*
    UPDATE STREAK DISPLAY
  */

  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      streak: realStreak,
    }));
  }, [realStreak]);

  const completedToday = stats.completedToday;

  const streak = stats.streak;

  const accuracy = stats.accuracy;

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
      const completed = prev.completedToday + 1;

      return {
        ...prev,

        completedToday: completed,

        totalCompleted: prev.totalCompleted + 1,

        accuracy:
          dueToday.length === 0
            ? 100
            : Math.min(100, Math.round((completed / dueToday.length) * 100)),

        lastCompletedDate: today,
      };
    });
  }

  function resetTodayStats() {
    setStats((prev) => ({
      ...prev,

      completedToday: 0,

      accuracy: 0,
    }));
  }
  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* HERO */}

      <section className="mb-8 rounded-3xl border bg-card p-8">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          <Brain className="h-4 w-4" />
          Smart Revision Workspace
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight">
          Keep Your Knowledge Fresh
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Smart spaced repetition system with calendar tracking, retention
          analytics and learning streak.
        </p>
      </section>

      {/* TOP STATS */}

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <CalendarClock className="mb-3 h-6 w-6 text-primary" />

            <p className="text-sm text-muted-foreground">Due Today</p>

            <h2 className="text-3xl font-bold mt-2">{dueToday.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <CheckCircle2 className="mb-3 h-6 w-6 text-green-500" />

            <p className="text-sm text-muted-foreground">Completed</p>

            <h2 className="text-3xl font-bold mt-2">{completedToday}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Flame className="mb-3 h-6 w-6 text-orange-500" />

            <p className="text-sm text-muted-foreground">Revision Streak</p>

            <h2 className="text-3xl font-bold mt-2">{streak} Days</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="mb-3 h-6 w-6 text-blue-500" />

            <p className="text-sm text-muted-foreground">Accuracy</p>

            <h2 className="text-3xl font-bold mt-2">{accuracy}%</h2>
          </CardContent>
        </Card>
      </section>

      {/* ANALYTICS */}

      <section className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <CalendarDays className="h-5 w-5" />

              <h2 className="font-semibold text-xl">Revision Calendar</h2>
            </div>

            <RevisionCalendar history={history} revisions={revisions} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5" />

              <h2 className="font-semibold text-xl">Retention Graph</h2>
            </div>

            <RetentionGraph history={history} />
          </CardContent>
        </Card>
      </section>

      {/* REVISION LIST */}

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Revision Queue</h2>

                <p className="text-muted-foreground mt-1">
                  Complete pending reviews to strengthen memory.
                </p>
              </div>

              <Target className="h-10 w-10 text-primary" />
            </div>

            <div className="mt-8 space-y-4">
              {revisions.length === 0 ? (
                <div className="rounded-2xl border border-dashed py-16 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />

                  <h3 className="text-xl font-semibold">All caught up 🎉</h3>

                  <p className="text-muted-foreground mt-2">
                    No revision pending.
                  </p>
                </div>
              ) : (
                revisions.map(({ topic, entry }) => {
                  const dueDate = new Date(entry.date);

                  return (
                    <Card key={`${topic.id}-${entry.date}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                          <div>
                            <div className="flex gap-3 items-center">
                              <h3 className="text-xl font-semibold">
                                {topic.topic}
                              </h3>

                              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                                Day {entry.offsetDays}
                              </span>
                            </div>

                            <p className="text-muted-foreground mt-2">
                              {topic.technology}
                            </p>

                            <div className="flex gap-2 mt-3 text-sm text-muted-foreground">
                              <Clock3 className="h-4 w-4" />

                              {format(dueDate, "dd MMM yyyy")}
                            </div>
                          </div>

                          <Button
                            className="bg-emerald-600 text-white"
                            onClick={async () => {
                              const exists = history.some(
                                (item) =>
                                  item.topicId === topic.id &&
                                  item.revisionDay === entry.offsetDays,
                              );

                              if (exists) return;

                              await markRevisionDone(topic.id, entry.date);

                              addRevisionHistory(
                                topic.id,
                                topic.topic,
                                topic.technology,
                                entry.offsetDays,
                              );

                              updateRevisionStats();
                            }}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Reviewed
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT SIDEBAR */}

        <div className="space-y-6">
          {/* DAILY GOAL */}

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold">Today's Goal</h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {completedToday} of {dueToday.length} revisions completed
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${
                      dueToday.length === 0
                        ? 100
                        : Math.min(
                            100,
                            (completedToday / dueToday.length) * 100,
                          )
                    }%`,
                  }}
                />
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={resetTodayStats}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Today
              </Button>
            </CardContent>
          </Card>

          {/* STREAK */}

          <Card>
            <CardContent className="p-6 text-center">
              <Flame className="mx-auto mb-4 h-12 w-12 text-orange-500" />

              <h3 className="text-5xl font-bold">{streak}</h3>

              <p className="text-muted-foreground mt-2">
                Consecutive revision days
              </p>
            </CardContent>
          </Card>

          {/* ACHIEVEMENTS */}

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Achievements</h3>

              <div className="space-y-3">
                <div className="rounded-xl border p-4">
                  🏆 {stats.totalCompleted}/100 Reviews
                </div>

                <div className="rounded-xl border p-4">
                  🔥 {streak}/7 Day Streak
                </div>

                <div className="rounded-xl border p-4">🧠 Memory Builder</div>
              </div>
            </CardContent>
          </Card>

          {/* QUICK STATS */}

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Topics</span>

                  <b>{totalTopics}</b>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Today</span>

                  <b>{dueToday.length}</b>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overdue</span>

                  <b className="text-red-500">{overdue.length}</b>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Reviews</span>

                  <b>{stats.totalCompleted}</b>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HISTORY */}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5" />

                <h3 className="font-semibold">Recent Reviews</h3>
              </div>

              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No history yet.
                  </p>
                ) : (
                  history.slice(0, 5).map((item) => (
                    <div key={item.id} className="rounded-xl border p-3">
                      <p className="font-medium">{item.topic}</p>

                      <p className="text-xs text-muted-foreground">
                        {item.technology}
                        {" • "}
                        Day {item.revisionDay}
                      </p>

                      <p className="text-xs mt-1 text-muted-foreground">
                        {format(
                          new Date(item.reviewedAt),

                          "dd MMM yyyy HH:mm",
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
