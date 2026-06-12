"use client";

import Link from "next/link";
import { Shield, Zap, Lock, BookOpen } from "lucide-react";
import DashboardMockup from "./DashboardMockup";
import { TRUST_BADGES } from "@/constants/hero";

/* ── Icon map for trust badges ── */
const BADGE_ICONS = { shield: Shield, zap: Zap, lock: Lock } as const;

export default function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-24 pb-16 overflow-hidden bg-gradient-to-br from-white via-blue-50/40 to-white dark:from-background dark:via-blue-950/20 dark:to-background transition-colors duration-300">
      {/* Background decoration */}
      <BackgroundDecor />

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <HeroBadge />
            <HeroHeading />
            <HeroDescription />
            <HeroButtons />
            <TrustBadges />
          </div>

          {/* Right */}
          <DashboardMockup />
        </div>
      </div>

      {/* Float animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  );
}

/* ── Sub-components ── */

function BackgroundDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #2563eb 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-100/60 dark:bg-blue-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-blue-50/80 dark:bg-blue-900/10 rounded-full blur-3xl" />
    </div>
  );
}

function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full px-4 py-1.5 transition-colors">
      <span className="text-base">🐳</span>
      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Docker Deployment Made Simple</span>
    </div>
  );
}

function HeroHeading() {
  return (
    <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] text-foreground tracking-tight transition-colors">
      Deploy Applications
      <br />
      in{" "}
      <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
        Minutes
      </span>
    </h1>
  );
}

function HeroDescription() {
  return (
    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg transition-colors">
      Platform otomatisasi deployment berbasis Docker dengan dukungan ZIP Upload,
      GitHub Integration, Monitoring, Web Terminal, dan SSL Otomatis.
    </p>
  );
}

function HeroButtons() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Link href="/register">
        <button
          id="btn-start-deploying"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-7 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 text-sm"
        >
          <Zap className="w-4 h-4" />
          Start Deploying
        </button>
      </Link>
      <Link href="#docs">
        <button className="inline-flex items-center gap-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-[#1e293b] text-gray-700 dark:text-slate-300 font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-sm shadow-sm">
          <BookOpen className="w-4 h-4" />
          Documentation
        </button>
      </Link>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="flex items-center gap-6 flex-wrap pt-2">
      {TRUST_BADGES.map((item) => {
        const Icon = BADGE_ICONS[item.type];
        return (
          <div key={item.label} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400">
            <Icon className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
