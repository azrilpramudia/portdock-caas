"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, initialize } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user && user.role !== "ADMIN") {
      // Security Guard: Non-admins go back to user dashboard
      router.replace("/projects");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[260px]">
            <AdminSidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0f1115] border-b border-border border-t-2 border-t-red-600">
          <div className="flex items-center">
            <span className="text-white font-bold tracking-tight">Portdock <span className="text-red-500">ADMIN</span></span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <AdminHeader />

        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
