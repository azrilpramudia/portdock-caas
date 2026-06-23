"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Cek apakah modal sudah pernah ditampilkan
    const hasSeen = localStorage.getItem("hasSeenWelcome");
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("hasSeenWelcome", "true");
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
        <DialogFooter className="sm:justify-center mt-4">
          <Button onClick={handleClose} className="w-full sm:w-auto portdock-gradient text-white">
            Mengerti, Lanjutkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
