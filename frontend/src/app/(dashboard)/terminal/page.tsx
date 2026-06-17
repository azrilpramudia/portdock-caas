"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { containersService } from "@/services/containers.service";
import { useTerminalSession } from "@/hooks/useTerminalSession";

import { TerminalHeader } from "@/components/terminal/TerminalHeader";
import { SessionInfoPanel } from "@/components/terminal/SessionInfoPanel";
import { TerminalWindow } from "@/components/terminal/TerminalWindow";
import { RecentCommandsSidebar } from "@/components/terminal/RecentCommandsSidebar";

export default function TerminalPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState("");

  const {
    terminalRef,
    isConnected,
    sessionInfo,
    recentCommands,
    setRecentCommands,
    handleConnect,
    handleDisconnect,
    handleClear,
    handleDownloadLog,
    executeCommand,
    fitTerminal
  } = useTerminalSession(selectedContainerId);

  // Load containers
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const data = await containersService.getContainers();
        setContainers(data.filter((c: any) => c.status === "RUNNING"));
      } catch (err) {
        toast.error("Failed to fetch containers");
      }
    };
    fetchContainers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Web Terminal</h2>
          <p className="text-muted-foreground mt-1">
            Access secure SSH sessions to your running containers
          </p>
        </div>
      </div>

      <TerminalHeader 
        containers={containers}
        selectedContainerId={selectedContainerId}
        setSelectedContainerId={setSelectedContainerId}
        isConnected={isConnected}
        handleConnect={handleConnect}
        handleDisconnect={handleDisconnect}
      />

      <SessionInfoPanel sessionInfo={sessionInfo} isConnected={isConnected} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <TerminalWindow 
          terminalRef={terminalRef}
          onClear={handleClear}
          onDownloadLog={handleDownloadLog}
          onMaximizeToggle={fitTerminal}
        />
        
        <RecentCommandsSidebar 
          commands={recentCommands}
          onClear={() => setRecentCommands([])}
          onExecute={executeCommand}
        />
      </div>
    </div>
  );
}
