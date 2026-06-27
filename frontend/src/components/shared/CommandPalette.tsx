"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FolderOpen,
  Database,
  Container,
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
  RotateCw
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
            {projects.slice(0, 5).map((project: any) => (
              <CommandItem 
                key={project.id} 
                onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
              >
                <Box className="mr-2 h-4 w-4 text-blue-500" />
                <span>{project.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{project.deploymentType || "ZIP"}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {projects && projects.length > 0 && <CommandSeparator />}

        {containers && containers.length > 0 && (
          <CommandGroup heading="Container Actions">
            {containers.slice(0, 3).map((container: any) => (
              <CommandItem 
                key={`restart-${container.id}`} 
                onSelect={() => runCommand(() => containerAction({ id: container.id, action: "restart" }))}
              >
                <RotateCw className="mr-2 h-4 w-4 text-orange-500" />
                <span>Restart {container.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">Action</span>
              </CommandItem>
            ))}
            {containers.slice(0, 3).map((container: any) => (
              <CommandItem 
                key={`stop-${container.id}`} 
                onSelect={() => runCommand(() => containerAction({ id: container.id, action: "stop" }))}
              >
                <Power className="mr-2 h-4 w-4 text-red-500" />
                <span>Stop {container.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">Action</span>
              </CommandItem>
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
            <Container className="mr-2 h-4 w-4" />
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
