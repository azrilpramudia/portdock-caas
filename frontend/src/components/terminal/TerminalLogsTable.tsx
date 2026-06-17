import React, { useState, useEffect } from "react";
import { Search, TerminalSquare, Clock, ShieldAlert } from "lucide-react";
import { terminalLogsService } from "@/services/terminal-logs.service";
import { formatDistanceToNow, format } from "date-fns";

interface TerminalLog {
  id: string;
  command: string;
  executedAt: string;
}

export function TerminalLogsTable({ containerId }: { containerId: string }) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerId) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await terminalLogsService.getLogs(containerId);
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch terminal logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Auto refresh every 5 seconds while this tab is open
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [containerId]);

  const filteredLogs = logs.filter(log => 
    log.command.toLowerCase().includes(search.toLowerCase())
  );

  if (!containerId) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
        <TerminalSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-foreground mb-2">No Container Selected</h3>
        <p className="text-sm text-muted-foreground">Select a container from the dropdown to view its terminal logs.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-500" />
            Command Audit Logs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time history of commands executed in this container
          </p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 h-10 bg-muted/50 border border-border text-[13px] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="py-4 px-6 text-[12px] font-bold text-muted-foreground uppercase tracking-wider w-1/2">Command</th>
              <th className="py-4 px-6 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Executed At</th>
              <th className="py-4 px-6 text-[12px] font-bold text-muted-foreground uppercase tracking-wider text-right">Relative Time</th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-muted-foreground">Loading audit logs...</td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <TerminalSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No terminal commands recorded yet</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-[13px] text-emerald-400 bg-slate-950/50 px-2.5 py-1.5 rounded-md border border-slate-800 break-all">
                        <span className="text-slate-500 select-none mr-2">$</span>
                        {log.command}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[13px] text-muted-foreground font-medium">
                      {format(new Date(log.executedAt), "MMM dd, yyyy HH:mm:ss")}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(log.executedAt), { addSuffix: true })}
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
