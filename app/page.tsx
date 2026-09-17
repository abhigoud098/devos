"use client";

import { useState, useEffect } from "react";
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
  Bot,
  Zap,
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

// 3D-styled AI Bot Illustration Component
function AIBotAvatar({ className = "h-28 w-28" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-violet-500/25 rounded-full blur-2xl animate-pulse pointer-events-none" />
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="purpleEar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0B091A" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>

        {/* Ears / Side Antennas */}
        <rect x="20" y="56" width="14" height="34" rx="7" fill="url(#purpleEar)" />
        <rect x="126" y="56" width="14" height="34" rx="7" fill="url(#purpleEar)" />

        {/* Top Antenna */}
        <circle cx="80" cy="18" r="6" fill="url(#purpleEar)" />
        <rect x="78" y="22" width="4" height="10" rx="2" fill="#94A3B8" />

        {/* Head Outer Shell */}
        <rect x="30" y="28" width="100" height="90" rx="45" fill="url(#headGrad)" />

        {/* Visor / Face Screen */}
        <rect x="42" y="44" width="76" height="58" rx="26" fill="url(#visorGrad)" stroke="#312E81" strokeWidth="1.5" />

        {/* Glowing Cheerful Eyes */}
        <ellipse cx="61" cy="69" rx="5.5" ry="6.5" fill="#C084FC" />
        <circle cx="63" cy="67" r="2.2" fill="#FFFFFF" />
        <ellipse cx="99" cy="69" rx="5.5" ry="6.5" fill="#C084FC" />
        <circle cx="101" cy="67" r="2.2" fill="#FFFFFF" />

        {/* Happy Smiling Mouth */}
        <path d="M74 80 Q80 86 86 80" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Body Collar */}
        <path d="M46 118 C46 118 52 140 80 140 C108 140 114 118 114 118 Z" fill="url(#bodyGrad)" />
        <rect x="74" y="124" width="12" height="3.5" rx="1.75" fill="#8B5CF6" />
      </svg>
    </div>
  );
}

// Sparkline Mini Trend Graph
function Sparkline({ data, height = 55, width = 160 }: { data: number[]; height?: number; width?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 10;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * chartWidth;
    const y = height - padding - ((val - min) / range) * chartHeight;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible select-none">
      <defs>
        <linearGradient id="sparklineGrad" x1="0%" y1="0%" x2="0%" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparklineGrad)" />
      <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, idx) => (
        <circle
          key={idx}
          cx={p.x}
          cy={p.y}
          r={idx === points.length - 1 ? 4.5 : 3}
          className={`${
            idx === points.length - 1
              ? "fill-violet-400 stroke-white stroke-2 shadow-sm animate-pulse"
              : "fill-violet-400 stroke-card stroke-[1.5]"
          }`}
        />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [progressTab, setProgressTab] = useState<"weekly" | "monthly">("weekly");
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  // Real dynamic weekly & monthly activity calculation
  const [extraActivity, setExtraActivity] = useState<{
    sessions: Array<{ date?: string; completedAt?: string }>;
    dsa: Array<{ completedAt?: string; date?: string; status?: string }>;
    tasks: Array<{ completedAt?: string; date?: string; completed?: boolean }>;
  }>({ sessions: [], dsa: [], tasks: [] });

  useEffect(() => {
    try {
      const savedSessions = JSON.parse(localStorage.getItem("study-session-history") || "[]");
      const savedDsa = JSON.parse(localStorage.getItem("dsa-problems") || "[]");
      const savedTasks = JSON.parse(localStorage.getItem("planner-tasks") || "[]");
      setExtraActivity({
        sessions: Array.isArray(savedSessions) ? savedSessions : [],
        dsa: Array.isArray(savedDsa) ? savedDsa : [],
        tasks: Array.isArray(savedTasks) ? savedTasks : [],
      });
    } catch {
      // ignore
    }
  }, []);

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

  // Dynamic AI Study Recommendation
  const inProgressTopic = topics.find(
    (t) => t.status === "in-progress" || t.confidence === 1 || t.confidence === 2
  );
  const dueRevision = summary.dueToday[0];

  let recTopic = "Dynamic Programming";
  let recDescription = "Based on your progress, I recommend focusing on Dynamic Programming next.";
  let recPrompt = "Can you give me a structured study guide and practice problems for Dynamic Programming?";

  if (dueRevision) {
    recTopic = dueRevision.topic.topic;
    recDescription = `Based on your spaced repetition queue, I recommend revising ${recTopic} (${dueRevision.topic.technology}) today.`;
    recPrompt = `Can you explain the key concepts and quiz me on ${recTopic} for my scheduled revision?`;
  } else if (inProgressTopic) {
    recTopic = inProgressTopic.topic;
    recDescription = `Based on your active learning curve, I recommend continuing with ${recTopic} (${inProgressTopic.technology}).`;
    recPrompt = `Help me master ${recTopic} with deep-dive explanations and common interview questions.`;
  } else if (topics.length > 0) {
    recTopic = topics[0].topic;
    recDescription = `Based on your curriculum, I recommend exploring advanced topics in ${topics[0].technology}.`;
    recPrompt = `What are the advanced topics and best practices in ${topics[0].technology}?`;
  }

  // Real Weekly Activity (past 7 days)
  const todayObj = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(todayObj.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const weeklyActivityByDay = past7Days.map((dateStr) => {
    let count = 0;
    topics.forEach((t) => {
      if (t.lastStudied && t.lastStudied.startsWith(dateStr)) count++;
      if (t.revisionSchedule) {
        t.revisionSchedule.forEach((r: any) => {
          if (r.done && ((r.doneAt && r.doneAt.startsWith(dateStr)) || r.date === dateStr)) {
            count++;
          }
        });
      }
    });
    extraActivity.sessions.forEach((s) => {
      const sDate = s.completedAt || s.date;
      if (sDate && sDate.startsWith(dateStr)) count++;
    });
    extraActivity.dsa.forEach((d) => {
      if (d.status === "Solved" || d.status === "Mastered") {
        const dDate = d.completedAt || d.date;
        if (dDate && dDate.startsWith(dateStr)) count++;
      }
    });
    extraActivity.tasks.forEach((tk) => {
      if (tk.completed) {
        const tkDate = tk.completedAt || tk.date;
        if (tkDate && tkDate.startsWith(dateStr)) count++;
      }
    });
    return count;
  });

  const totalWeeklyActivity = weeklyActivityByDay.reduce((a, b) => a + b, 0);
  const weeklyTarget = Math.max(5, summary.dueToday.length + topics.length);
  const weeklyPercent = Math.min(100, Math.max(0, Math.round((totalWeeklyActivity / (weeklyTarget || 1)) * 100)));

  // Real Monthly Activity (past 4 weeks)
  const monthlyWeeks = [0, 1, 2, 3].map((weekIdx) => {
    const startD = new Date();
    startD.setDate(todayObj.getDate() - (28 - weekIdx * 7));
    const endD = new Date();
    endD.setDate(todayObj.getDate() - (21 - weekIdx * 7));
    const startStr = startD.toISOString().slice(0, 10);
    const endStr = endD.toISOString().slice(0, 10);

    let count = 0;
    topics.forEach((t) => {
      if (t.lastStudied && t.lastStudied >= startStr && t.lastStudied <= endStr) count++;
      if (t.revisionSchedule) {
        t.revisionSchedule.forEach((r: any) => {
          if (r.done && r.date >= startStr && r.date <= endStr) count++;
        });
      }
    });
    extraActivity.sessions.forEach((s) => {
      const sDate = (s.completedAt || s.date || "").slice(0, 10);
      if (sDate >= startStr && sDate <= endStr) count++;
    });
    extraActivity.dsa.forEach((d) => {
      if (d.status === "Solved" || d.status === "Mastered") {
        const dDate = (d.completedAt || d.date || "").slice(0, 10);
        if (dDate >= startStr && dDate <= endStr) count++;
      }
    });
    return count;
  });

  const totalMonthlyActivity = monthlyWeeks.reduce((a, b) => a + b, 0);
  const monthlyTarget = Math.max(20, (weeklyTarget || 5) * 4);
  const monthlyPercent = Math.min(100, Math.max(0, Math.round((totalMonthlyActivity / (monthlyTarget || 1)) * 100)));

  // Cumulative Sparkline vectors
  let cumWeekly = 0;
  const weeklySparklineData = weeklyActivityByDay.map((val) => {
    cumWeekly += val;
    return cumWeekly;
  });
  const displayWeeklySparkline = weeklySparklineData.some((v) => v > 0)
    ? weeklySparklineData
    : [0, 0, 0, 0, 0, 0, 0];

  let cumMonthly = 0;
  const monthlySparklineData = monthlyWeeks.map((val) => {
    cumMonthly += val;
    return cumMonthly;
  });
  const displayMonthlySparkline = monthlySparklineData.some((v) => v > 0)
    ? monthlySparklineData
    : [0, 0, 0, 0];

  async function handleCompleteRevision(topicId: string, revisionDate: string) {
    await markRevisionDone(topicId, revisionDate);
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-7">
      {/* 1. HERO COMMAND BANNER */}
      <section className="relative overflow-hidden rounded-2xl border border-base-border/80 bg-gradient-to-br from-card/80 via-card/40 to-base-raised/60 p-5 sm:p-7 backdrop-blur-md shadow-sm">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-base-border/80 bg-base-raised/70 px-2.5 py-1 text-xs font-medium text-ink-muted">
              <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-gradient-to-tr from-violet-600 to-indigo-500 font-mono text-[9px] font-bold text-white shadow-xs">
                {"</>"}
              </span>
              <span>DevOS Workspace</span>
              <span className="text-ink-faint">•</span>
              <span className="text-ink-muted">{formattedDate}</span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
              {greeting}, {user?.name?.split(" ")[0] || "User"} 👋
            </h1>

            <p className="text-xs sm:text-sm text-ink-muted max-w-xl leading-relaxed">
              Master technologies systematically. Active spaced repetition and continuous developer growth.
            </p>
          </div>

          {/* Quick Mission Badge / Daily Summary */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-base-border/80 bg-base-raised/60 p-2.5 sm:p-3.5 backdrop-blur">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-medium text-ink-muted">Study Streak</p>
                <p className="text-base sm:text-lg font-bold text-ink">{streak} Days Active</p>
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

      {/* 2. AI RECOMMENDATION & WEEKLY/MONTHLY PROGRESS SECTION */}
      <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {/* Left Card: AI Study Recommendation */}
        <Card className="relative overflow-hidden border-base-border/80 bg-gradient-to-br from-card/90 via-card/50 to-base-raised/60 p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                <h3 className="text-sm sm:text-base font-bold text-ink dark:text-zinc-100 tracking-tight">
                  AI Study Recommendation
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted dark:text-zinc-300 leading-relaxed line-clamp-3">
                {recDescription}
              </p>
            </div>

            {/* 3D Robot Avatar Graphic */}
            <div className="shrink-0 -mt-1 -mr-1">
              <AIBotAvatar className="h-16 w-16 sm:h-24 sm:w-24" />
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-1">
            <Link href={`/ai?prompt=${encodeURIComponent(recPrompt)}`}>
              <Button className="h-8 sm:h-9 px-3 sm:px-4 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20 gap-1.5 transition-all">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI Assistant</span>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Right Card: Weekly & Monthly Progress */}
        <Card className="relative overflow-hidden border-base-border/80 bg-gradient-to-br from-card/90 via-card/50 to-base-raised/60 p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Tab Switcher Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1 rounded-lg bg-base-subtle/80 p-0.5 border border-base-border/50">
                <button
                  type="button"
                  onClick={() => setProgressTab("weekly")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    progressTab === "weekly"
                      ? "bg-card text-ink shadow-xs border border-base-border/60"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Weekly Progress
                </button>
                <button
                  type="button"
                  onClick={() => setProgressTab("monthly")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    progressTab === "monthly"
                      ? "bg-card text-ink shadow-xs border border-base-border/60"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Monthly Progress
                </button>
              </div>

              <span className="text-[11px] font-medium text-ink-muted">
                {progressTab === "weekly" ? "This Week" : "This Month"}
              </span>
            </div>

            {/* Main Progress Stat & Sparkline Row */}
            <div className="flex items-center justify-between mt-3 gap-3 sm:gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                  {progressTab === "weekly" ? `${weeklyPercent}%` : `${monthlyPercent}%`}
                </div>
                <p className="text-[11px] text-ink-muted font-medium mt-0.5">Goal progress</p>
              </div>

              {/* Dynamic Sparkline Graphic matching screenshot */}
              <div className="shrink-0 flex items-center justify-end">
                <Sparkline
                  data={progressTab === "weekly" ? displayWeeklySparkline : displayMonthlySparkline}
                  width={130}
                  height={45}
                />
              </div>
            </div>
          </div>

          {/* Progress Bar at bottom */}
          <div className="mt-3 sm:mt-4 space-y-1.5">
            <div className="h-2 w-full rounded-full bg-base-subtle overflow-hidden border border-base-border/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 transition-all duration-500 shadow-sm shadow-violet-500/30"
                style={{
                  width: `${progressTab === "weekly" ? weeklyPercent : monthlyPercent}%`,
                }}
              />
            </div>
          </div>
        </Card>
      </section>

      {/* 3. KEY METRICS GRID */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
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
