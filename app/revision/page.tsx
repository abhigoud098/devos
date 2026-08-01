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

  /*
LOAD DATA
*/

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

  /*
SAVE DATA
*/

  useEffect(() => {
    saveRevisionStats(stats);
  }, [stats]);

  useEffect(() => {
    saveRevisionHistory(history);
  }, [history]);

  /*
REVISION SUMMARY
*/

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

  /*
ONLY ACTIVE REVISION TOPICS
*/

  const activeRevisionTopics = useMemo(() => {
    return (
      topics?.filter(
        (topic) =>
          topic.needRevision &&
          topic.revisionSchedule.some((revision) => !revision.done),
      ) ?? []
    );
  }, [topics]);

  /*
ALL COMPLETED CHECK
*/

  const allRevisionCompleted =
    topics &&
    topics.length > 0 &&
    topics.every(
      (topic) =>
        !topic.needRevision ||
        topic.revisionSchedule.every((revision) => revision.done),
    );

  /*
STREAK
*/

  const streak = useMemo(() => {
    return calculateRevisionStreak(history);
  }, [history]);

  useEffect(() => {
    setStats((prev) => ({
      ...prev,

      streak,
    }));
  }, [streak]);

  /*
NOTIFICATION
*/

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

  /*
ADD HISTORY
*/

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
  /*
 UPDATE STATS
 */

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
            (totalCompleted / Math.max(totalCompleted, history.length + 1)) *
              100,
          ),
        ),

        lastCompletedDate: today,
      };
    });
  }

  /*
 COMPLETE REVISION
 */

  async function handleCompleteRevision(
    topic: DueRevision["topic"],

    entry: DueRevision["entry"],
  ) {
    const alreadyDone = history.some(
      (item) =>
        item.topicId === topic.id && item.revisionDay === entry.offsetDays,
    );

    if (alreadyDone) return;

    await markRevisionDone(
      topic.id,

      entry.date,
    );

    /*
 CHECK ALL REVISION COMPLETED
 */

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
      await db.learningTopics.update(
        topic.id,

        {
          needRevision: false,
        },
      );
    }

    addRevisionHistory(
      topic.id,

      topic.topic,

      topic.technology,

      entry.offsetDays,
    );

    updateRevisionStats();
  }

  /*
 ANALYTICS
 */

  const totalCompleted =
    topics?.reduce(
      (sum, topic) =>
        sum + topic.revisionSchedule.filter((revision) => revision.done).length,

      0,
    ) ?? 0;

  const totalRevision =
    topics?.reduce(
      (sum, topic) => sum + topic.revisionSchedule.length,

      0,
    ) ?? 0;

  const retention =
    totalRevision === 0
      ? 0
      : Math.round((totalCompleted / totalRevision) * 100);

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* ANALYTICS */}

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />

              <h2 className="text-xl font-semibold">Revision Calendar</h2>
            </div>

            <RevisionCalendar history={history} revisions={pendingRevisions} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />

              <h2 className="text-xl font-semibold">Retention Graph</h2>
            </div>

            <RetentionGraph history={history} />
          </CardContent>
        </Card>
      </section>

      {/* REVISION TRACKER */}

      <section>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Revision Progress</h2>

                <p className="text-muted-foreground">
                  Complete your revision cycles and strengthen memory.
                </p>
              </div>

              <Brain className="h-10 w-10" />
            </div>

            <div className="mt-8 space-y-6">
              {allRevisionCompleted ? (
                <div
                  className="
rounded-3xl
border
bg-muted/30
py-20
text-center
"
                >
                  <CheckCircle2
                    className="
mx-auto
h-16
w-16
text-emerald-500
"
                  />

                  <h3 className="mt-6 text-3xl font-bold">🎉 Amazing Work!</h3>

                  <p className="mt-3 text-muted-foreground">
                    You completed all revision cycles.
                    <br />
                    Your memory retention is getting stronger.
                  </p>

                  <div
                    className="
mt-6
inline-flex
items-center
gap-2
rounded-full
border
px-5
py-2
"
                  >
                    <Flame className="h-5 w-5" />
                    {streak} days learning streak
                  </div>
                </div>
              ) : (
                activeRevisionTopics.map((topic) => {
                  const completed = topic.revisionSchedule.filter(
                    (r) => r.done,
                  ).length;

                  const total = topic.revisionSchedule.length;

                  const progress =
                    total === 0 ? 0 : Math.round((completed / total) * 100);

                  const nextRevision = topic.revisionSchedule.find(
                    (r) => !r.done,
                  );

                  return (
                    <Card key={topic.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{topic.topic}</h3>

                            <p className="text-muted-foreground">
                              {topic.technology}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold">
                              {completed}/{total}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Completed
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="
h-full
bg-primary
transition-all
"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <div className="mt-6 space-y-3">
                          {topic.revisionSchedule

                            .filter((revision) => !revision.done)

                            .map((revision) => (
                              <div
                                key={revision.id}
                                className="
flex
items-center
justify-between
rounded-xl
border
p-4
"
                              >
                                <div className="flex items-center gap-3">
                                  <Clock3 className="h-5 w-5" />

                                  <div>
                                    <p className="font-medium">
                                      {revision.offsetDays === 0
                                        ? "Day 0 - First Review"
                                        : `Day ${revision.offsetDays}`}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      {format(
                                        new Date(revision.date),

                                        "dd MMM yyyy",
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {nextRevision?.id === revision.id && (
                                  <Button
                                    size="sm"
                                    className="
bg-emerald-600
text-white
"
                                    onClick={() =>
                                      handleCompleteRevision(
                                        topic,

                                        revision,
                                      )
                                    }
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Complete
                                  </Button>
                                )}
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
