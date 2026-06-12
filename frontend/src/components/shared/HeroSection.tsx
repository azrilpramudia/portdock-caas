"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Zap, Lock, BookOpen } from "lucide-react";
import portdockWhale from "@/assets/portdock.png";

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-br from-white via-blue-50/40 to-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #2563eb 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Soft glow blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-blue-50/80 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5">
              <span className="flex items-center justify-center w-5 h-5">
                🐳
              </span>
              <span className="text-sm font-medium text-blue-700">
                Docker Deployment Made Simple
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] text-gray-900 tracking-tight">
              Deploy Applications
              <br />
              in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Minutes
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-lg">
              Platform otomatisasi deployment berbasis Docker dengan dukungan
              ZIP Upload, GitHub Integration, Monitoring, Web Terminal, dan SSL
              Otomatis.
            </p>

            {/* CTA Buttons */}
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
                <button className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-sm shadow-sm">
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 flex-wrap pt-2">
              {[
                { icon: Shield, label: "SSL Otomatis" },
                { icon: Zap, label: "Deploy Cepat" },
                { icon: Lock, label: "Aman & Terproteksi" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 text-sm text-gray-500"
                >
                  <item.icon className="w-3.5 h-3.5 text-green-500" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative lg:pl-4">
            {/* Floating Docker Whale */}
            <div className="absolute -top-4 right-8 z-10 animate-[float_6s_ease-in-out_infinite]">
              <Image
                src={portdockWhale}
                alt="Docker whale"
                width={100}
                height={84}
                quality={100}
                className="h-20 w-auto object-contain drop-shadow-lg opacity-90"
              />
            </div>

            {/* Cloud decorations */}
            <div className="absolute -top-2 left-12 z-0">
              <svg
                width="80"
                height="40"
                viewBox="0 0 80 40"
                fill="none"
                className="opacity-20"
              >
                <ellipse cx="40" cy="26" rx="30" ry="14" fill="#93c5fd" />
                <ellipse cx="28" cy="20" rx="18" ry="12" fill="#93c5fd" />
                <ellipse cx="52" cy="18" rx="20" ry="14" fill="#93c5fd" />
              </svg>
            </div>
            <div className="absolute top-8 right-2 z-0">
              <svg
                width="60"
                height="30"
                viewBox="0 0 60 30"
                fill="none"
                className="opacity-15"
              >
                <ellipse cx="30" cy="20" rx="22" ry="10" fill="#93c5fd" />
                <ellipse cx="20" cy="15" rx="14" ry="9" fill="#93c5fd" />
                <ellipse cx="40" cy="14" rx="15" ry="10" fill="#93c5fd" />
              </svg>
            </div>

            {/* Dashboard Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-3 h-3 text-white"
                    >
                      <rect
                        x="2"
                        y="6"
                        width="20"
                        height="12"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-semibold tracking-wider">
                    PORTDOCK
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-5 space-y-4">
                {/* Title */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Dashboard
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    Last updated: just now
                  </span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total Projects",
                      value: "12",
                      color: "text-gray-900",
                      bg: "bg-gray-50",
                    },
                    {
                      label: "Running",
                      value: "8",
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "CPU",
                      value: "23%",
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "Memory",
                      value: "45%",
                      color: "text-amber-600",
                      bg: "bg-amber-50",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`${stat.bg} rounded-lg p-2.5 text-center`}
                    >
                      <p className="text-[10px] text-gray-500 mb-0.5">
                        {stat.label}
                      </p>
                      <p className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Container Status Table */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Container Status
                  </p>
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500">
                          <th className="text-left px-3 py-1.5 font-medium">
                            Name
                          </th>
                          <th className="text-left px-3 py-1.5 font-medium">
                            Status
                          </th>
                          <th className="text-left px-3 py-1.5 font-medium">
                            Port
                          </th>
                          <th className="text-left px-3 py-1.5 font-medium">
                            Uptime
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {[
                          {
                            name: "web-app-prod",
                            status: "Running",
                            port: "3000",
                            uptime: "3d 12h",
                            statusColor: "text-green-600",
                            dot: "bg-green-500",
                          },
                          {
                            name: "api-backend",
                            status: "Running",
                            port: "8080",
                            uptime: "7d 4h",
                            statusColor: "text-green-600",
                            dot: "bg-green-500",
                          },
                          {
                            name: "redis-cache",
                            status: "Running",
                            port: "6379",
                            uptime: "12d 1h",
                            statusColor: "text-green-600",
                            dot: "bg-green-500",
                          },
                          {
                            name: "ml-worker",
                            status: "Stopped",
                            port: "5000",
                            uptime: "—",
                            statusColor: "text-gray-400",
                            dot: "bg-gray-300",
                          },
                          {
                            name: "postgres-db",
                            status: "Running",
                            port: "5432",
                            uptime: "30d 2h",
                            statusColor: "text-green-600",
                            dot: "bg-green-500",
                          },
                        ].map((row) => (
                          <tr key={row.name} className="hover:bg-gray-50/50">
                            <td className="px-3 py-1.5 font-medium text-gray-700">
                              {row.name}
                            </td>
                            <td className="px-3 py-1.5">
                              <span
                                className={`inline-flex items-center gap-1 ${row.statusColor}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${row.dot}`}
                                />
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-gray-500 font-mono">
                              :{row.port}
                            </td>
                            <td className="px-3 py-1.5 text-gray-500">
                              {row.uptime}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom float animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>
    </section>
  );
}
