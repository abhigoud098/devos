"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, UserRound, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getTopicNotifications } from "@/lib/notifications";

const routeTitles: Record<string, { title: string; category: string }> = {
  "/": { title: "Dashboard", category: "Overview" },
  "/notifications": { title: "Notifications", category: "Insights" },
  "/learning": { title: "Learning Hub", category: "Learning" },
  "/revision": { title: "Smart Revision", category: "Learning" },
  "/dsa": { title: "DSA Knowledge Vault", category: "Learning" },
  "/projects": { title: "Projects", category: "Workspace" },
  "/notes": { title: "Developer Notes", category: "Workspace" },
  "/resources": { title: "Resources", category: "Workspace" },
  "/planner": { title: "Study Planner", category: "Productivity" },
  "/timer": { title: "Study Timer", category: "Productivity" },
  "/analytics": { title: "Analytics", category: "Insights" },
  "/profile": { title: "Profile", category: "Account" },
  "/settings": { title: "Settings", category: "Account" },
};

export function TopHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const dueCount = useLiveQuery(async () => {
    const list = await db.learningTopics.toArray();
    const summary = getTopicNotifications(list);
    return summary.dueToday.length + summary.overdue.length;
  }, []);

  const current = routeTitles[pathname] || { title: "DevOS", category: "Workspace" };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-base-border/70 bg-card/80 px-4 sm:px-8 backdrop-blur-md">
      {/* LEFT: Context Breadcrumb / Mobile Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <img
            src="/logo.png"
            alt="DevOS"
            className="h-6 w-auto object-contain dark:invert dark:hue-rotate-180"
          />
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-ink-muted">
          <span>{current.category}</span>
          <span className="text-ink-faint">/</span>
          <span className="text-ink font-semibold">{current.title}</span>
        </div>
      </div>

      {/* RIGHT: Global search, Notifications trigger, User badge */}
      <div className="flex items-center gap-2.5">
        {/* Notifications Icon with Badge */}
        <Link
          href="/notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-base-elevated hover:text-ink"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {typeof dueCount === "number" && dueCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-card">
              {dueCount > 9 ? "9+" : dueCount}
            </span>
          )}
        </Link>

        {/* User Pill */}
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-lg border border-base-border/80 bg-base-raised/60 py-1 pl-2 pr-2.5 text-xs text-ink transition-colors hover:bg-base-elevated"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent">
            <UserRound className="h-3 w-3" />
          </div>
          <span className="max-w-[100px] truncate font-medium sm:max-w-[140px]">
            {user?.name || "Developer"}
          </span>
        </Link>
      </div>
    </header>
  );
}
