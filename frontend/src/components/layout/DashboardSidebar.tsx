"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HelpCircle, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { navItems } from "@/constants/nav";
import { Button } from "@/components/ui/button";
import portdockLogo from "@/assets/portdock.png";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettingsStore } from "@/store/settings";

export function DashboardSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const { siteName, sidebarStyle } = useSettingsStore(state => state.settings);
  const isCompact = sidebarStyle === "compact" && !mobile;

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        mobile ? "w-full" : isCompact ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 lg:p-5">
        <Link href="/dashboard" className={cn("flex items-center gap-2 group", isCompact && "justify-center")} onClick={onClose}>
          <Image
            src={portdockLogo}
            alt="Portdock icon"
            height={40}
            width={48}
            quality={100}
            priority
            className="h-9 w-auto object-contain"
          />
          {!isCompact && (
            <span className="font-bold text-[1.35rem] leading-none tracking-tight select-none mt-1">
              <span className="text-foreground transition-colors duration-300">{siteName}</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-3 py-1 space-y-1">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            
            const label = (() => {
              const key = item.id as keyof typeof t.sidebar;
              return t.sidebar[key] || item.label;
            })();

            const navLink = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 group",
                  isCompact ? "justify-center px-0" : "px-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-200 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isCompact && <span>{label}</span>}
              </Link>
            );

            if (isCompact) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger render={navLink} />
                  <TooltipContent side="right" className="font-semibold">
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </TooltipProvider>
      </nav>

      {/* Help block */}
      {!isCompact && (
        <div className="p-4">
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground text-[13px] mb-1">Need Help?</h4>
            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
              Check our documentation or contact support team.
            </p>
            <Button variant="outline" className="w-full bg-background border-border text-primary font-semibold hover:bg-muted hover:text-primary h-9 text-xs">
              View Documentation
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
