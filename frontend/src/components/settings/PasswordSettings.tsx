"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useSecuritySettings } from "@/hooks/useSettings";

export function PasswordSettings() {
  const { updatePasswordMutation } = useSecuritySettings();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    updatePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  return (
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
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
            />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showCurrentPassword ? <EyeOff className="w-[18px] h-[18px] text-muted-foreground/70 hover:text-foreground transition-colors" /> : <Eye className="w-[18px] h-[18px] text-muted-foreground/70 hover:text-foreground transition-colors" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-foreground">New Password</label>
          <div className="relative">
            <input 
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
            />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showNewPassword ? <EyeOff className="w-[18px] h-[18px] text-muted-foreground/70 hover:text-foreground transition-colors" /> : <Eye className="w-[18px] h-[18px] text-muted-foreground/70 hover:text-foreground transition-colors" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-foreground">Confirm Password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-10"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px] text-muted-foreground/70 hover:text-foreground transition-colors" /> : <Eye className="w-[18px] h-[18px] text-muted-foreground/70 hover:text-foreground transition-colors" />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={handleUpdatePassword}
          disabled={updatePasswordMutation.isPending}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[14px] font-bold transition-all shadow-sm"
        >
          {updatePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Update Password
        </button>
      </div>
    </div>
  );
}
