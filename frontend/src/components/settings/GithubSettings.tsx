"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GitBranch, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useIntegrationSettings } from "@/hooks/useSettings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function GithubSettings() {
  const { user } = useAuthStore();
  const { connectGithubMutation, disconnectGithubMutation } = useIntegrationSettings();
  
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [githubTokenInput, setGithubTokenInput] = useState("");
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  const handleConnectGithub = async () => {
    if (!githubTokenInput) {
      toast.error("Please enter a valid Personal Access Token");
      return;
    }
    
    connectGithubMutation.mutate(githubTokenInput, {
      onSuccess: () => {
        setIsEditingGithub(false);
        setGithubTokenInput("");
      }
    });
  };

  const handleDisconnectGithub = async () => {
    disconnectGithubMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDisconnectDialog(false);
      }
    });
  };

  return (
    <>
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
              {user?.githubUsername ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[12px]">
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-bold text-[12px]">
                  Not Connected
                </span>
              )}
            </div>
            
            <div className="font-bold text-muted-foreground flex items-center">Account</div>
            <div className="font-semibold text-foreground flex items-center">{user?.githubUsername || "-"}</div>
            
            <div className="font-bold text-muted-foreground flex items-center">Repository Access</div>
            <div className="font-semibold text-foreground flex items-center">{user?.githubUsername ? "Full Access via PAT" : "Not Configured"}</div>
          </div>
        </div>
        
        <div className="mt-auto">
          {isEditingGithub ? (
            <div className="flex flex-col gap-3">
              <input 
                type="password" 
                placeholder="Enter Personal Access Token (PAT)"
                value={githubTokenInput}
                onChange={(e) => setGithubTokenInput(e.target.value)}
                className="w-full bg-card border border-border text-foreground text-[13px] rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all font-medium"
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleConnectGithub}
                  disabled={connectGithubMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 rounded-xl text-[13px] font-bold transition-colors"
                >
                  {connectGithubMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Save Token
                </button>
                <button 
                  onClick={() => setIsEditingGithub(false)}
                  className="px-4 py-2 border border-border hover:bg-muted text-foreground rounded-xl text-[13px] font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditingGithub(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl text-[13px] font-bold transition-colors"
              >
                <GitBranch className="w-[14px] h-[14px]" />
                {user?.githubUsername ? "Update GitHub Token" : "Connect GitHub"}
              </button>
              {user?.githubUsername && (
                <button 
                  onClick={() => setShowDisconnectDialog(true)}
                  disabled={disconnectGithubMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-[13px] font-bold transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent className="rounded-2xl border-border shadow-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">Disconnect GitHub</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to disconnect your GitHub account? Any projects that rely on this integration might fail to deploy in the future.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDisconnectDialog(false)}
              className="h-10 rounded-xl font-bold"
              disabled={disconnectGithubMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisconnectGithub}
              className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
              disabled={disconnectGithubMutation.isPending}
            >
              {disconnectGithubMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
