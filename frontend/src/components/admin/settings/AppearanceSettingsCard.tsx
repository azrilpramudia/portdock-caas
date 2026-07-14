"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, Monitor } from "lucide-react";

export function AppearanceSettingsCard() {
  const [theme, setTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("blue");
  const [sidebarStyle, setSidebarStyle] = useState("default");

  const colors = [
    { name: "blue", hex: "bg-blue-600" },
    { name: "indigo", hex: "bg-indigo-500" },
    { name: "purple", hex: "bg-purple-500" },
    { name: "orange", hex: "bg-orange-500" },
    { name: "red", hex: "bg-red-500" },
    { name: "slate", hex: "bg-slate-600" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full mt-6">
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground">Appearance Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">Sesuaikan tampilan dashboard</p>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-sm font-medium transition-all ${
                theme === "light" 
                  ? "border-blue-600 text-blue-600 bg-blue-50/10" 
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-sm font-medium transition-all ${
                theme === "dark" 
                  ? "border-blue-600 text-blue-600 bg-blue-50/10" 
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-sm font-medium transition-all ${
                theme === "system" 
                  ? "border-blue-600 text-blue-600 bg-blue-50/10" 
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Monitor className="w-4 h-4" /> System
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Primary Color</label>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setPrimaryColor(c.name)}
                className={`w-8 h-8 rounded-full ${c.hex} transition-transform ${
                  primaryColor === c.name ? "ring-2 ring-offset-2 ring-blue-600 ring-offset-background scale-110" : "opacity-90 hover:opacity-100 hover:scale-105"
                }`}
                aria-label={`Select ${c.name} color`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Sidebar Style</label>
          <div className="w-1/2">
            <Select value={sidebarStyle} onValueChange={setSidebarStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 shadow-sm rounded-md font-medium">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
