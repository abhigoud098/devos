"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Bell,
  BellRing,
  BookOpen,
  Brain,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  getTopicNotifications,
  markNotificationItemDone,
  type NotificationItem,
  type DayGroupedNotifications,
} from "@/lib/notifications";
import {
  requestRevisionNotificationPermission,
  sendRevisionNotification,
} from "@/lib/revision-notification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "today" | "overdue" | "upcoming" | "completed";

export default function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<FilterTab>("today");
  const [search, setSearch] = useState("");
  const [techFilter, setTechFilter] = useState("all");
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  const summary = useMemo(() => {
    if (!topics) {
      return {
        all: [],
        dueToday: [],
        overdue: [],
        upcoming: [],
        completed: [],
        groupedByDay: [],
      };
    }
    return getTopicNotifications(topics);
  }, [topics]);

  // Extract unique technologies for filter
  const technologies = useMemo(() => {
    if (!topics) return [];
    return Array.from(new Set(topics.map((t) => t.technology))).sort();
  }, [topics]);

  // Filter items based on current tab, search, and tech
  const filteredItems = useMemo(() => {
    let items = summary.all;

    if (tab === "today") {
      items = summary.dueToday;
    } else if (tab === "overdue") {
      items = summary.overdue;
    } else if (tab === "upcoming") {
      items = summary.upcoming;
    } else if (tab === "completed") {
      items = summary.completed;
    }

    if (techFilter !== "all") {
      items = items.filter(
        (i) => i.technology.toLowerCase() === techFilter.toLowerCase(),
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.technology.toLowerCase().includes(q) ||
          (i.subtopic && i.subtopic.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q)),
      );
    }

    return items;
  }, [summary, tab, techFilter, search]);

  // Group filtered items by day
  const filteredGroupedByDay = useMemo(() => {
    const dayMap = new Map<string, NotificationItem[]>();

    filteredItems.forEach((item) => {
      const list = dayMap.get(item.scheduledDate) || [];
      list.push(item);
      dayMap.set(item.scheduledDate, list);
    });

    const sortedDates = Array.from(dayMap.keys()).sort();

    return sortedDates.map((dateStr) => {
      const originalGroup = summary.groupedByDay.find((g) => g.date === dateStr);
      return {
        date: dateStr,
        displayDate: originalGroup?.displayDate || dateStr,
        relativeLabel: originalGroup?.relativeLabel || dateStr,
        isToday: originalGroup?.isToday || false,
        isTomorrow: originalGroup?.isTomorrow || false,
        isPast: originalGroup?.isPast || false,
        items: dayMap.get(dateStr) || [],
      };
    });
  }, [filteredItems, summary.groupedByDay]);

  async function handleEnableNotifications() {
    const allowed = await requestRevisionNotificationPermission();
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
    if (allowed) {
      sendRevisionNotification(summary.dueToday.length || 1);
    }
  }

  async function handleToggleComplete(item: NotificationItem) {
    await markNotificationItemDone(item);
  }

  return (
    <main className="page-shell space-y-8">
      {/* HERO SECTION */}
      <section className="page-hero relative overflow-hidden">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <Bell className="h-3.5 w-3.5" />
              Notifications & Study Hub
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Daily Study Tasks & Reminders
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
              Never miss a scheduled topic or spaced repetition cycle. Every day's
              learning tasks are organized line-by-line. Click any notification to jump
              straight to that topic.
            </p>
          </div>

          {/* Quick Notification Permission Status */}
          <div className="flex flex-col gap-2 rounded-2xl border border-base-border bg-base-raised/70 p-4 min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Browser Alerts</span>
              <span
                className={cn(
                  "flex items-center gap-1.5 font-medium",
                  notificationPermission === "granted"
                    ? "text-signal-high"
                    : "text-signal-mid",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    notificationPermission === "granted"
                      ? "bg-signal-high"
                      : "bg-signal-mid",
                  )}
                />
                {notificationPermission === "granted" ? "Active" : "Disabled"}
              </span>
            </div>

            {notificationPermission !== "granted" ? (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-xs gap-1.5 h-8 bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent font-medium"
                onClick={handleEnableNotifications}
              >
                <BellRing className="h-3.5 w-3.5" />
                Enable Push Alerts
              </Button>
            ) : (
              <p className="mt-1 text-xs text-ink-faint">
                You'll receive alert reminders when opening the app.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* METRIC COUNTER CARDS */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={() => setTab("today")}
          className={cn(
            "cursor-pointer rounded-2xl border transition-all hover:border-accent/50",
            tab === "today"
              ? "border-accent bg-accent/5 shadow-sm ring-1 ring-accent/30"
              : "bg-base-raised/60",
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-muted">Due Today</p>
              <p className="mt-1 text-2xl font-bold text-ink">
                {summary.dueToday.length}
              </p>
              <p className="text-[11px] text-ink-faint">Ready for study</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setTab("overdue")}
          className={cn(
            "cursor-pointer rounded-2xl border transition-all hover:border-signal-low/50",
            tab === "overdue"
              ? "border-signal-low bg-signal-low/5 shadow-sm ring-1 ring-signal-low/30"
              : "bg-base-raised/60",
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-muted">Overdue</p>
              <p className="mt-1 text-2xl font-bold text-signal-low">
                {summary.overdue.length}
              </p>
              <p className="text-[11px] text-ink-faint">Requires review</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-low/15 text-signal-low">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setTab("upcoming")}
          className={cn(
            "cursor-pointer rounded-2xl border transition-all hover:border-blue-500/50",
            tab === "upcoming"
              ? "border-blue-500 bg-blue-500/5 shadow-sm ring-1 ring-blue-500/30"
              : "bg-base-raised/60",
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-muted">Upcoming Days</p>
              <p className="mt-1 text-2xl font-bold text-ink">
                {summary.upcoming.length}
              </p>
              <p className="text-[11px] text-ink-faint">Scheduled next</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <CalendarDays className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setTab("completed")}
          className={cn(
            "cursor-pointer rounded-2xl border transition-all hover:border-signal-high/50",
            tab === "completed"
              ? "border-signal-high bg-signal-high/5 shadow-sm ring-1 ring-signal-high/30"
              : "bg-base-raised/60",
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-muted">Completed</p>
              <p className="mt-1 text-2xl font-bold text-signal-high">
                {summary.completed.length}
              </p>
              <p className="text-[11px] text-ink-faint">Mastered tasks</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-high/15 text-signal-high">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CONTROLS: TABS, SEARCH, TECH FILTER */}
      <section className="flex flex-col gap-4 rounded-2xl border border-base-border bg-base-raised/60 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: "today", label: "Today's Tasks", count: summary.dueToday.length },
              { key: "overdue", label: "Overdue", count: summary.overdue.length },
              { key: "upcoming", label: "Upcoming", count: summary.upcoming.length },
              { key: "completed", label: "Completed", count: summary.completed.length },
              { key: "all", label: "All Tasks", count: summary.all.length },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors",
                tab === item.key
                  ? "bg-accent text-white shadow-sm"
                  : "bg-base-elevated/60 text-ink-muted hover:bg-base-elevated hover:text-ink",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  tab === item.key
                    ? "bg-white/20 text-white"
                    : "bg-base-border text-ink-muted",
                )}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9 bg-base-elevated/50"
            />
          </div>

          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="w-36 h-9 text-xs bg-base-elevated/50">
              <SelectValue placeholder="Technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tech</SelectItem>
              {technologies.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* LINE-BY-LINE DAY-BY-DAY NOTIFICATIONS LIST */}
      <section className="space-y-6">
        {filteredGroupedByDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-border bg-base-raised/30 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-elevated text-ink-faint">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">
              No notifications in this view
            </h3>
            <p className="mt-1 max-w-sm text-xs text-ink-muted">
              {tab === "today"
                ? "You have completed all scheduled tasks for today! Great job."
                : "No matching study tasks or revisions found for current filter."}
            </p>
            <div className="mt-5">
              <Link href="/learning">
                <Button size="sm" className="gap-2 text-xs rounded-xl">
                  <BookOpen className="h-3.5 w-3.5" />
                  Explore Learning Topics
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          filteredGroupedByDay.map((group) => (
            <div key={group.date} className="space-y-3">
              {/* Day Header */}
              <div className="flex items-center gap-2.5 px-1">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold",
                    group.isToday
                      ? "bg-accent text-white"
                      : group.isPast
                        ? "bg-signal-low/20 text-signal-low"
                        : "bg-base-elevated text-ink-muted",
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                </div>

                <h3 className="text-sm font-semibold text-ink">
                  {group.relativeLabel}
                </h3>

                <span className="text-xs text-ink-faint">
                  ({group.displayDate})
                </span>

                <span className="ml-auto rounded-full bg-base-elevated px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                  {group.items.length} {group.items.length === 1 ? "task" : "tasks"}
                </span>
              </div>

              {/* Day's Tasks Line-by-Line */}
              <div className="space-y-2.5">
                {group.items.map((item) => {
                  const isScheduledTopic = item.type === "topic-schedule";

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between",
                        item.isDone
                          ? "border-base-border/50 bg-base-raised/30 opacity-70"
                          : item.status === "overdue"
                            ? "border-signal-low/30 bg-signal-low/5 hover:border-signal-low/50 hover:bg-signal-low/10"
                            : item.status === "due-today"
                              ? "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/10"
                              : "border-base-border bg-base-raised/70 hover:border-accent/30 hover:bg-base-raised",
                      )}
                    >
                      {/* Left: Indicator & Content */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Type Icon Badge */}
                        <div
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            isScheduledTopic
                              ? "bg-accent/15 text-accent"
                              : "bg-emerald-500/15 text-emerald-400",
                          )}
                        >
                          {isScheduledTopic ? (
                            <BookOpen className="h-4 w-4" />
                          ) : (
                            <Brain className="h-4 w-4" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Technology Tag */}
                            <span className="rounded-lg bg-base-elevated px-2 py-0.5 text-[11px] font-medium text-ink">
                              {item.technology}
                            </span>

                            {/* Subtopic */}
                            {item.subtopic && (
                              <span className="text-xs text-ink-faint">
                                / {item.subtopic}
                              </span>
                            )}

                            {/* Type Label */}
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                isScheduledTopic
                                  ? "bg-accent/10 text-accent"
                                  : "bg-emerald-500/10 text-emerald-500",
                              )}
                            >
                              {isScheduledTopic ? "Study Schedule" : "Revision Cycle"}
                            </span>

                            {/* Time Badge if available */}
                            {item.scheduledTime && (
                              <span className="flex items-center gap-1 rounded-full bg-base-elevated px-2 py-0.5 text-[10px] font-mono text-ink-muted">
                                <Clock className="h-3 w-3" />
                                {item.scheduledTime}
                              </span>
                            )}
                          </div>

                          {/* Topic Title */}
                          <h4
                            className={cn(
                              "text-sm font-semibold text-ink truncate",
                              item.isDone && "line-through text-ink-muted",
                            )}
                          >
                            {item.title}
                          </h4>

                          {/* Notes if present */}
                          {item.notes && (
                            <p className="text-xs text-ink-faint line-clamp-1">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Forward to Topic Button */}
                        <Link
                          href={`/learning?highlight=${item.topicId}`}
                          title="Forward to topic page"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs rounded-xl hover:bg-accent hover:text-white transition-colors"
                          >
                            <span>Open Topic</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        {/* Complete Button */}
                        {!item.isDone ? (
                          <Button
                            size="sm"
                            onClick={() => handleToggleComplete(item)}
                            className="h-8 gap-1.5 text-xs rounded-xl bg-signal-high/20 hover:bg-signal-high text-signal-high hover:text-white border border-signal-high/30 transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark Done</span>
                          </Button>
                        ) : (
                          <span className="flex items-center gap-1 rounded-xl bg-signal-high/15 px-2.5 py-1 text-xs font-medium text-signal-high">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
