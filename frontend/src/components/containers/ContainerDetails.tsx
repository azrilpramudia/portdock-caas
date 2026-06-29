"use client";

import { useState, useEffect } from "react";
import { X, Play, Square, RefreshCw, Trash2, Box, TerminalSquare, ExternalLink, Activity, Settings, Layout, ArrowRight, Globe, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { containersService } from "@/services/containers.service";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { ContainerHeader } from "./details/ContainerHeader";
import { NetworkTab } from "./details/NetworkTab";
import { SettingsTab } from "./details/SettingsTab";

interface ContainerDetailsProps {
  container: any;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ContainerDetails({ container, onClose, onRefresh }: ContainerDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [hostIp, setHostIp] = useState('localhost');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostIp(window.location.hostname);
    }
  }, []);
  
  // Resource Limits & Policies State
  const [memoryLimit, setMemoryLimit] = useState<number>(container.memoryLimit || 512);
  const [cpuLimit, setCpuLimit] = useState<number>(container.cpuLimit || 0.5);
  const [restartPolicy, setRestartPolicy] = useState<string>(container.restartPolicy || 'unless-stopped');
  const [volumeMountPath, setVolumeMountPath] = useState<string>(container.volumeMountPath || '');
  const [internalPort, setInternalPort] = useState<number | ''>(container.internalPort || 80);
  const [isSavingResources, setIsSavingResources] = useState(false);

  // Network Allocation State
  const [newPort, setNewPort] = useState<string>('');
  const [isCreatingAllocation, setIsCreatingAllocation] = useState(false);
  const [allocations, setAllocations] = useState([{
    hostPort: container.hostPort,
    internalPort: container.internalPort || 80,
    isPrimary: true
  }].filter(a => a.hostPort));

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
        volumeMountPath: volumeMountPath.trim() === '' ? null : volumeMountPath.trim(),
        internalPort: internalPort === '' ? undefined : Number(internalPort)
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

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const portNumber = parseInt(newPort);
    
    if (isNaN(portNumber)) {
      toast.error("Format port tidak valid");
      return;
    }

    if (portNumber < 19000 || portNumber > 25999) {
      toast.error("Port ditolak! Anda hanya diizinkan memilih port antara 19000 - 25999.");
      return;
    }

    if (allocations.find(a => a.hostPort === portNumber)) {
      toast.error("Port ini sudah Anda miliki.");
      return;
    }

    setIsCreatingAllocation(true);
    try {
      await containersService.allocatePort(container.id, portNumber);
      setAllocations([{ hostPort: portNumber, internalPort: container.internalPort || 80, isPrimary: true }]);
      toast.success(`Port ${portNumber} berhasil dialokasikan!`);
      setNewPort('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengalokasikan port");
    } finally {
      setIsCreatingAllocation(false);
    }
  };

  const handleRemovePort = async () => {
    try {
      await containersService.removePort(container.id);
      setAllocations([]);
      toast.success(`Port berhasil dihapus!`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus port");
    }
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
        <ContainerHeader 
          container={container} 
          isLoading={isLoading} 
          onClose={onClose} 
          handleAction={handleAction} 
          setShowDeleteConfirm={setShowDeleteConfirm} 
        />

        {/* Body Tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50 border border-border/50 h-11">
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Layout className="w-4 h-4" /> Overview</TabsTrigger>
              <TabsTrigger value="network" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Globe className="w-4 h-4" /> Network</TabsTrigger>
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

            <TabsContent value="network" className="mt-0 space-y-6">
              <NetworkTab 
                allocations={allocations} 
                hostIp={hostIp} 
                container={container} 
                handleRemovePort={handleRemovePort} 
                handleCreateAllocation={handleCreateAllocation} 
                newPort={newPort} 
                setNewPort={setNewPort} 
                isCreatingAllocation={isCreatingAllocation} 
              />
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
              <SettingsTab 
                container={container} 
                memoryLimit={memoryLimit} 
                setMemoryLimit={setMemoryLimit} 
                cpuLimit={cpuLimit} 
                setCpuLimit={setCpuLimit} 
                restartPolicy={restartPolicy} 
                setRestartPolicy={setRestartPolicy} 
                volumeMountPath={volumeMountPath} 
                setVolumeMountPath={setVolumeMountPath} 
                internalPort={internalPort} 
                setInternalPort={setInternalPort} 
                handleSaveResources={handleSaveResources} 
                isSavingResources={isSavingResources} 
              />
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
