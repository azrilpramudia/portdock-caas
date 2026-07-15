import { AlertTriangle } from "lucide-react";
import { useSettingsStore } from "@/store/settings";

export function MaintenanceBanner() {
  const { settings } = useSettingsStore();

  if (!settings.isMaintenanceMode) return null;

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-500 px-4 py-3 text-sm flex items-center justify-center space-x-2 z-50 w-full shrink-0">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="font-medium text-center">
        We are currently undergoing scheduled maintenance. Some features may be disabled.
      </span>
    </div>
  );
}
