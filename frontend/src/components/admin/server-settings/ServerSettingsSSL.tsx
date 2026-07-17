import React, { useState, useEffect } from "react";
import { Loader2, ShieldCheck, Mail, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/lib/api";

interface SslConfig {
  acmeEmail?: string;
  acmeServer?: string;
  forceHttps?: string;
}

export function ServerSettingsSSL() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [acmeEmail, setAcmeEmail] = useState("");
  const [acmeProvider, setAcmeProvider] = useState("letsencrypt");
  const [acmeServerUrl, setAcmeServerUrl] = useState("");
  const [forceHttps, setForceHttps] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/admin/ssl/config");
      const config = res.data;
      
      setAcmeEmail(config.acmeEmail || "");
      setForceHttps(config.forceHttps !== "false");

      if (config.acmeServer === "https://acme.zerossl.com/v2/DV90") {
        setAcmeProvider("zerossl");
      } else if (config.acmeServer) {
        setAcmeProvider("custom");
        setAcmeServerUrl(config.acmeServer);
      } else {
        setAcmeProvider("letsencrypt");
      }
    } catch (error) {
      toast.error("Gagal memuat konfigurasi SSL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (val: string) => {
    setAcmeProvider(val);
    if (val === "letsencrypt") setAcmeServerUrl("");
    if (val === "zerossl") setAcmeServerUrl("https://acme.zerossl.com/v2/DV90");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      let finalServerUrl = "";
      if (acmeProvider === "zerossl") finalServerUrl = "https://acme.zerossl.com/v2/DV90";
      else if (acmeProvider === "custom") finalServerUrl = acmeServerUrl;

      const payload: SslConfig = {
        acmeEmail,
        acmeServer: finalServerUrl,
        forceHttps: forceHttps ? "true" : "false"
      };

      await api.patch("/admin/ssl/config", payload);
      toast.success("Konfigurasi SSL berhasil disimpan.");
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi SSL");
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
      
      {/* ACME Certificate Security */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Sertifikat SSL (ACME)</h3>
            <p className="text-xs text-muted-foreground">Pengaturan otentikasi pengeluaran sertifikat Certbot</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Notifikasi
              </Label>
              <Input 
                type="email"
                placeholder="admin@domain.com" 
                value={acmeEmail}
                onChange={(e) => setAcmeEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Digunakan oleh provider SSL (seperti Let's Encrypt) untuk mengirimkan notifikasi perpanjangan jika otomatisasi gagal.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                ACME Provider
              </Label>
              <Select value={acmeProvider} onValueChange={(val) => handleProviderChange(val || "letsencrypt")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Provider SSL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letsencrypt">Let's Encrypt (Default)</SelectItem>
                  <SelectItem value="zerossl">ZeroSSL</SelectItem>
                  <SelectItem value="custom">Custom Provider Server URL</SelectItem>
                </SelectContent>
              </Select>
              {acmeProvider === "custom" && (
                <div className="mt-2">
                  <Input 
                    placeholder="https://acme-custom.com/directory" 
                    value={acmeServerUrl}
                    onChange={(e) => setAcmeServerUrl(e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Provider otoritas sertifikat SSL (CA) global untuk situs yang Anda jalankan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Routing Policies */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Global Routing Policies</h3>
            <p className="text-xs text-muted-foreground">Aturan routing lalu lintas HTTP/HTTPS secara global</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Force HTTPS</Label>
              <p className="text-xs text-muted-foreground">Otomatis mengalihkan (redirect 301) seluruh pengunjung HTTP (port 80) ke HTTPS (port 443).</p>
            </div>
            <Switch checked={forceHttps} onCheckedChange={setForceHttps} />
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
