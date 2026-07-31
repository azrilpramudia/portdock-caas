"use client";

import { toast } from "sonner";
import { KeyRound, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useIntegrationSettings } from "@/hooks/useSettings";

export function SshKeySettings() {
  const { user } = useAuthStore();
  const { generateSshKeyMutation } = useIntegrationSettings();

  const handleGenerateSsh = async () => {
    generateSshKeyMutation.mutate();
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
          disabled={generateSshKeyMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[14px] font-bold transition-all shadow-sm"
        >
          {generateSshKeyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Generate New SSH Key
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
