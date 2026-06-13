"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  FileText,
  ChevronDown,
  Info,
  Plus,
  Rocket
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DeployPage() {
  const [deployType, setDeployType] = useState<"zip" | "github" | "docker">("zip");

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Deployment Configuration */}
        <div className="flex-1">
          <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6 space-y-8">
            <h2 className="text-xl font-bold text-slate-900">Deployment Configuration</h2>

            {/* Project Name */}
            <div>
              <label className="block text-[14px] font-bold text-slate-900">Project Name</label>
              <p className="text-[13px] text-slate-500 mb-2">Enter a name for your project</p>
              <div className="relative">
                <Input
                  defaultValue="my-new-project"
                  className="pr-10 h-11 text-[14px] font-medium text-slate-700 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20"
                />
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Deployment Type */}
            <div>
              <label className="block text-[14px] font-bold text-slate-900">Deployment Type</label>
              <p className="text-[13px] text-slate-500 mb-3">Choose how you want to deploy your application</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Type: ZIP */}
                <button
                  onClick={() => setDeployType("zip")}
                  className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 text-center transition-all ${
                    deployType === "zip" 
                      ? "border-blue-500 bg-blue-50/30" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className={`absolute top-3 left-3 w-4 h-4 rounded-full border-2 flex items-center justify-center ${deployType === "zip" ? "border-blue-500" : "border-slate-300"}`}>
                    {deployType === "zip" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${deployType === "zip" ? "bg-blue-100 text-blue-600" : "bg-slate-50 text-slate-400"}`}>
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <h3 className={`text-[14px] font-bold mb-1 ${deployType === "zip" ? "text-slate-900" : "text-slate-700"}`}>Upload ZIP</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Upload your application as a ZIP file</p>
                </button>

                {/* Type: GitHub */}
                <button
                  onClick={() => setDeployType("github")}
                  className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 text-center transition-all ${
                    deployType === "github" 
                      ? "border-blue-500 bg-blue-50/30" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className={`absolute top-3 left-3 w-4 h-4 rounded-full border-2 flex items-center justify-center ${deployType === "github" ? "border-blue-500" : "border-slate-300"}`}>
                    {deployType === "github" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${deployType === "github" ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-400"}`}>
                    <FaGithub className="w-6 h-6" />
                  </div>
                  <h3 className={`text-[14px] font-bold mb-1 ${deployType === "github" ? "text-slate-900" : "text-slate-700"}`}>Connect GitHub</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Connect and deploy from a GitHub repository</p>
                </button>

                {/* Type: Dockerfile */}
                <button
                  onClick={() => setDeployType("docker")}
                  className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 text-center transition-all ${
                    deployType === "docker" 
                      ? "border-blue-500 bg-blue-50/30" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className={`absolute top-3 left-3 w-4 h-4 rounded-full border-2 flex items-center justify-center ${deployType === "docker" ? "border-blue-500" : "border-slate-300"}`}>
                    {deployType === "docker" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${deployType === "docker" ? "bg-purple-100 text-purple-600" : "bg-slate-50 text-slate-400"}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className={`text-[14px] font-bold mb-1 ${deployType === "docker" ? "text-slate-900" : "text-slate-700"}`}>Custom Dockerfile</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Define your own Dockerfile and build settings</p>
                </button>

              </div>
            </div>

            {/* Upload ZIP Details (Active state) */}
            <div className={`${deployType === "zip" ? "block" : "hidden"} transition-all duration-300`}>
              <label className="block text-[14px] font-bold text-slate-900">Upload ZIP File</label>
              <p className="text-[13px] text-slate-500 mb-3">Select a ZIP file of your application</p>
              
              <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                <CloudUpload className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-[14px] font-bold text-slate-700 mb-3">
                  Drag & drop your ZIP file here<br/>
                  <span className="text-[13px] font-normal text-slate-500">or</span>
                </p>
                <Button variant="outline" className="h-9 px-6 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg shadow-sm">
                  Browse File
                </Button>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-slate-400">
                <Info className="w-3.5 h-3.5" />
                <span className="text-[12px]">Maximum file size: 100MB</span>
              </div>
            </div>

            {/* GitHub Accordion (Inactive state) */}
            <div className="py-4 border-b border-t border-slate-100 flex items-center justify-between cursor-pointer group">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 mb-0.5">GitHub Repository</h3>
                <p className="text-[13px] text-slate-500">Connect your GitHub repository</p>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>

            {/* Dockerfile Accordion (Inactive state) */}
            <div className="py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer group">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 mb-0.5">Dockerfile</h3>
                <p className="text-[13px] text-slate-500">Define your Dockerfile configuration</p>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Deployment Settings */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6">
            <h2 className="text-[16px] font-bold text-slate-900 mb-5">Deployment Settings</h2>

            <div className="space-y-4">
              
              {/* Domain Config */}
              <div className="border border-slate-100 rounded-xl p-4">
                <label className="block text-[13px] font-bold text-slate-900">Domain Configuration</label>
                <p className="text-[12px] text-slate-500 mb-3">Configure your application domain</p>
                
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Subdomain</label>
                <div className="flex h-[38px] w-full">
                  <input
                    type="text"
                    defaultValue="my-new-project"
                    className="flex-1 min-w-0 px-3 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 border-r-0 rounded-l-lg focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500/20"
                  />
                  <div className="flex-shrink-0 px-3 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-r-lg text-[13px] font-medium text-slate-500">
                    .portdock.id
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 mt-2.5 text-emerald-500">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <span className="text-[12px] font-bold">Domain available</span>
                </div>
              </div>

              {/* Env Variables */}
              <div className="border border-slate-100 rounded-xl p-4">
                <label className="block text-[13px] font-bold text-slate-900">Environment Variables (Optional)</label>
                <p className="text-[12px] text-slate-500 mb-3">Add environment variables for your application</p>
                <button className="flex items-center text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Variable
                </button>
              </div>

              {/* Build Settings */}
              <div className="border border-slate-100 rounded-xl p-4">
                <label className="block text-[13px] font-bold text-slate-900">Build Settings</label>
                <p className="text-[12px] text-slate-500 mb-4">Configure build and runtime settings</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium text-slate-700">Node Version</label>
                    <div className="relative w-48">
                      <select className="w-full h-[36px] px-3 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg appearance-none outline-none focus:border-blue-500 cursor-pointer">
                        <option>18 (LTS)</option>
                        <option>20 (Latest)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium text-slate-700">Port</label>
                    <Input defaultValue="3000" className="w-48 h-[36px] text-[13px] font-medium text-slate-700 bg-white border-slate-200 rounded-lg focus-visible:ring-blue-500/20" />
                  </div>
                </div>
              </div>

              {/* Resource Limits */}
              <div className="border border-slate-100 rounded-xl p-4">
                <label className="block text-[13px] font-bold text-slate-900">Resource Limits</label>
                <p className="text-[12px] text-slate-500 mb-3">Set resource limits for your container</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Memory Limit</label>
                    <div className="relative">
                      <select className="w-full h-[36px] px-3 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg appearance-none outline-none focus:border-blue-500 cursor-pointer">
                        <option>512 MB</option>
                        <option>1024 MB</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-slate-500 mb-1.5">CPU Limit</label>
                    <div className="relative">
                      <select className="w-full h-[36px] px-3 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg appearance-none outline-none focus:border-blue-500 cursor-pointer">
                        <option>1 vCPU</option>
                        <option>2 vCPU</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Deploy Button */}
            <div className="mt-6">
              <Button className="w-full h-[46px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[14px] transition-all">
                <Rocket className="w-4 h-4 mr-2" /> Deploy Project
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
