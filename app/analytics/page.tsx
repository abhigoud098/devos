"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock3,
  Brain,
  CalendarDays,
  Target,
  Sparkles,
  Code2,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    hours: 0,
    progress: 0,
    revision: 0,
    topics: 0,
    totalDsa: 0,
    dsaSolved: 0,
    totalProjects: 0,
    totalNotes: 0,
  });

  useEffect(() => {
    const planner = JSON.parse(localStorage.getItem("planner-tasks") || "[]");
    const dsa = JSON.parse(localStorage.getItem("dsa-problems") || "[]");
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const notes = JSON.parse(localStorage.getItem("developer-notes") || "[]");

    const hours = planner.reduce(
      (sum: number, item: any) => sum + Number(item.hours || 0),
      0,
    );

    const completedTasks = planner.filter(
      (item: any) => item.status === "Completed",
    ).length;

    const progress = planner.length
      ? Math.round((completedTasks / planner.length) * 100)
      : 0;

    const solved = dsa.filter((item: any) => item.status === "Solved").length;
    const revision = dsa.length ? Math.round((solved / dsa.length) * 100) : 0;

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
      totalDsa: dsa.length,
      dsaSolved: solved,
      totalProjects: projects.length,
      totalNotes: notes.length,
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Insights & Velocity"
        title="Developer Analytics"
        description="Comprehensive metrics on your learning trajectory, problem-solving progress, and consistency."
      />

      {/* 2. STATS */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Planned Hours"
          value={`${stats.hours}h`}
          icon={Clock3}
          iconColor="text-amber-500 bg-amber-500/10"
        />
        <StatCard
          title="Plan Completion"
          value={`${stats.progress}%`}
          icon={TrendingUp}
          iconColor="text-signal-high bg-signal-high/10"
        />
        <StatCard
          title="DSA Solved Ratio"
          value={`${stats.revision}%`}
          icon={Brain}
          iconColor="text-accent bg-accent/10"
        />
        <StatCard
          title="Patterns & Tags"
          value={stats.topics}
          icon={Target}
          iconColor="text-blue-500 bg-blue-500/10"
        />
      </section>

      {/* 3. DETAILED BREAKDOWN CARDS */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-base-border/70">
              <BarChart3 className="h-4 w-4 text-accent" />
              <h2 className="text-base font-bold text-ink">Domain Breakdown</h2>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-ink mb-1.5">
                  <span>DSA Problems Solved</span>
                  <span className="font-bold text-accent">{stats.dsaSolved} / {stats.totalDsa}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-base-elevated">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${stats.totalDsa ? (stats.dsaSolved / stats.totalDsa) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-ink mb-1.5">
                  <span>Planner Tasks Completed</span>
                  <span className="font-bold text-signal-high">{stats.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-base-elevated">
                  <div
                    className="h-full rounded-full bg-signal-high transition-all duration-300"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-base-border/60">
                <div className="rounded-xl border border-base-border/70 bg-base-raised/60 p-3">
                  <span className="text-[11px] text-ink-muted">Projects Built</span>
                  <p className="text-xl font-bold text-ink mt-0.5">{stats.totalProjects}</p>
                </div>
                <div className="rounded-xl border border-base-border/70 bg-base-raised/60 p-3">
                  <span className="text-[11px] text-ink-muted">Notes Written</span>
                  <p className="text-xl font-bold text-ink mt-0.5">{stats.totalNotes}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-base-border/70">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <h2 className="text-base font-bold text-ink">Consistency Milestones</h2>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 rounded-xl border border-base-border/70 bg-base-raised/50 p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-high/15 text-signal-high">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink">Spaced Repetition Active</h3>
                  <p className="text-[11px] text-ink-muted">Leitner cycles scheduled across learning topics</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-base-border/70 bg-base-raised/50 p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink">Algorithmic Diversity</h3>
                  <p className="text-[11px] text-ink-muted">{stats.topics} unique patterns and technical topics logged</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-base-border/70 bg-base-raised/50 p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink">Focus Dedication</h3>
                  <p className="text-[11px] text-ink-muted">{stats.hours} hours planned for skill acquisition</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
