"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal, X, Minimize2, Maximize2, RefreshCw, Trash2 } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface ContainerDetailsProps {
  containerId: string;
  containerName: string;
  onClose: () => void;
}

export function ContainerDetails({ containerId, containerName, onClose }: ContainerDetailsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    setIsConnecting(true);
    setLogs([]);

    // Initialize socket connection
    // We assume backend runs on localhost:3000
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
      : "http://localhost:3000";
    const socket = io(apiUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnecting(false);
      setLogs((prev) => [...prev, `[System] Connected to server. Subscribing to logs for ${containerName}...`]);
      socket.emit("subscribeLogs", { containerId });
    });

    socket.on(`logs-${containerId}`, (data: string) => {
      // Split by new lines to keep formatting
      const lines = data.split('\n').filter(line => line.trim() !== '');
      setLogs((prev) => {
        // Keep only last 1000 lines to avoid memory leak
        const next = [...prev, ...lines];
        if (next.length > 1000) return next.slice(next.length - 1000);
        return next;
      });
    });

    socket.on("error", (error: string) => {
      setLogs((prev) => [...prev, `[Error] ${error}`]);
      setIsConnecting(false);
    });

    socket.on("disconnect", () => {
      setLogs((prev) => [...prev, `[System] Disconnected from server.`]);
      setIsConnecting(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [containerId, containerName]);

  const handleRefreshConnection = () => {
    setLogs([]);
    setIsConnecting(true);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className={`bg-[#0A0A0A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden mt-8 transition-all duration-300 ease-in-out ${isMaximized ? 'fixed inset-4 z-50 mt-0 flex flex-col' : 'relative h-[500px] flex flex-col'}`}>
      
      {/* Header */}
      <div className="h-12 bg-[#141414] border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <h3 className="text-[13px] font-bold text-slate-200 font-mono tracking-tight">{containerName} <span className="text-slate-500 font-normal">logs</span></h3>
          
          {isConnecting && (
            <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
              <RefreshCw className="w-3 h-3 animate-spin" /> Connecting
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleClearLogs}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleRefreshConnection}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
            title="Reconnect & Fetch Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed text-slate-300 selection:bg-emerald-500/30">
        {logs.length === 0 && !isConnecting ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600">
            <Terminal className="w-8 h-8 mb-2 opacity-50" />
            <p>Waiting for logs...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => {
              // Simple heuristic to colorize error lines
              const isError = log.toLowerCase().includes('error') || log.toLowerCase().includes('fail');
              const isWarn = log.toLowerCase().includes('warn');
              const isSystem = log.startsWith('[System]');
              
              let colorClass = "text-slate-300";
              if (isError) colorClass = "text-rose-400";
              else if (isWarn) colorClass = "text-amber-400";
              else if (isSystem) colorClass = "text-blue-400 font-bold";

              return (
                <div key={index} className={`break-all ${colorClass} hover:bg-white/5 px-1 -mx-1 rounded`}>
                  {log}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
