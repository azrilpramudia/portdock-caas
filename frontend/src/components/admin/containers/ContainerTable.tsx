import { Eye, Terminal, MoreVertical, Play, RotateCw, Trash2, ChevronLeft, ChevronRight, Box, PauseCircle, Copy, Check } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";
import { useAdminContainerAction } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ContainerTableProps {
  paginatedContainers: any[];
  filteredContainers: any[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setCurrentPage: (val: number) => void;
  handlePrevPage: () => void;
  handleNextPage: () => void;
}

export function ContainerTable({
  paginatedContainers,
  filteredContainers,
  currentPage,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  handlePrevPage,
  handleNextPage
}: ContainerTableProps) {
  const { mutate: performAction, isPending } = useAdminContainerAction();
  const router = useRouter();
  const [viewContainer, setViewContainer] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("JSON berhasil disalin!");
  };

  const handleAction = (containerId: string, action: 'start'|'stop'|'restart'|'delete') => {
    const actionText = action === 'start' ? 'menyalakan' : action === 'stop' ? 'mematikan' : action === 'restart' ? 'memulai ulang' : 'menghapus';
    performAction({ id: containerId, action }, {
      onSuccess: () => toast.success(`Berhasil ${actionText} kontainer!`),
      onError: (err: any) => toast.error(`Gagal ${actionText} kontainer: ${err.message}`)
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600';
      case 'STOPPED': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600';
      case 'ERROR':
      case 'FAILED':
      case 'REMOVING': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600';
      default: return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-emerald-500';
      case 'STOPPED': return 'bg-amber-500';
      case 'ERROR':
      case 'FAILED':
      case 'REMOVING': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const getAvatarInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

  const getAvatarColor = (name: string) => {
    if (!name) return 'bg-slate-500';
    const colors = [
      'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 
      'bg-amber-500', 'bg-rose-500', 'bg-cyan-600', 'bg-fuchsia-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <>
      <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[12px] font-semibold text-muted-foreground bg-muted/50">
              <th className="px-2 py-3 font-semibold">Container</th>
              <th className="px-2 py-3 font-semibold">Project</th>
              <th className="px-2 py-3 font-semibold">User</th>
              <th className="px-2 py-3 font-semibold">Status</th>
              <th className="px-2 py-3 font-semibold">Image</th>
              <th className="px-2 py-3 font-semibold">CPU</th>
              <th className="px-2 py-3 font-semibold">RAM</th>
              <th className="px-2 py-3 font-semibold">Uptime</th>
              <th className="px-2 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedContainers.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground font-medium">
                  No containers found.
                </td>
              </tr>
            ) : (
              paginatedContainers.map((container, idx) => {
                const user = container.project?.user || {};
                
                const liveStats = container.liveStats || {
                  cpuPercent: 0,
                  memoryUsage: 0,
                  memoryLimit: container.memoryLimit ? container.memoryLimit * 1024 * 1024 : 1024 * 1024 * 1024,
                  memoryPercent: 0,
                  startedAt: null
                };

                let uptime = '-';
                if (container.status === 'RUNNING' && liveStats.startedAt) {
                  uptime = formatDistanceToNow(new Date(liveStats.startedAt));
                }
                
                const ramUsedStr = formatBytes(liveStats.memoryUsage);
                const ramTotalStr = formatBytes(liveStats.memoryLimit);
                
                return (
                  <tr key={container.id} className="hover:bg-muted/10 transition-colors bg-card">
                    {/* Container Info */}
                    <td className="px-2 py-3 max-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-500 fill-emerald-100 dark:fill-emerald-900/30" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[13px] text-foreground truncate">{container.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate">{container.dockerContainerId?.substring(0, 8) || "N/A"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="px-2 py-3">
                      <div className="font-semibold text-[12px] text-foreground truncate max-w-[100px]">{container.project?.name || "Unknown"}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[100px]">{container.project?.domain || "No Domain"}</div>
                    </td>
                    
                    {/* User */}
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(user.name)} text-[10px] font-bold text-white ring-2 ring-background`}>
                          {getAvatarInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[12px] text-foreground truncate max-w-[100px]">{user.name || "Unknown"}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[100px]">{user.email || "-"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-2 py-3">
                      <Badge variant="outline" className={`font-semibold border-0 gap-1 px-2 py-0.5 text-[11px] ${getStatusColor(container.status)}`}>
                        {container.status === 'ERROR' || container.status === 'FAILED' ? (
                          <span className="w-2 h-2 flex items-center justify-center text-[9px] font-bold">×</span>
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(container.status)}`}></span>
                        )}
                        {container.status === 'RUNNING' ? 'Running' : container.status === 'STOPPED' ? 'Stopped' : 'Exited'}
                      </Badge>
                    </td>

                    {/* Image */}
                    <td className="px-2 py-3">
                      <div 
                        className="text-[12px] text-muted-foreground truncate max-w-[100px] 2xl:max-w-[150px]"
                        title={`${container.imageName}:${container.imageTag}`}
                      >
                        {container.imageName}:{container.imageTag}
                      </div>
                    </td>

                    {/* CPU */}
                    <td className="px-2 py-3">
                      <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">CPU Load</div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">{liveStats.cpuPercent}%</div>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${liveStats.cpuPercent}%` }}></div>
                      </div>
                    </td>

                    {/* RAM */}
                    <td className="px-2 py-3">
                      <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">{ramUsedStr} / {ramTotalStr}</div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">{liveStats.memoryPercent}%</div>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${liveStats.memoryPercent}%` }}></div>
                      </div>
                    </td>

                    {/* Uptime */}
                    <td className="px-2 py-3">
                      <div className="text-[12px] text-muted-foreground flex items-center gap-1">
                        {container.status === 'RUNNING' && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        )}
                        {uptime}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TooltipProvider delay={300}>
                          <Tooltip>
                            <TooltipTrigger render={<Button aria-label="Lihat detail kontainer" onClick={() => setViewContainer(container)} variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0" />}>
                              <Eye className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lihat Detail</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {container.status === 'RUNNING' && (
                          <TooltipProvider delay={300}>
                            <Tooltip>
                              <TooltipTrigger render={<Button aria-label="Buka terminal kontainer" variant="outline" size="icon" onClick={() => router.push(`/admin/terminal?containerId=${container.id}`)} className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0" />}>
                                <Terminal className="w-4 h-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Buka Terminal</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        {container.status === 'STOPPED' && (
                          <Button onClick={() => handleAction(container.id, 'start')} disabled={isPending} variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}

                        {(container.status === 'ERROR' || container.status === 'FAILED') && (
                          <>
                            <Button onClick={() => handleAction(container.id, 'restart')} disabled={isPending} variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0">
                              <RotateCw className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleAction(container.id, 'delete')} disabled={isPending} variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-rose-100 dark:border-rose-900/30 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-none shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {(container.status === 'RUNNING' || container.status === 'STOPPED') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0" />}>
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {container.status === 'RUNNING' && (
                                <DropdownMenuItem onClick={() => handleAction(container.id, 'stop')} disabled={isPending}>
                                  <PauseCircle className="w-4 h-4 mr-2" /> Stop Container
                                </DropdownMenuItem>
                              )}
                              {container.status === 'RUNNING' && (
                                <DropdownMenuItem onClick={() => handleAction(container.id, 'restart')} disabled={isPending}>
                                  <RotateCw className="w-4 h-4 mr-2" /> Restart Container
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => handleAction(container.id, 'delete')} disabled={isPending}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Container
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="border-t border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredContainers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(filteredContainers.length, currentPage * itemsPerPage)} of {filteredContainers.length} containers
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-card border-border rounded-lg hover:bg-muted"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Simple page numbers */}
          {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => (
            <Button 
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="icon" 
              className={`h-8 w-8 rounded-lg font-medium ${currentPage === i + 1 ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          
          {totalPages > 3 && (
            <>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-card border-border rounded-lg text-muted-foreground" disabled>
                ...
              </Button>
              <Button 
                variant={currentPage === totalPages ? "default" : "outline"}
                size="icon" 
                className={`h-8 w-8 rounded-lg font-medium ${currentPage === totalPages ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-card border-border rounded-lg hover:bg-muted"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Container Details Modal */}
      <Dialog open={!!viewContainer} onOpenChange={(open) => !open && setViewContainer(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-4xl w-full max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Container Details: {viewContainer?.name}</DialogTitle>
            <DialogDescription>Full properties of the selected container.</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="mt-2 flex-1 flex flex-col overflow-hidden">
            <TabsList className="mb-2 w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="json">Raw JSON</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="flex-1 overflow-y-auto outline-none">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pr-2 pb-2">
                {viewContainer && [
                  { label: 'Container Name', value: viewContainer.name },
                  { label: 'Docker ID', value: viewContainer.dockerContainerId?.substring(0, 12) || '-' },
                  { label: 'Image', value: `${viewContainer.imageName}:${viewContainer.imageTag}` },
                  { label: 'Project', value: viewContainer.project?.name || '-' },
                  { label: 'Domain', value: viewContainer.project?.domain || viewContainer.subdomain || '-' },
                  { label: 'Status', value: viewContainer.status },
                  { label: 'Memory Limit', value: viewContainer.memoryLimit ? `${viewContainer.memoryLimit} MB` : 'Unlimited' },
                  { label: 'CPU Limit', value: viewContainer.cpuLimit ? `${viewContainer.cpuLimit} Core` : 'Unlimited' },
                  { label: 'Port Mapping', value: viewContainer.hostPort ? `${viewContainer.hostPort} ➔ ${viewContainer.internalPort}` : '-' },
                  { label: 'Restart Policy', value: viewContainer.restartPolicy || 'Unless Stopped' },
                  { label: 'Volume Mount', value: viewContainer.volumeMountPath || 'None' },
                  { label: 'Created At', value: viewContainer.createdAt ? new Date(viewContainer.createdAt).toLocaleString('id-ID') : '-' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-muted/50 border border-border/50 rounded-lg p-3 flex flex-col gap-1 transition-colors hover:bg-muted">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground truncate" title={String(item.value)}>{item.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="json" className="flex-1 flex flex-col overflow-hidden outline-none">
              <div className="relative flex-1 bg-muted/30 border border-border rounded-lg flex flex-col overflow-hidden">
                <Button 
                  size="icon-sm" 
                  variant="ghost" 
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm z-10 border border-border"
                  onClick={() => handleCopy(JSON.stringify(viewContainer, null, 2))}
                  aria-label="Salin JSON"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
                  <pre className="text-foreground text-[10px] sm:text-xs whitespace-pre-wrap break-all m-0">
                    {viewContainer ? JSON.stringify(viewContainer, null, 2) : ''}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
