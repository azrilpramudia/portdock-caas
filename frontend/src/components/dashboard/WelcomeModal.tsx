"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export function WelcomeModal() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Cek apakah modal sudah pernah ditampilkan untuk user ini
    const hasSeen = localStorage.getItem(`hideWelcomeModal_${user.id}`);
    if (!hasSeen) {
      setOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleContinue = () => {
    setOpen(false);
    if (dontShowAgain && user) {
      localStorage.setItem(`hideWelcomeModal_${user.id}`, "true");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-blue-500" />
          </div>
          <DialogTitle className="text-center text-xl">Selamat Datang</DialogTitle>
          <DialogDescription className="text-center pt-2 leading-relaxed">
            Sistem ini masih dalam <strong>tahap pengembangan (Private Testing)</strong>. Jika Anda menemukan bug atau error selama penggunaan, mohon laporkan kendala beserta screenshot ke:
            <br />
            <br />
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=azrilpramudia01@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 font-semibold hover:underline"
            >
              azrilpramudia01@gmail.com
            </a>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between items-center mt-4">
          <div 
            className="flex items-center space-x-2.5 w-full sm:w-auto justify-start cursor-pointer group mt-4 sm:mt-0"
            onClick={() => setDontShowAgain(!dontShowAgain)}
          >
            <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${dontShowAgain ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-500'}`}>
              {dontShowAgain && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <label
              className="text-[13px] text-slate-600 dark:text-slate-400 cursor-pointer select-none whitespace-nowrap leading-none"
            >
              Jangan tampilkan lagi
            </label>
          </div>
          <Button onClick={handleContinue} className="w-full sm:w-auto portdock-gradient text-white">
            Mengerti, Lanjutkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
