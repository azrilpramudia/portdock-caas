"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-700/5 rounded-full blur-3xl" />
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
            Platform deployment aplikasi berbasis Docker
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-white mb-1">
                Masuk ke akun Anda
              </h1>
              <p className="text-slate-400 text-sm">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>

            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 Portdock. All rights reserved.
        </p>
      </div>
    </div>
  );
}
