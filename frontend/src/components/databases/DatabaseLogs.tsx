"use client";

import { useEffect } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppLogsSession } from "@/hooks/useAppLogsSession";
import "xterm/css/xterm.css";

interface DatabaseLogsProps {
  id: string;
  active: boolean;
}

export function DatabaseLogs({ id, active }: DatabaseLogsProps) {
  const {
    appLogsTerminalRef,
    isAppLogsConnected,
    handleConnectAppLogs,
    handleDisconnectAppLogs,
    handleClearAppLogs,
    fitAppLogsTerminal,
  } = useAppLogsSession(id, true); // true for isDatabase

  useEffect(() => {
    if (active) {
      fitAppLogsTerminal();
    }
  }, [active, fitAppLogsTerminal]);

  return (
    <div className={`bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px] ${active ? "block" : "hidden"}`}>
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Container Logs</h3>
        </div>
        <div className="flex items-center gap-2">
          {!isAppLogsConnected ? (
            <Button size="sm" onClick={handleConnectAppLogs} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">
              Connect
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={handleDisconnectAppLogs} className="h-8 text-xs">
              Disconnect
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleClearAppLogs} className="h-8 text-xs">
            Clear
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-[#111827] p-4 overflow-hidden relative">
        <div ref={appLogsTerminalRef} className="w-full h-full" />
        {!isAppLogsConnected && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Button onClick={handleConnectAppLogs} className="bg-blue-600 hover:bg-blue-700">
              Start Streaming Logs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
