"use client";

import Link from "next/link";
import { Container } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-700/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 portdock-gradient rounded-xl flex items-center justify-center shadow-lg">
              <Container className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Portdock</span>
          </div>
          <p className="text-slate-400 text-sm">
            Mulai deploy aplikasi Anda hari ini
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-white mb-1">
                Buat akun baru
              </h1>
              <p className="text-slate-400 text-sm">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Masuk sekarang
                </Link>
              </p>
            </div>

            <RegisterForm />
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 Portdock. All rights reserved.
        </p>
      </div>
    </div>
  );
}
