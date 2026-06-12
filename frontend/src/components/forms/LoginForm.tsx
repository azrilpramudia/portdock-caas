"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginFormSchema } from "@/lib/validations/auth";
import { useLoginMutation } from "@/hooks/useAuthQueries";
import Link from "next/link";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();

  return (
    <form
      onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
      className="space-y-4 w-full"
    >
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold">
          Email
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
          Password
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

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] mt-1"
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Login
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
