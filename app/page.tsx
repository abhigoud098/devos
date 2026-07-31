"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, Flame, Target, Clock3, BookOpen } from "lucide-react";

import { db } from "@/lib/db";
import { collectDueRevisions } from "@/lib/revision";
import { formatHours } from "@/lib/utils";
import type { LearningTopic, RevisionEntry } from "@/lib/types";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function calculateStreak(topics: LearningTopic[]) {
  const days = new Set<string>();

  topics.forEach((topic) => {
    if (topic.lastStudied) {
      days.add(topic.lastStudied.slice(0, 10));
    }
  });

  let streak = 0;
  const today = new Date();

  while (true) {
    const date = new Date(today);
    date.setDate(today.getDate() - streak);

    const key = date.toISOString().slice(0, 10);

    if (days.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default function DashboardPage() {
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  if (!topics) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-muted-foreground">Loading DevOS dashboard...</p>
      </main>
    );
  }

  const allTopics = topics;

  const dueRevisions = collectDueRevisions(allTopics);

  const totalHours = allTopics.reduce(
    (total, topic) => total + topic.hoursStudied,
    0,
  );

  const completedTopics = allTopics.filter(
    (topic) => topic.status === "completed",
  ).length;

  const progress =
    allTopics.length === 0
      ? 0
      : Math.round((completedTopics / allTopics.length) * 100);

  const inProgress = allTopics.filter(
    (topic) => topic.status === "in-progress" || topic.status === "revising",
  ).length;

  const streak = calculateStreak(allTopics);

  const latestTopic = [...allTopics].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];

  async function completeRevision(topicId: string, revisionDate: string) {
    const topic = await db.learningTopics.get(topicId);

    if (!topic) return;

    const updatedSchedule = topic.revisionSchedule.map(
      (revision: RevisionEntry) =>
        revision.date === revisionDate
          ? {
              ...revision,
              done: true,
              doneAt: new Date().toISOString(),
            }
          : revision,
    );

    await db.learningTopics.update(topicId, {
      revisionSchedule: updatedSchedule,
      updatedAt: new Date().toISOString(),
    });
  }
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Hero */}
      <section className="mb-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Developer Learning Command Center
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Welcome back 👋
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Build knowledge every day. Track topics, revise concepts, and grow
            your developer skills consistently.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mb-8">
        <Card className="rounded-2xl">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Today's Mission
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Focus on the next improvement
                </h2>
              </div>

              <Target className="h-6 w-6 text-muted-foreground" />
            </div>

            {allTopics.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your knowledge base is empty. Start adding topics.
                </p>

                <Link href="/learning">
                  <Button>Add First Topic</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dueRevisions.length > 0 && (
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <BookOpen className="h-5 w-5" />

                    <p className="text-sm">
                      Revise <strong>{dueRevisions.length}</strong> pending
                      topics
                    </p>
                  </div>
                )}

                {latestTopic && (
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <Clock3 className="h-5 w-5" />

                    <p className="text-sm">
                      Continue learning: <strong>{latestTopic.topic}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Stats */}

      <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground">Total Topics</p>

            <p className="mt-2 text-3xl font-semibold">{allTopics.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground">Completed</p>

            <p className="mt-2 text-3xl font-semibold">{completedTopics}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground">Progress</p>

            <p className="mt-2 text-3xl font-semibold">{progress}%</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground">Study Hours</p>

            <p className="mt-2 text-3xl font-semibold">
              {formatHours(totalHours)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4" />

              <p className="text-xs text-muted-foreground">Streak</p>
            </div>

            <p className="mt-2 text-3xl font-semibold">{streak}</p>

            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </section>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Revisions */}

        <section className="lg:col-span-7">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h3 className="mb-5 text-lg font-semibold">Today's Revisions</h3>

              {dueRevisions.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-8 w-8" />

                  <p className="text-sm text-muted-foreground">
                    No revisions pending. Your memory engine is healthy.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dueRevisions.slice(0, 8).map((revision) => (
                    <div
                      key={`${revision.topicId}-${revision.date}`}
                      className="flex items-center justify-between rounded-xl border p-4"
                    >
                      <div>
                        <p className="font-medium">{revision.topic}</p>

                        <p className="text-sm text-muted-foreground">
                          {revision.technology}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          completeRevision(revision.topicId, revision.date)
                        }
                      >
                        Complete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Continue Learning */}

        <section className="lg:col-span-5">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h3 className="mb-5 text-lg font-semibold">Continue Learning</h3>

              {!latestTopic ? (
                <p className="text-sm text-muted-foreground">
                  No active topic found.
                </p>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {latestTopic.technology}
                    </p>

                    <h4 className="mt-1 text-xl font-semibold">
                      {latestTopic.topic}
                    </h4>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Confidence</span>

                      <span>{latestTopic.confidence}/5</span>
                    </div>

                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-foreground"
                        style={{
                          width: `${latestTopic.confidence * 20}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Link href="/learning">
                    <Button className="w-full">Continue</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Bottom Section */}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Activity */}

        <section className="lg:col-span-7">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h3 className="mb-5 text-lg font-semibold">Recent Activity</h3>

              <div className="space-y-3">
                {allTopics
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.updatedAt).getTime() -
                      new Date(a.updatedAt).getTime(),
                  )
                  .slice(0, 5)
                  .map((topic) => (
                    <div key={topic.id} className="rounded-xl border p-4">
                      <p className="font-medium">{topic.topic}</p>

                      <p className="text-sm text-muted-foreground">
                        {topic.technology}
                        {" • "}
                        {topic.status}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}

        <section className="lg:col-span-5">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h3 className="mb-5 text-lg font-semibold">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/learning">
                  <Button variant="outline" className="w-full">
                    ➕ Add Topic
                  </Button>
                </Link>

                <Link href="/learning">
                  <Button variant="outline" className="w-full">
                    📚 Learning
                  </Button>
                </Link>

                <Link href="/timer">
                  <Button variant="outline" className="w-full">
                    ⏱ Focus
                  </Button>
                </Link>

                <Link href="/projects">
                  <Button variant="outline" className="w-full">
                    🚀 Projects
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
