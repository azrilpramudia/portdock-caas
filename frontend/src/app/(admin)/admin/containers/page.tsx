"use client";

import { useState, useMemo } from "react";
import { useAdminContainers } from "@/hooks/useAdmin";
import { format } from "date-fns";
import Link from "next/link";
import { Download, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extracted Components
import { ContainerStats } from "@/components/admin/containers/ContainerStats";
import { ContainerToolbar } from "@/components/admin/containers/ContainerToolbar";
import { ContainerTable } from "@/components/admin/containers/ContainerTable";

export default function AdminContainersPage() {
  const { data: responseData, isLoading } = useAdminContainers();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [userFilter, setUserFilter] = useState("All Users");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, 7DAYS, 30DAYS

  const activeFilterCount = (statusFilter !== "All Status" ? 1 : 0) + 
                            (projectFilter !== "All Projects" ? 1 : 0) +
                            (userFilter !== "All Users" ? 1 : 0) + 
                            (dateFilter !== "ALL" ? 1 : 0) + 
                            (searchQuery !== "" ? 1 : 0);

  const resetFilters = () => {
    setStatusFilter("All Status");
    setProjectFilter("All Projects");
    setUserFilter("All Users");
    setDateFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
  };
  
  const containers = responseData?.containers || [];
  const { 
    totalContainers = 0, 
    runningContainers = 0, 
    stoppedContainers = 0, 
    exitedContainers = 0, 
    totalImages = 0 
  } = responseData?.stats || {};

  const uniqueProjects = useMemo(() => {
    const projs = new Set<string>();
    containers.forEach(c => projs.add(c.project.name));
    return Array.from(projs).sort();
  }, [containers]);

  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    containers.forEach(c => users.add(c.project.user.name));
    return Array.from(users).sort();
  }, [containers]);

  // Filter containers
  const filteredContainers = useMemo(() => {
    let result = containers.filter(container => {
      const matchesSearch = 
        container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        container.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        container.project.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter !== "All Status") {
        if (statusFilter === "Exited") {
          matchesStatus = container.status === "ERROR" || container.status === "FAILED" || container.status === "REMOVING";
        } else {
          matchesStatus = container.status === statusFilter.toUpperCase();
        }
      }

      const matchesProject = projectFilter === "All Projects" || container.project.name === projectFilter;
      const matchesUser = userFilter === "All Users" || container.project.user.name === userFilter;
      
      let matchesDate = true;
      if (dateFilter !== "ALL") {
        const itemDate = new Date(container.createdAt).getTime();
        const now = new Date().getTime();
        const daysDiff = (now - itemDate) / (1000 * 3600 * 24);
        
        if (dateFilter === "7DAYS") matchesDate = daysDiff <= 7;
        if (dateFilter === "30DAYS") matchesDate = daysDiff <= 30;
      }
      
      return matchesSearch && matchesStatus && matchesProject && matchesUser && matchesDate;
    });

    return result;
  }, [containers, searchQuery, statusFilter, projectFilter, userFilter, dateFilter]);

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
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Container
          </Button>
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
      />

      <div className="space-y-4">
        <ContainerToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          uniqueProjects={uniqueProjects}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          uniqueUsers={uniqueUsers}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          setCurrentPage={setCurrentPage}
          activeFilterCount={activeFilterCount}
          resetFilters={resetFilters}
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
