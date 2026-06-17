"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { KeyRound, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export function SshKeySettings() {
  const { user, token, setAuth } = useAuthStore();
  const [isGeneratingSsh, setIsGeneratingSsh] = useState(false);

  const handleGenerateSsh = async () => {
    setIsGeneratingSsh(true);
    try {
      const data = await authService.generateSshKey();
      if (user && token) {
        setAuth({ ...user, sshPublicKey: data.sshPublicKey }, token);
      }
      toast.success("SSH Key generated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate SSH key");
    } finally {
      setIsGeneratingSsh(false);
    }
  };

  const handleCopySsh = () => {
    if (user?.sshPublicKey) {
      navigator.clipboard.writeText(user.sshPublicKey);
      toast.success("SSH Key copied to clipboard!");
    }
  };

  return (
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
          value={user?.sshPublicKey || ""}
          placeholder="No SSH key generated yet."
          className="w-full h-[100px] bg-card border border-border text-muted-foreground text-[13px] rounded-xl p-4 outline-none resize-none font-medium leading-relaxed"
        />
        <div className="flex items-start gap-2 mt-1">
          <CheckCircle2 className="w-[15px] h-[15px] text-emerald-500 mt-[1px] flex-shrink-0" />
          <p className="text-[12px] font-medium text-muted-foreground leading-snug">
            Your SSH key is used to access and manage your servers securely.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-8">
        <button 
          onClick={handleGenerateSsh}
          disabled={isGeneratingSsh}
          className="flex items-center gap-2 px-4 py-2.5 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 rounded-xl text-[13px] font-bold transition-all bg-card shadow-sm"
        >
          {isGeneratingSsh ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {user?.sshPublicKey ? "Regenerate Key" : "Generate Key"}
        </button>
        {user?.sshPublicKey && (
          <button 
            onClick={handleCopySsh}
            className="flex items-center gap-2 px-4 py-2.5 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl text-[13px] font-bold transition-all bg-card shadow-sm"
          >
            <Copy className="w-[14px] h-[14px]" />
            Copy Key
          </button>
        )}
      </div>
    </div>
  );
}
