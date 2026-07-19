"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdminSettings";
import { useAuthStore } from "@/store/auth";

export function GeneralSettingsCard() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const { user } = useAuthStore();

  const [siteName, setSiteName] = useState("");
  const [siteDesc, setSiteDesc] = useState("");
  const [adminEmail, setAdminEmail] = useState(user?.email || "");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [timeFormat, setTimeFormat] = useState("");
  const [dbPortalUrl, setDbPortalUrl] = useState("");

  useEffect(() => {
    if (settings) {
      if (settings.siteName) setSiteName(settings.siteName);
      if (settings.siteDesc) setSiteDesc(settings.siteDesc);
      if (settings.adminEmail) {
        setAdminEmail(settings.adminEmail);
      } else if (user?.email) {
        setAdminEmail(user.email);
      }
      if (settings.timezone) setTimezone(settings.timezone);
      if (settings.language) setLanguage(settings.language);
      if (settings.dateFormat) setDateFormat(settings.dateFormat);
      if (settings.timeFormat) setTimeFormat(settings.timeFormat);
      if (settings.dbPortalUrl) setDbPortalUrl(settings.dbPortalUrl);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      siteName,
      siteDesc,
      adminEmail,
      timezone,
      language,
      dateFormat,
      timeFormat,
      dbPortalUrl,
    });
  };

  const TIMEZONE_LABELS: Record<string, string> = {
    "Asia/Jakarta": "Asia/Jakarta (UTC +07:00)",
    "UTC": "UTC (UTC +00:00)"
  };

  const LANGUAGE_LABELS: Record<string, string> = {
    "id": "Bahasa Indonesia",
    "en": "English"
  };

  const DATE_FORMAT_LABELS: Record<string, string> = {
    "DD/MM/YYYY": "DD/MM/YYYY (26/05/2026)",
    "MM/DD/YYYY": "MM/DD/YYYY (05/26/2026)",
    "YYYY-MM-DD": "YYYY-MM-DD (2026-05-26)",
    "D MMM YYYY": "D MMM YYYY (26 Mei 2026)"
  };

  const TIME_FORMAT_LABELS: Record<string, string> = {
    "24h": "24-hour (14:30)",
    "12h": "12-hour (02:30 PM)"
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full w-full">
      <div className="px-6 pt-6 pb-5">
        <h3 className="text-base font-bold text-foreground">General Settings</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">Pengaturan dasar sistem Portdock</p>
      </div>
      
      <div className="px-6 pb-6 flex-1 flex flex-col gap-5">


        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Site Description</label>
          <div className="relative">
            <input 
              type="text" 
              value={siteDesc}
              onChange={(e) => setSiteDesc(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Admin Email</label>
          <div className="relative">
            <input 
              type="email" 
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Timezone</label>
          <Select value={timezone} onValueChange={(v) => setTimezone(v || "")}>
            <SelectTrigger className="rounded-md border-border w-full">
              <SelectValue placeholder="Select Timezone">{TIMEZONE_LABELS[timezone]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Jakarta">Asia/Jakarta (UTC +07:00)</SelectItem>
              <SelectItem value="UTC">UTC (UTC +00:00)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Language</label>
          <Select value={language} onValueChange={(v) => setLanguage(v || "")}>
            <SelectTrigger className="rounded-md border-border w-full">
              <SelectValue placeholder="Select Language">{LANGUAGE_LABELS[language]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground">Date Format</label>
          <Select value={dateFormat} onValueChange={(v) => setDateFormat(v || "")}>
            <SelectTrigger className="rounded-md border-border w-full">
              <SelectValue placeholder="Select Date Format">{DATE_FORMAT_LABELS[dateFormat]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (26/05/2026)</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (05/26/2026)</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-05-26)</SelectItem>
              <SelectItem value="D MMM YYYY">D MMM YYYY (26 Mei 2026)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground">Time Format</label>
          <Select value={timeFormat} onValueChange={(v) => setTimeFormat(v || "")}>
            <SelectTrigger className="rounded-md border-border w-full">
              <SelectValue placeholder="Select Time Format">{TIME_FORMAT_LABELS[timeFormat]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24-hour (14:30)</SelectItem>
              <SelectItem value="12h">12-hour (02:30 PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[13px] font-medium text-muted-foreground">Database Portal URL</label>
          <Input 
            value={dbPortalUrl} 
            onChange={(e) => setDbPortalUrl(e.target.value)} 
            placeholder="http://db-portal.your-domain.com"
            className="rounded-md border-border w-full"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Leave empty to disable the Manage Database button for users.</p>
        </div>

        <div className="pt-1 mt-auto md:col-span-2">
          <button 
            onClick={handleSave} 
            disabled={updateSettings.isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm"
          >
            {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
