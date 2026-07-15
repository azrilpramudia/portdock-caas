"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Shield, Loader2, CheckCircle2, QrCode } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/lib/api";
import Image from "next/image";
import { useAuthStore } from "@/store/auth";

export function TwoFactorSettings() {
  const { user, updateUser } = useAuthStore();
  const [is2faEnabled, setIs2faEnabled] = useState(user?.isTwoFactorEnabled || false);
  
  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      // Don't toggle visually yet, just open setup mode and fetch QR code
      setSetupMode(true);
      setIsLoading(true);
      try {
        const res = await api.post('/auth/2fa/setup');
        setQrCodeUrl(res.data.qrCode);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to initiate 2FA setup");
        setSetupMode(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Disable 2FA
      setIsLoading(true);
      try {
        await api.post('/auth/2fa/turn-off');
        setIs2faEnabled(false);
        updateUser({ isTwoFactorEnabled: false });
        toast.success("Two-Factor Authentication has been disabled");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to disable 2FA");
        // reset switch visual if failed
        setIs2faEnabled(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return;
    
    setIsLoading(true);
    try {
      await api.post('/auth/2fa/turn-on', { token: otpCode });
      setIs2faEnabled(true);
      setSetupMode(false);
      setOtpCode("");
      updateUser({ isTwoFactorEnabled: true });
      toast.success("Two-Factor Authentication successfully enabled!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Shield className="w-[18px] h-[18px]" />
        </div>
        <h2 className="text-[15px] font-bold text-foreground">Two-Factor Authentication</h2>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold tracking-wide uppercase border border-blue-500/20">Recommended</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between py-4">
          <div className="space-y-1 pr-4">
            <h4 className="text-[14px] font-semibold text-foreground">
              {is2faEnabled ? "2FA is Active" : "Enable 2FA"}
            </h4>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Add an extra layer of security to your account. You'll need to provide a 6-digit code from your authenticator app when logging in.
            </p>
          </div>
          <Switch 
            checked={is2faEnabled || setupMode} // Visual feedback when setup opens
            onCheckedChange={handleToggle}
            disabled={isLoading && !setupMode} // Keep enabled while dialog is open so it can be visually closed if they cancel? No, if dialog opens, let them use dialog cancel button.
            className="data-[state=checked]:bg-indigo-600 shrink-0"
          />
        </div>
        {is2faEnabled && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-4 py-3 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Your account is protected with Two-Factor Authentication.</span>
          </div>
        )}
      </div>

      {/* Setup Dialog */}
      <Dialog open={setupMode} onOpenChange={(open) => !open && setSetupMode(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (like Google Authenticator or Authy), then enter the 6-digit code below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="bg-white p-3 rounded-xl border border-gray-200 mb-5 shadow-sm">
              {qrCodeUrl ? (
                <Image src={qrCodeUrl} alt="2FA QR Code" width={160} height={160} className="rounded-lg" />
              ) : (
                <div className="w-[160px] h-[160px] flex items-center justify-center text-muted-foreground/50">
                  {isLoading ? <Loader2 className="w-10 h-10 animate-spin" /> : <QrCode className="w-10 h-10" />}
                </div>
              )}
            </div>
            
            <form onSubmit={handleVerifySetup} className="w-full space-y-4">
              <div className="relative">
                <Input 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest h-12 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <DialogFooter className="flex sm:justify-between sm:space-x-2">
                <Button type="button" variant="outline" onClick={() => { setSetupMode(false); setOtpCode(""); }} className="flex-1" disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading || otpCode.length < 6}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Verify Code
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
