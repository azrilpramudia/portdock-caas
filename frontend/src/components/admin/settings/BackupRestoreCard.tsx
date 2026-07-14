"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, RefreshCw } from "lucide-react";

export function BackupRestoreCard() {
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [backupRetention, setBackupRetention] = useState("7");

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full mt-6">
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground">Backup & Restore</h3>
        <p className="text-sm text-muted-foreground mt-1">Manajemen backup otomatis dan pemulihan data</p>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6">
        
        <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Last Backup</span>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Success
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">26 Mei 2026, 02:00 AM</p>
          </div>
          <Button variant="outline" className="h-10 px-4 py-2 shadow-sm rounded-md font-medium">
            View Details
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Backup Schedule</label>
          <div className="w-full">
            <Select value={backupSchedule} onValueChange={setBackupSchedule}>
              <SelectTrigger className="h-10 rounded-md">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily at 02:00 AM</SelectItem>
                <SelectItem value="weekly">Weekly on Sunday</SelectItem>
                <SelectItem value="monthly">Monthly on 1st</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Backup Retention</label>
          <div className="w-full">
            <Select value={backupRetention} onValueChange={setBackupRetention}>
              <SelectTrigger className="h-10 rounded-md">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 mt-auto">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 shadow-sm rounded-md font-medium flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Backup Now
          </Button>
          <Button variant="outline" className="h-10 px-4 py-2 shadow-sm rounded-md font-medium flex-1">
            Restore Backup
          </Button>
        </div>
      </div>
    </div>
  );
}
