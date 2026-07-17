import React, { useState, useEffect } from "react";
import { Loader2, HardDrive, Network, Trash2, Save, Plus, X } from "lucide-react";
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

interface DockerConfig {
  "default-address-pools"?: { base: string; size: number }[];
  bip?: string;
  "log-driver"?: string;
  "log-opts"?: { "max-size"?: string; "max-file"?: string };
  dns?: string[];
  "registry-mirrors"?: string[];
}

export function ServerSettingsDocker() {
  const [config, setConfig] = useState<DockerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPruning, setIsPruning] = useState(false);

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isPruneDialogOpen, setIsPruneDialogOpen] = useState(false);

  // Form states
  const [bip, setBip] = useState("");
  const [maxLogSize, setMaxLogSize] = useState("");
  const [dnsInput, setDnsInput] = useState("");
  const [dnsList, setDnsList] = useState<string[]>([]);
  const [mirrorInput, setMirrorInput] = useState("");
  const [mirrorList, setMirrorList] = useState<string[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/admin/docker/config");
      const data: DockerConfig = res.data;
      setConfig(data);
      
      setBip(data.bip || "");
      setMaxLogSize(data["log-opts"]?.["max-size"] || "");
      setDnsList(data.dns || []);
      setMirrorList(data["registry-mirrors"] || []);
      
    } catch (error) {
      toast.error("Gagal mengambil konfigurasi Docker");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaveDialogOpen(false);
      setIsSaving(true);
      const newConfig: DockerConfig = { ...config };
      
      if (bip) newConfig.bip = bip;
      else delete newConfig.bip;

      if (maxLogSize) {
        newConfig["log-driver"] = "json-file";
        newConfig["log-opts"] = { ...newConfig["log-opts"], "max-size": maxLogSize, "max-file": "3" };
      } else if (newConfig["log-opts"]) {
        delete newConfig["log-opts"];
      }

      if (dnsList.length > 0) newConfig.dns = dnsList;
      else delete newConfig.dns;

      if (mirrorList.length > 0) newConfig["registry-mirrors"] = mirrorList;
      else delete newConfig["registry-mirrors"];

      await api.patch("/admin/docker/config", newConfig);
      toast.success("Konfigurasi Docker berhasil disimpan. Service Docker telah direstart.");
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi Docker");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrune = async () => {
    try {
      setIsPruneDialogOpen(false);
      setIsPruning(true);
      const res = await api.post("/admin/server/action", { action: "prune-docker" });
      toast.success(res.data.message || "Sistem Docker berhasil dibersihkan");
    } catch (error) {
      toast.error("Gagal melakukan system prune");
    } finally {
      setIsPruning(false);
    }
  };

  const addItem = (item: string, setItem: (v: string) => void, list: string[], setList: (v: string[]) => void) => {
    if (item && !list.includes(item)) {
      setList([...list, item]);
      setItem("");
    }
  };

  const removeItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter(i => i !== item));
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center bg-card border border-border rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-foreground">Daemon Configuration</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">Konfigurasi utama /etc/docker/daemon.json</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Maximum Log Size</Label>
              <Input 
                placeholder="Contoh: 50m, 100m, 1g" 
                value={maxLogSize} 
                onChange={e => setMaxLogSize(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground">Mencegah log kontainer membuat disk penuh. Secara otomatis akan dirotasi 3 file.</p>
            </div>

            <div className="space-y-2">
              <Label>DNS Servers</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="8.8.8.8" 
                  value={dnsInput} 
                  onChange={e => setDnsInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem(dnsInput, setDnsInput, dnsList, setDnsList)}
                />
                <Button type="button" variant="outline" onClick={() => addItem(dnsInput, setDnsInput, dnsList, setDnsList)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {dnsList.map(dns => (
                  <div key={dns} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                    {dns}
                    <button onClick={() => removeItem(dns, dnsList, setDnsList)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Registry Mirrors</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://mirror.gcr.io" 
                  value={mirrorInput} 
                  onChange={e => setMirrorInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem(mirrorInput, setMirrorInput, mirrorList, setMirrorList)}
                />
                <Button type="button" variant="outline" onClick={() => addItem(mirrorInput, setMirrorInput, mirrorList, setMirrorList)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {mirrorList.map(mirror => (
                  <div key={mirror} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                    {mirror}
                    <button onClick={() => removeItem(mirror, mirrorList, setMirrorList)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end">
            <Button onClick={() => setIsSaveDialogOpen(true)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center gap-2">
            <Network className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-foreground">Network Config</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">Pengaturan Docker Bridge Network</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Bridge IP Subnet (BIP)</Label>
              <Input 
                placeholder="172.17.0.1/16" 
                value={bip} 
                onChange={e => setBip(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground">Mengubah subnet IP default untuk network bridge bawaan Docker agar tidak bertabrakan dengan host network Anda.</p>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end">
            <Button onClick={() => setIsSaveDialogOpen(true)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Network
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-destructive/20 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <div>
              <h3 className="text-base font-bold text-destructive">System Cleanup</h3>
              <p className="text-[13px] text-destructive/80 mt-0.5">Ruang disk dan cache</p>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Jalankan <code className="bg-muted px-1 rounded text-xs text-foreground">docker system prune</code> untuk menghapus semua kontainer, jaringan, image, dan volume (*opsional*) yang sudah tidak terpakai atau menggantung (*dangling*).
            </p>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => setIsPruneDialogOpen(true)} 
              disabled={isPruning}
            >
              {isPruning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Run System Prune
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
              Menyimpan konfigurasi ini akan memicu restart pada service Docker. Semua container yang sedang berjalan (termasuk aplikasi web ini) akan mengalami downtime sesaat. Apakah Anda yakin ingin melanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Ya, Lanjutkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prune Confirmation Dialog */}
      <Dialog open={isPruneDialogOpen} onOpenChange={setIsPruneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Peringatan Cleanup Docker</DialogTitle>
            <DialogDescription className="py-3">
              Ini akan menghapus SEMUA image, container, dan volume yang tidak digunakan (dangling). Operasi ini tidak dapat dibatalkan. Apakah Anda yakin?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPruneDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handlePrune}>Ya, Hapus Sekarang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
