import { create } from "zustand";
import api from "@/lib/api";

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
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
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: true,
  fetchSettings: async () => {
    try {
      // Create a raw axios request or fetch so we don't depend on interceptors for a public endpoint
      // if not necessary, but using standard api is fine if it doesn't 401.
      // We will use standard api instance, but catch errors.
      const res = await api.get("/settings/public");
      
      const newSettings = { ...defaultSettings, ...res.data };
      set({ settings: newSettings, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch public settings", error);
      set({ isLoading: false });
    }
  },
}));
