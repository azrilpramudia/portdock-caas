"use client";

import { useState } from "react";
import { X, Play, Square, RefreshCw, Trash2, Box, TerminalSquare, ExternalLink, Activity, Settings, Layout, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { containersService } from "@/services/containers.service";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface ContainerDetailsProps {
  container: any;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ContainerDetails({ container, onClose, onRefresh }: ContainerDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Resource Limits & Policies State
  const [memoryLimit, setMemoryLimit] = useState<number | null>(container.memoryLimit || null);
  const [cpuLimit, setCpuLimit] = useState<number | null>(container.cpuLimit || null);
  const [restartPolicy, setRestartPolicy] = useState<string>(container.restartPolicy || 'unless-stopped');
  const [volumeMountPath, setVolumeMountPath] = useState<string>(container.volumeMountPath || '');
  const [isSavingResources, setIsSavingResources] = useState(false);

  const router = useRouter();

  const handleAction = async (action: 'start' | 'stop' | 'restart' | 'delete') => {
    setIsLoading(true);
    try {
      if (action === 'start') await containersService.startContainer(container.id);
      if (action === 'stop') await containersService.stopContainer(container.id);
      if (action === 'restart') await containersService.restartContainer(container.id);
      if (action === 'delete') {
        await containersService.deleteContainer(container.id);
        toast.success(`Container deleted successfully`);
        onClose();
        if (onRefresh) onRefresh();
        return;
      }
      toast.success(`Container ${action}ed successfully`);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} container`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResources = async () => {
    setIsSavingResources(true);
    try {
      await containersService.updateResources(container.id, { 
        memoryLimit, 
        cpuLimit, 
        restartPolicy,
        volumeMountPath: volumeMountPath.trim() === '' ? null : volumeMountPath.trim() 
      });
      toast.success("Settings updated successfully");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setIsSavingResources(false);
    }
  };

  const openInTerminal = () => {
    router.push(`/terminal?containerId=${container.id}&tab=app-logs`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Window */}
      <div className="relative w-full max-w-3xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
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
                onClick={() => handleAction('start')} disabled={isLoading}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50"
                title="Start Container"
              >
                <Play className="w-4 h-4" fill="currentColor" />
              </button>
            ) : (
              <button 
                onClick={() => handleAction('stop')} disabled={isLoading}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-colors disabled:opacity-50"
                title="Stop Container"
              >
                <Square className="w-4 h-4" fill="currentColor" />
              </button>
            )}
            
            <button 
              onClick={() => handleAction('restart')} disabled={isLoading}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 transition-colors disabled:opacity-50"
              title="Restart Container"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <button 
              onClick={() => setShowDeleteConfirm(true)} disabled={isLoading}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50"
              title="Delete Container"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted ml-2 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 border border-border/50 h-11">
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Layout className="w-4 h-4" /> Overview</TabsTrigger>
              <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"><TerminalSquare className="w-4 h-4" /> Logs</TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Image</p>
                  <p className="font-mono text-sm">{container.imageName}:{container.imageTag}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Port Mapping</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded border border-border/50">{container.hostPort || 'N/A'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded border border-border/50">{container.internalPort || 'N/A'}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Created At</p>
                  <p className="text-sm">{container.createdAt ? format(new Date(container.createdAt), "dd MMM yyyy, HH:mm") : 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Network</p>
                  <p className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Attached
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-0">
              <div className="bg-muted/20 dark:bg-[#111827] border border-border dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <TerminalSquare className="w-16 h-16 text-blue-500/40 mb-4" />
                <h3 className="text-lg font-bold text-foreground dark:text-slate-200 mb-2">View Application Logs</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400 max-w-md mb-6">
                  Log aplikasi dari container ini sangat panjang dan berjalan secara real-time. Untuk pengalaman debugging terbaik, silakan buka di layar penuh Terminal.
                </p>
                <button 
                  onClick={openInTerminal}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka di Layar Terminal
                </button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <div className="bg-muted/20 dark:bg-[#111827] border border-border dark:border-slate-800 rounded-xl p-6 shadow-inner text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground dark:text-slate-200">Hardware Allocation</h3>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">Limit the maximum resources this container can consume.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Memory Limits */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">Memory Limit (RAM)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[null, 256, 512, 1024].map((val) => (
                        <button
                          key={val || 'unlimited'}
                          onClick={() => setMemoryLimit(val)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                            memoryLimit === val 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                              : 'bg-background dark:bg-slate-900 border-border dark:border-slate-800 text-muted-foreground dark:text-slate-400 hover:border-foreground/30 dark:hover:border-slate-700 hover:text-foreground dark:hover:text-slate-300'
                          }`}
                        >
                          {val === null ? 'Unlimited' : val >= 1024 ? `${val / 1024} GB` : `${val} MB`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CPU Limits */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">CPU Core Limit</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[null, 0.25, 0.5, 1].map((val) => (
                        <button
                          key={val || 'unlimited'}
                          onClick={() => setCpuLimit(val)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                            cpuLimit === val 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                              : 'bg-background dark:bg-slate-900 border-border dark:border-slate-800 text-muted-foreground dark:text-slate-400 hover:border-foreground/30 dark:hover:border-slate-700 hover:text-foreground dark:hover:text-slate-300'
                          }`}
                        >
                          {val === null ? 'Unlimited' : `${val} Core${val > 1 ? 's' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Restart Policies */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">Restart Policy</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { value: 'no', label: 'No (Off)', desc: 'Never restart automatically' },
                        { value: 'always', label: 'Always', desc: 'Always restart if it stops' },
                        { value: 'on-failure', label: 'On Failure', desc: 'Restart only if it crashes' },
                        { value: 'unless-stopped', label: 'Unless Stopped', desc: 'Restart unless manually stopped' },
                      ].map((policy) => (
                        <button
                          key={policy.value}
                          onClick={() => setRestartPolicy(policy.value)}
                          className={`flex flex-col items-start p-3 rounded-lg text-left border transition-all ${
                            restartPolicy === policy.value 
                              ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                              : 'bg-background dark:bg-slate-900 border-border dark:border-slate-800 hover:border-foreground/30 dark:hover:border-slate-700'
                          }`}
                        >
                          <span className={`text-sm font-medium ${restartPolicy === policy.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground dark:text-slate-300'}`}>
                            {policy.label}
                          </span>
                          <span className={`text-xs mt-0.5 ${restartPolicy === policy.value ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-muted-foreground dark:text-slate-500'}`}>
                            {policy.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Mounts */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">
                      Persistent Volume Mount (Max 2GB)
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="/app/data" 
                        value={volumeMountPath}
                        onChange={(e) => setVolumeMountPath(e.target.value)}
                        className="w-full bg-background dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-foreground dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-muted-foreground/50"
                      />
                      <p className="text-xs text-muted-foreground dark:text-slate-500 mt-2">
                        Specify a folder path inside the container to make its contents persistent across restarts. Leave blank for no persistent volume. Note: changing this will recreate the container.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-border dark:border-slate-800">
                    <button 
                      onClick={handleSaveResources}
                      disabled={isSavingResources || (memoryLimit === container.memoryLimit && cpuLimit === container.cpuLimit && restartPolicy === (container.restartPolicy || 'unless-stopped') && volumeMountPath === (container.volumeMountPath || ''))}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSavingResources ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-[420px] w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[17px] font-semibold text-slate-200">Delete Container</h3>
                  <button onClick={() => setShowDeleteConfirm(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[14px] text-slate-400 leading-relaxed pr-2">
                  Are you sure you want to delete this container? This action cannot be undone and all data inside the container will be lost.
                </p>
              </div>
              <div className="bg-slate-900/50 p-4 flex justify-end gap-3 border-t border-border/50">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2 rounded-md font-medium text-[13px] bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    handleAction('delete');
                  }}
                  className="px-5 py-2 rounded-md font-medium text-[13px] bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
