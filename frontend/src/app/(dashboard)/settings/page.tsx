"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { 
  User, 
  Lock, 
  GitBranch, 
  KeyRound, 
  Bell, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  Copy,
  Check,
  Loader2
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user, token, setAuth } = useAuthStore();
  
  // Profile State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isGeneratingSsh, setIsGeneratingSsh] = useState(false);
  const [isConnectingGithub, setIsConnectingGithub] = useState(false);
  const [isDisconnectingGithub, setIsDisconnectingGithub] = useState(false);
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [githubTokenInput, setGithubTokenInput] = useState("");
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getMe();
        setName(data.name || "");
        setEmail(data.email || "");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }
    setIsSavingProfile(true);
    try {
      const updatedUser = await authService.updateProfile({ name, email });
      if (token) setAuth(updatedUser, token);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

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

    setIsUpdatingPassword(true);
    try {
      await authService.updatePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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

  const handleConnectGithub = async () => {
    if (!githubTokenInput) {
      toast.error("Please enter a valid Personal Access Token");
      return;
    }
    setIsConnectingGithub(true);
    try {
      const data = await authService.connectGithub(githubTokenInput);
      if (user && token) {
        setAuth({ ...user, githubUsername: data.githubUsername }, token);
      }
      setIsEditingGithub(false);
      setGithubTokenInput("");
      toast.success("GitHub connected successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to connect GitHub");
    } finally {
      setIsConnectingGithub(false);
    }
  };

  const handleDisconnectGithub = async () => {
    setIsDisconnectingGithub(true);
    try {
      await authService.disconnectGithub();
      if (user && token) {
        setAuth({ ...user, githubUsername: undefined }, token);
      }
      toast.success("GitHub disconnected successfully!");
      setShowDisconnectDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to disconnect GitHub");
    } finally {
      setIsDisconnectingGithub(false);
    }
  };

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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-foreground">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={handleUpdateProfile}
              disabled={isSavingProfile}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[14px] font-bold transition-all shadow-sm"
            >
              {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
              disabled={isUpdatingPassword}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[14px] font-bold transition-all shadow-sm"
            >
              {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
                    disabled={isConnectingGithub}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 rounded-xl text-[13px] font-bold transition-colors"
                  >
                    {isConnectingGithub ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
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
                    disabled={isDisconnectingGithub}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-[13px] font-bold transition-colors disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            )}
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
              disabled={isDisconnectingGithub}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisconnectGithub}
              className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
              disabled={isDisconnectingGithub}
            >
              {isDisconnectingGithub ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
