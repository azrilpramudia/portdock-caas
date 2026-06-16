"use client";

import { 
  ChevronDown, 
  RefreshCw, 
  LogOut, 
  Trash2, 
  Download, 
  Maximize, 
  Code
} from "lucide-react";

export default function TerminalPage() {
  const recentCommands: any[] = [];

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div>
          <label className="block text-[13px] font-bold text-foreground mb-2">Container Selection</label>
          <div className="relative w-[320px]">
            <select className="w-full appearance-none bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold pr-10 cursor-pointer">
              <option value="">Select Container</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] block"></span>
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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border hover:bg-muted text-muted-foreground rounded-xl text-[14px] font-bold transition-all shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Reconnect
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[14px] font-bold transition-all border border-red-500/20">
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </div>

      {/* 2. SESSION INFO */}
      <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
        <h3 className="text-[14px] font-bold text-foreground mb-4">Session Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-muted-foreground mb-2">Status</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[13px] font-bold text-foreground">Connected</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-muted-foreground mb-2">Host</span>
            <span className="text-[13px] font-bold text-foreground">-</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-muted-foreground mb-2">User</span>
            <span className="text-[13px] font-bold text-foreground">-</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-muted-foreground mb-2">Started At</span>
            <span className="text-[13px] font-bold text-foreground">-</span>
          </div>
        </div>
      </div>

      {/* 3. TERMINAL AND COMMANDS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        
        {/* Terminal Window */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-foreground">Terminal Window</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:bg-muted border border-border rounded-lg text-[13px] font-semibold transition-colors">
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:bg-muted border border-border rounded-lg text-[13px] font-semibold transition-colors">
                <Download className="w-4 h-4" />
                Download Log
              </button>
              <button className="p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors border border-border ml-1">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Terminal Box */}
          <div className="bg-[#111827] rounded-xl flex-1 p-5 overflow-x-auto border border-slate-800 shadow-inner">
            <div className="font-mono text-[13px] leading-relaxed">
              {/* Cursor */}
              <div className="flex items-center">
                <span className="text-emerald-400 font-semibold mr-2">root@container:~#</span>
                <span className="w-2.5 h-[15px] bg-slate-300 animate-pulse inline-block"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Commands */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-foreground">Recent Commands</h3>
            <button className="p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted border border-border rounded-lg transition-colors">
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
