"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learning", label: "Learning", icon: BookOpen },
  { href: "/revision", label: "Smart Revision", icon: Brain },
  { href: "/dsa", label: "DSA", icon: Code2 },
  { href: "/projects", label: "Projects", icon: Rocket },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/timer", label: "Study Timer", icon: Timer },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-base-border bg-base-raised/40 px-3 py-5">
      <div className="px-3 mb-6">
        <span className="text-[15px] font-semibold tracking-tight">DevOS</span>
        <p className="text-xs text-ink-faint mt-0.5">Developer Second Brain</p>
      </div>

      <nav className="flex-1 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors",
                active
                  ? "text-ink bg-base-elevated"
                  : "text-ink-muted hover:text-ink hover:bg-base-elevated/60"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-accent" />
              )}
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-3 border-t border-base-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors",
            pathname === "/settings"
              ? "text-ink bg-base-elevated"
              : "text-ink-muted hover:text-ink hover:bg-base-elevated/60"
          )}
        >
          <Settings className="h-[17px] w-[17px]" strokeWidth={1.75} />
          Settings
        </Link>
        <div className="mt-3 px-3 text-[11px] text-ink-faint font-mono">
          <kbd className="rounded border border-base-border px-1.5 py-0.5">⌘K</kbd> to search
        </div>
      </div>
    </aside>
  );
}
