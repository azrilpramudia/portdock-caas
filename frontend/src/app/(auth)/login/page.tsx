"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Container, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, initialize } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(`Selamat datang, ${data.user.name}!`);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login gagal");
    },
  });

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

            <form
              onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@contoh.com"
                  {...register("email")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                id="btn-login"
                disabled={loginMutation.isPending}
                className="w-full h-11 portdock-gradient hover:opacity-90 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 Portdock. All rights reserved.
        </p>
      </div>
    </div>
  );
}
