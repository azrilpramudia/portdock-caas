import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settings";

export function useAdminSettings() {
  return useQuery({
    queryKey: ["adminSettings"],
    queryFn: async () => {
      const res = await api.get<Record<string, string>>("/admin/settings");
      return res.data;
    },
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      notifySystem?: string;
      notifySecurity?: string;
      notifyMaintenance?: string;
      telegramBotToken?: string;
      telegramChatId?: string;
    }) => {
      const res = await api.patch("/admin/settings", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      // Update global settings store immediately without reload
      useSettingsStore.getState().fetchSettings();
      toast.success("Settings saved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save settings");
    },
  });
}
