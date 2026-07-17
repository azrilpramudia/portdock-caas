import React, { useState, useEffect } from "react";
import { Loader2, DownloadCloud, Clock, Save, HardDrive, Globe, Server } from "lucide-react";
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
import { toast } from "sonner";
import api from "@/lib/api";

interface BackupConfig {
  backupProvider?: string;
  backupSchedule?: string;
  backupRetention?: string;
  s3Endpoint?: string;
  s3Region?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  sftpHost?: string;
  sftpPort?: string;
  sftpUser?: string;
  sftpPass?: string;
}

export function ServerSettingsBackup() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // General States
  const [backupProvider, setBackupProvider] = useState("local");
  const [backupSchedule, setBackupSchedule] = useState("");
  const [backupRetention, setBackupRetention] = useState("");

  // S3 States
  const [s3Endpoint, setS3Endpoint] = useState("");
  const [s3Region, setS3Region] = useState("");
  const [s3Bucket, setS3Bucket] = useState("");
  const [s3AccessKey, setS3AccessKey] = useState("");
  const [s3SecretKey, setS3SecretKey] = useState("");

  // SFTP States
  const [sftpHost, setSftpHost] = useState("");
  const [sftpPort, setSftpPort] = useState("22");
  const [sftpUser, setSftpUser] = useState("");
  const [sftpPass, setSftpPass] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/admin/backup/config");
      const config = res.data;
      
      setBackupProvider(config.backupProvider || "local");
      setBackupSchedule(config.backupSchedule || "0 0 * * *");
      setBackupRetention(config.backupRetention || "7");
      
      setS3Endpoint(config.s3Endpoint || "");
      setS3Region(config.s3Region || "");
      setS3Bucket(config.s3Bucket || "");
      setS3AccessKey(config.s3AccessKey || "");
      setS3SecretKey(config.s3SecretKey || "");

      setSftpHost(config.sftpHost || "");
      setSftpPort(config.sftpPort || "22");
      setSftpUser(config.sftpUser || "");
      setSftpPass(config.sftpPass || "");

    } catch (error) {
      toast.error("Gagal memuat konfigurasi Backup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const payload: BackupConfig = {
        backupProvider,
        backupSchedule,
        backupRetention,
        s3Endpoint,
        s3Region,
        s3Bucket,
        s3AccessKey,
        s3SecretKey,
        sftpHost,
        sftpPort,
        sftpUser,
        sftpPass
      };

      await api.patch("/admin/backup/config", payload);
      toast.success("Konfigurasi Backup berhasil disimpan.");
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi Backup");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await api.post("/admin/db/backup/run");
      toast.success(res.data.message || "Backup berhasil diselesaikan");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal melakukan backup database");
    } finally {
      setIsBackingUp(false);
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
      
      {/* Schedule & Retention */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Jadwal & Retensi</h3>
              <p className="text-xs text-muted-foreground">Otomatisasi waktu cadangan dan siklus hapus</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRunBackup} disabled={isBackingUp}>
            {isBackingUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
            Run Backup Now
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Jadwal Cron</Label>
              <Input 
                placeholder="0 2 * * *" 
                value={backupSchedule}
                onChange={(e) => setBackupSchedule(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Format penjadwalan Cron (menit jam tanggal bulan hari).</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Retensi (Hari/Jumlah File)</Label>
              <Input 
                type="number"
                placeholder="7" 
                value={backupRetention}
                onChange={(e) => setBackupRetention(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Berapa banyak file backup lokal yang akan disimpan sebelum versi tertua dihapus.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Destination */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Destinasi Storage</h3>
            <p className="text-xs text-muted-foreground">Lokasi penyimpanan file backup database dan konfigurasi</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2 max-w-sm">
            <Label className="text-sm font-semibold">Storage Provider</Label>
            <Select value={backupProvider} onValueChange={(val) => setBackupProvider(val || "local")}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Provider Storage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Disk (Internal)</SelectItem>
                <SelectItem value="s3">AWS S3 / S3-Compatible</SelectItem>
                <SelectItem value="sftp">SFTP Server</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {backupProvider === "s3" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  S3 Endpoint (Opsional)
                </Label>
                <Input 
                  placeholder="https://storage.googleapis.com (Kosongkan jika AWS S3 asli)" 
                  value={s3Endpoint}
                  onChange={(e) => setS3Endpoint(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Bucket Name</Label>
                <Input 
                  placeholder="portdock-backups" 
                  value={s3Bucket}
                  onChange={(e) => setS3Bucket(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Region</Label>
                <Input 
                  placeholder="us-east-1" 
                  value={s3Region}
                  onChange={(e) => setS3Region(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Access Key ID</Label>
                <Input 
                  type="password"
                  value={s3AccessKey}
                  onChange={(e) => setS3AccessKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Secret Access Key</Label>
                <Input 
                  type="password"
                  value={s3SecretKey}
                  onChange={(e) => setS3SecretKey(e.target.value)}
                />
              </div>
            </div>
          )}

          {backupProvider === "sftp" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Server className="w-4 h-4 text-muted-foreground" />
                  Host Address
                </Label>
                <Input 
                  placeholder="192.168.1.100" 
                  value={sftpHost}
                  onChange={(e) => setSftpHost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Port</Label>
                <Input 
                  type="number"
                  placeholder="22" 
                  value={sftpPort}
                  onChange={(e) => setSftpPort(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Username</Label>
                <Input 
                  value={sftpUser}
                  onChange={(e) => setSftpUser(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Password / Key</Label>
                <Input 
                  type="password"
                  value={sftpPass}
                  onChange={(e) => setSftpPass(e.target.value)}
                />
              </div>
            </div>
          )}

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
