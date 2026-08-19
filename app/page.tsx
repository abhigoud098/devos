"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flame,
  Target,
  Plus,
  Timer,
  Rocket,
  TrendingUp,
  Brain,
  Code2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { db } from "@/lib/db";
import { getRevisionSummary } from "@/lib/revision";
import type { LearningTopic, RevisionEntry } from "@/lib/types";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { markRevisionDone } from "@/lib/learning-repo";

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

const now = new Date();
const greeting =
  now.getHours() < 12
    ? "Good morning"
    : now.getHours() < 17
      ? "Good afternoon"
      : "Good evening";

const formattedDate = now.toLocaleDateString("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function DashboardPage() {
  const { user } = useAuth();
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  if (!topics) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
          Loading your developer dashboard...
        </div>
      </main>
    );
  }

  const summary = getRevisionSummary(topics);
  const totalHours = topics.reduce((sum, topic) => sum + (topic.hoursStudied || 0), 0);
  const completedTopics = topics.filter((topic) => topic.status === "completed").length;
  const progress =
    topics.length === 0
      ? 0
      : Math.round((completedTopics / topics.length) * 100);

  const streak = calculateStreak(topics);

  const latestTopic = [...topics]
    .filter((topic) => topic.lastStudied)
    .sort(
      (a, b) =>
        new Date(b.lastStudied!).getTime() - new Date(a.lastStudied!).getTime(),
    )[0];

  async function handleCompleteRevision(topicId: string, revisionDate: string) {
    await markRevisionDone(topicId, revisionDate);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. HERO COMMAND BANNER */}
      <section className="relative overflow-hidden rounded-2xl border border-base-border/80 bg-gradient-to-br from-card/80 via-card/40 to-base-raised/60 p-6 sm:p-8 backdrop-blur-md shadow-sm">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-base-border/80 bg-base-raised/70 px-3 py-1 text-xs font-medium text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-signal-high animate-pulse" />
              DevOS Workspace
              <span className="text-ink-faint">•</span>
              <span className="text-ink-muted">{formattedDate}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink">
              {greeting}, {user?.name?.split(" ")[0] || "Developer"} 👋
            </h1>

            <p className="text-xs sm:text-sm text-ink-muted max-w-xl leading-relaxed">
              Master technologies systematically. Active spaced repetition and continuous developer growth.
            </p>
          </div>

          {/* Quick Mission Badge / Daily Summary */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-base-border/80 bg-base-raised/60 p-3 sm:p-4 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-ink-muted">Study Streak</p>
                <p className="text-lg font-bold text-ink">{streak} Days Active</p>
              </div>
            </div>

            <Link href="/learning">
              <Button size="md" className="gap-1.5 shadow-md shadow-accent/20">
                <Plus className="h-4 w-4" />
                Add Topic
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KEY METRICS GRID */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Topics Tracked"
          value={topics.length}
          icon={BookOpen}
          iconColor="text-blue-500 bg-blue-500/10"
        />

        <StatCard
          title="Due Today"
          value={summary.dueToday.length}
          icon={CalendarDays}
          iconColor="text-accent bg-accent/10"
          badge={
            summary.dueToday.length > 0 ? (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                Action
              </span>
            ) : undefined
          }
        />

        <StatCard
          title="Mastered"
          value={completedTopics}
          icon={CheckCircle2}
          iconColor="text-signal-high bg-signal-high/10"
        />

        <StatCard
          title="Completion"
          value={`${progress}%`}
          icon={TrendingUp}
          iconColor="text-purple-500 bg-purple-500/10"
        />

        <StatCard
          title="Total Hours"
          value={`${totalHours.toFixed(1)}h`}
          icon={Timer}
          iconColor="text-amber-500 bg-amber-500/10"
        />

        <StatCard
          title="Streak"
          value={`${streak}d`}
          icon={Flame}
          iconColor="text-orange-500 bg-orange-500/10"
        />
      </section>

      {/* 3. MAIN WORKSPACE QUEUE: 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Revision Queue + Active Topic (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Today's Revision Queue */}
          <Card className="overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-base-border/70 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-ink">Today&apos;s Revision Queue</h2>
                    <p className="text-xs text-ink-muted">Spaced repetition reviews ready for recall</p>
                  </div>
                </div>

                <span className="rounded-full bg-base-elevated px-2.5 py-0.5 text-xs font-semibold text-ink">
                  {summary.dueToday.length} due
                </span>
              </div>

              {summary.dueToday.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="All caught up for today!"
                  description="No revisions are pending right now. Start exploring a new topic or practice DSA problems."
                  action={
                    <Link href="/learning">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        Explore Learning Hub
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {summary.dueToday.map((revision) => (
                    <div
                      key={`${revision.topic.id}-${revision.entry.id || revision.entry.date}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-base-border/80 bg-base-raised/50 p-4 transition-all hover:border-accent/30 hover:bg-base-raised"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-base-elevated px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                            {revision.topic.technology}
                          </span>
                          <h3 className="font-semibold text-sm text-ink">{revision.topic.topic}</h3>
                        </div>
                        {revision.topic.subtopic && (
                          <p className="text-xs text-ink-muted line-clamp-1">{revision.topic.subtopic}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 hover:border-signal-high hover:text-signal-high"
                          onClick={() => handleCompleteRevision(revision.topic.id, revision.entry.date)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-signal-high" />
                          Mark Revise Done
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Continue Learning Banner */}
          {latestTopic && (
            <Card className="overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between pb-4 border-b border-base-border/70 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-ink">Resume Learning</h2>
                      <p className="text-xs text-ink-muted">Pick up where you left off</p>
                    </div>
                  </div>

                  <span className="capitalize rounded-full bg-base-elevated px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                    {latestTopic.status.replace("-", " ")}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                      {latestTopic.technology}
                    </span>
                    <h3 className="text-lg font-bold text-ink">{latestTopic.topic}</h3>
                    {latestTopic.subtopic && (
                      <p className="text-xs text-ink-muted">{latestTopic.subtopic}</p>
                    )}
                  </div>

                  <Link href={`/learning?highlight=${latestTopic.id}`} className="shrink-0">
                    <Button size="md" className="gap-1.5">
                      Open Topic
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Quick Actions & Upcoming Schedule (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Quick Actions Panel */}
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 pb-4 border-b border-base-border/70 mb-4">
                <Sparkles className="h-4 w-4 text-accent" />
                <h2 className="text-base font-bold text-ink">Quick Shortcuts</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/learning" className="group">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-base-border/80 bg-base-raised/50 p-4 text-center transition-all duration-150 group-hover:border-accent/40 group-hover:bg-accent/5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent mb-2 group-hover:scale-110 transition-transform">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-ink">Add Topic</span>
                    <span className="text-[10px] text-ink-faint mt-0.5">New learning item</span>
                  </div>
                </Link>

                <Link href="/dsa" className="group">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-base-border/80 bg-base-raised/50 p-4 text-center transition-all duration-150 group-hover:border-blue-500/40 group-hover:bg-blue-500/5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                      <Code2 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-ink">DSA Vault</span>
                    <span className="text-[10px] text-ink-faint mt-0.5">Patterns & problems</span>
                  </div>
                </Link>

                <Link href="/timer" className="group">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-base-border/80 bg-base-raised/50 p-4 text-center transition-all duration-150 group-hover:border-amber-500/40 group-hover:bg-amber-500/5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 mb-2 group-hover:scale-110 transition-transform">
                      <Timer className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-ink">Study Timer</span>
                    <span className="text-[10px] text-ink-faint mt-0.5">Focus pomodoro</span>
                  </div>
                </Link>

                <Link href="/projects" className="group">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-base-border/80 bg-base-raised/50 p-4 text-center transition-all duration-150 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 mb-2 group-hover:scale-110 transition-transform">
                      <Rocket className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-ink">Projects</span>
                    <span className="text-[10px] text-ink-faint mt-0.5">Kanban pipeline</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Revisions Preview */}
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-base-border/70 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-ink-muted" />
                  <h2 className="text-base font-bold text-ink">Upcoming Recall</h2>
                </div>
                <Link href="/revision" className="text-xs font-medium text-accent hover:underline">
                  View all
                </Link>
              </div>

              {summary.upcoming.length === 0 ? (
                <p className="text-xs text-ink-muted text-center py-6">
                  No upcoming spaced repetition entries scheduled.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {summary.upcoming.slice(0, 4).map((item) => (
                    <div
                      key={`${item.topic.id}-${item.entry.id || item.entry.date}`}
                      className="flex items-center justify-between rounded-xl border border-base-border/70 bg-base-raised/40 p-3 text-xs"
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-ink truncate">{item.topic.topic}</p>
                        <p className="text-[11px] text-ink-muted">{item.topic.technology}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                        {item.entry.date}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
