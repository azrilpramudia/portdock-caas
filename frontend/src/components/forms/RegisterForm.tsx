"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, RegisterFormSchema } from "@/lib/validations/auth";
import { useRegisterMutation } from "@/hooks/useAuthQueries";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");
  const registerMutation = useRegisterMutation();

  const passwordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["Lemah", "Cukup", "Baik", "Kuat"];
  const strength = passwordStrength();

  return (
    <form
      onSubmit={handleSubmit((data) => registerMutation.mutate(data))}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-300 text-sm">
          Nama Lengkap
        </Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...register("name")}
          className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500 h-11"
        />
        {errors.name && (
          <p className="text-red-400 text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-300 text-sm">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="nama@contoh.com"
          {...register("email")}
          className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500 h-11"
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
            placeholder="Min. 8 karakter"
            {...register("password")}
            className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500 h-11 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= strength ? strengthColors[strength - 1] : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            {strength > 0 && (
              <p className="text-xs text-slate-400">
                Kekuatan password:{" "}
                <span className={`font-medium ${strength >= 3 ? "text-green-400" : strength === 2 ? "text-yellow-400" : "text-red-400"}`}>
                  {strengthLabels[strength - 1]}
                </span>
              </p>
            )}
          </div>
        )}
        {errors.password && (
          <p className="text-red-400 text-xs">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-slate-300 text-sm">
          Konfirmasi Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Ulangi password"
          {...register("confirmPassword")}
          className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500 h-11"
        />
        {errors.confirmPassword && (
          <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        id="btn-register"
        disabled={registerMutation.isPending}
        className="w-full h-11 portdock-gradient hover:opacity-90 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 mt-2"
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Membuat akun...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Buat Akun
          </>
        )}
      </Button>
    </form>
  );
}
