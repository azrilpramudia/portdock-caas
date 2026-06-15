import { 
  LayoutDashboard, 
  FolderOpen, 
  Rocket, 
  Container, 
  BarChart3, 
  TerminalSquare as TerminalIcon, 
  ScrollText, 
  Settings 
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/containers", icon: Container, label: "Containers" },
  { href: "/monitoring", icon: BarChart3, label: "Monitoring" },
  { href: "/terminal", icon: TerminalIcon, label: "Terminal" },
  { href: "/activity-logs", icon: ScrollText, label: "Activity Logs" },
  { href: "/settings", icon: Settings, label: "Settings" },
];
