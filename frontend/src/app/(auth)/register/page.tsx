"use client";

import Link from "next/link";
import { ArrowLeft, Rocket, Sparkles, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background text-slate-900 dark:text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Dot Pattern Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 w-full px-6 py-6 flex items-center justify-end max-w-7xl mx-auto">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-[500px] bg-white dark:bg-card border-white/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none rounded-2xl overflow-hidden animate-fade-in">
          <CardContent className="px-8 py-6">
            {/* Header Area */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Create Your Account
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Join Portdock and start deploying in minutes.
              </p>
            </div>
              
            <RegisterForm />

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
