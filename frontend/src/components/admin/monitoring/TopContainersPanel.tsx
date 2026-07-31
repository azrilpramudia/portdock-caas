import { Box } from 'lucide-react';

interface ContainerData {
  id: string;
  name: string;
  project: string;
  cpu: number;
  ram: number;
}

interface TopContainersPanelProps {
  topContainers: ContainerData[];
}

export function TopContainersPanel({ topContainers }: TopContainersPanelProps) {
  return (
    <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-2 xl:col-span-2 w-full h-full">
      {/* Top Containers CPU */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-foreground">Top Containers by CPU</h3>
          <span className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">View all</span>
        </div>
        <div className="space-y-5">
          {topContainers.map((item, i) => {
            const colors = [
              { bg: 'bg-blue-500/10', text: 'text-blue-500', fill: 'bg-blue-500' },
              { bg: 'bg-indigo-500/10', text: 'text-indigo-500', fill: 'bg-indigo-500' },
              { bg: 'bg-emerald-500/10', text: 'text-emerald-500', fill: 'bg-emerald-500' },
              { bg: 'bg-amber-500/10', text: 'text-amber-500', fill: 'bg-amber-500' },
              { bg: 'bg-purple-500/10', text: 'text-purple-500', fill: 'bg-purple-500' }
            ];
            const colorBase = colors[i % colors.length];
            return (
              <div key={item.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${colorBase.bg} flex items-center justify-center flex-shrink-0`}>
                  <Box className={`w-5 h-5 ${colorBase.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="truncate pr-2">
                      <p className="text-sm font-bold text-foreground leading-none mb-1 truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground leading-none truncate">{item.project}</p>
                    </div>
                    <span className="text-sm font-bold shrink-0">{item.cpu}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${colorBase.fill} rounded-full`} style={{ width: `${Math.min(100, item.cpu)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          {topContainers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No containers running</p>
          )}
        </div>
      </div>

      {/* Top Containers RAM */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-foreground">Top Containers by RAM</h3>
          <span className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">View all</span>
        </div>
        <div className="space-y-5">
          {[...topContainers].sort((a, b) => b.ram - a.ram).map((item, i) => {
            const colors = [
              { bg: 'bg-purple-500/10', text: 'text-purple-500', fill: 'bg-purple-500' },
              { bg: 'bg-emerald-500/10', text: 'text-emerald-500', fill: 'bg-emerald-500' },
              { bg: 'bg-sky-500/10', text: 'text-sky-500', fill: 'bg-sky-500' },
              { bg: 'bg-orange-500/10', text: 'text-orange-500', fill: 'bg-orange-500' },
              { bg: 'bg-blue-500/10', text: 'text-blue-500', fill: 'bg-blue-500' }
            ];
            const colorBase = colors[i % colors.length];
            return (
              <div key={item.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${colorBase.bg} flex items-center justify-center flex-shrink-0`}>
                  <Box className={`w-5 h-5 ${colorBase.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="truncate pr-2">
                      <p className="text-sm font-bold text-foreground leading-none mb-1 truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground leading-none truncate">{item.project}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{item.ram}%</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${colorBase.fill} rounded-full`} style={{ width: `${Math.min(100, item.ram)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          {topContainers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No containers running</p>
          )}
        </div>
      </div>
    </div>
  );
}
