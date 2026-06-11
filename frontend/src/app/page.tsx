"use client";

import Link from "next/link";
import {
  Container,
  Rocket,
  BarChart3,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Terminal,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Rocket,
    title: "Deploy Instan",
    description: "Deploy aplikasi dari ZIP atau GitHub dalam hitungan klik tanpa konfigurasi rumit.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Container,
    title: "Docker Native",
    description: "Terintegrasi langsung dengan Docker Engine untuk manajemen container yang powerful.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: BarChart3,
    title: "Real-time Monitoring",
    description: "Pantau CPU, RAM, dan Network usage container Anda secara real-time dengan grafik interaktif.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Shield,
    title: "Keamanan JWT",
    description: "Autentikasi aman dengan JWT dan enkripsi password menggunakan bcrypt.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Globe,
    title: "Manajemen Domain",
    description: "Konfigurasi domain kustom dan subdomain untuk setiap aplikasi Anda.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: Zap,
    title: "Auto Dockerfile",
    description: "Portdock otomatis mendeteksi runtime dan membuat Dockerfile yang optimal.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
];

const steps = [
  { step: "01", title: "Buat Project", description: "Pilih nama dan metode deployment" },
  { step: "02", title: "Upload / GitHub", description: "Upload ZIP atau connect ke repositori" },
  { step: "03", title: "Build Otomatis", description: "Docker image dibangun secara otomatis" },
  { step: "04", title: "Aplikasi Online", description: "Akses aplikasi melalui URL yang digenerate" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 portdock-gradient rounded-xl flex items-center justify-center">
            <Container className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Portdock</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button id="btn-get-started-nav" className="portdock-gradient text-white hover:opacity-90 shadow-lg shadow-blue-500/25">
              Mulai Gratis
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1.5 text-sm">
            🚀 Platform Deployment Docker — Self-Hosted
          </Badge>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Deploy Aplikasi{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Lebih Cepat
            </span>{" "}
            <br />dengan Docker
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Portdock menyederhanakan proses deployment dari source code hingga aplikasi online.
            Tanpa perlu memahami Docker, Nginx, atau SSL secara mendalam.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button
                id="btn-get-started-hero"
                size="lg"
                className="h-12 px-8 portdock-gradient text-white hover:opacity-90 shadow-xl shadow-blue-500/25 text-base"
              >
                Mulai Gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-white/10 text-slate-300 hover:bg-white/5 text-base"
              >
                Masuk ke Akun
              </Button>
            </Link>
          </div>

          {/* Badges */}
          <div className="flex items-center justify-center gap-6 mt-12 flex-wrap text-sm text-slate-500">
            {["100% Self-Hosted", "Open Source", "Docker Native", "JWT Auth"].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#0f172a]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Platform lengkap untuk deployment, monitoring, dan manajemen container Docker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Cara Kerja Portdock</h2>
            <p className="text-slate-400">Deploy aplikasi Anda dalam 4 langkah mudah</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <div key={step.step} className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 portdock-gradient rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20">
          <h2 className="text-3xl font-bold mb-4">
            Siap untuk Memulai?
          </h2>
          <p className="text-slate-400 mb-8">
            Daftar sekarang dan deploy aplikasi pertama Anda dalam hitungan menit.
          </p>
          <Link href="/register">
            <Button
              id="btn-get-started-cta"
              size="lg"
              className="h-12 px-10 portdock-gradient text-white hover:opacity-90 shadow-xl shadow-blue-500/25 text-base"
            >
              Mulai Sekarang — Gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 portdock-gradient rounded-lg flex items-center justify-center">
            <Container className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">Portdock</span>
        </div>
        <p>© 2024 Portdock by Azril Pramudia. All rights reserved.</p>
      </footer>
    </div>
  );
}
