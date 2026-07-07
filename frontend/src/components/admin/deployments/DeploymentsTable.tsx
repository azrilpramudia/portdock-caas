import { Eye, Square, RotateCw, ExternalLink, List, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MOCK_DEPLOYMENTS = [
  {
    id: "#DEP-1245",
    project: "E-Commerce API",
    tech: "Node.js",
    userInitials: "AP",
    userColor: "bg-blue-600",
    userName: "Azril Pramudia",
    userEmail: "azril@example.com",
    env: "Production",
    status: "Success",
    progress: 100,
    startedAt: "15 Apr 2026",
    startedTime: "10:24",
    duration: "2 menit 15 detik",
    domain: "api.ecommerce.portdock.id",
  },
  {
    id: "#DEP-1244",
    project: "Portfolio Web",
    tech: "Next.js",
    userInitials: "BS",
    userColor: "bg-green-600",
    userName: "Budi Santoso",
    userEmail: "budi@example.com",
    env: "Production",
    status: "Success",
    progress: 100,
    startedAt: "14 Apr 2026",
    startedTime: "09:12",
    duration: "1 menit 45 detik",
    domain: "portfolio.portdock.id",
  },
  {
    id: "#DEP-1243",
    project: "Blog System",
    tech: "PHP",
    userInitials: "AW",
    userColor: "bg-purple-600",
    userName: "Andi Wijaya",
    userEmail: "andi@example.com",
    env: "Production",
    status: "In Progress",
    progress: 65,
    startedAt: "16 Apr 2026",
    startedTime: "14:02",
    duration: "-",
    domain: "blog.portdock.id",
  },
  {
    id: "#DEP-1242",
    project: "Company Profile",
    tech: "Laravel",
    userInitials: "SR",
    userColor: "bg-emerald-600",
    userName: "Siti Rahma",
    userEmail: "siti@example.com",
    env: "Staging",
    status: "Success",
    progress: 100,
    startedAt: "16 Apr 2026",
    startedTime: "11:35",
    duration: "1 menit 20 detik",
    domain: "staging.company.portdock.id",
  },
  {
    id: "#DEP-1241",
    project: "Landing Page",
    tech: "Next.js",
    userInitials: "DR",
    userColor: "bg-amber-500",
    userName: "Dimas Ramadhan",
    userEmail: "dimas@example.com",
    env: "Production",
    status: "Failed",
    progress: 0,
    startedAt: "16 Apr 2026",
    startedTime: "10:11",
    duration: "58 detik",
    domain: "landing.portdock.id",
  },
  {
    id: "#DEP-1240",
    project: "Task Management",
    tech: "Node.js",
    userInitials: "MR",
    userColor: "bg-pink-500",
    userName: "Muhammad Rizky",
    userEmail: "rizky@example.com",
    env: "Staging",
    status: "Success",
    progress: 100,
    startedAt: "15 Apr 2026",
    startedTime: "16:20",
    duration: "2 menit 40 detik",
    domain: "staging.tasks.portdock.id",
  },
  {
    id: "#DEP-1239",
    project: "School App",
    tech: "Django",
    userInitials: "NA",
    userColor: "bg-indigo-600",
    userName: "Nabila Azzahra",
    userEmail: "nabila@example.com",
    env: "Production",
    status: "In Progress",
    progress: 30,
    startedAt: "16 Apr 2026",
    startedTime: "15:45",
    duration: "-",
    domain: "school.portdock.id",
  },
  {
    id: "#DEP-1238",
    project: "Internal Dashboard",
    tech: "React",
    userInitials: "FA",
    userColor: "bg-emerald-500",
    userName: "Fajar Alamsyah",
    userEmail: "fajar@example.com",
    env: "Production",
    status: "Success",
    progress: 100,
    startedAt: "15 Apr 2026",
    startedTime: "13:14",
    duration: "1 menit 55 detik",
    domain: "internal.portdock.id",
  },
  {
    id: "#DEP-1237",
    project: "Inventory Service",
    tech: "Node.js",
    userInitials: "IR",
    userColor: "bg-teal-700",
    userName: "Intan Rahayu",
    userEmail: "intan@example.com",
    env: "Staging",
    status: "Failed",
    progress: 0,
    startedAt: "15 Apr 2026",
    startedTime: "12:20",
    duration: "1 menit 02 detik",
    domain: "inventory.staging.portdock.id",
  },
  {
    id: "#DEP-1236",
    project: "Mobile Backend",
    tech: "Express.js",
    userInitials: "AG",
    userColor: "bg-emerald-600",
    userName: "Agung Prasetyo",
    userEmail: "agung@example.com",
    env: "Production",
    status: "Success",
    progress: 100,
    startedAt: "14 Apr 2026",
    startedTime: "18:33",
    duration: "2 menit 05 detik",
    domain: "api.mobile.portdock.id",
  },
];

export function DeploymentsTable() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-semibold text-[11px] border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Success
          </div>
        );
      case "In Progress":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-semibold text-[11px] border border-blue-100 dark:border-blue-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> In Progress
          </div>
        );
      case "Failed":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 font-semibold text-[11px] border border-rose-100 dark:border-rose-500/20">
            <XCircle className="w-3 h-3" /> Failed
          </div>
        );
      default:
        return null;
    }
  };

  const getProgressBar = (status: string, progress: number) => {
    let colorClass = "bg-emerald-500";
    if (status === "In Progress") colorClass = "bg-blue-500";
    if (status === "Failed") colorClass = "bg-rose-500";

    return (
      <div className="w-24">
        <div className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mb-1">{progress}%</div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-[100px]">ID</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Project</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider min-w-[180px]">User</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Environment</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider min-w-[120px]">Progress</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider min-w-[130px]">Started At</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider min-w-[120px]">Duration</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider min-w-[200px]">Domain</th>
              <th className="px-5 py-4 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-[120px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_DEPLOYMENTS.map((dep, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-5 py-4">
                  <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">{dep.id}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{dep.project}</div>
                  <div className="text-[12px] font-medium text-slate-500 mt-0.5">{dep.tech}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${dep.userColor} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                      {dep.userInitials}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{dep.userName}</div>
                      <div className="text-[12px] font-medium text-slate-500 mt-0.5">{dep.userEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                    dep.env === 'Production' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' 
                      : 'bg-purple-50 text-purple-600 dark:bg-purple-500/10'
                  }`}>
                    {dep.env}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {getStatusBadge(dep.status)}
                </td>
                <td className="px-5 py-4">
                  {getProgressBar(dep.status, dep.progress)}
                </td>
                <td className="px-5 py-4">
                  <div className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">{dep.startedAt}</div>
                  <div className="text-[12px] font-medium text-slate-500 mt-0.5">{dep.startedTime}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{dep.duration}</div>
                </td>
                <td className="px-5 py-4">
                  <a href="#" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-colors">
                    {dep.domain}
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <TooltipProvider delay={300}>
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-background border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 shadow-none" />
                        }>
                          <Eye className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent><p>View Details</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {dep.status === "Success" && (
                      <TooltipProvider delay={300}>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-background border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 shadow-none" />
                          }>
                            <List className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent><p>View Logs</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {dep.status === "In Progress" && (
                      <TooltipProvider delay={300}>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-background border-slate-200 dark:border-slate-800 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shadow-none" />
                          }>
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </TooltipTrigger>
                          <TooltipContent><p>Stop Deployment</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {dep.status === "Failed" && (
                      <TooltipProvider delay={300}>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-background border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 shadow-none" />
                          }>
                            <RotateCw className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent><p>Retry Deployment</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="border-t border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[13px] font-medium text-muted-foreground">
          Showing 1 to 10 of 1,248 deployments
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:bg-muted" disabled>
            <span className="sr-only">Previous</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </Button>
          <Button variant="default" size="icon" className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px]">
            1
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:bg-muted font-semibold text-[13px]">
            2
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:bg-muted font-semibold text-[13px]">
            3
          </Button>
          <div className="w-8 h-8 flex items-center justify-center text-muted-foreground text-[13px]">...</div>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:bg-muted font-semibold text-[13px]">
            125
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:bg-muted">
            <span className="sr-only">Next</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M6.1584 3.13508C5.95694 3.32394 5.94673 3.64036 6.1356 3.84182L9.565 7.49991L6.1356 11.158C5.94673 11.3595 5.95694 11.6759 6.1584 11.8648C6.35986 12.0536 6.67628 12.0434 6.86514 11.842L10.6151 7.84197C10.7954 7.64964 10.7954 7.35036 10.6151 7.15803L6.86514 3.15803C6.67628 2.95657 6.35986 2.94637 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
