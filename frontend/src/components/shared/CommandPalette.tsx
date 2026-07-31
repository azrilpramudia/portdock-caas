"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FolderOpen,
  Database,
  Container as ContainerIcon,
  Activity,
  Terminal,
  Moon,
  Sun,
  Plus,
  Box,
  Settings,
  FileCode,
  ScrollText,
  LifeBuoy,
  LogOut,
  User,
  Power,
  RotateCw,
  Play,
  TerminalSquare,
  Copy,
  ExternalLink,
  Globe
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { FaGithub } from "react-icons/fa";

import { useProjectsList } from "@/hooks/useProjects";
import { useContainersList, useContainerAction } from "@/hooks/useContainers";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import type { Project, Container, ManagedDatabase } from "@/types";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  // Fetch projects for global search (without search param to get recent ones)
  const { data: projectsData } = useProjectsList("", "");
  const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.data || []);

  const { data: containersData } = useContainersList("", "");
  const containers = Array.isArray(containersData) ? containersData : (containersData?.data || []);
  const { mutate: containerAction } = useContainerAction();
  
  const { logout } = useAuthStore();

  const { data: databasesData } = useQuery({
    queryKey: ["databases"],
    queryFn: async () => {
      const res = await api.get("/databases");
      return res.data;
    },
  });
  const databases = Array.isArray(databasesData) ? databasesData : (databasesData?.data || []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
    setOpen(false);
  };

  const visitUrl = (url: string) => {
    window.open(url.startsWith('http') ? url : `http://${url}`, '_blank');
    setOpen(false);
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {projects && projects.length > 0 && (
          <CommandGroup heading="Projects">
            {projects.map((project: Project) => (
              <React.Fragment key={project.id}>
                <CommandItem 
                  onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                >
                  <Box className="mr-2 h-4 w-4 text-blue-500" />
                  <span>{project.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{project.deploymentType || "ZIP"}</span>
                </CommandItem>
                {project.domain && (
                  <>
                    <CommandItem key={`visit-${project.id}`} onSelect={() => runCommand(() => visitUrl(project.domain!))}>
                      <ExternalLink className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>Visit {project.name} Website</span>
                      <span className="ml-auto text-xs text-muted-foreground">Action</span>
                    </CommandItem>
                    <CommandItem key={`copy-${project.id}`} onSelect={() => runCommand(() => copyToClipboard(project.domain!, "Domain"))}>
                      <Copy className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Copy {project.name} Domain</span>
                      <span className="ml-auto text-xs text-muted-foreground">Action</span>
                    </CommandItem>
                  </>
                )}
              </React.Fragment>
            ))}
          </CommandGroup>
        )}

        {projects && projects.length > 0 && <CommandSeparator />}

        {databases && databases.length > 0 && (
          <>
            <CommandGroup heading="Databases">
              {databases.map((db: ManagedDatabase) => (
                <CommandItem 
                  key={db.id} 
                  onSelect={() => runCommand(() => router.push(`/databases`))}
                >
                  <Database className="mr-2 h-4 w-4 text-emerald-500" />
                  <span>{db.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{db.type}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {containers && containers.length > 0 && (
          <CommandGroup heading="Container Actions">
            {containers.map((container: Container) => (
              <React.Fragment key={container.id}>
                <CommandItem onSelect={() => runCommand(() => router.push(`/terminal?containerId=${container.id}&tab=app-logs`))}>
                  <TerminalSquare className="mr-2 h-4 w-4 text-blue-500" />
                  <span>View {container.name} Logs</span>
                  <span className="ml-auto text-xs text-muted-foreground">Action</span>
                </CommandItem>
                {container.status !== 'RUNNING' ? (
                  <CommandItem onSelect={() => runCommand(() => containerAction({ id: container.id, action: "start" }))}>
                    <Play className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>Start {container.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">Action</span>
                  </CommandItem>
                ) : (
                  <>
                    <CommandItem onSelect={() => runCommand(() => containerAction({ id: container.id, action: "restart" }))}>
                      <RotateCw className="mr-2 h-4 w-4 text-orange-500" />
                      <span>Restart {container.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">Action</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => containerAction({ id: container.id, action: "stop" }))}>
                      <Power className="mr-2 h-4 w-4 text-red-500" />
                      <span>Stop {container.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">Action</span>
                    </CommandItem>
                  </>
                )}
                {container.networkAllocations && container.networkAllocations.length > 0 && (
                  <>
                    <CommandItem key={`visit-ip-${container.id}`} onSelect={() => runCommand(() => visitUrl(`${container.project?.domain || window.location.hostname}:${container.networkAllocations![0].hostPort}`))}>
                      <Globe className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>Visit {container.name} IP</span>
                      <span className="ml-auto text-xs text-muted-foreground">Action</span>
                    </CommandItem>
                    <CommandItem key={`copy-ip-${container.id}`} onSelect={() => runCommand(() => copyToClipboard(`${container.project?.domain || window.location.hostname}:${container.networkAllocations![0].hostPort}`, "IP Address"))}>
                      <Copy className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Copy {container.name} IP Address</span>
                      <span className="ml-auto text-xs text-muted-foreground">Action</span>
                    </CommandItem>
                  </>
                )}
              </React.Fragment>
            ))}
          </CommandGroup>
        )}

        {containers && containers.length > 0 && <CommandSeparator />}

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/projects"))}>
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/databases"))}>
            <Database className="mr-2 h-4 w-4" />
            <span>Databases</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/containers"))}>
            <ContainerIcon className="mr-2 h-4 w-4" />
            <span>Containers</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/monitoring"))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Monitoring</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/terminal"))}>
            <Terminal className="mr-2 h-4 w-4" />
            <span>Terminal</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/projects/new"))}>
            <Plus className="mr-2 h-4 w-4 text-blue-500" />
            <span>Deploy New Project</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/projects/new?type=github"))}>
            <FaGithub className="mr-2 h-4 w-4" />
            <span>Deploy from GitHub</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/projects/new?type=dockerfile"))}>
            <FileCode className="mr-2 h-4 w-4" />
            <span>Deploy via Dockerfile</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/activity-logs"))}>
            <ScrollText className="mr-2 h-4 w-4" />
            <span>View Activity Logs</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4 text-amber-500" />
            <span>Switch to Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4 text-indigo-400" />
            <span>Switch to Dark Mode</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account & Help">
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => window.open("mailto:support@portdock.com", "_blank"))}>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Contact Support</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => logout())}>
            <LogOut className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-red-500">Log out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
