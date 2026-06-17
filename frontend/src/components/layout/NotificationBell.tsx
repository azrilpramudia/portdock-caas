import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/lib/api";

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastViewed, setLastViewed] = useState<string | null>(null);

  useEffect(() => {
    setLastViewed(localStorage.getItem("portdock_last_notif_view"));
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      const now = new Date().toISOString();
      localStorage.setItem("portdock_last_notif_view", now);
      setLastViewed(now);
    }
  };

  const { data: logs, isLoading, isError } = useQuery<ActivityLog[]>({
    queryKey: ["recent-activity-logs"],
    queryFn: async () => {
      const res = await api.get("/activity-logs/recent");
      return res.data;
    },
    refetchInterval: 15000, // Refresh every 15s to be more responsive
  });

  // Check if there are any logs created after the last viewed time
  const hasRecentLogs = logs && logs.length > 0 && 
    (!lastViewed || new Date(logs[0].createdAt).getTime() > new Date(lastViewed).getTime());

  const getIconForAction = (action: string) => {
    if (action.includes("ERROR") || action.includes("FAIL")) return <XCircle className="w-4 h-4 text-red-500" />;
    if (action.includes("SUCCESS") || action.includes("CONNECT")) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (action.includes("START") || action.includes("STOP") || action.includes("RESTART")) return <RefreshCw className="w-4 h-4 text-blue-500" />;
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger className="relative inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors outline-none">
        <Bell className="w-[1.15rem] h-[1.15rem]" />
        {hasRecentLogs && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 rounded-xl shadow-xl border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-bold text-[14px] text-foreground">Recent Activity</h4>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-[13px] text-red-500 font-medium">
              Failed to load activities.
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="flex flex-col">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 items-start p-4 border-b border-border/50 hover:bg-muted/50 transition-colors last:border-0">
                  <div className="mt-0.5 flex-shrink-0">
                    {getIconForAction(log.action)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[13px] text-foreground font-medium leading-snug">
                      {log.description}
                    </p>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {formatTimeAgo(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <Bell className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-[13px] text-muted-foreground font-medium">No recent activity</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
