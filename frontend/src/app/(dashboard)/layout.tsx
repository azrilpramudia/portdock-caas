"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import portdockLogo from "@/assets/portdock.png";
import {
  LayoutDashboard,
  FolderOpen,
  Container,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  Container as ContainerIcon,
  Terminal as TerminalIcon,
  Rocket,
  ChevronRight,
  Menu,
  Bell,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/deploy", icon: Rocket, label: "Deploy" },
  { href: "/containers", icon: Container, label: "Containers" },
  { href: "/monitoring", icon: BarChart3, label: "Monitoring" },
  { href: "/terminal", icon: TerminalIcon, label: "Terminal" },
  { href: "/activity-logs", icon: ScrollText, label: "Activity Logs" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-slate-200",
        mobile ? "w-full" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 group" onClick={onClose}>
          <Image
            src={portdockLogo}
            alt="Portdock icon"
            height={40}
            width={48}
            quality={100}
            priority
            className="h-9 w-auto object-contain"
          />
          <span className="font-bold text-[1.35rem] leading-none tracking-tight select-none mt-1">
            <span className="text-slate-900 transition-colors duration-300">Port</span><span className="text-blue-600">Dock</span>
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 group",
                isActive
                  ? "bg-blue-600 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Help block */}
      <div className="p-5">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-semibold text-slate-900 text-sm mb-1.5">Need Help?</h4>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Check our documentation or contact support team.
          </p>
          <Button variant="outline" className="w-full bg-white border-slate-200 text-blue-600 font-semibold hover:bg-slate-50 hover:text-blue-700 h-9 text-xs">
            View Documentation
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, initialize } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Determine current page title
  const currentNav = navItems.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  const pageTitle = currentNav?.label || "Dashboard";

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[260px]">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
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
            onClick={() => setSidebarOpen(true)}
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
