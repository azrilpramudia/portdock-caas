import React, { useState, useEffect } from "react";
import { Loader2, Globe, FileCode, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface NginxConfig {
  clientMaxBodySize?: string;
  proxyReadTimeout?: string;
  templateHttp?: string;
  templateHttps?: string;
}

export function ServerSettingsNginx() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Form states
  const [clientMaxBodySize, setClientMaxBodySize] = useState("");
  const [proxyReadTimeout, setProxyReadTimeout] = useState("");
  const [templateHttp, setTemplateHttp] = useState("");
  const [templateHttps, setTemplateHttps] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/admin/nginx/config");
      const config = res.data;
      
      setClientMaxBodySize(config.clientMaxBodySize || "");
      setProxyReadTimeout(config.proxyReadTimeout || "");
      setTemplateHttp(config.templateHttp || "");
      setTemplateHttps(config.templateHttps || "");
    } catch (error) {
      toast.error("Gagal memuat konfigurasi Nginx");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaveDialogOpen(false);
      setIsSaving(true);
      
      const payload: NginxConfig = {
        clientMaxBodySize,
        proxyReadTimeout,
        templateHttp,
        templateHttps
      };

      await api.patch("/admin/nginx/config", payload);
      toast.success("Konfigurasi Nginx berhasil disimpan. Service direstart.");
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi Nginx");
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
      
      {/* Global Configuration */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Global Configuration</h3>
            <p className="text-xs text-muted-foreground">Konfigurasi umum yang berlaku pada seluruh block server</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Client Max Body Size</Label>
              <Input 
                placeholder="Contoh: 100M, 1G" 
                value={clientMaxBodySize}
                onChange={(e) => setClientMaxBodySize(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Menaikkan limit ukuran file upload. Biarkan kosong untuk nilai default Nginx (1M).</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Proxy Read Timeout</Label>
              <Input 
                placeholder="Contoh: 300s, 5m" 
                value={proxyReadTimeout}
                onChange={(e) => setProxyReadTimeout(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Batas waktu untuk koneksi long-polling atau websocket.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Configuration */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Server Templates</h3>
            <p className="text-xs text-muted-foreground">Kustomisasi template file .conf bawaan untuk aplikasi baru</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md p-4 mb-4">
            <p className="text-xs font-semibold mb-1">💡 Variabel yang Tersedia:</p>
            <ul className="text-xs list-disc list-inside opacity-90 space-y-1">
              <li><code>{`{{domain}}`}</code> - Nama domain aplikasi</li>
              <li><code>{`{{hostPort}}`}</code> - Port kontainer di dalam host</li>
              <li><code>{`{{projectName}}`}</code> - Nama proyek (slug)</li>
              <li><code>{`{{certPath}}`}</code> - (HTTPS) Lokasi file certificate SSL</li>
              <li><code>{`{{keyPath}}`}</code> - (HTTPS) Lokasi file private key SSL</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">HTTP Template (Port 80)</Label>
            <Textarea 
              placeholder="server {&#10;    listen 80;&#10;    server_name {{domain}};&#10;...&#10;}" 
              value={templateHttp}
              onChange={(e) => setTemplateHttp(e.target.value)}
              className="font-mono text-xs h-64 resize-y bg-muted/30"
            />
            <p className="text-xs text-muted-foreground">Biarkan kosong untuk menggunakan template bawaan Portdock.</p>
          </div>

          <div className="space-y-2 pt-4">
            <Label className="text-sm font-semibold">HTTPS Template (Port 443)</Label>
            <Textarea 
              placeholder="server {&#10;    listen 443 ssl;&#10;    server_name {{domain}};&#10;...&#10;}" 
              value={templateHttps}
              onChange={(e) => setTemplateHttps(e.target.value)}
              className="font-mono text-xs h-64 resize-y bg-muted/30"
            />
            <p className="text-xs text-muted-foreground">Biarkan kosong untuk menggunakan template bawaan Portdock.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={() => setIsSaveDialogOpen(true)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Nginx Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Simpan Konfigurasi Nginx</DialogTitle>
            <DialogDescription className="py-3">
              Menyimpan konfigurasi ini akan otomatis memicu restart pada service portdock-nginx. Aplikasi yang menggunakan proxy mungkin mengalami downtime sepersekian detik. Lanjutkan?
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
