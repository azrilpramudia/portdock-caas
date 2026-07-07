import { ChevronDown, RefreshCw, LogOut, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
  backUrl?: string;
  isAdminMode?: boolean;
}

export function TerminalHeader({
  containers,
  selectedContainerId,
  setSelectedContainerId,
  isConnected,
  handleConnect,
  handleDisconnect,
  backUrl,
  isAdminMode,
}: TerminalHeaderProps) {
  const selectedContainer = containers.find((c) => c.id === selectedContainerId);
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm mb-6">
      <div className="w-full md:w-auto flex items-end gap-3">
        {backUrl && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push(backUrl)}
            className="mb-0.5 h-[42px] w-[42px] rounded-xl border-border bg-background hover:bg-muted text-muted-foreground shrink-0"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-semibold text-muted-foreground block">
              Container Selection
            </label>
            {isAdminMode && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
                Admin Mode
              </span>
            )}
          </div>
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
