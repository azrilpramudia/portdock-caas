"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { navItems } from "@/constants/nav";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
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
      <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-card border-b border-border z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 text-primary rounded-[10px] flex items-center justify-center">
            <Menu className="w-[18px] h-[18px]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">
              {pageTitle}
            </h1>
            {pageTitle === "Dashboard" && (
              <p className="text-[13px] text-muted-foreground mt-0.5">Overview of your deployments and system status</p>
            )}
            {pageTitle === "Projects" && (
              <p className="text-[13px] text-muted-foreground mt-0.5">Manage all your deployment projects</p>
            )}
            {pageTitle === "Deploy" && (
              <p className="text-[13px] text-muted-foreground mt-0.5">Deploy your application to Docker in minutes</p>
            )}
            {pageTitle === "Containers" && (
              <p className="text-[13px] text-muted-foreground mt-0.5">Manage and control your Docker containers</p>
            )}
            {pageTitle === "Monitoring" && (
              <p className="text-[13px] text-muted-foreground mt-0.5">Real-time overview of your container resources</p>
            )}
            {pageTitle === "Terminal" && (
              <p className="text-[13px] text-muted-foreground mt-0.5">Access and manage your containers via web terminal</p>
            )}
            {pageTitle === "Activity Logs" && (
              <p className="text-[13px] text-muted-foreground mt-0.5">View all system activities and user actions</p>
            )}
            {pageTitle === "Settings" && (
              <p className="text-[13px] text-muted-foreground mt-0.5">Manage your account and platform preferences</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-3 cursor-pointer group outline-none">
                <Avatar className="w-9 h-9 border border-border">
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-muted-foreground hover:text-foreground focus:text-foreground"
                onClick={() => router.push("/settings")}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-muted-foreground hover:text-foreground focus:text-foreground"
                onClick={() => router.push("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10"
                onClick={() => {
                  useAuthStore.getState().logout();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-foreground text-[15px]">{pageTitle}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none ml-1">
              <div className="flex items-center cursor-pointer outline-none">
                <Avatar className="w-8 h-8 border border-border">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-muted-foreground hover:text-foreground focus:text-foreground py-2.5"
                  onClick={() => router.push("/settings")}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-muted-foreground hover:text-foreground focus:text-foreground py-2.5"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10"
                onClick={() => {
                  useAuthStore.getState().logout();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
