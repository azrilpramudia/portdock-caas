import { Server, Globe, Settings, Box, Clock } from 'lucide-react';

interface ServerInfoPanelProps {
  data: {
    name: string;
    ip: string;
    provider: string;
    os: string;
    dockerVersion: string;
    uptime: string;
  };
}

export function ServerInfoPanel({ data }: ServerInfoPanelProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-foreground mb-6">Server Information</h3>
      <div className="space-y-5">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Server className="w-4 h-4" /> Server Name
          </div>
          <span className="font-semibold text-foreground">{data.name}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Globe className="w-4 h-4" /> IP Address
          </div>
          <span className="font-mono text-foreground">{data.ip}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Server className="w-4 h-4" /> Provider
          </div>
          <span className="font-semibold text-foreground">{data.provider}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Settings className="w-4 h-4" /> OS
          </div>
          <span className="font-semibold text-foreground">{data.os}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Box className="w-4 h-4" /> Docker Version
          </div>
          <span className="font-mono text-foreground">{data.dockerVersion}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="w-4 h-4" /> Uptime
          </div>
          <span className="font-semibold text-foreground">{data.uptime}</span>
        </div>
      </div>
    </div>
  );
}
