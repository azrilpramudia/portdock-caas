"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdminSettings";
import { PasswordPolicyModal } from "./PasswordPolicyModal";

export function SecuritySettingsCard() {
  const { data: settings } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [loginAttempts, setLoginAttempts] = useState("5");

  useEffect(() => {
    if (settings) {
      if (settings.twoFactor !== undefined) setTwoFactor(settings.twoFactor === "true");
      if (settings.sessionTimeout) setSessionTimeout(settings.sessionTimeout);
      if (settings.loginAttempts) setLoginAttempts(settings.loginAttempts);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      twoFactor: twoFactor ? "true" : "false",
      sessionTimeout,
      loginAttempts,
    });
  };

  const TIMEOUT_LABELS: Record<string, string> = {
    "15": "15 menit",
    "30": "30 menit",
    "60": "1 jam",
    "120": "2 jam"
  };

  const ATTEMPTS_LABELS: Record<string, string> = {
    "3": "3 percobaan",
    "5": "5 percobaan",
    "10": "10 percobaan"
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full w-full">
      <div className="px-6 pt-6 pb-5">
        <h3 className="text-base font-bold text-foreground">Security Settings</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">Kelola keamanan akun dan sistem</p>
      </div>
      
      <div className="px-6 pb-6 flex-1 flex flex-col gap-0">
        
        <div className="flex items-center justify-between py-5 border-b border-border/50">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</h4>
            <p className="text-xs text-muted-foreground">Tambahkan lapisan keamanan ekstra untuk akun admin.</p>
          </div>
          <Switch 
            checked={twoFactor}
            onCheckedChange={setTwoFactor}
            className="data-[state=checked]:bg-blue-600 shrink-0"
          />
        </div>

        <div className="flex items-center justify-between py-5 border-b border-border/50">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Session Timeout</h4>
            <p className="text-xs text-muted-foreground">Logout otomatis setelah tidak aktif selama periode tertentu.</p>
          </div>
          <div className="w-[120px] shrink-0">
            <Select value={sessionTimeout} onValueChange={(v) => setSessionTimeout(v || "")}>
              <SelectTrigger className="rounded-md border-border w-full">
                <SelectValue placeholder="Select">{TIMEOUT_LABELS[sessionTimeout]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 menit</SelectItem>
                <SelectItem value="30">30 menit</SelectItem>
                <SelectItem value="60">1 jam</SelectItem>
                <SelectItem value="120">2 jam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between py-5 border-b border-border/50">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Password Policy</h4>
            <p className="text-xs text-muted-foreground">Atur kebijakan dan kompleksitas password.</p>
          </div>
          <PasswordPolicyModal />
        </div>

        <div className="flex items-center justify-between py-5">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Login Attempts</h4>
            <p className="text-xs text-muted-foreground">Batasi jumlah percobaan login yang gagal.</p>
          </div>
          <div className="w-[140px] shrink-0">
            <Select value={loginAttempts} onValueChange={(v) => setLoginAttempts(v || "")}>
              <SelectTrigger className="rounded-md border-border w-full">
                <SelectValue placeholder="Select">{ATTEMPTS_LABELS[loginAttempts]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 percobaan</SelectItem>
                <SelectItem value="5">5 percobaan</SelectItem>
                <SelectItem value="10">10 percobaan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-1 mt-auto">
          <button 
            onClick={handleSave} 
            disabled={updateSettings.isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm"
          >
            {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
