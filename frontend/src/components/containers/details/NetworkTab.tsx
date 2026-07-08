import { Activity, ArrowRight, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NetworkTabProps {
  allocations: any[];
  hostIp: string;
  container: any;
  handleRemovePort: () => void;
  handleCreateAllocation: (e: React.FormEvent) => void;
  newPort: string;
  setNewPort: (val: string) => void;
  isCreatingAllocation: boolean;
}

export function NetworkTab({
  allocations,
  hostIp,
  container,
  handleRemovePort,
  handleCreateAllocation,
  newPort,
  setNewPort,
  isCreatingAllocation
}: NetworkTabProps) {
  return (
    <div className="space-y-6">
      {/* Existing Allocations */}
      <div className="bg-muted/20 dark:bg-gray-900 border border-border dark:border-slate-800 rounded-xl p-6 shadow-inner">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground dark:text-slate-200">Network Allocation</h3>
            <p className="text-xs text-muted-foreground dark:text-slate-400">Kelola port eksternal yang terhubung ke kontainer Anda.</p>
          </div>
          <Badge variant="outline" className="bg-muted/50">{allocations.length} / 1 Port</Badge>
        </div>
        
        <div className="space-y-3">
          {allocations.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">Belum ada port yang dialokasikan.</p>
            </div>
          ) : (
            allocations.map((alloc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm hover:border-border/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-[15px]">{container.project?.domain || hostIp}:<span className="text-emerald-500">{alloc.hostPort}</span></span>
                      <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0 h-5 px-1.5 text-[10px]">DEDICATED</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                      Port Mapping: <span className="bg-muted px-1.5 rounded">{alloc.hostPort}</span> <ArrowRight className="w-3 h-3" /> <span className="bg-muted px-1.5 rounded">{alloc.internalPort}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleRemovePort}
                    className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors text-muted-foreground" 
                    title="Revoke Port"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Allocation Form */}
      <div className="bg-muted/20 dark:bg-gray-900 border border-border dark:border-slate-800 rounded-xl p-6 shadow-inner">
        <h3 className="text-lg font-bold text-foreground dark:text-slate-200 mb-2">Create Allocation</h3>
        <p className="text-xs text-muted-foreground dark:text-slate-400 mb-4">Choose a specific port for this server (allowed range: 19000-25999).</p>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">NOTICE</h4>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
              Restart your container after creating an allocation to apply the new network settings.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateAllocation} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Requested Port</label>
            <input 
              type="number" 
              required
              min={19000}
              max={25999}
              value={newPort}
              onChange={(e) => setNewPort(e.target.value)}
              placeholder="e.g. 19500"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
            />
            <p className="text-[11px] text-muted-foreground">Enter a port allowed for this system (19000-25999).</p>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              disabled={isCreatingAllocation}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isCreatingAllocation && <RefreshCw className="w-4 h-4 animate-spin" />}
              Create Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
