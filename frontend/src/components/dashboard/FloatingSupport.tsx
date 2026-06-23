"use client";

import { MessageCircleQuestion } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";

export function FloatingSupport() {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <Popover>
        <PopoverTrigger
          className={buttonVariants({
            size: "icon",
            className: "w-14 h-14 rounded-full shadow-2xl shadow-blue-500/20 portdock-gradient text-white hover:scale-105 transition-transform"
          })}
        >
          <MessageCircleQuestion className="w-6 h-6" />
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={16} className="w-80 p-4 shadow-xl border-border/50">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Butuh Bantuan?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sistem ini masih tahap pengembangan. Jika Anda menemukan bug atau error, mohon laporkan kendala beserta screenshot ke email di bawah ini.
            </p>
            <div className="pt-2">
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=azrilpramudia01@gmail.com" 
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ 
                  variant: "outline", 
                  className: "w-full text-xs h-9 border-blue-500/20 hover:bg-blue-500/10 text-blue-500" 
                })}
              >
                azrilpramudia01@gmail.com
              </a>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
