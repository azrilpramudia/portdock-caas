"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Laptop, Smartphone, Globe, LogOut, Loader2, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Session } from "@/types";
import { formatDistanceToNow } from "date-fns";

export function ActiveSessions() {
  const queryClient = useQueryClient();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const res = await api.get('/auth/sessions');
      return res.data;
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/auth/sessions/${id}`);
    },
    onSuccess: () => {
      toast.success("Session revoked successfully");
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to revoke session");
    },
    onSettled: () => {
      setRevokingId(null);
    }
  });

  const handleRevoke = (id: string) => {
    setRevokingId(id);
    revokeSessionMutation.mutate(id);
  };

  const parseDevice = (userAgent?: string) => {
    if (!userAgent) return { name: "Unknown Device", icon: Globe };
    const lowerUA = userAgent.toLowerCase();
    
    let icon = Globe;
    if (lowerUA.includes("mobile") || lowerUA.includes("android") || lowerUA.includes("iphone")) {
      icon = Smartphone;
    } else if (lowerUA.includes("macintosh") || lowerUA.includes("windows") || lowerUA.includes("linux")) {
      icon = Laptop;
    }

    let os = "Unknown OS";
    if (lowerUA.includes("windows")) os = "Windows";
    else if (lowerUA.includes("mac os") || lowerUA.includes("macintosh")) os = "macOS";
    else if (lowerUA.includes("linux")) os = "Linux";
    else if (lowerUA.includes("android")) os = "Android";
    else if (lowerUA.includes("ios") || lowerUA.includes("iphone") || lowerUA.includes("ipad")) os = "iOS";

    let browser = "Unknown Browser";
    if (lowerUA.includes("firefox")) browser = "Firefox";
    else if (lowerUA.includes("edg/")) browser = "Edge";
    else if (lowerUA.includes("chrome")) browser = "Chrome";
    else if (lowerUA.includes("safari")) browser = "Safari";

    return { name: `${os} • ${browser}`, icon };
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <MonitorSmartphone className="w-[18px] h-[18px]" />
          </div>
          <h2 className="text-[15px] font-bold text-foreground">Active Sessions</h2>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
          These are the devices that are currently logged into your account. Revoke any sessions that you do not recognize.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const { name, icon: Icon } = parseDevice(session.userAgent);
              return (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`p-2 rounded-lg shrink-0 ${session.isCurrent ? 'bg-indigo-500/10 text-indigo-600' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-foreground truncate">{name}</p>
                        {session.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shrink-0">Current</span>
                        )}
                      </div>
                      <p className="text-[12px] text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-foreground/70">{session.ipAddress || 'Unknown IP'}</span>
                        <span>•</span>
                        <span>Active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}</span>
                      </p>
                    </div>
                  </div>
                  
                  {!session.isCurrent && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0 ml-2"
                      onClick={() => handleRevoke(session.id)}
                      disabled={revokingId === session.id}
                      title="Revoke session"
                    >
                      {revokingId === session.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
