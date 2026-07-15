"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
import { FloatingSupport } from "@/components/dashboard/FloatingSupport";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { DashboardErrorBoundary } from "@/components/shared/DashboardErrorBoundary";
import { MaintenanceBanner } from "@/components/layout/MaintenanceBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initialize, isInitializing } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <MaintenanceBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[260px]">
            <DashboardSidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <DashboardErrorBoundary>
            <div className="p-4 lg:p-8 animate-fade-in">{children}</div>
          </DashboardErrorBoundary>
        </main>
      </div>
      </div>

      {/* Global Dashboard Elements */}
      <CommandPalette />
      <WelcomeModal />
      <FloatingSupport />
    </div>
  );
}
