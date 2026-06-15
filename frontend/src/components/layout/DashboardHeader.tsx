"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { navItems } from "@/constants/nav";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const currentNav = navItems.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  const pageTitle = currentNav?.label || "Dashboard";

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-[10px] flex items-center justify-center">
            <Menu className="w-[18px] h-[18px]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {pageTitle}
            </h1>
            {pageTitle === "Dashboard" && (
              <p className="text-[13px] text-slate-500 mt-0.5">Overview of your deployments and system status</p>
            )}
            {pageTitle === "Projects" && (
              <p className="text-[13px] text-slate-500 mt-0.5">Manage all your deployment projects</p>
            )}
            {pageTitle === "Deploy" && (
              <p className="text-[13px] text-slate-500 mt-0.5">Deploy your application to Docker in minutes</p>
            )}
            {pageTitle === "Containers" && (
              <p className="text-[13px] text-slate-500 mt-0.5">Manage and control your Docker containers</p>
            )}
            {pageTitle === "Monitoring" && (
              <p className="text-[13px] text-slate-500 mt-0.5">Real-time overview of your container resources</p>
            )}
            {pageTitle === "Terminal" && (
              <p className="text-[13px] text-slate-500 mt-0.5">Access and manage your containers via web terminal</p>
            )}
            {pageTitle === "Activity Logs" && (
              <p className="text-[13px] text-slate-500 mt-0.5">View all system activities and user actions</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 cursor-pointer group">
            <Avatar className="w-9 h-9 border border-slate-200">
              <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-10">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{pageTitle}</span>
        </div>
        <Avatar className="w-8 h-8 border border-slate-200">
          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </header>
    </>
  );
}
