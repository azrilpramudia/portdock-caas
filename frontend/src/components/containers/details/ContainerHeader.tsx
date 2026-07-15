import { Box, Play, Square, RefreshCw, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/store/settings";

interface ContainerHeaderProps {
  container: any;
  isLoading: boolean;
  onClose: () => void;
  handleAction: (action: 'start' | 'stop' | 'restart' | 'delete') => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

export function ContainerHeader({ 
  container, 
  isLoading, 
  onClose, 
  handleAction, 
  setShowDeleteConfirm 
}: ContainerHeaderProps) {
  const { settings } = useSettingsStore();
  const isDisabled = isLoading || settings.isMaintenanceMode;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border bg-muted/20 shrink-0 gap-4">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Box className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">{container.name}</h2>
            <Badge variant={container.status === 'RUNNING' ? 'default' : 'secondary'} className={container.status === 'RUNNING' ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20' : ''}>
              {container.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="font-mono">{container.id.substring(0, 12)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {container.status !== 'RUNNING' ? (
          <button 
            onClick={() => handleAction('start')} disabled={isDisabled}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={settings.isMaintenanceMode ? "Disabled in Maintenance Mode" : "Start Container"}
          >
            <Play className="w-4 h-4" fill="currentColor" />
          </button>
        ) : (
          <button 
            onClick={() => handleAction('stop')} disabled={isDisabled}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={settings.isMaintenanceMode ? "Disabled in Maintenance Mode" : "Stop Container"}
          >
            <Square className="w-4 h-4" fill="currentColor" />
          </button>
        )}
        
        <button 
          onClick={() => handleAction('restart')} disabled={isDisabled}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={settings.isMaintenanceMode ? "Disabled in Maintenance Mode" : "Restart Container"}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <button 
          onClick={() => setShowDeleteConfirm(true)} disabled={isDisabled}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={settings.isMaintenanceMode ? "Disabled in Maintenance Mode" : "Delete Container"}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted ml-2 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
