import React from "react";
import { RefreshCw, Eye, Play, Square, RefreshCw as RestartIcon, Trash2, MoreVertical, TerminalSquare, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ContainerTableProps {
  containers: any[];
  isLoading: boolean;
  rawContainersCount: number;
  selectedContainer: any | null;
  setSelectedContainer: (c: any) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
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
}: ContainerTableProps) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-6 overflow-hidden">
      <h2 className="text-[15px] font-bold text-foreground mb-6">Containers List</h2>
      
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/80">
            <tr className="border-b border-border text-[13px] font-semibold text-muted-foreground">
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
                <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
                  <p className="font-medium">Loading containers...</p>
                </td>
              </tr>
            ) : containers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground font-medium">
                  {rawContainersCount === 0 ? "No containers found" : "No containers match your filters"}
                </td>
              </tr>
            ) : (
              containers.map((c: any) => (
                <tr key={c.id} className="group hover:bg-muted/50 transition-colors border-b border-border last:border-0">
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
                      <button 
                        onClick={() => setSelectedContainer({ id: c.id, name: c.name })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${selectedContainer?.id === c.id ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground border-border bg-card'}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {c.status === "Running" ? (
                        <>
                          <button onClick={() => onStop(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 transition-colors border border-border bg-card">
                            <Square className="w-4 h-4" />
                          </button>
                          <button onClick={() => onRestart(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-colors border border-border bg-card">
                            <RestartIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => onStart(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors border border-border bg-card">
                          <Play className="w-4 h-4 ml-0.5" />
                        </button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border bg-card focus:outline-none">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-xl rounded-xl">
                          <DropdownMenuItem className="flex items-center gap-2 py-2.5 cursor-pointer hover:bg-muted">
                            <TerminalSquare className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-[13px]">Open Terminal</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 py-2.5 cursor-pointer hover:bg-muted">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium text-[13px]">View Logs</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem 
                            className="flex items-center gap-2 py-2.5 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this container?")) {
                                onDelete(c.id);
                              }
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
