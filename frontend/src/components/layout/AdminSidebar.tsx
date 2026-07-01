"use client";

import Link from "next/link";
import Image from "next/image";
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
import portdockLogo from "@/assets/portdock.png";

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
    <div className="flex h-full w-[260px] flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground overflow-hidden">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 mt-2 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 group" onClick={onClose}>
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
            <span className="text-sidebar-foreground transition-colors duration-300">Port</span><span className="text-sidebar-primary">Dock</span>
          </span>
        </Link>
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
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon
                className={`mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors ${
                  isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Area */}
      <div className="p-4 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 w-full cursor-pointer hover:bg-sidebar-accent p-2 rounded-lg transition-colors group relative">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || "Admin Portdock"}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.email || "admin@portdock.id"}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-sidebar-foreground/70 shrink-0" />
          
          {/* Quick exit/logout on hover overlay */}
          <div className="absolute inset-0 bg-sidebar-accent rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
             <Link href="/projects" onClick={onClose} className="text-xs text-sidebar-accent-foreground/80 hover:text-sidebar-accent-foreground" title="Exit to App">
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
