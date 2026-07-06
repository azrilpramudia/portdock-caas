import { Box, CheckCircle2, PauseCircle, XCircle, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ContainerStatsProps {
  totalContainers: number;
  runningContainers: number;
  stoppedContainers: number;
  exitedContainers: number;
  totalImages: number;
}

export function ContainerStats({
  totalContainers,
  runningContainers,
  stoppedContainers,
  exitedContainers,
  totalImages
}: ContainerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0">
            <Box className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Containers</p>
            <h3 className="text-2xl font-bold mt-1">{totalContainers}</h3>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              ↑ 7% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
            <CheckCircle2 className="w-6 h-6 fill-current text-white dark:text-emerald-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Running</p>
            <h3 className="text-2xl font-bold mt-1">{runningContainers}</h3>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              ↑ 8% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <PauseCircle className="w-6 h-6 fill-current text-white dark:text-amber-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stopped</p>
            <h3 className="text-2xl font-bold mt-1">{stoppedContainers}</h3>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              ↑ 6% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <XCircle className="w-6 h-6 fill-current text-white dark:text-rose-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Exited</p>
            <h3 className="text-2xl font-bold mt-1">{exitedContainers}</h3>
            <p className="text-xs font-medium text-rose-500 mt-1 flex items-center">
              ↓ 2% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-500 shrink-0">
            <Package className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Images</p>
            <h3 className="text-2xl font-bold mt-1">{totalImages}</h3>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              ↑ 10% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
