"use client";

import React, { useState } from "react";
import { ChevronRight, Calendar as CalendarIcon, ChevronDown, Loader2, Box } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminMonitoring } from "@/hooks/useAdminMonitoring";

import { ServerSettingsStats } from "@/components/admin/server-settings/ServerSettingsStats";
import { ServerSettingsInfo } from "@/components/admin/server-settings/ServerSettingsInfo";
import { ServerSettingsResource } from "@/components/admin/server-settings/ServerSettingsResource";
import { ServerSettingsServices } from "@/components/admin/server-settings/ServerSettingsServices";
import { ServerSettingsQuickActions } from "@/components/admin/server-settings/ServerSettingsQuickActions";
import { ServerSettingsDiskUsage } from "@/components/admin/server-settings/ServerSettingsDiskUsage";

export default function ServerSettingsPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [range, setRange] = useState("7d");
  const { data: monitoringData, isLoading, error } = useAdminMonitoring(range);

  const rangeLabel = range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days';

  const tabs = [
    "Overview", "General", "Docker", "Nginx", "Database", "SSL", "Backup", "Security", "Notifications", "Advanced"
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !monitoringData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-destructive">
        Failed to load server settings data.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 w-full overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Server Settings</h2>
          <div className="flex items-center gap-2 mt-2 text-[13px] text-muted-foreground font-medium">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Server Settings</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline", className: "h-10 px-4 text-sm font-medium bg-background border-input flex items-center gap-2 flex-1 sm:flex-auto" })}>
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className="whitespace-nowrap">{rangeLabel}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRange("24h")}>Last 24 Hours</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRange("7d")}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRange("30d")}>Last 30 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[13px] font-semibold whitespace-nowrap transition-colors relative ${
              activeTab === tab 
                ? "text-blue-600" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? (
        <>
          {/* Stats Row */}
          <ServerSettingsStats overview={monitoringData.overview} />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1">
              <ServerSettingsInfo serverInfo={monitoringData.serverInfo} />
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-1">
              <ServerSettingsResource historical={monitoringData.historical} overview={monitoringData.overview} range={range} setRange={setRange} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <ServerSettingsServices services={monitoringData.services} />
            </div>
          </div>

          {/* Bottom Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ServerSettingsQuickActions />
            </div>
            <div className="lg:col-span-1">
              <ServerSettingsDiskUsage diskPartitions={monitoringData.overview.diskPartitions || []} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 mt-6 text-center bg-card border border-border rounded-xl shadow-sm">
          <Box className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">{activeTab}</h2>
          <p className="text-muted-foreground text-[14px] max-w-md">
            This feature is currently in development (Coming Soon).<br/>
            We are working hard to bring you more detailed server monitoring.
          </p>
        </div>
      )}
    </div>
  );
}
