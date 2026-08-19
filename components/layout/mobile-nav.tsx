"use client";

import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NAV } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

const mobileItems = [
  NAV[0],
  NAV[1],
  NAV[9],
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[68px] items-center justify-around border-t border-base-border bg-base-raised/95 px-2 backdrop-blur md:hidden">
    {mobileItems.map((item) => {
      const Icon = item.icon;
      return <Link key={item.href} href={item.href} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium", pathname === item.href ? "text-accent" : "text-ink-faint")}><Icon className="h-[18px] w-[18px]" /><span className="max-w-[50px] truncate">{item.label}</span></Link>;
    })}
    <button aria-label="Logout" onClick={() => { logout(); router.replace("/login"); }} className="flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium text-ink-faint"><LogOut className="h-[18px] w-[18px]" /><span>Logout</span></button>
  </nav>;
}
