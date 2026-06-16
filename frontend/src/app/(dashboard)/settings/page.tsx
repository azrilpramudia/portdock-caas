"use client";

import { 
  User, 
  Lock, 
  GitBranch, 
  KeyRound, 
  Bell, 
  Eye, 
  CheckCircle2, 
  Copy,
  Check
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="w-full pb-8">
      
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Profile Information */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-[15px] font-bold text-foreground">Profile Information</h2>
          </div>
          
          <div className="space-y-5 flex-1">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-foreground">Full Name</label>
              <input 
                type="text" 
                defaultValue="" 
                className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-foreground">Email</label>
              <input 
                type="email" 
                defaultValue="" 
                className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="mt-8">
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-bold transition-all shadow-sm">
              Save Changes
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-[15px] font-bold text-foreground">Security</h2>
          </div>
          
          <div className="space-y-5 flex-1">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-foreground">Current Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="" 
                  className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
                />
                <Eye className="w-[18px] h-[18px] text-muted-foreground/70 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-foreground transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-foreground">New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="" 
                  className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
                />
                <Eye className="w-[18px] h-[18px] text-muted-foreground/70 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-foreground transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-foreground">Confirm Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="" 
                  className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
                />
                <Eye className="w-[18px] h-[18px] text-muted-foreground/70 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-foreground transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-bold transition-all shadow-sm">
              Update Password
            </button>
          </div>
        </div>

        {/* GitHub Integration */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GitBranch className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-[15px] font-bold text-foreground">GitHub Integration</h2>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-[160px_1fr] gap-y-4 text-[13px] mb-6">
              <div className="font-bold text-muted-foreground flex items-center">Status</div>
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-bold text-[12px]">
                  Not Connected
                </span>
              </div>
              
              <div className="font-bold text-muted-foreground flex items-center">Account</div>
              <div className="font-semibold text-foreground flex items-center">-</div>
              
              <div className="font-bold text-muted-foreground flex items-center">Repository Access</div>
              <div className="font-semibold text-foreground flex items-center">Not Configured</div>
            </div>
          </div>
          
          <div className="mt-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl text-[13px] font-bold transition-colors">
              <GitBranch className="w-[14px] h-[14px]" />
              Connect GitHub
            </button>
          </div>
        </div>

        {/* SSH Keys */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <KeyRound className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-[15px] font-bold text-foreground">SSH Keys</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            <label className="text-[13px] font-bold text-foreground">SSH Public Key</label>
            <textarea 
              readOnly 
              className="w-full h-[100px] bg-card border border-border text-muted-foreground text-[13px] rounded-xl p-4 outline-none resize-none font-medium leading-relaxed"
              defaultValue={""}
            />
            <div className="flex items-start gap-2 mt-1">
              <CheckCircle2 className="w-[15px] h-[15px] text-emerald-500 mt-[1px] flex-shrink-0" />
              <p className="text-[12px] font-medium text-muted-foreground leading-snug">
                Your SSH key is used to access and manage your servers securely.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-8">
            <button className="px-4 py-2.5 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl text-[13px] font-bold transition-all bg-card shadow-sm">
              Generate Key
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl text-[13px] font-bold transition-all bg-card shadow-sm">
              <Copy className="w-[14px] h-[14px]" />
              Copy Key
            </button>
          </div>
        </div>

      </div>

      {/* Full Width Bottom Section */}
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

    </div>
  );
}
