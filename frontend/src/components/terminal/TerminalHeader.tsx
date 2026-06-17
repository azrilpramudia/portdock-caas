import { ChevronDown, RefreshCw, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Container {
  id: string;
  name: string;
  status: string;
}

interface TerminalHeaderProps {
  containers: Container[];
  selectedContainerId: string;
  setSelectedContainerId: (id: string) => void;
  isConnected: boolean;
  handleConnect: () => void;
  handleDisconnect: () => void;
}

export function TerminalHeader({
  containers,
  selectedContainerId,
  setSelectedContainerId,
  isConnected,
  handleConnect,
  handleDisconnect,
}: TerminalHeaderProps) {
  const selectedContainer = containers.find((c) => c.id === selectedContainerId);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm mb-6">
      <div className="w-full md:w-auto">
        <label className="text-sm font-semibold text-muted-foreground mb-2 block">
          Container Selection
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full md:w-[320px] flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-xl text-[14px] font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${selectedContainerId ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-slate-600"}`} />
              <span className="truncate">
                {selectedContainer ? selectedContainer.name : "Select a container..."}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[320px] bg-card border-border shadow-xl rounded-xl max-h-[200px] overflow-y-auto custom-scrollbar">
            {containers.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => setSelectedContainerId(c.id)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="font-medium text-[14px] truncate">{c.name}</span>
              </DropdownMenuItem>
            ))}
            {containers.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                No running containers found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {!isConnected ? (
          <button 
            onClick={handleConnect}
            className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-[14px] font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
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
  );
}
