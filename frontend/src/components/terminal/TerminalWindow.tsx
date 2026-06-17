import React, { useState } from "react";
import { Trash2, Download, Maximize } from "lucide-react";
import "xterm/css/xterm.css";

interface TerminalWindowProps {
  terminalRef: React.RefObject<HTMLDivElement>;
  onClear: () => void;
  onDownloadLog: () => void;
  onMaximizeToggle: () => void;
}

export function TerminalWindow({
  terminalRef,
  onClear,
  onDownloadLog,
  onMaximizeToggle,
}: TerminalWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximizeToggle();
  };

  return (
    <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col transition-all duration-200 ${isMaximized ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-[15px] font-bold text-foreground">Terminal Window</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClear} 
            className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:bg-muted border border-border rounded-lg text-[13px] font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button 
            onClick={onDownloadLog} 
            className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:bg-muted border border-border rounded-lg text-[13px] font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Log
          </button>
          <button 
            onClick={handleToggleMaximize} 
            className="p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors border border-border ml-1"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className={`bg-[#111827] rounded-xl p-3 overflow-hidden border border-slate-800 shadow-inner relative ${isMaximized ? 'flex-1 min-h-0' : 'h-[520px]'}`}>
        <div className="absolute inset-3">
          <div ref={terminalRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
