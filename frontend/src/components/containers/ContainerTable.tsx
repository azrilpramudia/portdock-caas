import React, { useState } from "react";
import { RefreshCw, Eye, Play, Square, RefreshCw as RestartIcon, Trash2, MoreVertical, TerminalSquare, FileText, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContainerTableProps {
  containers: any[];
  isLoading: boolean;
  rawContainersCount: number;
  selectedContainer: any | null;
  setSelectedContainer: (container: { id: string; name: string; initialTab?: string }) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
}

export function ContainerTable({
  containers,
  isLoading,
  rawContainersCount,
  selectedContainer,
  setSelectedContainer,
  onStart,
  onStop,
  onRestart,
  onDelete,
  selectedIds,
  onSelectToggle,
  onSelectAll,
}: ContainerTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter out any skeleton rows or loading states if needed
  const validContainers = containers || [];
  const allSelected = validContainers.length > 0 && selectedIds.size === validContainers.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < validContainers.length;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-6 overflow-hidden">
      <h2 className="text-[15px] font-bold text-foreground mb-6">Containers List</h2>
      
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/80">
            <tr className="border-b border-border text-[13px] font-semibold text-muted-foreground">
              <th className="px-5 py-4 font-semibold w-12 text-center">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={onSelectAll} 
                  aria-label="Select all"
                />
              </th>
              <th className="px-5 py-4 font-semibold w-64">Container Name</th>
              <th className="px-5 py-4 font-semibold">Image</th>
              <th className="px-5 py-4 font-semibold">Project</th>
              <th className="px-5 py-4 font-semibold">Port</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Uptime</th>
              <th className="px-5 py-4 font-semibold">Created At</th>
              <th className="px-5 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-foreground divide-y divide-border bg-card">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
                  <p className="font-medium">Loading containers...</p>
                </td>
              </tr>
            ) : validContainers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-muted-foreground font-medium">
                  {rawContainersCount === 0 ? "No containers found" : "No containers match your filters"}
                </td>
              </tr>
            ) : (
              validContainers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((c: any) => {
                const isSelected = selectedIds.has(c.id);
                return (
                  <tr key={c.id} className={`group hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${isSelected ? 'bg-muted/40' : ''}`}>
                    <td className="px-5 py-4 text-center">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => onSelectToggle(c.id)}
                        aria-label={`Select container ${c.name}`}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <c.icon className={`w-8 h-8 ${c.iconColor} flex-shrink-0`} />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-[14px] leading-tight truncate max-w-[130px]" title={c.name}>{c.name}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5 truncate max-w-[130px]">{c.containerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">
                      <div className="truncate max-w-[130px]" title={c.image}>{c.image}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">
                      <div className="truncate max-w-[90px]" title={c.project}>{c.project}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">{c.port}</td>
                    <td className="px-5 py-4">
                      {c.status === "Running" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Running
                        </span>
                      )}
                      {c.status === "Stopped" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" /> Stopped
                        </span>
                      )}
                      {c.status === "Failed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">{c.uptime}</td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">{c.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {c.domain ? (
                          <a 
                            href={`http://${c.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border text-muted-foreground hover:bg-muted hover:text-foreground border-border bg-card"
                            title={`Open ${c.domain}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : c.hostPort ? (
                          <TooltipProvider delay={300}>
                            <Tooltip>
                              <TooltipTrigger render={
                                <a 
                                  href={`http://localhost:${c.hostPort}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border text-muted-foreground hover:bg-muted hover:text-foreground border-border bg-card"
                                />
                              }>
                                <ExternalLink className="w-4 h-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Open App in Browser</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider delay={300}>
                            <Tooltip>
                              <TooltipTrigger render={
                                <button 
                                  disabled
                                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border text-muted-foreground/30 border-border bg-card cursor-not-allowed"
                                />
                              }>
                                <ExternalLink className="w-4 h-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>No port exposed</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        {c.status === "Running" ? (
                          <>
                            <TooltipProvider delay={300}>
                              <Tooltip>
                                <TooltipTrigger render={
                                  <button onClick={() => onStop(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 transition-colors border border-border bg-card" />
                                }>
                                  <Square className="w-4 h-4" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Stop Container</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider delay={300}>
                              <Tooltip>
                                <TooltipTrigger render={
                                  <button onClick={() => onRestart(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-colors border border-border bg-card" />
                                }>
                                  <RestartIcon className="w-4 h-4" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Restart Container</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        ) : (
                          <TooltipProvider delay={300}>
                            <Tooltip>
                              <TooltipTrigger render={
                                <button onClick={() => onStart(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors border border-border bg-card" />
                              }>
                                <Play className="w-4 h-4 ml-0.5" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Start Container</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border bg-card focus:outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-xl rounded-xl">
                            <DropdownMenuItem 
                              className="flex items-center gap-2 py-2.5 cursor-pointer hover:bg-muted"
                              onClick={() => router.push(`/terminal?containerId=${c.id}`)}
                            >
                              <TerminalSquare className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-[13px]">Open Terminal</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 py-2.5 cursor-pointer hover:bg-muted"
                              onClick={() => setSelectedContainer({ id: c.id, name: c.name, initialTab: 'logs' })}
                            >
                              <FileText className="w-4 h-4 text-emerald-500" />
                              <span className="font-medium text-[13px]">View Logs</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              className="flex items-center gap-2 py-2.5 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => {
                                onDelete(c.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="font-bold text-[13px]">Delete Container</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
          <div className="text-[13px] text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, validContainers.length)}</span> of <span className="font-medium text-foreground">{validContainers.length}</span> containers
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-[13px] font-medium rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(validContainers.length / itemsPerPage) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md text-[13px] font-medium transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(validContainers.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(validContainers.length / itemsPerPage)}
              className="px-3 py-1.5 text-[13px] font-medium rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
    </div>
  );
}
