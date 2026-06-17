"use client";

import { Bell, Check } from "lucide-react";

export function NotificationSettings() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Bell className="w-[18px] h-[18px]" />
        </div>
        <h2 className="text-[15px] font-bold text-foreground">Notifications</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 mb-4">
        
        {/* Checkbox item */}
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="w-[18px] h-[18px] border-2 border-border bg-card rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
              <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Deployment Success</div>
            <div className="text-[12px] font-medium text-muted-foreground">Receive notification when deployment succeeds.</div>
          </div>
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="w-[18px] h-[18px] border-2 border-border bg-card rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
              <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Container Down</div>
            <div className="text-[12px] font-medium text-muted-foreground">Receive notification when a container is down.</div>
          </div>
        </label>
        
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="w-[18px] h-[18px] border-2 border-border bg-card rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
              <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Deployment Failed</div>
            <div className="text-[12px] font-medium text-muted-foreground">Receive notification when deployment fails.</div>
          </div>
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="w-[18px] h-[18px] border-2 border-border bg-card rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
              <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Container Restart</div>
            <div className="text-[12px] font-medium text-muted-foreground">Receive notification when a container restarts.</div>
          </div>
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input type="checkbox" className="peer sr-only" />
            <div className="w-[18px] h-[18px] border-2 border-border bg-card rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
              <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Weekly Summary</div>
            <div className="text-[12px] font-medium text-muted-foreground">Receive a weekly summary of your projects.</div>
          </div>
        </label>

      </div>

      <div className="flex justify-end mt-4">
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-bold transition-all shadow-sm">
          Save Preferences
        </button>
      </div>

    </div>
  );
}
