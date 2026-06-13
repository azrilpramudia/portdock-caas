"use client";

import { useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, User, Mail, Lock, UserPlus } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, RegisterFormSchema } from "@/lib/validations/auth";
import { useRegisterMutation } from "@/hooks/useAuthQueries";
import Link from "next/link";

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: "", color: "bg-slate-200 dark:bg-slate-800", textColor: "text-slate-500" };
  
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.match(/(?=.*[a-z])(?=.*[A-Z])/)) score += 1;
  if (password.match(/(?=.*[0-9])/)) score += 1;
  if (password.match(/(?=.*[^A-Za-z0-9])/)) score += 1;

  if (score === 0) return { score: 1, label: "Very Weak", color: "bg-red-500", textColor: "text-red-500 dark:text-red-400" };
  if (score === 1) return { score: 2, label: "Weak", color: "bg-orange-500", textColor: "text-orange-500 dark:text-orange-400" };
  if (score === 2) return { score: 3, label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-500 dark:text-yellow-400" };
  if (score >= 3) return { score: 4, label: "Strong", color: "bg-green-500", textColor: "text-green-500 dark:text-green-400" };
  
  return { score: 0, label: "", color: "bg-slate-200 dark:bg-slate-800", textColor: "text-slate-500" };
};

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileError, setTurnstileError] = useState<string>("");
  const turnstileRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const strength = getPasswordStrength(passwordValue);

  const registerMutation = useRegisterMutation();

  const onSubmit = (data: RegisterFormSchema) => {
    if (!turnstileToken && process.env.NODE_ENV !== "development") {
      // Allow bypass in dev if env var is missing, otherwise enforce
      if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
        setTurnstileError("Please complete the verification");
        return;
      }
    }
    setTurnstileError("");
    registerMutation.mutate(
      { ...data, turnstileToken },
      {
        onError: () => {
          turnstileRef.current?.reset();
          setTurnstileToken("");
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-2 w-full"
    >
      <div className="space-y-0.5">
        <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold">
          Full Name
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            id="name"
            placeholder="Enter your full name"
            {...register("name")}
            className="pl-10 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-9 transition-all rounded-lg"
          />
        </div>
        {errors.name && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-0.5">
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
            className="pl-10 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-9 transition-all rounded-lg"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-0.5">
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
            placeholder="Create a password"
            {...register("password")}
            className="pl-10 pr-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-9 transition-all rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {passwordValue && (
          <div className="pt-1">
            <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
              <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : "bg-slate-200 dark:bg-slate-800"} transition-colors duration-300`} />
              <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : "bg-slate-200 dark:bg-slate-800"} transition-colors duration-300`} />
              <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : "bg-slate-200 dark:bg-slate-800"} transition-colors duration-300`} />
              <div className={`h-full flex-1 ${strength.score >= 4 ? strength.color : "bg-slate-200 dark:bg-slate-800"} transition-colors duration-300`} />
            </div>
            <p className={`text-[11px] mt-1 text-right font-medium ${strength.textColor}`}>
              {strength.label}
            </p>
          </div>
        )}
        {errors.password && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-0.5">
        <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold">
          Confirm Password
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            {...register("confirmPassword")}
            className="pl-10 pr-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-9 transition-all rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-0.5">
        <input 
          type="checkbox" 
          id="terms" 
          className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-4 h-4 cursor-pointer"
        />
        <label htmlFor="terms" className="text-[13px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
          I agree to the <Link href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Terms of Service</Link> and <Link href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Privacy Policy</Link>
        </label>
      </div>

      <div className="flex flex-col items-center">
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
        id="btn-register"
        disabled={registerMutation.isPending}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] mt-1"
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registering...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Register
          </>
        )}
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-card px-3 text-slate-500 dark:text-slate-400 font-medium">or</span>
        </div>
      </div>

      <p className="text-center text-[13px] text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
