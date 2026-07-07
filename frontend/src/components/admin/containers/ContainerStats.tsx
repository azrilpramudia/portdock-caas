import { Box, CheckCircle2, PauseCircle, XCircle, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ContainerStatsProps {
  totalContainers: number;
  runningContainers: number;
  stoppedContainers: number;
  exitedContainers: number;
  totalImages: number;
  totalContainersTrend?: number;
  runningContainersTrend?: number;
  stoppedContainersTrend?: number;
  exitedContainersTrend?: number;
  totalImagesTrend?: number;
}

const TrendIndicator = ({ value }: { value?: number }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  return (
    <p className={`text-xs font-medium mt-1 flex items-center ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
      {isPositive ? '↑' : '↓'} {Math.abs(value)}% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
    </p>
  );
};

export function ContainerStats({
  totalContainers,
  runningContainers,
  stoppedContainers,
  exitedContainers,
  totalImages,
  totalContainersTrend,
  runningContainersTrend,
  stoppedContainersTrend,
  exitedContainersTrend,
  totalImagesTrend
}: ContainerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-blue-600 dark:text-blue-500">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <line x1="12" y1="22.08" x2="12" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Containers</p>
            <h3 className="text-2xl font-bold mt-1">{totalContainers}</h3>
            <TrendIndicator value={totalContainersTrend} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600 dark:text-emerald-500">
              <rect width="18" height="18" x="3" y="3" rx="4" fill="currentColor" />
              <polyline points="7 11 9 13 7 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <line x1="12" y1="15" x2="17" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Running</p>
            <h3 className="text-2xl font-bold mt-1">{runningContainers}</h3>
            <TrendIndicator value={runningContainersTrend} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-amber-500">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M10 15V9M14 15V9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stopped</p>
            <h3 className="text-2xl font-bold mt-1">{stoppedContainers}</h3>
            <TrendIndicator value={stoppedContainersTrend} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-rose-500">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Exited</p>
            <h3 className="text-2xl font-bold mt-1">{exitedContainers}</h3>
            <TrendIndicator value={exitedContainersTrend} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-violet-600 dark:text-violet-500">
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Images</p>
            <h3 className="text-2xl font-bold mt-1">{totalImages}</h3>
            <TrendIndicator value={totalImagesTrend} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
