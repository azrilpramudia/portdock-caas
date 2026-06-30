"use client";

import { Calendar } from "lucide-react";
import { StatCards } from "@/components/admin/StatCards";
import { ResourceUsage } from "@/components/admin/ResourceUsage";
import { ContainerStatus } from "@/components/admin/ContainerStatus";
import { RecentDeployments } from "@/components/admin/RecentDeployments";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { ServiceStatus } from "@/components/admin/ServiceStatus";

export default function AdminRootPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header section with Title and Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan keseluruhan sistem Portdock</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">26 Mei – 2 Jun 2026</span>
          <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* Top Stats Row */}
      <StatCards />

      {/* Middle Row (Resource & Container Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResourceUsage />
        </div>
        <div className="lg:col-span-1">
          <ContainerStatus />
        </div>
      </div>

      {/* Bottom Row (Deployments & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentDeployments />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      {/* Footer Row (Service Status) */}
      <ServiceStatus />
    </div>
  );
}
