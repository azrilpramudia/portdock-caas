"use client";

import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Download, History } from "lucide-react";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdminSettings";

export function BackupRestoreCard() {
  const { data: settings } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [backupRetention, setBackupRetention] = useState("30");

  useEffect(() => {
    if (settings) {
      if (settings.backupSchedule) setBackupSchedule(settings.backupSchedule);
      if (settings.backupRetention) setBackupRetention(settings.backupRetention);
    }
  }, [settings]);

  const handleScheduleChange = (val: string | null) => {
    const value = val || "";
    setBackupSchedule(value);
    updateSettings.mutate({ backupSchedule: value });
  };

  const handleRetentionChange = (val: string | null) => {
    const value = val || "";
    setBackupRetention(value);
    updateSettings.mutate({ backupRetention: value });
  };

  const SCHEDULE_LABELS: Record<string, string> = {
    daily: "Setiap hari pukul 02:00",
    weekly: "Setiap minggu",
    monthly: "Setiap bulan"
  };

  const RETENTION_LABELS: Record<string, string> = {
    "7": "7 hari",
    "14": "14 hari",
    "30": "30 hari"
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full w-full">
      <div className="px-6 pt-6 pb-5">
        <h3 className="text-base font-bold text-foreground">Backup & Restore</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">Kelola backup dan restore sistem</p>
      </div>
      
      <div className="px-6 pb-6 flex-1 flex flex-col gap-5">
        
        {/* Last Backup Status */}
        <div className="border border-border/50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Backup</p>
              <h4 className="text-sm font-bold text-foreground">2 Jun 2026 02:15</h4>
              <p className="text-[11px] text-muted-foreground">oleh system</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-md shrink-0">
            Success
          </span>
        </div>

        {/* Backup Schedule */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-foreground">Backup Schedule</h4>
            <p className="text-xs text-muted-foreground">Atur jadwal backup otomatis.</p>
          </div>
          <div className="w-[200px] shrink-0">
            <Select value={backupSchedule} onValueChange={handleScheduleChange}>
              <SelectTrigger className="rounded-md border-border w-full">
                <SelectValue placeholder="Select">{SCHEDULE_LABELS[backupSchedule]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Setiap hari pukul 02:00</SelectItem>
                <SelectItem value="weekly">Setiap minggu</SelectItem>
                <SelectItem value="monthly">Setiap bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-border/50" />

        {/* Backup Retention */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-foreground">Backup Retention</h4>
            <p className="text-xs text-muted-foreground">Simpan backup selama periode tertentu.</p>
          </div>
          <div className="w-[200px] shrink-0">
            <Select value={backupRetention} onValueChange={handleRetentionChange}>
              <SelectTrigger className="rounded-md border-border w-full">
                <SelectValue placeholder="Select">{RETENTION_LABELS[backupRetention]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 hari</SelectItem>
                <SelectItem value="14">14 hari</SelectItem>
                <SelectItem value="30">30 hari</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 mt-auto grid grid-cols-2 gap-3">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Download className="w-4 h-4 mr-2" />
            Run Backup Now
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <History className="w-4 h-4 mr-2" />
            Restore Backup
          </button>
        </div>
      </div>
    </div>
  );
}
