import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, ClipboardList, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ActivityLogDetailsModal } from "./AdminActivityLogsModals";

interface AdminActivityLogsTableProps {
  isLoading: boolean;
  filteredActivities: any[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  getTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
}

export function AdminActivityLogsTable({
  isLoading,
  filteredActivities,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  setCurrentPage,
  handlePrevPage,
  handleNextPage,
  getTypeColor,
  getStatusColor,
}: AdminActivityLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = (log: any) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left relative min-w-[800px]">
          <thead className="text-[12px] text-muted-foreground bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Resource</th>
              <th className="px-4 py-3 font-semibold">Resource Type</th>
              <th className="px-4 py-3 font-semibold">IP Address</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </td>
              </tr>
            ) : filteredActivities.length > 0 ? filteredActivities.map((activity) => {
              const time = format(new Date(activity.createdAt), "d MMM yyyy HH:mm:ss", { locale: localeId });
              const relativeTime = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: localeId });
              const userInitial = activity.user.name.substring(0, 2).toUpperCase();
              const resourceDesc = activity.projectId ? "Project" : "System";
              const resourceName = activity.project?.name || "System";
              const type = activity.projectId ? "Project" : "System";
              
              return (
                <tr key={activity.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <div className="font-medium text-foreground">{time}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{relativeTime}</div>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm ring-2 ring-background ${
                        activity.user.role === 'ADMIN' ? 'bg-slate-500' : 'bg-blue-600'
                      }`}>
                        {userInitial}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{activity.user.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{activity.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-foreground">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">{activity.description}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-foreground">{resourceName}</div>
                    <div className="text-xs text-muted-foreground">{resourceDesc}</div>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${getTypeColor(type)}`}>
                      {type}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground text-[13px] whitespace-nowrap">
                    {activity.ipAddress || "-"}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(activity.status)}`}>
                      {activity.status === 'Success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {activity.status === 'Failed' ? <XCircle className="w-3.5 h-3.5" /> : null}
                      {activity.status === 'Warning' ? <AlertCircle className="w-3.5 h-3.5" /> : null}
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenDetails(activity)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-5 rounded-full mb-5 shadow-sm border border-slate-200 dark:border-slate-700">
                      <ClipboardList className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      Belum ada log aktivitas
                    </h3>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Log aktivitas akan muncul di sini ketika ada tindakan yang dilakukan oleh pengguna atau sistem.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
        <div className="text-[13px] font-medium text-muted-foreground">
          Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} activities
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-50"
            disabled={currentPage <= 1 || isLoading}
            onClick={handlePrevPage}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
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
            disabled={currentPage >= totalPages || isLoading}
            onClick={handleNextPage}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ActivityLogDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        log={selectedLog} 
      />
    </div>
  );
}
