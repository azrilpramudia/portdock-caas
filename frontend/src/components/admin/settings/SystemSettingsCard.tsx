"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SystemSettingsCard() {
  const [dataRetention, setDataRetention] = useState("90");
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkUpdates, setCheckUpdates] = useState(true);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full w-full">
      <div className="px-6 pt-6 pb-5">
        <h3 className="text-base font-bold text-foreground">System Settings</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">Pengaturan sistem dan performa</p>
      </div>
      
      <div className="px-6 pb-6 flex-1 flex flex-col gap-0">
        
        <div className="flex items-center justify-between py-5 border-b border-border/50">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Data Retention (Logs)</h4>
            <p className="text-xs text-muted-foreground">Simpan log aktivitas selama periode tertentu.</p>
          </div>
          <div className="w-[110px] shrink-0">
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger className="rounded-md border-border w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 hari</SelectItem>
                <SelectItem value="60">60 hari</SelectItem>
                <SelectItem value="90">90 hari</SelectItem>
                <SelectItem value="180">180 hari</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between py-5 border-b border-border/50">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Auto Cleanup</h4>
            <p className="text-xs text-muted-foreground">Hapus resource data yang tidak terpakai secara otomatis.</p>
          </div>
          <Switch 
            checked={autoCleanup}
            onCheckedChange={setAutoCleanup}
            className="data-[state=checked]:bg-blue-600 shrink-0"
          />
        </div>

        <div className="flex items-center justify-between py-5 border-b border-border/50">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Maintenance Mode</h4>
            <p className="text-xs text-muted-foreground">Aktifkan mode maintenance untuk sistem.</p>
          </div>
          <Switch 
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
            className="data-[state=checked]:bg-blue-600 shrink-0"
          />
        </div>

        <div className="flex items-center justify-between py-5">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Check for Updates</h4>
            <p className="text-xs text-muted-foreground">Periksa update sistem secara otomatis.</p>
          </div>
          <Switch 
            checked={checkUpdates}
            onCheckedChange={setCheckUpdates}
            className="data-[state=checked]:bg-blue-600 shrink-0"
          />
        </div>

        <div className="pt-1 mt-auto">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
