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

const TrendIndicator = ({ value, label1, label2 }: { value?: number, label1: string, label2: string }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  const colorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';
  
  return (
    <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] leading-tight">
      <span className={colorClass}>{isPositive ? '↑' : '↓'}</span>
      <span className="text-muted-foreground">{label1}</span>
      <span className={`font-bold ${colorClass}`}>{Math.abs(value)}%</span>
      <span className="text-muted-foreground">{label2}</span>
    </div>
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
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Box className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Containers</p>
            <h3 className="text-2xl font-bold mt-1">{totalContainers}</h3>
            <TrendIndicator value={totalContainersTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Running</p>
            <h3 className="text-2xl font-bold mt-1">{runningContainers}</h3>
            <TrendIndicator value={runningContainersTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <PauseCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stopped</p>
            <h3 className="text-2xl font-bold mt-1">{stoppedContainers}</h3>
            <TrendIndicator value={stoppedContainersTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <XCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Exited</p>
            <h3 className="text-2xl font-bold mt-1">{exitedContainers}</h3>
            <TrendIndicator value={exitedContainersTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
            <Package className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Images</p>
            <h3 className="text-2xl font-bold mt-1">{totalImages}</h3>
            <TrendIndicator value={totalImagesTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
