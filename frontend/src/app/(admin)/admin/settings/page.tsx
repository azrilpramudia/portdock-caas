"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { GeneralSettingsCard } from "@/components/admin/settings/GeneralSettingsCard";
import { SecuritySettingsCard } from "@/components/admin/settings/SecuritySettingsCard";
import { NotificationSettingsCard } from "@/components/admin/settings/NotificationSettingsCard";
import { AppearanceSettingsCard } from "@/components/admin/settings/AppearanceSettingsCard";
import { SystemSettingsCard } from "@/components/admin/settings/SystemSettingsCard";
import { BackupRestoreCard } from "@/components/admin/settings/BackupRestoreCard";
import { ApiIntegrationsCard } from "@/components/admin/settings/ApiIntegrationsCard";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");

  const tabs = [
    "General", 
    "Security", 
    "Notifications", 
    "Appearance", 
    "System", 
    "API & Integrations", 
    "Backup & Restore"
  ];

  return (
    <div className="space-y-6 pb-10 w-full overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
          <div className="flex items-center gap-2 mt-2 text-[13px] text-muted-foreground font-medium">
            <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Settings</span>
          </div>
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

      {/* Content */}
      <div className="mt-6 w-full">
        {activeTab === "General" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
            <div className="xl:col-span-1 space-y-6 flex flex-col">
              <GeneralSettingsCard />
              <AppearanceSettingsCard />
            </div>
            <div className="xl:col-span-1 space-y-6 flex flex-col">
              <SecuritySettingsCard />
              <SystemSettingsCard />
            </div>
            <div className="xl:col-span-1 space-y-6 flex flex-col">
              <NotificationSettingsCard />
              <BackupRestoreCard />
            </div>
          </div>
        )}
        
        <div className="max-w-4xl">
          {activeTab === "Security" && <SecuritySettingsCard />}
          {activeTab === "Notifications" && <NotificationSettingsCard />}
          {activeTab === "Appearance" && <AppearanceSettingsCard />}
          {activeTab === "System" && <SystemSettingsCard />}
          {activeTab === "API & Integrations" && <ApiIntegrationsCard />}
          {activeTab === "Backup & Restore" && <BackupRestoreCard />}
        </div>
      </div>
    </div>
  );
}
