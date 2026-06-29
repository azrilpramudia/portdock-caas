"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Server, ShieldAlert, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ mobile, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Global Projects", href: "/admin/projects", icon: Server },
  ];

  const content = (
    <div className="flex h-full flex-col bg-[#0f1115] border-r border-[#1e2329] text-white">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 border-b border-[#1e2329] border-t-4 border-t-red-600">
        <ShieldAlert className="w-6 h-6 text-red-500 mr-2" />
        <span className="text-lg font-bold tracking-tight text-white">
          Portdock <span className="text-red-500 font-black">ADMIN</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Management
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-red-500/10 text-red-400"
                  : "text-gray-400 hover:bg-[#1e2329] hover:text-white"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-red-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#1e2329]">
        <Link href="/projects" onClick={onClose} className="block w-full mb-2">
          <Button variant="outline" className="w-full bg-[#1e2329] border-none text-gray-300 hover:text-white hover:bg-[#2a3038] justify-start text-sm h-10">
            Exit Admin Mode
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          onClick={() => { logout(); onClose?.(); }}
          className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 justify-start text-sm h-10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return content;
}
