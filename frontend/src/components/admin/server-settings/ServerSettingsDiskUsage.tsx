import React, { useState } from "react";
import { Folder } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface ServerSettingsDiskUsageProps {
  diskPartitions: {
    path: string;
    size: string;
    percent: number;
  }[];
}

export function ServerSettingsDiskUsage({ diskPartitions }: ServerSettingsDiskUsageProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Sort by percent (descending) and take top 5
  const allDisks = [...diskPartitions].sort((a, b) => b.percent - a.percent);
  const diskUsage = allDisks.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[15px] font-bold text-foreground">Disk Usage by Directory</h3>
        <button 
          className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
          onClick={() => setIsOpen(true)}
        >
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {diskUsage.map((disk, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-foreground truncate max-w-[120px]" title={disk.path}>{disk.path}</span>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-medium text-muted-foreground">{disk.size}</span>
                  <span className="text-[13px] font-semibold text-foreground w-8 text-right">{disk.percent}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full bg-blue-600 rounded-full`} style={{ width: `${disk.percent}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>All Disk Partitions</DialogTitle>
            <DialogDescription>
              Detailed view of all disk usage across the system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4 space-y-4 pt-2">
            {allDisks.map((disk, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Folder className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-foreground truncate mr-4" title={disk.path}>{disk.path}</span>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[14px] font-medium text-muted-foreground">{disk.size}</span>
                      <span className="text-[14px] font-semibold text-foreground w-10 text-right">{disk.percent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${disk.percent > 90 ? 'bg-red-500' : disk.percent > 70 ? 'bg-amber-500' : 'bg-blue-600'} rounded-full`} style={{ width: `${disk.percent}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
