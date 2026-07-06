import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";

interface SettingsDangerZoneProps {
  handleDelete: () => void;
  isPending: boolean;
}

export function SettingsDangerZone({ handleDelete, isPending }: SettingsDangerZoneProps) {
  return (
    <Card className="border border-red-500/20 shadow-sm rounded-2xl overflow-hidden bg-card p-0 gap-0">
      <CardHeader className="border-b border-red-500/20 bg-red-500/10 pt-6 px-6 pb-4">
        <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Permanently remove this project and all of its associated containers, logs, and environments. This action cannot be undone.
        </p>
        <Button 
          onClick={handleDelete}
          disabled={isPending}
          variant="destructive"
          className="w-full text-sm font-semibold h-10 shadow-none bg-red-600 hover:bg-red-700 text-white"
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Delete Project
        </Button>
      </CardContent>
    </Card>
  );
}
