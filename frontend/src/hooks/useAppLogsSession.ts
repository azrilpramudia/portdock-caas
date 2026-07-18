import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/constants/config";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";

export function useAppLogsSession(selectedContainerId: string, isDatabase: boolean = false) {
  const [isAppLogsConnected, setIsAppLogsConnected] = useState(false);
  
  const appLogsTerminalRef = useRef<HTMLDivElement>(null);
  const appLogsXtermRef = useRef<Terminal | null>(null);
  const appLogsFitAddonRef = useRef<FitAddon | null>(null);
  const appLogsSocketRef = useRef<Socket | null>(null);
  
  const isInitializing = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Terminal on client-side
  const initTerminal = async () => {
    if (typeof window === "undefined") return;
    if (appLogsTerminalRef.current && !appLogsXtermRef.current && !isInitializing.current) {
      isInitializing.current = true;
      try {
        const xtermModule = await import("xterm");
        const fitAddonModule = await import("xterm-addon-fit");

        if (appLogsXtermRef.current) return;

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

        if (appLogsTerminalRef.current) {
          appLogsTerminalRef.current.innerHTML = '';
          term.open(appLogsTerminalRef.current);
        }

        initTimeoutRef.current = setTimeout(() => {
          if (!appLogsTerminalRef.current) return;
          try {
            fitAddon.fit();
            term.writeln("\x1b[36m--- Application Logs Viewer ---\x1b[0m");
            term.writeln("\x1b[90mClick 'Connect' to start streaming logs.\x1b[0m\r\n");
          } catch (e) {
            console.error("Fit addon error during init:", e);
          }
        }, 50);

        appLogsXtermRef.current = term;
        appLogsFitAddonRef.current = fitAddon;

        const handleResize = () => {
          if (appLogsFitAddonRef.current && appLogsTerminalRef.current) {
            try {
              appLogsFitAddonRef.current.fit();
            } catch (e) {
              console.error("Resize error:", e);
            }
          }
        };
        window.addEventListener("resize", handleResize);
        (appLogsXtermRef as any).handleResize = handleResize;
      } finally {
        isInitializing.current = false;
      }
    }
  };

  // Try to initialize on mount
  useEffect(() => {
    initTerminal();

    return () => {
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      
      if (appLogsXtermRef.current) {
        if ((appLogsXtermRef as any).handleResize) {
          window.removeEventListener("resize", (appLogsXtermRef as any).handleResize);
        }
        appLogsXtermRef.current.dispose();
        appLogsXtermRef.current = null;
      }
    };
  }, []);

  const handleConnectAppLogs = async () => {
    if (!selectedContainerId) {
      toast.error("Please select a container first");
      return;
    }

    // Ensure terminal is initialized (may not be if the ref wasn't ready on mount)
    await initTerminal();

    if (appLogsSocketRef.current) {
      appLogsSocketRef.current.disconnect();
    }

    const apiUrl = API_BASE_URL;
    const socketUrl = apiUrl.replace("/api", "");

    appLogsXtermRef.current?.clear();
    appLogsXtermRef.current?.write("\x1b[H\x1b[2J"); 
    appLogsXtermRef.current?.writeln(`\x1b[33mConnecting to Application Logs at ${socketUrl}...\x1b[0m`);

    const socket = io(`${socketUrl}/terminal`, {
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });
    appLogsSocketRef.current = socket;

    socket.on("connect", () => {
      appLogsXtermRef.current?.writeln(`\x1b[32mSocket connected. Requesting logs...\x1b[0m\r\n`);
      socket.emit("connect_app_logs", { containerId: selectedContainerId, isDatabase });
    });

    socket.on("connect_error", (err) => {
      appLogsXtermRef.current?.writeln(`\r\n\x1b[31mConnection Error: ${err.message}\x1b[0m`);
      toast.error(`Connection failed: ${err.message}`);
      setIsAppLogsConnected(false);
    });

    socket.on("app_logs_ready", () => {
      setIsAppLogsConnected(true);
      toast.success("Streaming Application Logs...");
    });

    socket.on("app_logs_output", (data: string) => {
      // Because docker logs string might have bare newlines, we convert them to \r\n for xterm if necessary
      // Actually xterm usually prefers \r\n.
      const formattedData = data.replace(/\r?\n/g, "\r\n");
      appLogsXtermRef.current?.write(formattedData);
    });

    socket.on("app_logs_error", (errMessage: string) => {
      appLogsXtermRef.current?.writeln(`\r\n\x1b[31mError: ${errMessage}\x1b[0m`);
      setIsAppLogsConnected(false);
    });

    socket.on("disconnect", () => {
      setIsAppLogsConnected(false);
      appLogsXtermRef.current?.writeln("\r\n\x1b[31mDisconnected from log stream.\x1b[0m");
    });
  };

  const handleDisconnectAppLogs = () => {
    if (appLogsSocketRef.current) {
      appLogsSocketRef.current.disconnect();
      appLogsSocketRef.current = null;
    }
    setIsAppLogsConnected(false);
    appLogsXtermRef.current?.writeln("\r\n\x1b[33mLog stream terminated by user.\x1b[0m");
  };

  const handleClearAppLogs = () => {
    appLogsXtermRef.current?.clear();
  };

  const handleDownloadAppLogs = () => {
    if (!appLogsXtermRef.current) {
      toast.error("Terminal is not active");
      return;
    }

    try {
      const term = appLogsXtermRef.current;
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
      a.download = `app-logs-${selectedContainerId}-${new Date().toISOString().replace(/:/g, '-')}.log`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Application logs downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download logs");
    }
  };

  const fitAppLogsTerminal = () => {
    initTerminal().then(() => {
      setTimeout(() => {
        if (appLogsFitAddonRef.current && appLogsXtermRef.current) {
          appLogsFitAddonRef.current.fit();
        }
      }, 100);
    });
  };

  return {
    appLogsTerminalRef,
    isAppLogsConnected,
    handleConnectAppLogs,
    handleDisconnectAppLogs,
    handleClearAppLogs,
    handleDownloadAppLogs,
    fitAppLogsTerminal
  };
}
