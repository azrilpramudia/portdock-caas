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
        const running = data.filter((c: any) => c.status === "RUNNING");
        setContainers(running);
        
        const params = new URLSearchParams(window.location.search);
        const urlContainerId = params.get("containerId");
        if (urlContainerId && running.some((c: any) => c.id === urlContainerId)) {
          setSelectedContainerId(urlContainerId);
        }
      } catch (err) {
        toast.error("Failed to fetch containers");
      }
    };
    fetchContainers();
  }, []);

  return (
    <div className="space-y-6">
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
