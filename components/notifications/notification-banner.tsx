"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Bell, BookOpen, CheckCircle, ChevronRight, Sparkles, X } from "lucide-react";
import { db } from "@/lib/db";
import {
  getTopicNotifications,
  triggerAppOpenBrowserNotification,
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";

export function NotificationBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("devos_banner_dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (!topics || topics.length === 0) return;

    const summary = getTopicNotifications(topics);
    const dueCount = summary.dueToday.length + summary.overdue.length;

    if (dueCount > 0 && !hasCheckedPermission) {
      setHasCheckedPermission(true);
      triggerAppOpenBrowserNotification(summary.dueToday);
    }
  }, [topics, hasCheckedPermission]);

  if (dismissed || !topics) return null;

  const summary = getTopicNotifications(topics);
  const activeDue = [...summary.overdue, ...summary.dueToday];

  if (activeDue.length === 0) return null;

  const totalCount = activeDue.length;
  const overdueCount = summary.overdue.length;
  const firstTopic = activeDue[0];

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("devos_banner_dismissed", "true");
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-base-raised/95 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-accent/20">
        {/* Ambient background glow */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/20 blur-xl pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {totalCount}
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Daily Study Reminder
              </span>
              {overdueCount > 0 && (
                <span className="rounded-full bg-signal-low/20 px-2 py-0.5 text-[10px] font-medium text-signal-low">
                  {overdueCount} Overdue
                </span>
              )}
            </div>

            <h4 className="mt-1 text-sm font-semibold text-ink truncate">
              {totalCount === 1
                ? `Time to study "${firstTopic.title}"`
                : `${totalCount} topics scheduled for today`}
            </h4>

            <p className="mt-0.5 text-xs text-ink-muted line-clamp-2">
              {firstTopic.subtopic
                ? `${firstTopic.technology} • ${firstTopic.subtopic}`
                : `${firstTopic.technology} • Keep your learning streak alive!`}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Link href="/notifications" onClick={handleDismiss}>
                <Button size="sm" className="h-7 text-xs gap-1.5 rounded-lg px-3">
                  <BookOpen className="h-3.5 w-3.5" />
                  View All Tasks
                </Button>
              </Link>

              <Link
                href={`/learning?highlight=${firstTopic.topicId}`}
                onClick={handleDismiss}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 rounded-lg px-2.5 hover:bg-accent/10"
                >
                  Start Topic
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 rounded-lg p-1 text-ink-faint hover:bg-base-elevated hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
