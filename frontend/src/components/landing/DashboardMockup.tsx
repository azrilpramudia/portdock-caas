import Image from "next/image";
import { Container } from "lucide-react";
import { HERO_ICON_MAP } from "@/utils/icon-helpers";
import TopDecorations from "./TopDecorations";
import {
  SIDEBAR_ITEMS,
  DASHBOARD_STATS,
  CONTAINER_ROWS,
} from "@/constants/hero";





/* ── Sidebar ── */
function Sidebar() {
  return (
    <div className="w-[140px] bg-portdock-navy flex flex-col py-4 px-3 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-1.5 px-1 mb-6">
        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
          <Container className="w-3 h-3 text-white" />
        </div>
        <span className="text-white text-[10px] font-bold tracking-wider">PORTDOCK</span>
      </div>

      {/* Nav Items */}
      <nav className="space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = HERO_ICON_MAP[item.iconName as keyof typeof HERO_ICON_MAP];
          return (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium ${
                item.active
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/* ── Stats Cards ── */
function StatsGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {DASHBOARD_STATS.map((stat) => (
        <div key={stat.label} className={`${stat.bg} rounded-lg p-2 text-center transition-colors duration-300`}>
          <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5 leading-tight">{stat.label}</p>
          <p className={`text-lg font-bold ${stat.color} transition-colors duration-300`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Container Table ── */
function ContainerTable() {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5 transition-colors">Container Status</p>
      <div className="border border-gray-100 dark:border-slate-800/80 rounded-lg overflow-hidden transition-colors">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 transition-colors">
              <th className="text-left px-2.5 py-1 font-medium">Name</th>
              <th className="text-left px-2.5 py-1 font-medium">Status</th>
              <th className="text-left px-2.5 py-1 font-medium">Port</th>
              <th className="text-left px-2.5 py-1 font-medium">IMAGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50 transition-colors">
            {CONTAINER_ROWS.map((row) => (
              <tr key={row.name}>
                <td className="px-2.5 py-1.5 font-medium text-gray-700 dark:text-slate-300">{row.name}</td>
                <td className="px-2.5 py-1.5">
                  <span className={`inline-flex items-center gap-1 ${row.running ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-slate-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.running ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"}`} />
                    {row.status}
                  </span>
                </td>
                <td className="px-2.5 py-1.5 text-gray-500 dark:text-slate-400">{row.port}</td>
                <td className="px-2.5 py-1.5 text-gray-500 dark:text-slate-400 font-mono">{row.image}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Floating Terminal Mockup ── */
function FloatingTerminal() {
  return (
    <div className="hidden sm:block absolute -bottom-8 -right-8 w-72 bg-portdock-navy rounded-xl shadow-2xl shadow-blue-900/20 border border-slate-700/50 overflow-hidden z-20 animate-[float_8s_ease-in-out_infinite_reverse]">
      {/* Terminal Header */}
      <div className="flex items-center px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <span className="text-slate-400 text-xs font-mono">$ docker ps</span>
        <div className="ml-auto w-1 h-3 bg-slate-400 animate-pulse" />
      </div>
      
      {/* Terminal Content */}
      <div className="p-4">
        <table className="w-full text-[9px] font-mono text-slate-300">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="pb-2 font-normal">CONTAINER ID</th>
              <th className="pb-2 font-normal">IMAGE</th>
              <th className="pb-2 font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody className="space-y-1">
            <tr>
              <td className="py-1.5">a1b2c3d4e5f6</td>
              <td className="py-1.5 text-blue-300">my-app:latest</td>
              <td className="py-1.5 text-emerald-400">Up 2 hours</td>
            </tr>
            <tr>
              <td className="py-1.5">b2c3d4e5f6a7</td>
              <td className="py-1.5 text-blue-300">api:latest</td>
              <td className="py-1.5 text-emerald-400">Up 1 hour</td>
            </tr>
            <tr>
              <td className="py-1.5">c3d4e5f6a7b8</td>
              <td className="py-1.5 text-blue-300">nginx:latest</td>
              <td className="py-1.5 text-emerald-400">Up 3 hours</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Dashboard Mockup ── */
export default function DashboardMockup() {
  return (
    <div className="relative lg:pl-4 mt-20">
      <TopDecorations />

      {/* Dashboard Card */}
      <div className="relative bg-white dark:bg-background rounded-2xl shadow-2xl shadow-gray-200/60 dark:shadow-none border border-gray-100 dark:border-slate-800 overflow-hidden flex transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-4 space-y-3 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200 transition-colors">Dashboard</h3>
          <StatsGrid />
          <ContainerTable />
        </div>
      </div>

      {/* Floating Terminal Window */}
      <FloatingTerminal />
    </div>
  );
}
