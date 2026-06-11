"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginFormSchema } from "@/lib/validations/auth";
import { useLoginMutation } from "@/hooks/useAuthQueries";

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
  );
}
