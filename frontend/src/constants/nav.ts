import { 
  LayoutDashboard, 
  FolderOpen, 
  Container, 
  BarChart3, 
  TerminalSquare as TerminalIcon, 
  ScrollText, 
  Settings,
  Database
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { href: "/projects", icon: FolderOpen, label: "Projects", id: "projects" },
  { href: "/databases", icon: Database, label: "Databases", id: "databases" },
  { href: "/containers", icon: Container, label: "Containers", id: "containers" },
  { href: "/monitoring", icon: BarChart3, label: "Monitoring", id: "monitoring" },
  { href: "/terminal", icon: TerminalIcon, label: "Terminal", id: "terminal" },
  { href: "/activity-logs", icon: ScrollText, label: "Activity Logs", id: "activityLogs" },
  { href: "/settings", icon: Settings, label: "Settings", id: "settings" },
];
