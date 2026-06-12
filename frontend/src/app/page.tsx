"use client";

import Link from "next/link";
import { LANDING_FEATURES, LANDING_STEPS } from "@/constants/landing";
import { APP_CONFIG } from "@/constants/config";
import {
  Container,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/shared/Navbar";
import HeroSection from "@/components/shared/HeroSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Platform lengkap untuk deployment, monitoring, dan manajemen container Docker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDING_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-200"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Cara Kerja Portdock</h2>
            <p className="text-gray-500">Deploy aplikasi Anda dalam 4 langkah mudah</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {LANDING_STEPS.map((step, i) => (
              <div key={step.step} className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 portdock-gradient rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl shadow-blue-500/20">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Siap untuk Memulai?
          </h2>
          <p className="text-blue-100/80 mb-8">
            Daftar sekarang dan deploy aplikasi pertama Anda dalam hitungan menit.
          </p>
          <Link href="/register">
            <Button
              id="btn-get-started-cta"
              size="lg"
              className="h-12 px-10 bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xl text-base"
            >
              Mulai Sekarang — Gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center text-gray-400 text-sm bg-white">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 portdock-gradient rounded-lg flex items-center justify-center">
            <Container className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Portdock</span>
        </div>
        <p>© {APP_CONFIG.year} {APP_CONFIG.name} by {APP_CONFIG.author}. All rights reserved.</p>
      </footer>
    </div>
  );
}
