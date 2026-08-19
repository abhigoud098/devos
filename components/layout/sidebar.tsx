"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  BookOpen,
  Brain,
  Code2,
  Rocket,
  StickyNote,
  Library,
  CalendarDays,
  BarChart3,
  Timer,
  Settings,
  LogOut,
  UserRound,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getTopicNotifications } from "@/lib/notifications";

export const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/notifications", label: "Notifications", icon: Bell, hasBadge: true },
    ],
  },
  {
    title: "Learning",
    items: [
      { href: "/learning", label: "Learning Hub", icon: BookOpen },
      { href: "/revision", label: "Smart Revision", icon: Brain },
      { href: "/dsa", label: "DSA Vault", icon: Code2 },
    ],
  },
  {
    title: "Workspace",
    items: [
      { href: "/projects", label: "Projects", icon: Rocket },
      { href: "/notes", label: "Notes", icon: StickyNote },
      { href: "/resources", label: "Resources", icon: Library },
    ],
  },
  {
    title: "Productivity",
    items: [
      { href: "/planner", label: "Study Planner", icon: CalendarDays },
      { href: "/timer", label: "Study Timer", icon: Timer },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const dueCount = useLiveQuery(async () => {
    const list = await db.learningTopics.toArray();
    const summary = getTopicNotifications(list);
    return summary.dueToday.length + summary.overdue.length;
  }, []);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-base-border/80 bg-card/40 px-3.5 py-5 backdrop-blur-md">
      {/* Brand Header */}
      <div className="px-3 mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="DevOS"
            className="h-8 w-auto object-contain dark:invert dark:hue-rotate-180"
          />
        </Link>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
          v2.0
        </span>
      </div>

      {/* Grouped Navigation */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              {group.title}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                const isNotif = item.hasBadge;
                const showBadge = isNotif && typeof dueCount === "number" && dueCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150",
                      active
                        ? "bg-accent/10 text-accent font-semibold shadow-sm ring-1 ring-accent/20"
                        : "text-ink-muted hover:bg-base-elevated/70 hover:text-ink",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                          active ? "text-accent" : "text-ink-muted group-hover:text-ink",
                        )}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {showBadge && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white shadow-sm">
                        {dueCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Account & Settings Footer */}
      <div className="mt-4 border-t border-base-border/80 pt-3.5 space-y-1">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
            pathname === "/profile"
              ? "bg-base-elevated text-ink font-semibold"
              : "text-ink-muted hover:bg-base-elevated/60 hover:text-ink",
          )}
        >
          <UserRound className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          <span>Profile</span>
        </Link>

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
            pathname === "/settings"
              ? "bg-base-elevated text-ink font-semibold"
              : "text-ink-muted hover:bg-base-elevated/60 hover:text-ink",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          <span>Settings</span>
        </Link>

        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
