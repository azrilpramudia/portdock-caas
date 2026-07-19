"use client";

import { useState, useMemo } from "react";
import { useAdminDatabases } from "@/hooks/useAdminDatabases";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database, Download, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AdminDataFilters, FilterValues } from "@/components/admin/AdminDataFilters";

export default function AdminDatabasesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    status: "all",
    projectId: "all",
    userId: "all",
    dateRange: "all",
  });

  const { data: responseData, isLoading } = useAdminDatabases();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const databases = responseData?.databases || [];
  
  const { 
    totalDatabases = 0, 
    runningDatabases = 0,
  } = responseData?.stats || {};

  const userOptions = useMemo(() => {
    if (!responseData?.databases) return [{ label: "All Users", value: "all" }];
    const uniqueUsers = Array.from(new Set(responseData.databases.map(d => d.user.id)));
    return [
      { label: "All Users", value: "all" },
      ...uniqueUsers.map(id => {
        const d = responseData.databases.find(db => db.user.id === id);
        return { label: d?.user.name || id, value: id };
      })
    ];
  }, [responseData?.databases]);

  const filteredDatabases = useMemo(() => {
    let result = databases;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(db => 
        db.name.toLowerCase().includes(q) || 
        db.user.name.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter(db => db.status === filters.status);
    }
    if (filters.userId && filters.userId !== "all") {
      result = result.filter(db => db.user.id === filters.userId);
    }
    return result;
  }, [databases, filters]);

  const totalPages = Math.ceil(filteredDatabases.length / itemsPerPage) || 1;
  const paginatedDatabases = filteredDatabases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Databases</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor all databases across the system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Databases</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{totalDatabases}</h3>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Running</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{runningDatabases}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-320px)] min-h-[500px]">
        <div className="p-4 border-b border-border bg-muted/20 shrink-0">
          <AdminDataFilters 
            onFilterChange={setFilters} 
            userOptions={userOptions}
            projectOptions={[{ label: "All Projects", value: "all" }]}
          />
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">Database</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Engine</th>
                <th className="px-6 py-4 font-semibold">Limits</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedDatabases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No databases found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedDatabases.map((db) => (
                  <tr key={db.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          db.type === 'POSTGRESQL' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {db.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{db.id.slice(0,8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{db.user.name}</div>
                      <div className="text-xs text-muted-foreground">{db.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold flex w-fit items-center gap-1.5 capitalize ${
                        db.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        db.status === 'STOPPED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          db.status === 'RUNNING' ? 'bg-emerald-500' : 
                          db.status === 'STOPPED' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {db.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{db.type === 'POSTGRESQL' ? 'PostgreSQL' : 'MySQL'}</div>
                      <div className="text-xs text-muted-foreground">{db.version}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{db.cpuLimit ? db.cpuLimit : 0.5} CPU</div>
                      <div className="text-xs text-muted-foreground">{db.memoryLimit ? db.memoryLimit : 512} MB RAM</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <TooltipProvider delay={0}>
                        <Tooltip>
                          <TooltipTrigger 
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            onClick={() => router.push(`/admin/databases/${db.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredDatabases.length)}</span> of <span className="font-medium text-foreground">{filteredDatabases.length}</span> results
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
