"use client";

import { useState, useMemo } from "react";
import { useAdminContainers } from "@/hooks/useAdminContainers";;
import { format } from "date-fns";
import Link from "next/link";
import { Download, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ContainerStats } from "@/components/admin/containers/ContainerStats";
import { AdminDataFilters, FilterValues } from "@/components/admin/AdminDataFilters";
import { ContainerTable } from "@/components/admin/containers/ContainerTable";

export default function AdminContainersPage() {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    status: "all",
    projectId: "all",
    userId: "all",
    dateRange: "all",
  });

  const { data: responseData, isLoading } = useAdminContainers();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const containers = responseData?.containers || [];
  
  const { 
    totalContainers = 0, 
    runningContainers = 0, 
    stoppedContainers = 0, 
    exitedContainers = 0, 
    totalImages = 0,
    totalContainersTrend,
    runningContainersTrend,
    stoppedContainersTrend,
    exitedContainersTrend,
    totalImagesTrend
  } = responseData?.stats || {};

  const projectOptions = useMemo(() => {
    if (!responseData?.containers) return [{ label: "All Projects", value: "all" }];
    const uniqueProjects = Array.from(new Set(responseData.containers.map(c => c.project.id)));
    return [
      { label: "All Projects", value: "all" },
      ...uniqueProjects.map(id => {
        const c = responseData.containers.find(c => c.project.id === id);
        return { label: c?.project.name || id, value: id };
      })
    ];
  }, [responseData?.containers]);

  const userOptions = useMemo(() => {
    if (!responseData?.containers) return [{ label: "All Users", value: "all" }];
    const uniqueUsers = Array.from(new Set(responseData.containers.map(c => c.project.user.id)));
    return [
      { label: "All Users", value: "all" },
      ...uniqueUsers.map(id => {
        const c = responseData.containers.find(c => c.project.user.id === id);
        return { label: c?.project.user.name || id, value: id };
      })
    ];
  }, [responseData?.containers]);

  const filteredContainers = useMemo(() => {
    let result = containers;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.project.name.toLowerCase().includes(q) ||
        c.project.user.name.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter(c => c.status === filters.status);
    }
    if (filters.projectId && filters.projectId !== "all") {
      result = result.filter(c => c.project.id === filters.projectId);
    }
    if (filters.userId && filters.userId !== "all") {
      result = result.filter(c => c.project.user.id === filters.userId);
    }
    return result;
  }, [containers, filters]);

  const totalPages = Math.ceil(filteredContainers.length / itemsPerPage) || 1;
  const paginatedContainers = filteredContainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleExport = () => {
    if (!filteredContainers || filteredContainers.length === 0) return;
    const csvRows = [];
    const headers = ['Container', 'Docker ID', 'Project', 'User', 'Status', 'Image', 'Created At'];
    csvRows.push(headers.join(','));

    for (const container of filteredContainers) {
      const row = [
        `"${container.name}"`,
        `"${container.dockerContainerId || ''}"`,
        `"${container.project.name}"`,
        `"${container.project.user.name}"`,
        `"${container.status}"`,
        `"${container.imageName}:${container.imageTag}"`,
        `"${format(new Date(container.createdAt), 'dd MMM yyyy HH:mm')}"`
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portdock_containers_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Containers</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-foreground">Containers</span>
          </div>
        </div>
        <div className="flex items-center gap-3">

          <Button 
            variant="outline" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <ContainerStats 
        totalContainers={totalContainers}
        runningContainers={runningContainers}
        stoppedContainers={stoppedContainers}
        exitedContainers={exitedContainers}
        totalImages={totalImages}
        totalContainersTrend={totalContainersTrend}
        runningContainersTrend={runningContainersTrend}
        stoppedContainersTrend={stoppedContainersTrend}
        exitedContainersTrend={exitedContainersTrend}
        totalImagesTrend={totalImagesTrend}
      />

      <div className="space-y-4">
        <AdminDataFilters 
          searchPlaceholder="Search containers by name, project, or user..."
          statusOptions={[
            { label: "All Status", value: "all" },
            { label: "Running", value: "RUNNING" },
            { label: "Stopped", value: "STOPPED" },
            { label: "Exited", value: "EXITED" }
          ]}
          projectOptions={projectOptions}
          userOptions={userOptions}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1);
          }}
        />

        <ContainerTable 
          paginatedContainers={paginatedContainers}
          filteredContainers={filteredContainers}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
        />
      </div>
    </div>
  );
}
