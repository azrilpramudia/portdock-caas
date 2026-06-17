import { RefreshCw, Code, Play } from "lucide-react";

interface RecentCommand {
  cmd: string;
  time: string;
}

interface RecentCommandsSidebarProps {
  commands: RecentCommand[];
  onClear: () => void;
  onExecute: (cmd: string) => void;
}

export function RecentCommandsSidebar({ commands, onClear, onExecute }: RecentCommandsSidebarProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-foreground">Recent Commands</h3>
        <button 
          onClick={onClear}
          title="Clear Recent Commands"
          className="p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted border border-border rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="divide-y divide-border">
        {commands.length === 0 ? (
          <div className="py-8 text-center">
            <Code className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-medium">No recent commands</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Commands will appear here</p>
          </div>
        ) : (
          commands.map((cmd, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between group">
              <div className="overflow-hidden mr-3">
                <p className="text-[13px] font-mono text-foreground font-medium truncate">
                  {cmd.cmd}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{cmd.time}</p>
              </div>
              <button 
                onClick={() => onExecute(cmd.cmd)}
                className="opacity-0 group-hover:opacity-100 p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-md transition-all flex-shrink-0"
                title="Run again"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
