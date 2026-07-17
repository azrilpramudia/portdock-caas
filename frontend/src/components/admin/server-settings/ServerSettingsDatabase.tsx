import React, { useState, useEffect } from "react";
import { Loader2, Database, ShieldAlert, Cpu, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";

interface DbConfig {
  maxConnections?: string;
  memLimit?: string;
}

export function ServerSettingsDatabase() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Form states
  const [maxConnections, setMaxConnections] = useState("");
  const [memLimit, setMemLimit] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/admin/db/config");
      const config = res.data;
      
      setMaxConnections(config.maxConnections || "");
      setMemLimit(config.memLimit || "");
    } catch (error) {
      toast.error("Gagal memuat konfigurasi Database");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaveDialogOpen(false);
      setIsSaving(true);
      
      const payload: DbConfig = {
        maxConnections,
        memLimit,
      };

      await api.patch("/admin/db/config", payload);
      toast.success("Konfigurasi Database berhasil disimpan. Kontainer akan direstart.");
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi Database");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      
      {/* Connection Pool & Resource Limit */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Resource & Connection</h3>
            <p className="text-xs text-muted-foreground">Pembatasan sumber daya dan koneksi PostgreSQL Portdock</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Max Connections</Label>
              <Input 
                type="number"
                placeholder="Contoh: 100, 200" 
                value={maxConnections}
                onChange={(e) => setMaxConnections(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Maksimal koneksi serentak ke database. Standar PostgreSQL adalah 100.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Memory Limit</Label>
              <Input 
                placeholder="Contoh: 512M, 1G, 2G" 
                value={memLimit}
                onChange={(e) => setMemLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Batas maksimal RAM (*hard limit*) untuk kontainer DB agar tidak terjadi *Memory Leak*.</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={() => setIsSaveDialogOpen(true)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Simpan Konfigurasi</DialogTitle>
            <DialogDescription className="py-3">
              Menyimpan konfigurasi Memory dan Max Connections akan memicu restart pada kontainer Database Portdock. Layanan akan terputus selama beberapa detik. Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Ya, Lanjutkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
