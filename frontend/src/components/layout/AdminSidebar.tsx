"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Folder, 
  Box, 
  Rocket, 
  Activity, 
  Globe, 
  List, 
  Settings2, 
  Settings,
  ChevronDown,
  LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface AdminSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ mobile, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Projects", href: "/admin/projects", icon: Folder },
    { name: "Containers", href: "/admin/containers", icon: Box },
    { name: "Deployments", href: "/admin/deployments", icon: Rocket },
    { name: "Monitoring", href: "/admin/monitoring", icon: Activity },
    { name: "Domains", href: "/admin/domains", icon: Globe },
    { name: "Activity Logs", href: "/admin/activity", icon: List },
    { name: "Server Settings", href: "/admin/server", icon: Settings2 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const content = (
    <div className="flex h-full w-[260px] flex-col bg-[#041527] border-r border-[#0f2a4a] text-white overflow-hidden">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 mt-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20M2 12l5-5M2 12l5 5" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            PORTDOCK
          </span>
        </div>
      </div>

      <div className="px-6 py-2 shrink-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          ADMIN PANEL
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          // Exact match for dashboard, startswith for others
          const isActive = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname.startsWith(item.href) && item.href !== "/admin";
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-[#0066FF] text-white shadow-sm"
                  : "text-gray-400 hover:bg-[#0f2a4a] hover:text-white"
              }`}
            >
              <Icon
                className={`mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Area */}
      <div className="p-4 border-t border-[#0f2a4a] shrink-0">
        <div className="flex items-center gap-3 w-full cursor-pointer hover:bg-[#0f2a4a] p-2 rounded-lg transition-colors group relative">
          <div className="w-10 h-10 rounded-full bg-[#0066FF] flex items-center justify-center text-white font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Admin Portdock
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || "admin@portdock.id"}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          
          {/* Quick exit/logout on hover overlay */}
          <div className="absolute inset-0 bg-[#0f2a4a] rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
             <Link href="/projects" onClick={onClose} className="text-xs text-gray-300 hover:text-white" title="Exit to App">
               Exit
             </Link>
             <button onClick={() => { logout(); onClose?.(); }} className="text-xs text-red-400 hover:text-red-300 flex items-center" title="Logout">
               <LogOut className="w-3 h-3 mr-1" /> Logout
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  return content;
}
