import { Activity, RefreshCw, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface ActivityLogsTableProps {
  logs: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalLogs: number;
  startCount: number;
  endCount: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export function ActivityLogsTable({
  logs,
  isLoading,
  currentPage,
  totalPages,
  totalLogs,
  startCount,
  endCount,
  setCurrentPage
}: ActivityLogsTableProps) {
  return (
    <>
      {/* 2. MAIN TABLE */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-card sticky top-0 z-10 border-b border-border">
            <tr className="text-[12px] font-bold text-muted-foreground">
              <th className="px-6 py-4 font-semibold">Time</th>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Action</th>
              <th className="px-6 py-4 font-semibold">Project / Container</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">IP Address</th>
              <th className="px-6 py-4 font-semibold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-500" />
                  <p className="font-medium text-sm">Loading activity logs...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-medium text-sm">No activity logs found</p>
                </td>
              </tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-muted/50 transition-colors group">
                  
                  {/* Time */}
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-medium text-muted-foreground">{log.date}</div>
                    <div className="text-[12px] text-muted-foreground/70 mt-0.5">{log.time}</div>
                  </td>

                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 rounded-full border border-border bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold text-foreground">
                          {log.user.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </Avatar>
                      <div>
                        <div className="text-[13px] font-bold text-foreground">{log.user}</div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{log.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${log.actionBg}`}>
                        {log.actionIcon}
                      </div>
                      <div className="max-w-[200px] xl:max-w-[250px]">
                        <div className="text-[13px] font-bold text-foreground truncate">{log.actionTitle}</div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5 truncate">{log.actionSub}</div>
                      </div>
                    </div>
                  </td>

                  {/* Project / Container */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${log.targetBg}`}>
                        {log.targetIcon}
                      </div>
                      <div className="max-w-[200px] xl:max-w-[250px]">
                        <div className="text-[13px] font-bold text-foreground truncate">{log.targetTitle}</div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5 truncate">{log.targetSub}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {log.status === "Success" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Success
                      </span>
                    ) : log.status === "Pending" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[12px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Failed
                      </span>
                    )}
                  </td>

                  {/* IP Address */}
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-medium text-muted-foreground">{log.ip}</span>
                  </td>

                  {/* Actions (Three dots) */}
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-muted-foreground/70 hover:text-foreground rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-[13px] font-medium text-muted-foreground">
            Showing {startCount} to {endCount} of {totalLogs} activities
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 bg-card border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-bold text-foreground mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 bg-card border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
