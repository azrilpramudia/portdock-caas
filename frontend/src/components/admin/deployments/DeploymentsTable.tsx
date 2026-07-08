import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Rocket, Terminal } from "lucide-react";
import { Eye, Square, RotateCw, ExternalLink, List, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DeploymentsTableProps {
  deployments: any[];
  filteredDeployments: any[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setCurrentPage: (val: number) => void;
  handlePrevPage: () => void;
  handleNextPage: () => void;
}

export function DeploymentsTable({
  deployments,
  filteredDeployments,
  currentPage,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  handlePrevPage,
  handleNextPage
}: DeploymentsTableProps) {
  const [selectedDep, setSelectedDep] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-semibold text-[11px]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Success
          </div>
        );
      case "In Progress":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-semibold text-[11px]">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> In Progress
          </div>
        );
      case "Failed":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 font-semibold text-[11px]">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Failed
          </div>
        );
      default:
        return null;
    }
  };

  const getProgressBar = (status: string, progress: number) => {
    let colorClass = "bg-emerald-500";
    if (status === "In Progress") colorClass = "bg-blue-500";
    if (status === "Failed") colorClass = "bg-rose-500";

    return (
      <div className="w-24">
        <div className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mb-1">{progress}%</div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const calculateDuration = (startedAt: string, endedAt: string | null) => {
    if (!endedAt) return "-";
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} detik`;
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes} menit ${seconds} detik`;
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Fixed colors based on user ID logic to keep it deterministic
  const getUserColor = (userId: string) => {
    const colors = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-emerald-600", "bg-amber-500", "bg-pink-500", "bg-indigo-600", "bg-teal-700"];
    const charCodeSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[12px] font-semibold text-muted-foreground bg-muted/50">
              <th className="px-2 py-3 font-semibold w-[100px]">ID</th>
              <th className="px-2 py-3 font-semibold">Project</th>
              <th className="px-2 py-3 font-semibold">User</th>
              <th className="px-2 py-3 font-semibold">Environment</th>
              <th className="px-2 py-3 font-semibold">Status</th>
              <th className="px-2 py-3 font-semibold">Progress</th>
              <th className="px-2 py-3 font-semibold">Started At</th>
              <th className="px-2 py-3 font-semibold">Duration</th>
              <th className="px-2 py-3 font-semibold">Domain</th>
              <th className="px-2 py-3 font-semibold text-center w-[120px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deployments.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-5 rounded-full mb-5 shadow-sm border border-slate-200 dark:border-slate-700">
                      <Rocket className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      Belum ada riwayat deployment
                    </h3>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Data deployment akan otomatis terisi dan dipantau di sini ketika pengguna meluncurkan proyek mereka.
                    </p>
                  </div>
                </td>
              </tr>
            ) : deployments.map((dep, index) => (
              <tr key={dep.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-2 py-3">
                  <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">
                    #DEP-{dep.id.substring(dep.id.length - 4).toUpperCase()}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{dep.project.name}</div>
                  <div className="text-[12px] font-medium text-slate-500 mt-0.5">{dep.project.templateId || 'N/A'}</div>
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getUserColor(dep.project.user.id)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                      {getUserInitials(dep.project.user.name)}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{dep.project.user.name}</div>
                      <div className="text-[12px] font-medium text-slate-500 mt-0.5">{dep.project.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                    dep.project.name.toLowerCase().includes('staging') 
                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' 
                  }`}>
                    {dep.project.name.toLowerCase().includes('staging') ? 'Staging' : 'Production'}
                  </span>
                </td>
                <td className="px-2 py-3">
                  {getStatusBadge(dep.status)}
                </td>
                <td className="px-2 py-3">
                  {getProgressBar(dep.status, dep.progress)}
                </td>
                <td className="px-2 py-3">
                  <div className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                    {format(new Date(dep.startedAt), 'dd MMM yyyy')}
                  </div>
                  <div className="text-[12px] font-medium text-slate-500 mt-0.5">
                    {format(new Date(dep.startedAt), 'HH:mm')}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <div className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                    {calculateDuration(dep.startedAt, dep.endedAt)}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <a href={`http://${dep.domain}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-colors">
                    {dep.domain || '-'}
                    {dep.domain && <ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
                  </a>
                </td>
                <td className="px-2 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <TooltipProvider delay={300}>
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button 
                            onClick={() => { setSelectedDep(dep); setIsDetailsOpen(true); }}
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg bg-background border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 shadow-none" 
                          />
                        }>
                          <Eye className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent><p>View Details</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {dep.status === "Success" && (
                      <TooltipProvider delay={300}>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button 
                              onClick={() => { setSelectedDep(dep); setIsLogsOpen(true); }}
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg bg-background border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 shadow-none" 
                            />
                          }>
                            <List className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent><p>View Logs</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {dep.status === "In Progress" && (
                      <TooltipProvider delay={300}>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-background border-slate-200 dark:border-slate-800 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shadow-none" />
                          }>
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </TooltipTrigger>
                          <TooltipContent><p>Stop Deployment</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {dep.status === "Failed" && (
                      <TooltipProvider delay={300}>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-background border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 shadow-none" />
                          }>
                            <RotateCw className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent><p>Retry Deployment</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="border-t border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[13px] font-medium text-muted-foreground">
          Showing {filteredDeployments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDeployments.length)} of {filteredDeployments.length} deployments
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            // Simplified pagination logic to show max 5 pages
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <Button 
                  key={page}
                  variant={currentPage === page ? "default" : "outline"} 
                  size="icon" 
                  className={`h-8 w-8 rounded-lg ${currentPage === page ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' : 'border-border bg-card text-muted-foreground hover:bg-muted'} font-semibold text-[13px]`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="text-muted-foreground px-1">...</span>;
            }
            return null;
          })}

          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Deployment Details</DialogTitle>
            <DialogDescription>
              Detailed information about this deployment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDep && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">ID:</span>
                <span className="col-span-3 text-sm font-mono text-muted-foreground">{selectedDep.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Project:</span>
                <span className="col-span-3 text-sm font-medium text-foreground">{selectedDep.project?.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Status:</span>
                <span className="col-span-3 text-sm">{getStatusBadge(selectedDep.status)}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Progress:</span>
                <span className="col-span-3 text-sm font-medium text-foreground">{selectedDep.progress}%</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Started At:</span>
                <span className="col-span-3 text-sm text-muted-foreground">{format(new Date(selectedDep.startedAt), "dd MMM yyyy, HH:mm:ss", { locale: id })}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Ended At:</span>
                <span className="col-span-3 text-sm text-muted-foreground">{selectedDep.endedAt ? format(new Date(selectedDep.endedAt), "dd MMM yyyy, HH:mm:ss", { locale: id }) : '-'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Duration:</span>
                <span className="col-span-3 text-sm font-medium text-foreground">{calculateDuration(selectedDep.startedAt, selectedDep.endedAt)}</span>
              </div>
              {selectedDep.domain && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Domain:</span>
                  <a href={`http://${selectedDep.domain}`} target="_blank" rel="noreferrer" className="col-span-3 text-sm text-blue-500 hover:underline">
                    {selectedDep.domain}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Build Logs</DialogTitle>
            <DialogDescription>
              Terminal output for {selectedDep?.project?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-[#0D1117] text-[#C9D1D9] font-mono text-[13px] p-5 rounded-md h-[400px] overflow-y-auto mt-2 border border-slate-700/50">
            <div className="flex flex-col gap-1.5">
              <div className="text-blue-400 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Starting deployment process...</span>
              </div>
              <div>&gt; Fetching project configuration for <span className="font-bold text-white">{selectedDep?.project?.name}</span></div>
              <div className="text-emerald-400">✓ Configuration loaded successfully.</div>
              <div>&gt; Pulling dependencies...</div>
              <div>&gt; Building Docker image...</div>
              <div className="text-slate-500">Step 1/5 : FROM node:18-alpine</div>
              <div className="text-slate-500">Step 2/5 : WORKDIR /app</div>
              <div className="text-slate-500">Step 3/5 : COPY package*.json ./</div>
              <div className="text-slate-500">Step 4/5 : RUN npm install</div>
              <div className="text-slate-500">Step 5/5 : COPY . .</div>
              <div>&gt; Exporting image...</div>
              
              <div className="mt-4 border-t border-slate-700/50 pt-4">
                {selectedDep?.status === "Success" ? (
                  <div className="text-emerald-400 font-medium">✓ Deployment completed successfully. Container is now running.</div>
                ) : selectedDep?.status === "Failed" ? (
                  <div className="text-rose-400 font-medium">✗ Deployment failed: Build process exited with error code 1.</div>
                ) : (
                  <div className="text-blue-400 animate-pulse font-medium">... Processing ...</div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
