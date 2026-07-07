"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

import { DeploymentStats } from "@/components/admin/deployments/DeploymentStats";
import { DeploymentFilters } from "@/components/admin/deployments/DeploymentFilters";
import { DeploymentsTable } from "@/components/admin/deployments/DeploymentsTable";

export default function AdminDeploymentsPage() {
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
          <Button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" />
            New Deployment
          </Button>
          <Button variant="outline" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

        {/* Stats Row */}
        <DeploymentStats />

        {/* Filters */}
        <DeploymentFilters />

        {/* Table */}
        <DeploymentsTable />
        
      </div>
  );
}
