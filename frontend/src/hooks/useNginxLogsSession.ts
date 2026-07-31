import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/constants/config";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";

export function useNginxLogsSession() {
  const [isConnected, setIsConnected] = useState(false);
  const [logType, setLogType] = useState<"error" | "access">("error");
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const isInitializing = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initTerminal = async () => {
    if (typeof window === "undefined") return;
    if (terminalRef.current && !xtermRef.current && !isInitializing.current) {
      isInitializing.current = true;
      try {
        const xtermModule = await import("xterm");
        const fitAddonModule = await import("xterm-addon-fit");

        if (xtermRef.current) return;

        const term = new xtermModule.Terminal({
          cursorBlink: false,
          disableStdin: true,
          fontFamily: '"Fira Code", "JetBrains Mono", "Courier New", Courier, monospace',
          fontSize: 13,
          theme: {
            background: "#111827",
            foreground: "#e2e8f0",
            cursor: "transparent",
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
            term.writeln("\x1b[36m--- Nginx Log Viewer ---\x1b[0m");
            term.writeln("\x1b[90mClick 'Connect' to start streaming nginx logs.\x1b[0m\r\n");
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

  useEffect(() => {
    initTerminal();
    return () => {
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      if (xtermRef.current) {
        if ((xtermRef as any).handleResize) {
          window.removeEventListener("resize", (xtermRef as any).handleResize);
        }
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, []);

  const handleConnect = async (type?: "error" | "access") => {
    const selectedType = type || logType;
    
    await initTerminal();

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const apiUrl = API_BASE_URL;
    const socketUrl = apiUrl.replace(/\/api\/?$/, "");

    xtermRef.current?.clear();
    xtermRef.current?.write("\x1b[H\x1b[2J");
    xtermRef.current?.writeln(`\x1b[33mConnecting to Nginx ${selectedType} logs at ${socketUrl}...\x1b[0m`);

    const socket = io(`${socketUrl}/terminal`, {
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      xtermRef.current?.writeln(`\x1b[32mSocket connected. Requesting ${selectedType} logs...\x1b[0m\r\n`);
      socket.emit("connect_nginx_logs", { logType: selectedType });
    });

    socket.on("connect_error", (err) => {
      xtermRef.current?.writeln(`\r\n\x1b[31mConnection Error: ${err.message}\x1b[0m`);
      toast.error(`Connection failed: ${err.message}`);
      setIsConnected(false);
    });

    socket.on("nginx_logs_ready", (data: { logType: string; logFile: string }) => {
      setIsConnected(true);
      setLogType(data.logType as "error" | "access");
      toast.success(`Streaming Nginx ${data.logType} logs...`);
    });

    socket.on("nginx_logs_output", (data: string) => {
      const formattedData = data.replace(/\r?\n/g, "\r\n");
      xtermRef.current?.write(formattedData);
    });

    socket.on("nginx_logs_error", (errMessage: string) => {
      xtermRef.current?.writeln(`\r\n\x1b[31mError: ${errMessage}\x1b[0m`);
      setIsConnected(false);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      xtermRef.current?.writeln("\r\n\x1b[31mDisconnected from log stream.\x1b[0m");
    });
  };

  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    xtermRef.current?.writeln("\r\n\x1b[33mLog stream terminated by user.\x1b[0m");
  };

  const handleClear = () => {
    xtermRef.current?.clear();
  };

  const handleDownload = () => {
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
      a.download = `nginx-${logType}-${new Date().toISOString().replace(/:/g, '-')}.log`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Nginx logs downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download logs");
    }
  };

  const fitTerminal = () => {
    initTerminal().then(() => {
      setTimeout(() => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit();
        }
      }, 100);
    });
  };

  return {
    terminalRef,
    isConnected,
    logType,
    setLogType,
    handleConnect,
    handleDisconnect,
    handleClear,
    handleDownload,
    fitTerminal,
  };
}
