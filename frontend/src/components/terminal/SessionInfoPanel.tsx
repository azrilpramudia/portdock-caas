import { Code, Server, Clock } from "lucide-react";

interface SessionInfo {
  host: string;
  user: string;
  startedAt: string;
}

interface SessionInfoPanelProps {
  sessionInfo: SessionInfo;
  isConnected: boolean;
}

export function SessionInfoPanel({ sessionInfo, isConnected }: SessionInfoPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Code className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-0.5">Host System</p>
          <p className="text-sm font-bold text-foreground truncate">{sessionInfo.host || "Not Connected"}</p>
        </div>
      </div>
      <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-emerald-500/10 rounded-lg">
          <Server className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-0.5">Active User</p>
          <p className="text-sm font-bold text-foreground">
            {isConnected ? sessionInfo.user || "root" : "-"}
          </p>
        </div>
      </div>
      <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-purple-500/10 rounded-lg">
          <Clock className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-0.5">Session Time</p>
          <p className="text-sm font-bold text-foreground">
            {isConnected ? sessionInfo.startedAt || "Just now" : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
