"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SystemSettingsCard() {
  const [dataRetention, setDataRetention] = useState("90");
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkUpdates, setCheckUpdates] = useState(true);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full mt-6">
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground">System Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">Pengaturan sistem dan performa</p>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Data Retention (Logs)</h4>
            <p className="text-[13px] text-muted-foreground">Simpan log aktivitas selama periode tertentu.</p>
          </div>
          <div className="w-[120px]">
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger>
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

        <div className="border-t border-border/50" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Auto Cleanup</h4>
            <p className="text-[13px] text-muted-foreground">Hapus resource data yang tidak terpakai secara otomatis.</p>
          </div>
          <Switch 
            checked={autoCleanup}
            onCheckedChange={setAutoCleanup}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Maintenance Mode</h4>
            <p className="text-[13px] text-muted-foreground">Aktifkan mode maintenance untuk sistem.</p>
          </div>
          <Switch 
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Check for Updates</h4>
            <p className="text-[13px] text-muted-foreground">Periksa update sistem secara otomatis.</p>
          </div>
          <Switch 
            checked={checkUpdates}
            onCheckedChange={setCheckUpdates}
            className="data-[state=checked]:bg-blue-600"
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
