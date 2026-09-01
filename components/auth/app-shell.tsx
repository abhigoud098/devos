"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { NotificationBanner } from "@/components/notifications/notification-banner";
import { syncTopicsFromBackend } from "@/lib/learning-repo";
import { TopHeader } from "@/components/layout/top-header";

export const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      syncTopicsFromBackend();
    }
  }, [isAuthenticated]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative overflow-x-hidden">
        {/* Fixed Desktop Sidebar (Locked to 256px / 16rem on large screens) & Mobile Slide-Over */}
        <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

        {/* Main Content Area: Offset by 256px on lg screens, takes full width on mobile */}
        <div className="flex flex-1 flex-col min-w-0 lg:pl-64 w-full">
          <TopHeader onOpenMenu={() => setMobileMenuOpen(true)} />
          <main className="min-w-0 flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile Navigation Bar */}
        <MobileNav onOpenMenu={() => setMobileMenuOpen(true)} />
        <NotificationBanner />
      </div>
    </ProtectedRoute>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}?`) || pathname.startsWith(`${p}/`),
  );

  return (
    <AuthProvider>
      <LoadingOverlay />
      {isPublicPage ? (
        children
      ) : (
        <AuthenticatedContent>{children}</AuthenticatedContent>
      )}
    </AuthProvider>
  );
}
