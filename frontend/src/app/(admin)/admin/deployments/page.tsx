"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { DeploymentStats } from "@/components/admin/deployments/DeploymentStats";
import { AdminDataFilters, FilterValues } from "@/components/admin/AdminDataFilters";
import { DeploymentsTable } from "@/components/admin/deployments/DeploymentsTable";
import { useAdminDeployments } from "@/hooks/useAdminDeployments";;

export default function AdminDeploymentsPage() {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    status: "all",
    projectId: "all",
    userId: "all",
    dateRange: "all",
  });

  const { data, isLoading } = useAdminDeployments();

  const deployments = data?.deployments || [];
  const stats = data?.stats;

  const filteredDeployments = useMemo(() => {
    let result = deployments;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(d => 
        d.id.toLowerCase().includes(q) || 
        d.project.name.toLowerCase().includes(q) ||
        d.project.user.name.toLowerCase().includes(q) ||
        (d.domain && d.domain.toLowerCase().includes(q))
      );
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter(d => d.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.projectId && filters.projectId !== "all") {
      result = result.filter(d => d.project.id === filters.projectId);
    }
    if (filters.userId && filters.userId !== "all") {
      result = result.filter(d => d.project.user.id === filters.userId);
    }
    return result;
  }, [deployments, filters]);

  const projectOptions = useMemo(() => {
    if (!data?.deployments) return [{ label: "All Projects", value: "all" }];
    const uniqueProjects = Array.from(new Set(data.deployments.map(d => d.project.id)));
    return [
      { label: "All Projects", value: "all" },
      ...uniqueProjects.map(id => {
        const d = data.deployments.find(d => d.project.id === id);
        return { label: d?.project.name || id, value: id };
      })
    ];
  }, [data?.deployments]);

  const userOptions = useMemo(() => {
    if (!data?.deployments) return [{ label: "All Users", value: "all" }];
    const uniqueUsers = Array.from(new Set(data.deployments.map(d => d.project.user.id)));
    return [
      { label: "All Users", value: "all" },
      ...uniqueUsers.map(id => {
        const d = data.deployments.find(d => d.project.user.id === id);
        return { label: d?.project.user.name || id, value: id };
      })
    ];
  }, [data?.deployments]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(filteredDeployments.length / itemsPerPage) || 1;
  const paginatedDeployments = filteredDeployments.slice(
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
    if (!filteredDeployments.length) return;
    
    // Create CSV header
    const headers = ['ID', 'Project', 'User', 'Environment', 'Status', 'Progress', 'Started At', 'Ended At', 'Domain'];
    
    // Create CSV rows
    const rows = filteredDeployments.map(dep => [
      dep.id,
      dep.project.name,
      dep.project.user.name,
      dep.project.templateId || 'N/A',
      dep.status,
      `${dep.progress}%`,
      new Date(dep.startedAt).toLocaleString(),
      dep.endedAt ? new Date(dep.endedAt).toLocaleString() : '-',
      dep.domain || 'N/A'
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `deployments_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deployments</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-foreground">Deployments</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">

          <Button onClick={handleExport} disabled={filteredDeployments.length === 0} variant="outline" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <DeploymentStats stats={stats} />

      {/* Filters */}
      <AdminDataFilters 
        searchPlaceholder="Search deployments by project, user, or domain..."
        statusOptions={[
          { label: "All Status", value: "all" },
          { label: "Success", value: "Success" },
          { label: "In Progress", value: "In Progress" },
          { label: "Failed", value: "Failed" },
        ]}
        projectOptions={projectOptions}
        userOptions={userOptions}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
      />

      {/* Table */}
      <DeploymentsTable 
        deployments={paginatedDeployments}
        filteredDeployments={filteredDeployments}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
      />
        
    </div>
  );
}
