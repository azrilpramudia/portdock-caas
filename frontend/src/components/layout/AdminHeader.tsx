"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Menu, User, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-card border-b border-border shadow-sm z-10 shrink-0 h-[64px]">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="text-foreground/80 hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-6 justify-end flex-1">
        {/* Search */}
        <div className="relative group flex items-center">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
          <button 
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                ctrlKey: true
              });
              document.dispatchEvent(event);
            }}
            className="flex items-center text-left pl-9 pr-12 py-1.5 text-sm bg-background border border-border rounded-lg outline-none hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-[300px] text-muted-foreground"
          >
            Search anything...
          </button>
          <div className="absolute right-2 flex items-center text-[10px] text-muted-foreground font-medium pointer-events-none">
            <span className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-semibold tracking-widest">⌘K</span>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer group ml-2"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {user?.name || "Admin Portdock"}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Administrator
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground ml-1 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-card rounded-xl shadow-lg border border-border py-1 z-50">
              <div className="px-4 py-2 border-b border-border mb-1">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Link 
                href="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
              <button 
                onClick={() => { setIsProfileOpen(false); logout(); }}
                className="w-full flex items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
