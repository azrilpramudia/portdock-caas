import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface ActivityLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
}

export function ActivityLogDetailsModal({ isOpen, onClose, log }: ActivityLogDetailsModalProps) {
  if (!log) return null;

  const time = format(new Date(log.createdAt), "d MMMM yyyy, HH:mm:ss", { locale: localeId });
  const resourceDesc = log.projectId ? "Project" : "System";
  const resourceName = log.project?.name || "System";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Activity Log Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
            <div className="col-span-1 text-sm font-semibold text-muted-foreground">Time</div>
            <div className="col-span-2 text-sm text-foreground">{time}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
            <div className="col-span-1 text-sm font-semibold text-muted-foreground">User</div>
            <div className="col-span-2 text-sm text-foreground">
              <div>{log.user.name}</div>
              <div className="text-muted-foreground text-xs">{log.user.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
            <div className="col-span-1 text-sm font-semibold text-muted-foreground">Action</div>
            <div className="col-span-2 text-sm text-foreground">{log.action}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
            <div className="col-span-1 text-sm font-semibold text-muted-foreground">Description</div>
            <div className="col-span-2 text-sm text-foreground">{log.description || "-"}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
            <div className="col-span-1 text-sm font-semibold text-muted-foreground">Resource</div>
            <div className="col-span-2 text-sm text-foreground">
              <div>{resourceName}</div>
              <div className="text-muted-foreground text-xs">{resourceDesc}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
            <div className="col-span-1 text-sm font-semibold text-muted-foreground">IP Address</div>
            <div className="col-span-2 text-sm text-foreground">{log.ipAddress || "-"}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 text-sm font-semibold text-muted-foreground">Status</div>
            <div className="col-span-2 text-sm text-foreground">{log.status}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
