import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Plus, Eye, EyeOff, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

interface EnvVar {
  key: string;
  value: string;
  show?: boolean;
}

interface SettingsEnvVarsProps {
  envs: EnvVar[];
  setEnvs: (v: EnvVar[]) => void;
  setIsDirty: (v: boolean) => void;
}

export function SettingsEnvVars({ envs, setEnvs, setIsDirty }: SettingsEnvVarsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const lines = text.split('\n');
        const newEnvs: EnvVar[] = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          
          const equalIdx = trimmed.indexOf('=');
          if (equalIdx > 0) {
            const key = trimmed.slice(0, equalIdx).trim();
            let value = trimmed.slice(equalIdx + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            newEnvs.push({ key, value });
          }
        }
        
        if (newEnvs.length > 0) {
          const filtered = envs.filter(e => e.key.trim() !== "");
          setEnvs([...filtered, ...newEnvs]);
          setIsDirty(true);
          toast.success(`${newEnvs.length} variables imported successfully`);
        } else {
          toast.error("No valid variables found in the file");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const addEnv = () => { 
    setEnvs([...envs, { key: "", value: "" }]); 
    setIsDirty(true); 
  };
  
  const removeEnv = (index: number) => { 
    setEnvs(envs.filter((_, i) => i !== index)); 
    setIsDirty(true); 
  };

  const handleEnvChange = (index: number, field: 'key' | 'value', val: string) => {
    const newEnvs = [...envs];
    newEnvs[index][field] = val;
    setEnvs(newEnvs);
    setIsDirty(true);
  };

  return (
    <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden border p-0 gap-0">
      <CardHeader className="border-b border-border bg-muted/50 pt-6 px-6 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" /> Environment Variables
            </CardTitle>
            <CardDescription className="mt-1">Securely inject runtime configurations.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept=".env,text/plain" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="h-8 text-xs font-semibold text-emerald-600 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20">
              <Upload className="w-3.5 h-3.5 mr-1" /> Import .env
            </Button>
            <Button onClick={addEnv} variant="outline" size="sm" className="h-8 text-xs font-semibold text-blue-600 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Var
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {envs.map((env, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div className="flex-1 space-y-1.5">
              <Input 
                placeholder="KEY (e.g. DATABASE_URL)" 
                value={env.key} 
                onChange={(e) => handleEnvChange(idx, 'key', e.target.value)}
                className="h-10 font-mono text-sm border-border focus-visible:ring-emerald-500 bg-card" 
              />
            </div>
            <div className="flex-1 space-y-1.5 relative">
              <Input 
                placeholder="Value" 
                value={env.value} 
                onChange={(e) => handleEnvChange(idx, 'value', e.target.value)}
                type={env.show ? "text" : "password"} 
                className="h-10 font-mono text-sm border-border focus-visible:ring-emerald-500 bg-card pr-10" 
              />
              <button
                type="button"
                className="absolute right-3 top-[9px] text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const newEnvs = [...envs];
                  newEnvs[idx].show = !newEnvs[idx].show;
                  setEnvs(newEnvs);
                }}
              >
                {env.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button onClick={() => removeEnv(idx)} variant="outline" className="h-10 w-10 p-0 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 border-border hover:border-red-500/30 hover:bg-red-500/10 shrink-0 bg-card">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {envs.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground bg-muted rounded-xl border border-dashed border-border">
            No environment variables configured.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
