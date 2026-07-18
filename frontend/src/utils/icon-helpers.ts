import {
  Atom,
  Hexagon,
  Layers,
  FileCode2,
  Database,
  FolderOpen,
  Container,
  FileArchive,
  LayoutDashboard,
  Rocket,
  BarChart3,
  TerminalSquare,
  ScrollText,
  Settings,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

/* ── Mappings for the Dashboard Mockup ── */
export const HERO_ICON_MAP = {
  LayoutDashboard,
  FolderOpen,
  Rocket,
  Container,
  BarChart3,
  TerminalSquare,
  ScrollText,
  Settings,
} as const;

/* ── Helpers for the Projects Page ── */
export function getProjectIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("portfolio")) return { icon: Atom, bg: "bg-blue-500", text: "text-white" };
  if (n.includes("company")) return { icon: Hexagon, bg: "bg-emerald-500", text: "text-white" };
  if (n.includes("ecommerce")) return { icon: Layers, bg: "bg-orange-500", text: "text-white" };
  if (n.includes("blog")) return { icon: FileCode2, bg: "bg-indigo-500", text: "text-white" };
  if (n.includes("landing")) return { icon: Layers, bg: "bg-rose-500", text: "text-white" };
  if (n.includes("admin")) return { icon: Database, bg: "bg-teal-500", text: "text-white" };
  return { icon: FolderOpen, bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" };
}

export function getDeployTypeDetails(type: string) {
  if (type === "GITHUB") return { icon: FaGithub, label: "GitHub" };
  if (type === "ZIP") return { icon: FileArchive, label: "ZIP" };
  if (type === "DOCKERFILE") return { icon: Container, label: "Dockerfile" };
  return { icon: FileCode2, label: type };
}

export function getTemplateDetails(templateId: string) {
  switch (templateId) {
    case "STATIC_NGINX":
      return { label: "Nginx", color: "bg-green-500/10 text-green-600" };
    case "STATIC_APACHE":
      return { label: "Apache", color: "bg-red-500/10 text-red-600" };
    case "PHP_APACHE":
      return { label: "PHP Apache", color: "bg-indigo-500/10 text-indigo-600" };
    case "NIXPACKS":
      return { label: "Nixpacks", color: "bg-blue-500/10 text-blue-600" };
    default:
      return { label: templateId || "Unknown", color: "bg-slate-500/10 text-slate-600" };
  }
}
