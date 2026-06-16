"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronDown, 
  RefreshCw, 
  LogOut, 
  Trash2, 
  Download, 
  Maximize, 
  Code
} from "lucide-react";
import { toast } from "sonner";
import { containersService } from "@/services/containers.service";
import { io, Socket } from "socket.io-client";

export default function TerminalPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
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
  
  const [recentCommands, setRecentCommands] = useState<{cmd: string, time: string}[]>([]);
  const commandBufferRef = useRef("");

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
        
        // Command buffering logic for "Recent Commands" UI
        if (data.startsWith('\x1b')) {
          // Ignore arrow keys and other ANSI escape sequences
          return;
        }
        
        if (data.includes('\r')) {
          const parts = data.split('\r');
          commandBufferRef.current += parts[0];
          
          const cmd = commandBufferRef.current.trim();
          if (cmd) {
            setRecentCommands(prev => {
              // Format time like "04:35 PM"
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const newCmds = [{ cmd, time: timeStr }, ...prev];
              return newCmds.slice(0, 10); // Keep last 10 commands
            });
          }
          
          // Reset buffer
          commandBufferRef.current = "";
        } else if (data === '\u007F') { // Backspace
          commandBufferRef.current = commandBufferRef.current.slice(0, -1);
        } else {
          // Only append printable characters
          const printable = data.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          commandBufferRef.current += printable;
        }
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
  };

  const handleDownloadLog = () => {
    if (!xtermRef.current) {
      toast.error("Terminal is not active");
      return;
    }

    try {
      const term = xtermRef.current;
      const buffer = term.buffer.active;
      const rows = buffer.length;
      let log = '';
      
      for (let i = 0; i < rows; i++) {
        const line = buffer.getLine(i);
        if (line) {
          log += line.translateToString(true) + '\n';
        }
      }

      const blob = new Blob([log], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `terminal-${selectedContainerId}-${new Date().toISOString().replace(/:/g, '-')}.log`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Log downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download log");
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
    // Wait for DOM layout to update, then fit
    setTimeout(() => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
        if (socketRef.current && isConnected) {
          socketRef.current.emit("terminal_resize", { 
            cols: xtermRef.current.cols, 
            rows: xtermRef.current.rows 
          });
        }
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div>
          <label className="block text-[13px] font-bold text-foreground mb-2">Container Selection</label>
          <div className="relative w-[320px]">
            <select 
              value={selectedContainerId}
              onChange={(e) => setSelectedContainerId(e.target.value)}
              disabled={isConnected}
              className="w-full appearance-none bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold pr-10 cursor-pointer disabled:opacity-50"
            >
              <option value="" disabled>Select Container</option>
              {containers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-600"} block`}></span>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/70">
              <ChevronDown className="w-4 h-4" />
            </div>
            {/* Indent text so dot shows */}
            <style jsx>{`
              select {
                padding-left: 2.5rem;
              }
            `}</style>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button 
              onClick={handleConnect}
              disabled={!selectedContainerId}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-sm ${
                selectedContainerId 
                ? "bg-card border border-border hover:bg-muted text-foreground" 
                : "bg-muted text-muted-foreground cursor-not-allowed border-transparent"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Connect
            </button>
          ) : (
            <>
              <button 
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border hover:bg-muted text-foreground rounded-xl text-[14px] font-bold transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reconnect
              </button>
              <button 
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[14px] font-bold transition-all border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. SESSION INFO */}
      <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
        <h3 className="text-[14px] font-bold text-foreground mb-4">Session Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-muted-foreground mb-2">Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-600"}`}></span>
              <span className="text-[13px] font-bold text-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-muted-foreground mb-2">Host</span>
            <span className="text-[13px] font-bold text-foreground">{sessionInfo.host || "-"}</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-muted-foreground mb-2">User</span>
            <span className="text-[13px] font-bold text-foreground">{sessionInfo.user || "-"}</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-muted-foreground mb-2">Started At</span>
            <span className="text-[13px] font-bold text-foreground">{sessionInfo.startedAt || "-"}</span>
          </div>
        </div>
      </div>

      {/* 3. TERMINAL AND COMMANDS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        
        {/* Terminal Window */}
        <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col transition-all duration-200 ${isMaximized ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-[15px] font-bold text-foreground">Terminal Window</h3>
            <div className="flex items-center gap-2">
              <button onClick={handleClear} className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:bg-muted border border-border rounded-lg text-[13px] font-semibold transition-colors">
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <button onClick={handleDownloadLog} className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:bg-muted border border-border rounded-lg text-[13px] font-semibold transition-colors">
                <Download className="w-4 h-4" />
                Download Log
              </button>
              <button onClick={toggleMaximize} className="p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors border border-border ml-1">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Terminal Box */}
          <div className={`bg-[#111827] rounded-xl p-3 overflow-hidden border border-slate-800 shadow-inner relative ${isMaximized ? 'flex-1 min-h-0' : 'h-[520px]'}`}>
            <div className="absolute inset-3">
              <div ref={terminalRef} className="w-full h-full" />
            </div>
            
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

        {/* Recent Commands */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-foreground">Recent Commands</h3>
            <button 
              onClick={() => setRecentCommands([])}
              title="Clear Recent Commands"
              className="p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted border border-border rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-border">
            {recentCommands.length === 0 ? (
              <div className="py-8 text-center">
                <Code className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[13px] font-medium text-muted-foreground">No recent commands</p>
              </div>
            ) : (
              recentCommands.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground/70 bg-muted/80 px-1.5 py-1 rounded flex items-center justify-center">
                      <Code className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[13px] font-medium text-foreground">{item.cmd}</span>
                  </div>
                  <span className="text-[12px] font-medium text-muted-foreground">{item.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
      
    </div>
  );
}
