import React, { useState } from "react";
import { RefreshCw, Box, Layers, Terminal, Database, HardDrive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminServerAction, useAdminServerLogs } from "@/hooks/useAdminMonitoring";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ServerSettingsQuickActions() {
  const { mutateAsync: performAction } = useAdminServerAction();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const { data: logs, refetch: fetchLogs, isFetching: isFetchingLogs } = useAdminServerLogs();

  const handleAction = async (action: string) => {
    if (action === 'restart-server') {
      toast.info("Fitur Restart Server sementara dinonaktifkan untuk keamanan.");
      return;
    }
    
    try {
      setActiveAction(action);
      const res = await performAction(action);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || "Gagal melakukan aksi");
    } finally {
      setActiveAction(null);
    }
  };

  const handleViewLogs = () => {
    setIsLogsOpen(true);
    fetchLogs();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
      <h3 className="text-[15px] font-bold text-foreground mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground leading-none">Restart Server</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">Restart the server safely</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[12px] px-3 font-semibold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
            onClick={() => handleAction('restart-server')}
            disabled={activeAction !== null}
          >
            Restart
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Box className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground leading-none">Restart Docker</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">Restart Docker service</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[12px] px-3 font-semibold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
            onClick={() => handleAction('restart-docker')}
            disabled={activeAction !== null}
          >
            {activeAction === 'restart-docker' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Restart'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground leading-none">Restart Nginx</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">Restart Nginx service</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[12px] px-3 font-semibold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
            onClick={() => handleAction('restart-nginx')}
            disabled={activeAction !== null}
          >
            {activeAction === 'restart-nginx' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Restart'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground leading-none">Clear Cache</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">Clear system cache</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[12px] px-3 font-semibold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
            onClick={() => handleAction('clear-cache')}
            disabled={activeAction !== null}
          >
            {activeAction === 'clear-cache' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Clear'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground leading-none">Run Backup</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">Run manual backup</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[12px] px-3 font-semibold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
            onClick={() => handleAction('run-backup')}
            disabled={activeAction !== null}
          >
            {activeAction === 'run-backup' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Backup'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground leading-none">View Logs</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">View server logs</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[12px] px-3 font-semibold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
            onClick={handleViewLogs}
            disabled={activeAction !== null}
          >
            View Logs
          </Button>
        </div>

      </div>

      <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl w-[90vw] h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle>System Logs</DialogTitle>
            <DialogDescription>
              Recent logs from the system (journalctl / syslog).
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6 pt-2">
            <div className="bg-black/95 text-white font-mono text-[12px] p-4 rounded-lg h-full overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {isFetchingLogs ? (
                <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading logs...
                </div>
              ) : logs ? (
                logs
              ) : (
                <div className="text-muted-foreground italic">No logs available or failed to fetch.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
