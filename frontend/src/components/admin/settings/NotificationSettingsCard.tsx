"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Box, Bell, ShieldAlert, Wrench, Mail } from "lucide-react";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdminSettings";

export function NotificationSettingsCard() {
  const { data: settings } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const [deployment, setDeployment] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.notifyDeployments !== undefined) setDeployment(settings.notifyDeployments === "true");
      if (settings.notifySystem !== undefined) setSystemAlerts(settings.notifySystem === "true");
      if (settings.notifySecurity !== undefined) setSecurityAlerts(settings.notifySecurity === "true");
      if (settings.notifyMaintenance !== undefined) setMaintenance(settings.notifyMaintenance === "true");
      if (settings.emailDigest !== undefined) setEmailDigest(settings.emailDigest === "true");
    }
  }, [settings]);

  const handleToggle = (key: string, value: boolean) => {
    updateSettings.mutate({ [key]: value ? "true" : "false" });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full w-full">
      <div className="px-6 pt-6 pb-5">
        <h3 className="text-base font-bold text-foreground">Notification Settings</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">Atur preferensi notifikasi sistem</p>
      </div>
      
      <div className="px-6 pb-6 flex-1 flex flex-col gap-0">
        
        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="flex gap-3 items-center pr-4">
            <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
              <Box className="w-[18px] h-[18px]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Deployment Notifications</h4>
              <p className="text-xs text-muted-foreground">Dapatkan notifikasi ketika deployment selesai.</p>
            </div>
          </div>
            <Switch 
              checked={deployment}
              onCheckedChange={(val) => { setDeployment(val); handleToggle('notifyDeployments', val); }}
              className="data-[state=checked]:bg-green-500 shrink-0"
            />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="flex gap-3 items-center pr-4">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Bell className="w-[18px] h-[18px]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">System Alerts</h4>
              <p className="text-xs text-muted-foreground">Notifikasi untuk alert dan peringatan sistem.</p>
            </div>
          </div>
            <Switch 
              checked={systemAlerts}
              onCheckedChange={(val) => { setSystemAlerts(val); handleToggle('notifySystem', val); }}
              className="data-[state=checked]:bg-blue-600 shrink-0"
            />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="flex gap-3 items-center pr-4">
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <ShieldAlert className="w-[18px] h-[18px]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Security Alerts</h4>
              <p className="text-xs text-muted-foreground">Notifikasi untuk aktivitas keamanan penting.</p>
            </div>
          </div>
            <Switch 
              checked={securityAlerts}
              onCheckedChange={(val) => { setSecurityAlerts(val); handleToggle('notifySecurity', val); }}
              className="data-[state=checked]:bg-red-500 shrink-0"
            />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="flex gap-3 items-center pr-4">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <Wrench className="w-[18px] h-[18px]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Maintenance Notifications</h4>
              <p className="text-xs text-muted-foreground">Informasi tentang pemeliharaan sistem.</p>
            </div>
          </div>
            <Switch 
              checked={maintenance}
              onCheckedChange={(val) => { setMaintenance(val); handleToggle('notifyMaintenance', val); }}
              className="data-[state=checked]:bg-amber-500 shrink-0"
            />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex gap-3 items-center pr-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Mail className="w-[18px] h-[18px]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Email Digest</h4>
              <p className="text-xs text-muted-foreground">Kirim ringkasan aktivitas harian via email.</p>
            </div>
          </div>
            <Switch 
              checked={emailDigest}
              onCheckedChange={(val) => { setEmailDigest(val); handleToggle('emailDigest', val); }}
              className="data-[state=checked]:bg-purple-500 shrink-0"
            />
        </div>


      </div>
    </div>
  );
}
