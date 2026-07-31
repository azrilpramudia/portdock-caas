"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Loader2 } from "lucide-react";
import { useProfileSettings } from "@/hooks/useSettings";

export function ProfileSettings() {
  const { profileQuery, updateProfileMutation } = useProfileSettings();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name || "");
      setEmail(profileQuery.data.email || "");
    }
  }, [profileQuery.data]);

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }
    
    updateProfileMutation.mutate({ name, email });
  };

  return (
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
          disabled={updateProfileMutation.isPending}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[14px] font-bold transition-all shadow-sm"
        >
          {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Changes
        </button>
      </div>
    </div>
  );
}
