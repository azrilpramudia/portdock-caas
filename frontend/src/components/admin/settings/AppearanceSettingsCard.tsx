"use client";

import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Monitor, Loader2 } from "lucide-react";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdminSettings";

export function AppearanceSettingsCard() {
  const { data: settings } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const [primaryColor, setPrimaryColor] = useState("blue");
  const [sidebarStyle, setSidebarStyle] = useState("default");

  useEffect(() => {
    if (settings) {
      if (settings.primaryColor) setPrimaryColor(settings.primaryColor);
      if (settings.sidebarStyle) setSidebarStyle(settings.sidebarStyle);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      primaryColor,
      sidebarStyle,
    });
  };

  const SIDEBAR_LABELS: Record<string, string> = {
    "default": "Default",
    "compact": "Compact"
  };

  const colors = [
    { name: "blue", hex: "bg-blue-600", ring: "ring-blue-600" },
    { name: "green", hex: "bg-emerald-500", ring: "ring-emerald-500" },
    { name: "purple", hex: "bg-purple-500", ring: "ring-purple-500" },
    { name: "yellow", hex: "bg-amber-500", ring: "ring-amber-500" },
    { name: "red", hex: "bg-red-500", ring: "ring-red-500" },
    { name: "slate", hex: "bg-slate-600", ring: "ring-slate-600" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full w-full">
      <div className="px-6 pt-6 pb-5">
        <h3 className="text-base font-bold text-foreground">Appearance Settings</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">Sesuaikan tampilan dashboard</p>
      </div>
      
      <div className="px-6 pb-6 flex-1 flex flex-col gap-5">

        <div className="space-y-2.5">
          <label className="text-[13px] font-medium text-muted-foreground">Primary Color</label>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setPrimaryColor(c.name)}
                className={`w-8 h-8 rounded-full ${c.hex} transition-all ${
                  primaryColor === c.name ? `ring-2 ring-offset-2 ${c.ring} ring-offset-background scale-110` : "opacity-90 hover:opacity-100 hover:scale-105"
                }`}
                aria-label={`Select ${c.name} color`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-5 border-b border-border/50">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-semibold text-foreground">Sidebar Style</h4>
            <p className="text-xs text-muted-foreground">Pilih gaya tampilan sidebar.</p>
          </div>
          <div className="w-[120px] shrink-0">
            <Select value={sidebarStyle} onValueChange={(v) => setSidebarStyle(v || "")}>
              <SelectTrigger className="rounded-md border-border w-full">
                <SelectValue placeholder="Select Style">{SIDEBAR_LABELS[sidebarStyle]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-1 mt-auto">
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
