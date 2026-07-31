import { FileText, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NginxLogsTerminalProps {
  nginxTerminalRef: React.RefObject<HTMLDivElement>;
  isNginxConnected: boolean;
  nginxLogType: 'access' | 'error';
  setNginxLogType: (type: 'access' | 'error') => void;
  handleNginxConnect: (type?: 'access' | 'error') => void;
  handleNginxDisconnect: () => void;
  handleNginxClear: () => void;
  handleNginxDownload: () => void;
}

export function NginxLogsTerminal({
  nginxTerminalRef,
  isNginxConnected,
  nginxLogType,
  setNginxLogType,
  handleNginxConnect,
  handleNginxDisconnect,
  handleNginxClear,
  handleNginxDownload,
}: NginxLogsTerminalProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[650px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-border bg-muted/30 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Nginx Log Viewer</h3>
            <p className="text-xs text-muted-foreground">Real-time streaming from /var/log/nginx/</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Log Type Toggle */}
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => {
                if (isNginxConnected) {
                  handleNginxConnect("error");
                } else {
                  setNginxLogType("error");
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                nginxLogType === 'error' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Error Log
            </button>
            <button
              onClick={() => {
                if (isNginxConnected) {
                  handleNginxConnect("access");
                } else {
                  setNginxLogType("access");
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                nginxLogType === 'access' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Access Log
            </button>
          </div>

          {!isNginxConnected ? (
            <Button size="sm" onClick={() => handleNginxConnect()} className="h-8 text-xs">
              Connect
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={handleNginxDisconnect} className="h-8 text-xs">
              Disconnect
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleNginxClear} className="h-8 text-xs">
            Clear
          </Button>
          <Button size="sm" variant="outline" onClick={handleNginxDownload} className="h-8 text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Download
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-[#111827] p-4 overflow-hidden relative">
        <div ref={nginxTerminalRef} className="w-full h-full" />
        {!isNginxConnected && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
            <div className="text-center space-y-4">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
              <div>
                <Button onClick={() => handleNginxConnect()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Connect to {nginxLogType === 'error' ? 'Error' : 'Access'} Log
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
