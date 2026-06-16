"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal as TerminalIcon, 
  Play, 
  Square, 
  RotateCcw, 
  Download, 
  Trash2,
  Maximize2,
  ChevronDown,
  Code,
  Activity,
  Cpu,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { containersService } from "@/services/containers.service";
import { io, Socket } from "socket.io-client";

export default function TerminalPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({
    host: "",
    user: "",
    startedAt: "",
  });

  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const isInitializing = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load containers
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const data = await containersService.getContainers();
        // Only allow running containers
        setContainers(data.filter((c: any) => c.status === "RUNNING"));
      } catch (err) {
        toast.error("Failed to fetch containers");
      }
    };
    fetchContainers();
  }, []);

  // Initialize Terminal on client-side
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initTerminal = async () => {
      if (terminalRef.current && !xtermRef.current && !isInitializing.current) {
        isInitializing.current = true;
        try {
          const xtermModule = await import("xterm");
          await import("xterm/css/xterm.css");
          const fitAddonModule = await import("xterm-addon-fit");

          if (xtermRef.current) return;

          const term = new xtermModule.Terminal({
            cursorBlink: true,
            fontFamily: '"Fira Code", "JetBrains Mono", "Courier New", Courier, monospace',
            fontSize: 14,
            theme: {
              background: "#111827",
              foreground: "#e2e8f0",
              cursor: "#10b981",
            },
          });

          const fitAddon = new fitAddonModule.FitAddon();
          term.loadAddon(fitAddon);

          if (terminalRef.current) {
            terminalRef.current.innerHTML = '';
            term.open(terminalRef.current);
          }

          initTimeoutRef.current = setTimeout(() => {
            if (!terminalRef.current) return;
            try {
              fitAddon.fit();
              term.writeln("\x1b[32mWelcome to Portdock Web Terminal\x1b[0m");
              term.writeln("Select a running container from the dropdown to connect.\r\n");
            } catch (e) {
              console.error("Fit addon error during init:", e);
            }
          }, 50);

          xtermRef.current = term;
          fitAddonRef.current = fitAddon;

          // Handle window resize
          const handleResize = () => {
            if (fitAddonRef.current && terminalRef.current) {
              try {
                fitAddonRef.current.fit();
                if (socketRef.current && isConnected && xtermRef.current) {
                  socketRef.current.emit("terminal_resize", { 
                    cols: xtermRef.current.cols, 
                    rows: xtermRef.current.rows 
                  });
                }
              } catch (e) {
                console.error("Resize error:", e);
              }
            }
          };
          window.addEventListener("resize", handleResize);
          
          // Store handleResize on the ref so we can clean it up
          (xtermRef as any).handleResize = handleResize;
        } finally {
          isInitializing.current = false;
        }
      }
    };

    initTerminal();

    return () => {
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      
      if (xtermRef.current) {
        if ((xtermRef as any).handleResize) {
          window.removeEventListener("resize", (xtermRef as any).handleResize);
        }
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, []);

  // Handle Terminal Input -> Socket
  useEffect(() => {
    if (!xtermRef.current) return;

    const dataDisposable = xtermRef.current.onData((data: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("terminal_input", data);
      }
    });

    const resizeDisposable = xtermRef.current.onResize(({ cols, rows }: { cols: number, rows: number }) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("terminal_resize", { cols, rows });
      }
    });

    return () => {
      if (dataDisposable) dataDisposable.dispose();
      if (resizeDisposable) resizeDisposable.dispose();
    };
  }, [isConnected]);

  // Connect to Container
  const handleConnect = () => {
    if (!selectedContainerId) {
      toast.error("Please select a container first");
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const socketUrl = apiUrl.replace("/api", "");

    console.log("Connecting to terminal at:", socketUrl, "Container:", selectedContainerId);
    toast.info("Attempting to connect...");

    xtermRef.current?.clear();
    xtermRef.current?.reset();
    xtermRef.current?.writeln(`\x1b[33mConnecting to server at ${socketUrl}...\x1b[0m`);

    const socket = io(`${socketUrl}/terminal`, {
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected! Emitting connect_terminal event");
      xtermRef.current?.writeln(`\x1b[32mSocket connected. Requesting session...\x1b[0m`);
      socket.emit("connect_terminal", { containerId: selectedContainerId });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      xtermRef.current?.writeln(`\r\n\x1b[31mConnection Error: ${err.message}\x1b[0m`);
      toast.error(`Connection failed: ${err.message}`);
      setIsConnected(false);
    });

    socket.on("terminal_ready", (data) => {
      setIsConnected(true);
      setSessionInfo({
        host: data.host,
        user: "root", // typically docker exec defaults to root
        startedAt: new Date().toLocaleTimeString(),
      });
      xtermRef.current?.clear();
      xtermRef.current?.reset();
      
      // Force fit and send initial dimensions with a slight delay to ensure layout is settled
      connectTimeoutRef.current = setTimeout(() => {
        if (fitAddonRef.current && xtermRef.current && terminalRef.current) {
          try {
            fitAddonRef.current.fit();
            if (socketRef.current) {
              socketRef.current.emit("terminal_resize", { 
                cols: xtermRef.current.cols, 
                rows: xtermRef.current.rows 
              });
            }
          } catch (e) {
            console.error("Fit addon error during connect:", e);
          }
        }
      }, 50);
      
      xtermRef.current?.focus();
      toast.success("Connected to terminal");
    });

    socket.on("terminal_output", (data: string) => {
      xtermRef.current?.write(data);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      xtermRef.current?.writeln("\r\n\x1b[31mDisconnected from server.\x1b[0m");
    });
  };

  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    xtermRef.current?.writeln("\r\n\x1b[33mSession terminated by user.\x1b[0m");
  };

  const handleClear = () => {
    xtermRef.current?.clear();
    xtermRef.current?.reset();
  };

  const handleDownloadLog = () => {
    // Currently xterm doesn't provide a straightforward way to get all buffer content easily in v5 without addons, 
    // but for simple cases we can grab the DOM or use a serialize addon.
    toast.info("Log download feature coming soon");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <TerminalIcon className="w-7 h-7 text-blue-500" />
            </div>
            Terminal
          </h1>
          <p className="text-muted-foreground mt-2 text-[15px]">
            Access and manage your containers via web terminal.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <button 
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[14px] font-bold transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              Disconnect
            </button>
          ) : (
            <button 
              onClick={handleConnect}
              disabled={!selectedContainerId}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                selectedContainerId 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Connect
            </button>
          )}
        </div>
      </div>

      {/* 2. CONTAINER SELECTION */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-[14px] font-bold text-muted-foreground mb-4 uppercase tracking-wider">Connection Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground">Target Container</label>
            <div className="relative">
              <select 
                value={selectedContainerId}
                onChange={(e) => setSelectedContainerId(e.target.value)}
                disabled={isConnected}
                className="w-full appearance-none bg-background border border-border text-foreground text-[14px] rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold pr-10 cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>Select a running container...</option>
                {containers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/70">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 flex flex-col justify-end">
            <div className="bg-background border border-border rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`}></div>
                <span className="text-[14px] font-bold text-foreground">
                  {isConnected ? "Session Active" : "Disconnected"}
                </span>
              </div>
              {isConnected && (
                <span className="text-[12px] font-semibold text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">
                  {sessionInfo.startedAt}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TERMINAL AND INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        
        {/* Terminal Window */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-[650px]">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-[15px] font-bold text-foreground flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-blue-500" />
              Terminal Window
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg text-[13px] font-semibold transition-colors border border-transparent hover:border-border"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
              <button 
                onClick={handleDownloadLog}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg text-[13px] font-semibold transition-colors border border-transparent hover:border-border"
              >
                <Download className="w-3.5 h-3.5" />
                Log
              </button>
            </div>
          </div>
          
          {/* Terminal Box */}
          <div className="bg-[#111827] rounded-xl h-[520px] p-3 border border-slate-800 shadow-inner relative overflow-hidden">
            {/* The ref container for xterm */}
            <div className="absolute inset-3">
              <div ref={terminalRef} className="w-full h-full" />
            </div>
            
            {/* Overlay if not connected */}
            {!isConnected && (
              <div className="absolute inset-0 bg-[#111827]/80 flex flex-col items-center justify-center backdrop-blur-[2px] z-10 pointer-events-none">
                <Code className="w-8 h-8 text-muted-foreground/50 mb-3" />
                <p className="text-[13px] font-medium text-muted-foreground">Select a container and connect to start session</p>
              </div>
            )}
            
            <style jsx global>{`
              .xterm-viewport::-webkit-scrollbar {
                width: 10px;
              }
              .xterm-viewport::-webkit-scrollbar-track {
                background: rgba(17, 24, 39, 0.5);
                border-radius: 4px;
              }
              .xterm-viewport::-webkit-scrollbar-thumb {
                background: #475569;
                border-radius: 4px;
                border: 2px solid #111827;
              }
              .xterm-viewport::-webkit-scrollbar-thumb:hover {
                background: #64748b;
              }
            `}</style>
          </div>
        </div>

        {/* Session Information */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-[650px]">
          <h3 className="text-[15px] font-bold text-foreground mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Session Info
          </h3>

          <div className="flex-1">
            {isConnected ? (
              <div className="space-y-6">
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1">
                  <p className="text-[12px] font-bold text-blue-500 uppercase tracking-wider">Host</p>
                  <p className="text-[14px] font-mono text-foreground font-semibold break-all">
                    {sessionInfo.host || selectedContainerId.substring(0, 12)}
                  </p>
                </div>
                
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                  <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-wider">User</p>
                  <p className="text-[14px] font-mono text-foreground font-semibold">
                    {sessionInfo.user}
                  </p>
                </div>

                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-1">
                  <p className="text-[12px] font-bold text-purple-500 uppercase tracking-wider">Started At</p>
                  <p className="text-[14px] font-mono text-foreground font-semibold">
                    {sessionInfo.startedAt}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Cpu className="w-4 h-4" />
                    <span className="text-[13px] font-bold">Terminal Features</span>
                  </div>
                  <ul className="text-[13px] font-medium text-muted-foreground/80 space-y-2 ml-6 list-disc">
                    <li>Full TTY Support</li>
                    <li>Automatic Resizing</li>
                    <li>256 Color Support</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <Square className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-[14px] font-medium text-muted-foreground max-w-[200px]">
                  Connect to a container to view session details
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
