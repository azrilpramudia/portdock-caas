import { Settings, RefreshCw } from "lucide-react";

interface SettingsTabProps {
  container: any;
  memoryLimit: number;
  setMemoryLimit: (val: number) => void;
  cpuLimit: number;
  setCpuLimit: (val: number) => void;
  restartPolicy: string;
  setRestartPolicy: (val: string) => void;
  volumeMountPath: string;
  setVolumeMountPath: (val: string) => void;
  internalPort: number | '';
  setInternalPort: (val: number | '') => void;
  handleSaveResources: () => void;
  isSavingResources: boolean;
}

export function SettingsTab({
  container,
  memoryLimit,
  setMemoryLimit,
  cpuLimit,
  setCpuLimit,
  restartPolicy,
  setRestartPolicy,
  volumeMountPath,
  setVolumeMountPath,
  internalPort,
  setInternalPort,
  handleSaveResources,
  isSavingResources
}: SettingsTabProps) {
  return (
    <div className="bg-muted/20 dark:bg-gray-900 border border-border dark:border-slate-800 rounded-xl p-6 shadow-inner text-left">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground dark:text-slate-200">Hardware Allocation</h3>
          <p className="text-xs text-muted-foreground dark:text-slate-400">Limit the maximum resources this container can consume.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Memory Limits */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">Memory Limit (RAM)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[128, 256, 512].map((val) => (
              <button
                key={val}
                onClick={() => setMemoryLimit(val)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                  memoryLimit === val 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                    : 'bg-background dark:bg-slate-900 border-border dark:border-slate-800 text-muted-foreground dark:text-slate-400 hover:border-foreground/30 dark:hover:border-slate-700 hover:text-foreground dark:hover:text-slate-300'
                }`}
              >
                {`${val} MB`}
              </button>
            ))}
          </div>
        </div>

        {/* CPU Limits */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">CPU Core Limit</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[0.25, 0.5, 1.0].map((val) => (
              <button
                key={val}
                onClick={() => setCpuLimit(val)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                  cpuLimit === val 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                    : 'bg-background dark:bg-slate-900 border-border dark:border-slate-800 text-muted-foreground dark:text-slate-400 hover:border-foreground/30 dark:hover:border-slate-700 hover:text-foreground dark:hover:text-slate-300'
                }`}
              >
                {`${val} Core${val > 1 ? 's' : ''}`}
              </button>
            ))}
          </div>
        </div>

        {/* Restart Policies */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">Restart Policy</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { value: 'no', label: 'No (Off)', desc: 'Never restart automatically' },
              { value: 'always', label: 'Always', desc: 'Always restart if it stops' },
              { value: 'on-failure', label: 'On Failure', desc: 'Restart only if it crashes' },
              { value: 'unless-stopped', label: 'Unless Stopped', desc: 'Restart unless manually stopped' },
            ].map((policy) => (
              <button
                key={policy.value}
                onClick={() => setRestartPolicy(policy.value)}
                className={`flex flex-col items-start p-3 rounded-lg text-left border transition-all ${
                  restartPolicy === policy.value 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                    : 'bg-background dark:bg-slate-900 border-border dark:border-slate-800 hover:border-foreground/30 dark:hover:border-slate-700'
                }`}
              >
                <span className={`text-sm font-medium ${restartPolicy === policy.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground dark:text-slate-300'}`}>
                  {policy.label}
                </span>
                <span className={`text-xs mt-0.5 ${restartPolicy === policy.value ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-muted-foreground dark:text-slate-500'}`}>
                  {policy.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Volume Mounts */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">
            Persistent Volume Mount (Max 2GB)
          </label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="/app/data" 
              value={volumeMountPath}
              onChange={(e) => setVolumeMountPath(e.target.value)}
              className="w-full bg-background dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-foreground dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-muted-foreground/50"
            />
            <p className="text-xs text-muted-foreground dark:text-slate-500 mt-2">
              Specify a folder path inside the container to make its contents persistent across restarts. Leave blank for no persistent volume. Note: changing this will recreate the container.
            </p>
          </div>
        </div>

        {/* Internal Port */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground/80 dark:text-slate-300">
            Target Internal Port
          </label>
          <div className="relative">
            <input 
              type="number" 
              placeholder="80" 
              value={internalPort}
              onChange={(e) => setInternalPort(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full bg-background dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-foreground dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-muted-foreground/50"
            />
            <p className="text-xs text-muted-foreground dark:text-slate-500 mt-2">
              Port di mana aplikasi Anda (Nginx/Node.js) berjalan di dalam kontainer. Mengubah pengaturan ini akan merakit ulang kontainer saat Anda menekan Restart.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-border dark:border-slate-800">
          <button 
            onClick={handleSaveResources}
            disabled={isSavingResources || (memoryLimit === container.memoryLimit && cpuLimit === container.cpuLimit && restartPolicy === (container.restartPolicy || 'unless-stopped') && volumeMountPath === (container.volumeMountPath || '') && internalPort === (container.internalPort || 80))}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSavingResources ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
