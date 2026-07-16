import React, { useEffect, useRef, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Terminal, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DeploymentLogsTerminalProps {
  isDeploying: boolean;
  uploadProgress: number;
  deploymentType: string;
  isSuccess: boolean;
  isError: boolean;
  projectId?: string;
  projectName?: string;
  errorMessage?: string;
}

interface LogLine {
  id: string;
  text: string;
  type: 'info' | 'process' | 'success' | 'error';
  timestamp: string;
}

export function DeploymentLogsTerminal({
  isDeploying,
  uploadProgress,
  deploymentType,
  isSuccess,
  isError,
  projectId,
  projectName,
  errorMessage,
}: DeploymentLogsTerminalProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: LogLine['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { id: Math.random().toString(36).substring(7), text, type, timestamp: time }]);
  };

  // Simulate deployment logs based on state
  const hasInitializedRef = useRef(false);

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isDeploying && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      addLog(`Initializing deployment environment for "${projectName || 'project'}"...`, 'info');
      
      const t1 = setTimeout(() => {
        if (deploymentType === 'ZIP') {
          addLog('Preparing to upload ZIP package...', 'process');
        } else if (deploymentType === 'GITHUB') {
          addLog('Connecting to GitHub repository...', 'process');
          const t2 = setTimeout(() => addLog('Cloning source code...', 'process'), 1500);
          timeoutRefs.current.push(t2);
        } else {
          addLog('Parsing custom Dockerfile...', 'process');
        }
      }, 1000);
      timeoutRefs.current.push(t1);
    }
  }, [isDeploying, deploymentType, projectName]);

  // Track upload progress for ZIP
  const prevProgressRef = useRef(0);
  
  useEffect(() => {
    if (deploymentType === 'ZIP' && isDeploying) {
      if (uploadProgress > 0 && uploadProgress < 100) {
        if (prevProgressRef.current === 0) {
          addLog(`Uploading source code... ${uploadProgress}%`, 'process');
          prevProgressRef.current = uploadProgress;
        } else if (uploadProgress - prevProgressRef.current >= 25) {
          addLog(`Upload progress: ${uploadProgress}%`, 'process');
          prevProgressRef.current = uploadProgress;
        }
      } else if (uploadProgress === 100 && prevProgressRef.current !== 100) {
        prevProgressRef.current = 100;
        addLog('Upload completed 100%', 'success');
        const t1 = setTimeout(() => addLog('Extracting ZIP package...', 'process'), 500);
        const t2 = setTimeout(() => addLog('Building Docker container... (this may take a few minutes)', 'process'), 1500);
        timeoutRefs.current.push(t1, t2);
      }
    }
  }, [uploadProgress, deploymentType, isDeploying]);

  // Handle success/error states
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (isSuccess && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      addLog('Provisioning SSL certificates and routing...', 'process');
      const t1 = setTimeout(() => {
        addLog('Deployment completed successfully!', 'success');
      }, 1000);
      timeoutRefs.current.push(t1);
    }
    
    if (isError && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      timeoutRefs.current.forEach(clearTimeout);
      addLog(`Deployment failed: ${errorMessage || 'Unknown error occurred'}`, 'error');
    }
  }, [isSuccess, isError, errorMessage]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="mx-auto flex items-center gap-2 text-slate-400 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            Deployment Status
          </div>
        </div>

        {/* Terminal Body */}
        <div 
          ref={scrollRef}
          className="p-6 h-[400px] overflow-y-auto font-mono text-sm leading-relaxed"
          style={{ fontFamily: "'Fira Code', 'Courier New', Courier, monospace" }}
        >
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 font-mono text-[13px] leading-relaxed group">
              <span className="text-slate-500 shrink-0">{log.timestamp}</span>
              <span className={
                log.type === 'info' ? 'text-slate-400' :
                log.type === 'process' ? 'text-slate-300' :
                log.type === 'success' ? 'text-green-500' :
                'text-red-500'
              }>
                {log.type === 'error' ? '✖ ' : log.type === 'success' ? '✔ ' : '❯ '}
                {log.text}
              </span>
            </div>
          ))}
          
          {isDeploying && !isSuccess && !isError && (
            <div className="flex gap-4 font-mono text-[13px] leading-relaxed">
              <span className="text-slate-500">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
              <span className="text-blue-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Success Actions */}
      {isSuccess && projectId && (
        <div className="mt-8 flex flex-col items-center animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Deployed Successfully!</h2>
          <p className="text-muted-foreground mb-6">Your project is now live and running.</p>
          
          <Link href={`/projects/${projectId}`}>
            <Button className="h-11 px-8 portdock-gradient text-white font-medium shadow-lg shadow-blue-500/25">
              Go to Dashboard
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {/* Error Actions */}
      {isError && (
        <div className="mt-8 flex flex-col items-center animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Deployment Failed</h2>
          <p className="text-muted-foreground mb-6">Please check the logs and try again.</p>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="h-11 px-8 font-medium"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
