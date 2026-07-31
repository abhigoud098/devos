"use client";

import { useEffect, useState } from "react";

import {
  BarChart3,
  TrendingUp,
  Clock3,
  Brain,
  CalendarDays,
  Target,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    hours: 0,

    progress: 0,

    revision: 0,

    topics: 0,
  });

  useEffect(() => {
    const planner = JSON.parse(localStorage.getItem("planner-tasks") || "[]");

    const dsa = JSON.parse(localStorage.getItem("dsa-problems") || "[]");

    const projects = JSON.parse(localStorage.getItem("projects") || "[]");

    const notes = JSON.parse(localStorage.getItem("developer-notes") || "[]");

    // Study hours

    const hours = planner.reduce(
      (sum: number, item: any) => sum + Number(item.hours || 0),

      0,
    );

    // completed tasks

    const completedTasks = planner.filter(
      (item: any) => item.status === "Completed",
    ).length;

    const progress = planner.length
      ? Math.round((completedTasks / planner.length) * 100)
      : 0;

    // DSA revision accuracy

    const solved = dsa.filter((item: any) => item.status === "Solved").length;

    const revision = dsa.length ? Math.round((solved / dsa.length) * 100) : 0;

    // Topics

    const topics = new Set([
      ...dsa.map((x: any) => x.pattern),

      ...notes.map((x: any) => x.type),

      ...projects.map((x: any) => x.tech),
    ]).size;

    setStats({
      hours,

      progress,

      revision,

      topics,
    });
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      <section className="mb-8 rounded-2xl border bg-card p-8">
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Learning Insights
        </span>

        <h1 className="mt-4 text-4xl font-bold">Analytics</h1>

        <p className="mt-3 text-muted-foreground">
          Track your developer growth automatically.
        </p>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <Clock3 className="mb-3" />

            <p className="text-sm text-muted-foreground">Study Hours</p>

            <h2 className="text-3xl font-bold">{stats.hours}h</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="mb-3" />

            <p className="text-sm text-muted-foreground">Weekly Progress</p>

            <h2 className="text-3xl font-bold">{stats.progress}%</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Brain className="mb-3" />

            <p className="text-sm text-muted-foreground">Revision Accuracy</p>

            <h2 className="text-3xl font-bold">{stats.revision}%</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Target className="mb-3" />

            <p className="text-sm text-muted-foreground">Topics Completed</p>

            <h2 className="text-3xl font-bold">{stats.topics}</h2>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="min-h-[340px] flex flex-col items-center justify-center text-center">
            <BarChart3 className="mb-5 h-14 w-14" />

            <h3 className="text-xl font-semibold">Learning Charts</h3>

            <p className="mt-3 text-muted-foreground">
              Your activity is converted into progress insights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="min-h-[340px] flex flex-col items-center justify-center text-center">
            <CalendarDays className="mb-5 h-14 w-14" />

            <h3 className="text-xl font-semibold">Learning Heatmap</h3>

            <p className="mt-3 text-muted-foreground">
              Daily consistency tracking coming from planner activity.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-8 border-dashed">
        <CardContent className="min-h-[260px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="mb-6 h-16 w-16" />

          <h2 className="text-2xl font-semibold">
            Your Insights Will Grow Here
          </h2>

          <p className="mt-3 max-w-lg text-muted-foreground">
            Keep solving DSA, building projects and learning. DevOS will track
            your journey.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
