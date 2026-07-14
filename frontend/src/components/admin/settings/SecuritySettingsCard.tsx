"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SecuritySettingsCard() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [loginAttempts, setLoginAttempts] = useState("5");

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground">Security Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">Kelola keamanan akun dan sistem</p>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Two-Factor Authentication (2FA)</h4>
            <p className="text-[13px] text-muted-foreground">Tambahkan lapisan keamanan ekstra untuk akun admin.</p>
          </div>
          <Switch 
            checked={twoFactor}
            onCheckedChange={setTwoFactor}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Session Timeout</h4>
            <p className="text-[13px] text-muted-foreground">Logout otomatis setelah tidak aktif selama periode tertentu.</p>
          </div>
          <div className="w-[120px]">
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger className="h-10 rounded-md">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 menit</SelectItem>
                <SelectItem value="30">30 menit</SelectItem>
                <SelectItem value="60">1 jam</SelectItem>
                <SelectItem value="120">2 jam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Password Policy</h4>
            <p className="text-[13px] text-muted-foreground">Atur kebijakan dan kompleksitas password.</p>
          </div>
          <Button variant="outline" className="h-10 px-4 py-2 shadow-sm rounded-md font-medium">
            Configure
          </Button>
        </div>

        <div className="border-t border-border/50" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Login Attempts</h4>
            <p className="text-[13px] text-muted-foreground">Batasi jumlah percobaan login yang gagal.</p>
          </div>
          <div className="w-[140px]">
            <Select value={loginAttempts} onValueChange={setLoginAttempts}>
              <SelectTrigger className="h-10 rounded-md">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 percobaan</SelectItem>
                <SelectItem value="5">5 percobaan</SelectItem>
                <SelectItem value="10">10 percobaan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2 mt-auto">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 shadow-sm rounded-md font-medium">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
