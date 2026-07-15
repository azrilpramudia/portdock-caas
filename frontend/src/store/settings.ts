import { create } from "zustand";
import api from "@/lib/api";

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  isMaintenanceMode: boolean;
  primaryColor?: string;
  sidebarStyle?: string;
}

interface SettingsState {
  settings: SystemSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
}

const defaultSettings: SystemSettings = {
  siteName: "Portdock",
  siteDescription: "Platform cloud hosting docker",
  language: "id",
  timezone: "Asia/Jakarta",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24-hour",
  isMaintenanceMode: false,
  primaryColor: "blue",
  sidebarStyle: "default",
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: true,
  fetchSettings: async () => {
    try {
      const res = await api.get("/settings/public");
      
      const newSettings = { 
        ...defaultSettings, 
        ...res.data,
        isMaintenanceMode: res.data.isMaintenanceMode === "true" || res.data.isMaintenanceMode === true
      };
      
      set({ settings: newSettings, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch public settings", error);
      set({ isLoading: false });
    }
  },
}));
