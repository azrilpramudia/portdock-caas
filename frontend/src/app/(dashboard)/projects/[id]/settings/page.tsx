"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Plus, Trash2, ShieldAlert, Globe, Server, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [envs, setEnvs] = useState<{key: string, value: string}[]>([]);

  const addEnv = () => setEnvs([...envs, { key: "", value: "" }]);
  const removeEnv = (index: number) => setEnvs(envs.filter((_, i) => i !== index));

  return (
    <div className="w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/projects" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-slate-700" />
            Project Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage configuration, environments, and lifecycle for project <span className="font-semibold text-slate-700">prj-{projectId}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 px-5 text-[13px] font-semibold border-slate-200">
            Cancel
          </Button>
          <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Settings */}
          <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" /> General Details
              </CardTitle>
              <CardDescription>Update the basic information of your project.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Project Name</Label>
                <Input defaultValue="" className="h-11 border-slate-200 focus-visible:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Description</Label>
                <textarea 
                  className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                />
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-600" /> Environment Variables
                  </CardTitle>
                  <CardDescription className="mt-1">Securely inject runtime configurations.</CardDescription>
                </div>
                <Button onClick={addEnv} variant="outline" size="sm" className="h-8 text-xs font-semibold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Var
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {envs.map((env, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-1.5">
                    <Input placeholder="KEY (e.g. DATABASE_URL)" defaultValue={env.key} className="h-10 font-mono text-sm border-slate-200 focus-visible:ring-emerald-500" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Input placeholder="Value" defaultValue={env.value} type="password" className="h-10 font-mono text-sm border-slate-200 focus-visible:ring-emerald-500" />
                  </div>
                  <Button onClick={() => removeEnv(idx)} variant="outline" className="h-10 w-10 p-0 text-slate-400 hover:text-red-600 border-slate-200 hover:border-red-200 hover:bg-red-50 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {envs.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No environment variables configured.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
          
          {/* Domain Configuration */}
          <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" /> Custom Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Map a custom domain to this project. We will automatically provision an SSL certificate via Let's Encrypt.
              </p>
              <div className="space-y-2">
                <Label className="text-[13px] text-slate-700 font-semibold">Domain Name</Label>
                <div className="flex gap-2">
                  <Input placeholder="www.example.com" className="h-9 text-sm border-slate-200 focus-visible:ring-indigo-500" />
                  <Button className="h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs">Verify</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-red-100 bg-red-50/50 pb-4">
              <CardTitle className="text-base text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Permanently remove this project and all of its associated containers, logs, and environments. This action cannot be undone.
              </p>
              <Button className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 font-bold transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
