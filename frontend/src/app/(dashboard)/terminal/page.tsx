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
  const recentCommands = [
    { cmd: "docker ps", time: "12:30 PM" },
    { cmd: "npm install", time: "12:29 PM" },
    { cmd: "pm2 restart app", time: "12:27 PM" },
    { cmd: "cd /var/www/app", time: "12:25 PM" },
    { cmd: "ls -la", time: "12:25 PM" },
    { cmd: "cat .env", time: "12:24 PM" },
    { cmd: "pm2 status", time: "12:23 PM" },
    { cmd: "docker logs app", time: "12:22 PM" },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div>
          <label className="block text-[13px] font-bold text-slate-900 mb-2">Container Selection</label>
          <div className="relative w-[320px]">
            <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold pr-10 cursor-pointer">
              <option>my-portfolio</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] block"></span>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-[14px] font-bold transition-all shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Reconnect
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[14px] font-bold transition-all">
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </div>

      {/* 2. SESSION INFO */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm px-6 py-5">
        <h3 className="text-[14px] font-bold text-slate-900 mb-4">Session Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-slate-500 mb-2">Status</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[13px] font-bold text-slate-700">Connected</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-slate-500 mb-2">Host</span>
            <span className="text-[13px] font-bold text-slate-700">my-portfolio</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-slate-500 mb-2">User</span>
            <span className="text-[13px] font-bold text-slate-700">root</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-[13px] font-medium text-slate-500 mb-2">Started At</span>
            <span className="text-[13px] font-bold text-slate-700">May 18, 2025 12:30 PM</span>
          </div>
        </div>
      </div>

      {/* 3. TERMINAL AND COMMANDS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        
        {/* Terminal Window */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900">Terminal Window</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold transition-colors">
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold transition-colors">
                <Download className="w-4 h-4" />
                Download Log
              </button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 ml-1">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Terminal Box */}
          <div className="bg-[#111827] rounded-xl flex-1 p-5 overflow-x-auto border border-slate-800 shadow-inner">
            <div className="font-mono text-[13px] leading-relaxed">
              {/* Command 1 */}
              <div>
                <span className="text-emerald-400 font-semibold">root@container:~#</span> <span className="text-slate-200">docker ps</span>
              </div>
              <div className="text-slate-300 mt-1 mb-5 flex gap-8 whitespace-nowrap">
                <div>
                  <div className="text-slate-400 mb-0.5">CONTAINER ID</div>
                  <div>a12b34cd56</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-0.5">IMAGE</div>
                  <div>node:20</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-0.5">STATUS</div>
                  <div>Up 2 hours</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-0.5">PORTS</div>
                  <div>0.0.0.0:3000-&gt;3000/tcp</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-0.5">NAMES</div>
                  <div>my-portfolio</div>
                </div>
              </div>

              {/* Command 2 */}
              <div>
                <span className="text-emerald-400 font-semibold">root@container:~#</span> <span className="text-slate-200">npm install</span>
              </div>
              <div className="text-slate-300 mt-1 mb-5">
                <div className="mb-2">Installing packages...</div>
                <div>added 120 packages, and audited 120 packages in 3s</div>
                <div>found <span className="text-emerald-400">0</span> vulnerabilities</div>
              </div>

              {/* Command 3 */}
              <div>
                <span className="text-emerald-400 font-semibold">root@container:~#</span> <span className="text-slate-200">pm2 restart app</span>
              </div>
              <div className="text-slate-300 mt-1 mb-3">
                <div>[PM2] Applying <span className="text-sky-400">action restartProcessId</span> on app [app](ids: [ 0 ])</div>
                <div>[PM2] [app](0) <span className="text-emerald-400">✓</span></div>
              </div>

              {/* Cursor */}
              <div className="flex items-center">
                <span className="text-emerald-400 font-semibold mr-2">root@container:~#</span>
                <span className="w-2.5 h-[15px] bg-slate-300 animate-pulse inline-block"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Commands */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900">Recent Commands</h3>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-slate-100/80">
            {recentCommands.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400 bg-slate-50/80 px-1.5 py-1 rounded flex items-center justify-center">
                    <Code className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[13px] font-medium text-slate-700">{item.cmd}</span>
                </div>
                <span className="text-[12px] font-medium text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>
      
    </div>
  );
}
