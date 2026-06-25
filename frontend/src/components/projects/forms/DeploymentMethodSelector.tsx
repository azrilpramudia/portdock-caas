import { FileArchive, GitBranch, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormSetValue } from "react-hook-form";

export const deployTypes = [
  {
    value: "ZIP" as const,
    label: "ZIP Upload",
    description: "Upload source code sebagai file ZIP",
    icon: FileArchive,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-500/20",
  },
  {
    value: "GITHUB" as const,
    label: "GitHub Repository",
    description: "Deploy dari repositori GitHub",
    icon: GitBranch,
    color: "text-foreground dark:text-foreground",
    bg: "bg-muted dark:bg-muted",
  },
  {
    value: "DOCKERFILE" as const,
    label: "Custom Dockerfile",
    description: "Deploy menggunakan Dockerfile custom",
    icon: FileCode,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/20",
  },
];

interface DeploymentMethodSelectorProps {
  deploymentType: "ZIP" | "GITHUB" | "DOCKERFILE";
  setValue: UseFormSetValue<any>;
}

export function DeploymentMethodSelector({
  deploymentType,
  setValue,
}: DeploymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {deployTypes.map((type) => {
        const Icon = type.icon;
        const isActive = deploymentType === type.value;
        
        return (
          <div
            key={type.value}
            onClick={() => setValue("deploymentType", type.value)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
              isActive 
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" 
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", type.bg)}>
              <Icon className={cn("w-5 h-5", type.color)} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">{type.label}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
            </div>
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
              isActive ? "border-blue-500" : "border-muted-foreground/30"
            )}>
              {isActive && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
