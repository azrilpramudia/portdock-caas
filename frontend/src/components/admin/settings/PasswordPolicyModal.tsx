import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdminSettings";

export function PasswordPolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: settings } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const [minLen, setMinLen] = useState("8");
  const [reqUpper, setReqUpper] = useState(true);
  const [reqNum, setReqNum] = useState(true);
  const [reqSpec, setReqSpec] = useState(true);

  useEffect(() => {
    if (settings && isOpen) {
      if (settings.pwdMinLength) setMinLen(settings.pwdMinLength);
      if (settings.pwdRequireUpper !== undefined) setReqUpper(settings.pwdRequireUpper === "true");
      if (settings.pwdRequireNumber !== undefined) setReqNum(settings.pwdRequireNumber === "true");
      if (settings.pwdRequireSpecial !== undefined) setReqSpec(settings.pwdRequireSpecial === "true");
    }
  }, [settings, isOpen]);

  const handleSave = () => {
    updateSettings.mutate({
      pwdMinLength: minLen,
      pwdRequireUpper: reqUpper ? "true" : "false",
      pwdRequireNumber: reqNum ? "true" : "false",
      pwdRequireSpecial: reqSpec ? "true" : "false",
    }, {
      onSuccess: () => {
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-4 w-full">
        Configure
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Password Policy</DialogTitle>
          <DialogDescription>
            Configure complexity requirements for user passwords.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Minimum Length</label>
            <Input 
              type="number" 
              value={minLen} 
              onChange={(e) => setMinLen(e.target.value)} 
              min={4} max={32} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Require Uppercase Letter</label>
            <Switch checked={reqUpper} onCheckedChange={setReqUpper} />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Require Number</label>
            <Switch checked={reqNum} onCheckedChange={setReqNum} />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Require Special Character</label>
            <Switch checked={reqSpec} onCheckedChange={setReqSpec} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
