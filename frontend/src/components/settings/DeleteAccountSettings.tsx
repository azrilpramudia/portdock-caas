import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useSecuritySettings } from "@/hooks/useSettings";
import { AxiosError } from "axios";

export function DeleteAccountSettings() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { deleteAccountMutation } = useSecuritySettings();
  
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = () => {
    if (confirmText !== "HAPUS") {
      toast.error("Ketik 'HAPUS' untuk mengkonfirmasi");
      return;
    }
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Akun berhasil dihapus.");
        setIsOpen(false);
        logout();
        router.push("/login");
      },
      onError: (error: AxiosError<{ message: string }> | any) => {
        toast.error(error.response?.data?.message || "Gagal menghapus akun");
      },
    });
  };

  return (
    <>
      <Card className="border-red-500/20 bg-red-500/5 mt-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Hapus Akun (Danger Zone)
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            Aksi ini bersifat permanen. Menghapus akun akan menghentikan dan menghancurkan semua Docker container Anda, menghapus konfigurasi domain, dan memusnahkan semua data project Anda secara tidak bisa dipulihkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setIsOpen(true)}
            className="font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Akun Saya Permanen
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Hapus Akun
            </DialogTitle>
            <DialogDescription className="pt-2">
              Aksi ini <strong>sangat berbahaya</strong>. Semua project dan container Anda yang sedang berjalan akan dihentikan dan dihapus secara paksa dari VPS. Data yang sudah dihapus tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ketik <strong>HAPUS</strong> untuk mengkonfirmasi:
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== "HAPUS" || deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...</>
              ) : (
                "Ya, Hapus Semuanya"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
