import { Box, CheckCircle2, PauseCircle, XCircle, Package, ArrowUp, ArrowDown } from "lucide-react";
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

const TrendIndicator = ({ value, timeframe }: { value?: number, timeframe: string }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  
  return (
    <div className="flex items-start text-[10px] xl:text-[11px] mt-0.5">
      <span className={`font-bold flex items-center shrink-0 ${isPositive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded' : 'text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded'}`}>
        {isPositive ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
        {Math.abs(value)}%
      </span>
      <span className="text-muted-foreground ml-1.5 font-medium leading-tight pt-[1px]">{timeframe}</span>
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
            <TrendIndicator value={totalContainersTrend} timeframe="dari minggu lalu" />
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
            <TrendIndicator value={runningContainersTrend} timeframe="dari minggu lalu" />
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
            <TrendIndicator value={stoppedContainersTrend} timeframe="dari minggu lalu" />
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
            <TrendIndicator value={exitedContainersTrend} timeframe="dari minggu lalu" />
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
            <TrendIndicator value={totalImagesTrend} timeframe="dari minggu lalu" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
