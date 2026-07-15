"use client";

import React, { useEffect } from "react";
import { useSettingsStore } from "@/store/settings";

const colorMap: Record<string, string> = {
  blue: "#2563eb",
  green: "#10b981",
  purple: "#8b5cf6",
  yellow: "#f59e0b",
  red: "#ef4444",
  slate: "#475569",
};

export function DynamicSettingsProvider({ children }: { children: React.ReactNode }) {
  const primaryColor = useSettingsStore(state => state.settings.primaryColor);

  useEffect(() => {
    if (primaryColor && colorMap[primaryColor]) {
      const hex = colorMap[primaryColor];
      // Inject CSS variables to override defaults in globals.css
      document.documentElement.style.setProperty("--primary", hex);
      document.documentElement.style.setProperty("--chart-1", hex);
      document.documentElement.style.setProperty("--sidebar-primary", hex);
      document.documentElement.style.setProperty("--ring", hex);
    } else {
      // Revert to defaults if invalid or missing
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--chart-1");
      document.documentElement.style.removeProperty("--sidebar-primary");
      document.documentElement.style.removeProperty("--ring");
    }
  }, [primaryColor]);

  return <>{children}</>;
}
