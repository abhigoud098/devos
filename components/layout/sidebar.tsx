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
      { href: "/ai", label: "AI Assistant", icon: Sparkles },
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

import { useEffect } from "react";
import { X } from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const dueCount = useLiveQuery(async () => {
    const list = await db.learningTopics.toArray();
    const summary = getTopicNotifications(list);
    return summary.dueToday.length + summary.overdue.length;
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  }, [pathname, setMobileOpen]);

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen && setMobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  function handleLogout() {
    if (setMobileOpen) setMobileOpen(false);
    logout();
    router.replace("/login");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="px-2 mb-5 flex items-center justify-between shrink-0">
        <Link
          href="/"
          onClick={() => setMobileOpen?.(false)}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-tr from-violet-600 to-indigo-500 font-mono font-bold text-sm text-white shadow-md shadow-violet-500/25 transition-transform group-hover:scale-105">
            {"</>"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-ink">DevOS</span>
            <span className="text-[10px] text-ink-muted -mt-0.5 tracking-wider uppercase font-semibold">Workspace</span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
            v2.0
          </span>
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="flex lg:hidden h-7 w-7 items-center justify-center rounded-lg border border-base-border/70 text-ink-muted hover:bg-base-elevated hover:text-ink transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grouped Navigation */}
      <div className="flex-1 min-h-0 space-y-5 overflow-y-auto pr-1">
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
                    onClick={() => setMobileOpen?.(false)}
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
      <div className="mt-auto shrink-0 border-t border-base-border/80 pt-3.5 space-y-1">
        <Link
          href="/profile"
          onClick={() => setMobileOpen?.(false)}
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
          onClick={() => setMobileOpen?.(false)}
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
    </div>
  );

  return (
    <>
      {/* FIXED DESKTOP SIDEBAR (1024px+) - Locked to 256px width, does NOT expand */}
      <aside className="hidden lg:flex w-64 min-w-[256px] max-w-[256px] fixed top-0 left-0 bottom-0 h-screen shrink-0 flex-col border-r border-base-border/80 bg-card/75 px-3.5 py-5 backdrop-blur-md z-30 select-none">
        {sidebarContent}
      </aside>

      {/* MOBILE SLIDE-OVER DRAWER (< 1024px) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileOpen?.(false)}
            aria-hidden="true"
          />

          {/* Sliding Drawer Panel */}
          <div className="relative flex w-72 max-w-[85vw] flex-col bg-card/95 backdrop-blur-xl border-r border-base-border/80 p-4 shadow-2xl z-50 animate-in slide-in-from-left duration-200 select-none">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
