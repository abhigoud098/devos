"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

const publicPaths = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = publicPaths.includes(pathname);

  return (
    <AuthProvider>
      <LoadingOverlay />
      {isPublicPage ? children : (
        <ProtectedRoute>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1 pb-[68px] md:pb-0">{children}</main>
            <MobileNav />
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}
