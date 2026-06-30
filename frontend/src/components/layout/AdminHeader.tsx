"use client";

import { Search, Bell, Sun, ChevronDown, Menu } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shadow-sm z-10 shrink-0 h-[64px]">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="text-gray-400 hover:text-gray-600 transition-colors hidden" // hidden on desktop for now
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-6 justify-end flex-1">
        {/* Search */}
        <div className="relative group flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-9 pr-12 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all w-[300px]"
          />
          <div className="absolute right-2 flex items-center gap-0.5 text-[10px] text-gray-400 font-medium">
            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">⌘</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">K</span>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              5
            </span>
          </button>
          
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <Sun className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-[#0066FF] text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0066FF] transition-colors">
              Admin Portdock
            </span>
            <span className="text-xs text-gray-500">
              Administrator
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
