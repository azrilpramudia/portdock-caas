"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export function GeneralSettingsCard() {
  const [siteName, setSiteName] = useState("Portdock");
  const [siteDesc, setSiteDesc] = useState("Platform manajemen infrastruktur container & deployment");
  const [email, setEmail] = useState("admin@portdock.id");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [language, setLanguage] = useState("id");
  const [dateFormat, setDateFormat] = useState("26 Mei 2026");
  const [timeFormat, setTimeFormat] = useState("14:30");

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full w-full">
      <div className="px-6 pt-6 pb-5">
        <h3 className="text-base font-bold text-foreground">General Settings</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">Pengaturan dasar sistem Portdock</p>
      </div>
      
      <div className="px-6 pb-6 flex-1 flex flex-col gap-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground">Site Name</label>
          <Input 
            value={siteName} 
            onChange={(e) => setSiteName(e.target.value)} 
            className="rounded-md border-border"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground">Site Description</label>
          <Input 
            value={siteDesc} 
            onChange={(e) => setSiteDesc(e.target.value)} 
            className="rounded-md border-border"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground">Admin Email</label>
          <Input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="rounded-md border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground">Timezone</label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="rounded-md border-border w-full">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta (UTC +07:00)</SelectItem>
                <SelectItem value="UTC">UTC (UTC +00:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="rounded-md border-border w-full">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground">Date Format</label>
            <div className="relative">
              <Input 
                value={dateFormat} 
                onChange={(e) => setDateFormat(e.target.value)}
                className="pr-10 rounded-md border-border"
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground">Time Format</label>
            <div className="relative">
              <Input 
                value={timeFormat} 
                onChange={(e) => setTimeFormat(e.target.value)}
                className="pr-10 rounded-md border-border"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="pt-1 mt-auto">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
