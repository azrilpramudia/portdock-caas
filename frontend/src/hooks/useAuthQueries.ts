import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";

export function useLoginMutation() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(`Selamat datang, ${data.user.name}!`);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      if (message === "Invalid credentials") {
        toast.error("Login gagal: Email atau password salah.");
      } else if (message?.includes("Turnstile")) {
        toast.error("Verifikasi keamanan gagal. Silakan coba lagi.");
      } else {
        toast.error(message || "Terjadi kesalahan saat login.");
      }
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Akun berhasil dibuat! Selamat datang di Portdock.");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      if (message === "Email already registered") {
        toast.error("Registrasi gagal: Email ini sudah terdaftar.");
      } else if (message?.includes("Turnstile")) {
        toast.error("Verifikasi keamanan gagal. Silakan coba lagi.");
      } else {
        toast.error(message || "Terjadi kesalahan saat registrasi.");
      }
    },
  });
}
