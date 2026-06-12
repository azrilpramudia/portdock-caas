/* ── Sidebar menu ── */
export const SIDEBAR_ITEMS = [
  { iconName: "LayoutDashboard" as const, label: "Dashboard", active: true },
  { iconName: "FolderKanban" as const, label: "Projects", active: false },
  { iconName: "Container" as const, label: "Containers", active: false },
  { iconName: "Settings" as const, label: "Settings", active: false },
];

/* ── Stats cards ── */
export const DASHBOARD_STATS = [
  { label: "Total Projects", value: "12", color: "text-gray-900", bg: "bg-gray-50" },
  { label: "Running Containers", value: "8", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "CPU Usage", value: "23%", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Memory", value: "45%", color: "text-amber-600", bg: "bg-amber-50" },
];

/* ── Container table rows ── */
export const CONTAINER_ROWS = [
  { name: "my-app-1", status: "Running", port: "Up 2h", image: "node:18", running: true },
  { name: "web-frontend", status: "Running", port: "Up 1h", image: "nginx:alpine", running: true },
  { name: "api-backend", status: "Stopped", port: "—", image: "bun:latest", running: false },
  { name: "db-postgres", status: "Running", port: "Up 7d", image: "postgres:15", running: true },
  { name: "All Analyics", status: "Running", port: "Up 3d", image: "grafana/grafana", running: true },
];

/* ── Trust badges ── */
export const TRUST_BADGES = [
  { label: "SSL Otomatis", type: "shield" as const },
  { label: "Deploy Cepat", type: "zap" as const },
  { label: "Aman & Terproteksi", type: "lock" as const },
];
