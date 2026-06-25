import { Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";

interface GithubRepoFieldProps {
  register: UseFormRegister<any>;
  isPending: boolean;
}

export function GithubRepoField({ register, isPending }: GithubRepoFieldProps) {
  return (
    <div className="space-y-3 pt-2 border-t border-border mt-4">
      <div>
        <Label>GitHub Repository URL</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Masukkan URL repositori GitHub publik (HTTPS).
        </p>
      </div>
      <Input
        placeholder="https://github.com/username/repo"
        {...register("repositoryUrl")}
        className="h-10"
      />
      
      {isPending && (
        <div className="mt-4 space-y-2 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 animate-pulse flex items-center justify-center gap-2">
            <Rocket className="w-3 h-3" />
            Sedang mem-build dari GitHub (Bisa memakan waktu 1-5 menit)...
          </p>
        </div>
      )}
    </div>
  );
}
