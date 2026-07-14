"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Rocket, ShieldAlert, Wrench, Mail } from "lucide-react";

export function NotificationSettingsCard() {
  const [deployment, setDeployment] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground">Notification Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">Preferensi notifikasi sistem dan email</p>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6">
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="mt-0.5 text-blue-500">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">Deployment Notifications</h4>
              <p className="text-[13px] text-muted-foreground">Notifikasi saat deployment berhasil atau gagal.</p>
            </div>
          </div>
          <Switch 
            checked={deployment}
            onCheckedChange={setDeployment}
            className="data-[state=checked]:bg-blue-600 mt-1"
          />
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="mt-0.5 text-blue-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">System Alerts</h4>
              <p className="text-[13px] text-muted-foreground">Peringatan penggunaan resource server yang tinggi.</p>
            </div>
          </div>
          <Switch 
            checked={systemAlerts}
            onCheckedChange={setSystemAlerts}
            className="data-[state=checked]:bg-blue-600 mt-1"
          />
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="mt-0.5 text-red-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">Security Alerts</h4>
              <p className="text-[13px] text-muted-foreground">Notifikasi untuk aktivitas mencurigakan atau login gagal.</p>
            </div>
          </div>
          <Switch 
            checked={securityAlerts}
            onCheckedChange={setSecurityAlerts}
            className="data-[state=checked]:bg-blue-600 mt-1"
          />
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="mt-0.5 text-orange-500">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">Maintenance Notifications</h4>
              <p className="text-[13px] text-muted-foreground">Pemberitahuan pemeliharaan rutin atau downtime.</p>
            </div>
          </div>
          <Switch 
            checked={maintenance}
            onCheckedChange={setMaintenance}
            className="data-[state=checked]:bg-blue-600 mt-1"
          />
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="mt-0.5 text-blue-500">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">Email Digest</h4>
              <p className="text-[13px] text-muted-foreground">Terima ringkasan aktivitas mingguan via email.</p>
            </div>
          </div>
          <Switch 
            checked={emailDigest}
            onCheckedChange={setEmailDigest}
            className="data-[state=checked]:bg-blue-600 mt-1"
          />
        </div>

        <div className="pt-2 mt-auto">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 shadow-sm rounded-md font-medium">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
