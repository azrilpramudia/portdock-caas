"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/constants/nav";
import { Button } from "@/components/ui/button";
import portdockLogo from "@/assets/portdock.png";

export function DashboardSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border",
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
            <span className="text-foreground transition-colors duration-300">Port</span><span className="text-blue-600">Dock</span>
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
                  ? "bg-primary text-primary-foreground shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Help block */}
      <div className="p-5">
        <div className="bg-muted/50 border border-border rounded-2xl p-5 text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">Need Help?</h4>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Check our documentation or contact support team.
          </p>
          <Button variant="outline" className="w-full bg-background border-border text-primary font-semibold hover:bg-muted hover:text-primary h-9 text-xs">
            View Documentation
          </Button>
        </div>
      </div>
    </aside>
  );
}
