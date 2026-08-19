"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  Menu,
  X,
  Brain,
  Code2,
  Rocket,
  StickyNote,
  Library,
  CalendarDays,
  Timer,
  BarChart3,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getTopicNotifications } from "@/lib/notifications";

const primaryMobileTabs = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/learning", label: "Learning", icon: BookOpen },
  { href: "/notifications", label: "Alerts", icon: Bell, hasBadge: true },
  { href: "/revision", label: "Revision", icon: Brain },
];

const allNavLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { href: "/notifications", label: "Notifications", icon: Bell, section: "Overview", hasBadge: true },
  { href: "/learning", label: "Learning Hub", icon: BookOpen, section: "Learning" },
  { href: "/revision", label: "Smart Revision", icon: Brain, section: "Learning" },
  { href: "/dsa", label: "DSA Vault", icon: Code2, section: "Learning" },
  { href: "/projects", label: "Projects", icon: Rocket, section: "Workspace" },
  { href: "/notes", label: "Notes", icon: StickyNote, section: "Workspace" },
  { href: "/resources", label: "Resources", icon: Library, section: "Workspace" },
  { href: "/planner", label: "Study Planner", icon: CalendarDays, section: "Productivity" },
  { href: "/timer", label: "Study Timer", icon: Timer, section: "Productivity" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, section: "Productivity" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dueCount = useLiveQuery(async () => {
    const list = await db.learningTopics.toArray();
    const summary = getTopicNotifications(list);
    return summary.dueToday.length + summary.overdue.length;
  }, []);

  function handleLogout() {
    setDrawerOpen(false);
    logout();
    router.replace("/login");
  }

  return (
    <>
      {/* FULL-SCREEN MOBILE DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl md:hidden animate-fade-in">
          {/* Drawer Header */}
          <div className="flex h-14 items-center justify-between border-b border-base-border px-5">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="DevOS"
                className="h-6 w-auto object-contain dark:invert dark:hue-rotate-180"
              />
              <span className="text-xs font-bold text-ink">DevOS Menu</span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-border text-ink-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {allNavLinks.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                const showBadge = item.hasBadge && typeof dueCount === "number" && dueCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl p-3 text-xs font-medium border transition-colors",
                      active
                        ? "bg-accent/15 border-accent/40 text-accent font-semibold"
                        : "bg-base-raised/60 border-base-border/70 text-ink-muted hover:text-ink",
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="h-4 w-4 shrink-0 text-accent" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {showBadge && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                        {dueCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Details & Settings */}
            <div className="border-t border-base-border pt-4 space-y-2">
              <div className="rounded-xl border border-base-border bg-base-raised/60 p-3">
                <p className="text-xs font-semibold text-ink">{user?.name}</p>
                <p className="text-[11px] text-ink-muted">{user?.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-base-border bg-base-raised/60 py-2.5 text-xs font-medium text-ink"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-base-border bg-base-raised/60 py-2.5 text-xs font-medium text-ink"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-medium text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM TAB BAR */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-base-border/80 bg-card/90 px-2 backdrop-blur-lg md:hidden">
        {primaryMobileTabs.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const showBadge = item.hasBadge && typeof dueCount === "number" && dueCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
                active ? "text-accent font-semibold" : "text-ink-muted hover:text-ink",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-bold text-white">
                    {dueCount}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu Drawer Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
            drawerOpen ? "text-accent font-semibold" : "text-ink-muted hover:text-ink",
          )}
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
