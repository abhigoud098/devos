"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { collectDueRevisions } from "@/lib/revision";
import { formatHours } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  const allTopics = topics ?? [];

  const due = collectDueRevisions(allTopics);

  const totalHours = allTopics.reduce(
    (sum, topic) => sum + topic.hoursStudied,
    0,
  );

  const inProgress = allTopics.filter(
    (topic) => topic.status === "in-progress",
  ).length;

  const completed = allTopics.filter(
    (topic) => topic.status === "completed",
  ).length;

  const latestTopic = [...allTopics].sort((a: any, b: any) => {
    const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return bTime - aTime;
  })[0];

  const recentActivity = [...allTopics]
    .sort((a: any, b: any) => {
      const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 6);

  const date = new Date();

  const greeting =
    date.getHours() < 12
      ? "Good Morning"
      : date.getHours() < 18
        ? "Good Afternoon"
        : "Good Evening";

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const missionItems = [];

  if (due.length > 0) {
    missionItems.push(`Revise ${due.length} topic${due.length > 1 ? "s" : ""}`);
  }

  if (latestTopic) {
    missionItems.push(`Continue ${latestTopic.topic}`);
  }

  if (missionItems.length === 0) {
    missionItems.push("Start your learning journey");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          {greeting}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">{formattedDate}</p>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Small improvements made consistently become expertise over time.
        </p>
      </section>

      {/* Today's Mission */}
      <section className="mb-8">
        <Card className="rounded-2xl border">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Today&apos;s Mission
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Focus on what matters next
                </h2>
              </div>
            </div>

            {allTopics.length === 0 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  No learning topics yet. Start building your knowledge base.
                </p>

                <Link
                  href="/learning"
                  className="inline-flex rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
                >
                  Add Your First Topic
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {missionItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <span className="h-2 w-2 rounded-full bg-foreground/70" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Stats */}
      <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-6">
            <p className="mb-2 text-xs text-muted-foreground">
              🔥 Topics In Progress
            </p>

            <p className="text-3xl font-semibold">{inProgress}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-6">
            <p className="mb-2 text-xs text-muted-foreground">
              📚 Due Revisions
            </p>

            <p className="text-3xl font-semibold">{due.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-6">
            <p className="mb-2 text-xs text-muted-foreground">
              ⏱ Total Study Hours
            </p>

            <p className="text-3xl font-semibold">{formatHours(totalHours)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-6">
            <p className="mb-2 text-xs text-muted-foreground">
              ✅ Completed Topics
            </p>

            <p className="text-3xl font-semibold">{completed}</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Revisions */}
        <section className="lg:col-span-7">
          <Card className="h-full rounded-2xl">
            <CardContent className="p-6">
              <h3 className="mb-5 text-lg font-semibold">
                Today&apos;s Revisions
              </h3>

              {due.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  You're all caught up. No revisions due today.
                </div>
              ) : (
                <div className="space-y-3">
                  {due.slice(0, 8).map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border p-4"
                    >
                      <div>
                        <p className="font-medium">
                          {item.topic || item.title}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {item.technology}
                        </p>
                      </div>

                      <span className="rounded-full border px-3 py-1 text-xs">
                        Revision Due
                      </span>
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
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No active learning topic found.
                </div>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>

                      <p className="mt-1 font-medium">
                        {latestTopic.confidence ?? 0}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Hours Studied
                      </p>

                      <p className="mt-1 font-medium">
                        {formatHours(latestTopic.hoursStudied ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="rounded-full border px-3 py-1 text-xs">
                      {latestTopic.status}
                    </span>

                    <Link
                      href="/learning"
                      className="rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
                    >
                      Continue
                    </Link>
                  </div>
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
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No activity yet.
                  </p>
                ) : (
                  recentActivity.map((topic: any, index) => (
                    <div key={index} className="rounded-xl border p-4">
                      <p className="font-medium">{topic.topic}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {topic.technology}
                      </p>
                    </div>
                  ))
                )}
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
                <Link
                  href="/learning"
                  className="rounded-xl border p-4 text-sm transition hover:bg-muted"
                >
                  ➕ Add Topic
                </Link>

                <Link
                  href="/learning"
                  className="rounded-xl border p-4 text-sm transition hover:bg-muted"
                >
                  📚 Open Learning
                </Link>

                <button className="rounded-xl border p-4 text-left text-sm transition hover:bg-muted">
                  🚀 Add Project
                </button>

                <button className="rounded-xl border p-4 text-left text-sm transition hover:bg-muted">
                  ⏱ Focus Session
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
