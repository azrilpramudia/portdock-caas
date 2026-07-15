"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn } from "lucide-react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginFormSchema } from "@/lib/validations/auth";
import { useLoginMutation } from "@/hooks/useAuthQueries";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";


export function LoginForm() {
  
  const [twoFactorState, setTwoFactorState] = useState<'none' | 'setup' | 'verify'>('none');
  const [tempToken, setTempToken] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const queryClient = useQueryClient();
  const [isLoading2fa, setIsLoading2fa] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileError, setTurnstileError] = useState<string>("");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();

  const onSubmit = (data: LoginFormSchema) => {
    if (!turnstileToken && process.env.NODE_ENV !== "development") {
      // Allow bypass in dev if env var is missing, otherwise enforce
      if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
        setTurnstileError("Please complete the verification");
        return;
      }
    }
    setTurnstileError("");
    loginMutation.mutate(
      { ...data, turnstileToken },
      {
        
        onSuccess: async (data: any) => {
          if (data.requires2faSetup) {
            setTempToken(data.tempToken);
            setTwoFactorState('setup');
            
            // Fetch setup QR code
            try {
              const res = await api.post('/auth/2fa/setup', {}, {
                headers: { Authorization: `Bearer ${data.tempToken}` }
              });
              setQrCodeUrl(res.data.qrCode);
            } catch (err: any) {
              toast.error(err?.response?.data?.message || 'Failed to initialize 2FA setup');
              setTwoFactorState('none');
            }
          } else if (data.requires2fa) {
            setTempToken(data.tempToken);
            setTwoFactorState('verify');
          } else {
            // Normal login success, handled by hook usually, but let's ensure we reset
            setTwoFactorState('none');
          }
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          if (msg && msg.includes('locked')) {
            toast.error(msg, { duration: 5000 });
          }

          turnstileRef.current?.reset();
          setTurnstileToken("");
        },
      }
    );
  };

  
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading2fa(true);
    try {
      const res = await api.post('/auth/2fa/verify', {
        token: otpCode,
        setupToken: tempToken,
        isSetup: twoFactorState === 'setup'
      });
      
      // Manually store token and user since we bypass useLoginMutation's onSuccess partially if it returns early
      // The hook might need to be adjusted, or we just manually reload
      localStorage.setItem("auth-storage", JSON.stringify({ state: { user: res.data.user, token: res.data.token, isAuthenticated: true }, version: 0 }));
      toast.success("Login successful");
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP code");
    } finally {
      setIsLoading2fa(false);
    }
  };

  if (twoFactorState !== 'none') {
    return (
      <form onSubmit={handleVerify2FA} className="space-y-4 w-full text-center">
        <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
        {twoFactorState === 'setup' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Scan this QR code with Google Authenticator to setup 2FA.</p>
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} alt="2FA QR Code" width={150} height={150} />
            ) : (
              <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            )}
          </div>
        )}
        <div className="space-y-1.5 mt-4 text-left">
          <Label className="text-sm font-semibold">Enter 6-digit OTP</Label>
          <Input 
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-widest h-12"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading2fa || otpCode.length < 6}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg mt-2"
        >
          {isLoading2fa ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Verify & Login
        </Button>
        <Button type="button" variant="ghost" onClick={() => setTwoFactorState('none')} className="w-full mt-2">
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full"
    >
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold">
          {t.auth.email}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className="pl-10 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-10 transition-all rounded-lg"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold">
          {t.auth.password}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            className="pl-10 pr-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-10 transition-all rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <Link 
          href="#" 
          className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="pt-2 pb-1 flex flex-col items-center">
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => {
              setTurnstileToken(token);
              setTurnstileError("");
            }}
            options={{ theme: "auto" }}
          />
        )}
        {turnstileError && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{turnstileError}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] mt-1"
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t.auth.loggingIn}
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            {t.auth.loginBtn}
          </>
        )}
      </Button>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-card px-3 text-slate-500 dark:text-slate-400 font-medium">or</span>
        </div>
      </div>

      <p className="text-center text-[13px] text-slate-600 dark:text-slate-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
