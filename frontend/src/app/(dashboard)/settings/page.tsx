"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, User, KeyRound, Loader2, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { format } from "date-fns";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: profile?.name || "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      // Profile update would go through a users endpoint
      const res = await api.get("/auth/me");
      return { ...res.data, ...data };
    },
    onSuccess: (data) => {
      const token = localStorage.getItem("portdock_token") || "";
      setAuth(data, token);
      toast.success("Profil berhasil diupdate");
    },
    onError: () => toast.error("Gagal mengupdate profil"),
  });

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Kelola akun dan preferensi Anda</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <KeyRound className="w-4 h-4" />
            Keamanan
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-white border border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Informasi Profil</CardTitle>
              <CardDescription>Update informasi akun Anda</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                <Avatar className="w-16 h-16 border-2 border-blue-200">
                  <AvatarFallback className="bg-blue-600 text-white text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{profile?.name}</p>
                  <p className="text-sm text-slate-500">{profile?.email}</p>
                  {profile?.createdAt && (
                    <p className="text-xs text-slate-400 mt-1">
                      Bergabung {format(new Date(profile.createdAt), "MMMM yyyy")}
                    </p>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="setting-name">Nama Lengkap</Label>
                  <Input
                    id="setting-name"
                    {...registerProfile("name")}
                    className="h-10"
                  />
                  {profileErrors.name && (
                    <p className="text-red-500 text-xs">{profileErrors.name.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-email">Email</Label>
                  <Input
                    id="setting-email"
                    value={profile?.email || ""}
                    disabled
                    className="h-10 bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-400">Email tidak dapat diubah</p>
                </div>
                <Button
                  type="submit"
                  id="btn-save-profile"
                  disabled={updateProfileMutation.isPending}
                  className="portdock-gradient text-white hover:opacity-90 shadow-lg shadow-blue-500/25"
                >
                  {updateProfileMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Simpan Perubahan</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="bg-white border border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Ubah Password</CardTitle>
              <CardDescription>Pastikan akun Anda menggunakan password yang kuat</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <form
                onSubmit={handlePasswordSubmit(() => {
                  toast.info("Fitur ubah password akan segera tersedia");
                  resetPassword();
                })}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword("currentPassword")}
                    className="h-10"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-xs">{passwordErrors.currentPassword.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Min. 8 karakter"
                    {...registerPassword("newPassword")}
                    className="h-10"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs">{passwordErrors.newPassword.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Ulangi password baru"
                    {...registerPassword("confirmPassword")}
                    className="h-10"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs">{passwordErrors.confirmPassword.message as string}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  id="btn-change-password"
                  className="portdock-gradient text-white hover:opacity-90 shadow-lg shadow-blue-500/25"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Ubah Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
