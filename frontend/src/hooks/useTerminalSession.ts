import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";

export function useTerminalSession(selectedContainerId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({
    host: "",
    user: "",
    startedAt: "",
  });
  const [recentCommands, setRecentCommands] = useState<{cmd: string, time: string}[]>([]);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const isInitializing = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commandBufferRef = useRef("");

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
  }, []); // We do not want this to re-run on isConnected change

  // Handle Terminal Input -> Socket
  useEffect(() => {
    if (!xtermRef.current) return;

    const dataDisposable = xtermRef.current.onData((data: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("terminal_input", data);
        
        if (data.startsWith('\x1b')) return;
        
        if (data.includes('\r')) {
          const parts = data.split('\r');
          commandBufferRef.current += parts[0];
          
          const cmd = commandBufferRef.current.trim();
          if (cmd) {
            setRecentCommands(prev => {
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return [{ cmd, time: timeStr }, ...prev].slice(0, 10);
            });
          }
          commandBufferRef.current = "";
        } else if (data === '\u007F') {
          commandBufferRef.current = commandBufferRef.current.slice(0, -1);
        } else {
          const printable = data.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          commandBufferRef.current += printable;
        }
      }
    });

    // Cast the resize event listener properly for @xterm/xterm
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

    xtermRef.current?.clear();
    xtermRef.current?.write("\x1b[H\x1b[2J"); // Better clear
    xtermRef.current?.writeln(`\x1b[33mConnecting to server at ${socketUrl}...\x1b[0m`);

    const socket = io(`${socketUrl}/terminal`, {
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      xtermRef.current?.writeln(`\x1b[32mSocket connected. Requesting session...\x1b[0m`);
      socket.emit("connect_terminal", { containerId: selectedContainerId });
    });

    socket.on("connect_error", (err) => {
      xtermRef.current?.writeln(`\r\n\x1b[31mConnection Error: ${err.message}\x1b[0m`);
      toast.error(`Connection failed: ${err.message}`);
      setIsConnected(false);
    });

    socket.on("terminal_ready", (data) => {
      setIsConnected(true);
      setSessionInfo({
        host: data.host,
        user: "root",
        startedAt: new Date().toLocaleTimeString(),
      });
      xtermRef.current?.clear();
      xtermRef.current?.write("\x1b[H\x1b[2J"); // Clear again upon success
      
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

  const executeCommand = (cmd: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("terminal_input", cmd + '\r');
    } else {
      toast.error("Terminal not connected");
    }
  };

  const fitTerminal = () => {
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

  return {
    terminalRef,
    xtermRef,
    fitAddonRef,
    socketRef,
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
  };
}
