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
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground">General Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">Pengaturan dasar sistem Portdock</p>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Site Name</label>
          <Input 
            value={siteName} 
            onChange={(e) => setSiteName(e.target.value)} 
            className="h-10 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Site Description</label>
          <Input 
            value={siteDesc} 
            onChange={(e) => setSiteDesc(e.target.value)} 
            className="h-10 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Admin Email</label>
          <Input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="h-10 rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Timezone</label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-10 rounded-md">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta (UTC +07:00)</SelectItem>
                <SelectItem value="UTC">UTC (UTC +00:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-10 rounded-md">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date Format</label>
            <div className="relative">
              <Input 
                value={dateFormat} 
                onChange={(e) => setDateFormat(e.target.value)}
                className="h-10 rounded-md pr-10"
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Time Format</label>
            <div className="relative">
              <Input 
                value={timeFormat} 
                onChange={(e) => setTimeFormat(e.target.value)}
                className="h-10 rounded-md pr-10"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="pt-2 mt-auto">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 shadow-sm rounded-md font-medium">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
