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
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900">Profile Information</h2>
          </div>
          
          <div className="space-y-5 flex-1">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700">Full Name</label>
              <input 
                type="text" 
                defaultValue="John Doe" 
                className="w-full bg-white border border-slate-200 text-slate-700 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700">Email</label>
              <input 
                type="email" 
                defaultValue="john@example.com" 
                className="w-full bg-white border border-slate-200 text-slate-700 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
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
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900">Security</h2>
          </div>
          
          <div className="space-y-5 flex-1">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700">Current Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="password123" 
                  className="w-full bg-white border border-slate-200 text-slate-400 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
                />
                <Eye className="w-[18px] h-[18px] text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700">New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="password123" 
                  className="w-full bg-white border border-slate-200 text-slate-400 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
                />
                <Eye className="w-[18px] h-[18px] text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700">Confirm Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="password123" 
                  className="w-full bg-white border border-slate-200 text-slate-400 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
                />
                <Eye className="w-[18px] h-[18px] text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600 transition-colors" />
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
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitBranch className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900">GitHub Integration</h2>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-[160px_1fr] gap-y-4 text-[13px] mb-6">
              <div className="font-bold text-slate-500 flex items-center">Status</div>
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[12px]">
                  Connected
                </span>
              </div>
              
              <div className="font-bold text-slate-500 flex items-center">Account</div>
              <div className="font-semibold text-slate-700 flex items-center">johndoe</div>
              
              <div className="font-bold text-slate-500 flex items-center">Repository Access</div>
              <div className="font-semibold text-slate-700 flex items-center">Enabled</div>
            </div>
          </div>
          
          <div className="mt-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-500 rounded-xl text-[13px] font-bold transition-colors">
              <GitBranch className="w-[14px] h-[14px]" />
              Disconnect GitHub
            </button>
          </div>
        </div>

        {/* SSH Keys */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900">SSH Keys</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            <label className="text-[13px] font-bold text-slate-700">SSH Public Key</label>
            <textarea 
              readOnly 
              className="w-full h-[100px] bg-white border border-slate-200 text-slate-500 text-[13px] rounded-xl p-4 outline-none resize-none font-medium leading-relaxed"
              defaultValue={"ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7ExampleKey...\nuser@portdock"}
            />
            <div className="flex items-start gap-2 mt-1">
              <CheckCircle2 className="w-[15px] h-[15px] text-emerald-500 mt-[1px] flex-shrink-0" />
              <p className="text-[12px] font-medium text-slate-500 leading-snug">
                Your SSH key is used to access and manage your servers securely.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-8">
            <button className="px-4 py-2.5 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl text-[13px] font-bold transition-all bg-white shadow-sm">
              Generate Key
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl text-[13px] font-bold transition-all bg-white shadow-sm">
              <Copy className="w-[14px] h-[14px]" />
              Copy Key
            </button>
          </div>
        </div>

      </div>

      {/* Full Width Bottom Section */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bell className="w-[18px] h-[18px]" />
          </div>
          <h2 className="text-[15px] font-bold text-slate-900">Notifications</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 mb-4">
          
          {/* Checkbox item */}
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="w-[18px] h-[18px] border-2 border-slate-200 bg-white rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-800 leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Deployment Success</div>
              <div className="text-[12px] font-medium text-slate-500">Receive notification when deployment succeeds.</div>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="w-[18px] h-[18px] border-2 border-slate-200 bg-white rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-800 leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Container Down</div>
              <div className="text-[12px] font-medium text-slate-500">Receive notification when a container is down.</div>
            </div>
          </label>
          
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="w-[18px] h-[18px] border-2 border-slate-200 bg-white rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-800 leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Deployment Failed</div>
              <div className="text-[12px] font-medium text-slate-500">Receive notification when deployment fails.</div>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="w-[18px] h-[18px] border-2 border-slate-200 bg-white rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-800 leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Container Restart</div>
              <div className="text-[12px] font-medium text-slate-500">Receive notification when a container restarts.</div>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input type="checkbox" className="peer sr-only" />
              <div className="w-[18px] h-[18px] border-2 border-slate-200 bg-white rounded flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-800 leading-none mb-1.5 group-hover:text-blue-600 transition-colors">Weekly Summary</div>
              <div className="text-[12px] font-medium text-slate-500">Receive a weekly summary of your projects.</div>
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
