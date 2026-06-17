"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { containersService } from "@/services/containers.service";
import { useTerminalSession } from "@/hooks/useTerminalSession";

import { TerminalHeader } from "@/components/terminal/TerminalHeader";
import { SessionInfoPanel } from "@/components/terminal/SessionInfoPanel";
import { TerminalWindow } from "@/components/terminal/TerminalWindow";
import { RecentCommandsSidebar } from "@/components/terminal/RecentCommandsSidebar";
import { TerminalLogsTable } from "@/components/terminal/TerminalLogsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TerminalSquare, ListTodo } from "lucide-react";

export default function TerminalPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState("");
  const [activeTab, setActiveTab] = useState("live");

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

      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        if (val === 'live') {
          // Small delay to allow DOM to un-hide before fitting
          setTimeout(() => fitTerminal(), 50);
        }
      }} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-muted/50 p-1 border border-border/50">
            <TabsTrigger value="live" className="gap-2 px-6 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
              <TerminalSquare className="w-4 h-4" />
              Live Terminal
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2 px-6 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
              <ListTodo className="w-4 h-4" />
              Command Logs
            </TabsTrigger>
          </TabsList>
        </div>

        <div className={activeTab === 'live' ? 'block' : 'hidden'}>
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

        <TabsContent value="logs" className="mt-0 focus-visible:outline-none focus-visible:ring-0 border-0 p-0">
          <TerminalLogsTable containerId={selectedContainerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
