"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { NotificationBanner } from "@/components/notifications/notification-banner";
import { syncTopicsFromBackend } from "@/lib/learning-repo";

import { TopHeader } from "@/components/layout/top-header";

const publicPaths = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = publicPaths.includes(pathname);

  useEffect(() => {
    syncTopicsFromBackend();
  }, []);

  return (
    <AuthProvider>
      <LoadingOverlay />
      {isPublicPage ? (
        children
      ) : (
        <ProtectedRoute>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0">
              <TopHeader />
              <main className="min-w-0 flex-1 pb-20 md:pb-8">{children}</main>
            </div>
            <MobileNav />
            <NotificationBanner />
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}
