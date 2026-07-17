'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Settings2, Plus, Trash2, AlertTriangle, Save, Info, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EnvVar {
  key: string;
  value: string;
}

export function ServerSettingsAdvanced() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);

  // Danger Zone
  const [isResetting, setIsResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  useEffect(() => {
    fetchGlobalEnv();
  }, []);

  const fetchGlobalEnv = async () => {
    try {
      const res = await api.get('/admin/advanced/env');
      setEnvVars(res.data || []);
    } catch (error) {
      toast.error('Gagal mengambil pengaturan Global Environment Variables');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEnv = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const handleRemoveEnv = (index: number) => {
    const newVars = [...envVars];
    newVars.splice(index, 1);
    setEnvVars(newVars);
  };

  const handleEnvChange = (index: number, field: 'key' | 'value', val: string) => {
    const newVars = [...envVars];
    newVars[index][field] = val;
    setEnvVars(newVars);
  };

  const handleSaveEnv = async () => {
    try {
      setIsSaving(true);
      // Filter out empty keys
      const validVars = envVars.filter(v => v.key.trim() !== '');
      await api.patch('/admin/advanced/env', { vars: validVars });
      setEnvVars(validVars);
      toast.success('Global Environment Variables berhasil disimpan');
    } catch (error: any) {
      toast.error('Gagal menyimpan variabel', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFactoryReset = async () => {
    if (resetConfirmText !== 'RESET') {
      return toast.error('Ketik RESET untuk mengonfirmasi.');
    }

    try {
      setIsResetting(true);
      await api.post('/admin/advanced/factory-reset');
      toast.success('Factory Reset berhasil dilakukan. Semua data klien telah dihapus.');
      setShowResetDialog(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast.error('Gagal melakukan Factory Reset', { description: error?.response?.data?.message || error.message });
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Settings2 className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Advanced Settings</h3>
          <p className="text-sm text-muted-foreground">
            Konfigurasi lanjutan dan fitur operasional tingkat bahaya tinggi (Danger Zone).
          </p>
        </div>
      </div>

      {/* GLOBAL ENV VARS */}
      <Card className="shadow-none border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-base text-purple-500">Global Environment Variables</CardTitle>
          <CardDescription>
            Variabel ini akan secara otomatis disuntikkan (injected) ke dalam setiap container aplikasi yang baru di-deploy di sistem ini. Berguna untuk kredensial terpusat atau API keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {envVars.length === 0 ? (
            <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
              Belum ada Global Environment Variables
            </div>
          ) : (
            <div className="space-y-3">
              {envVars.map((env, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder="KEY" 
                    value={env.key} 
                    onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                    className="font-mono text-sm w-1/3"
                  />
                  <Input 
                    placeholder="VALUE" 
                    value={env.value} 
                    onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                    className="font-mono text-sm flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveEnv(index)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={handleAddEnv} className="mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Variabel
          </Button>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t justify-between">
          <p className="text-xs text-muted-foreground">Variabel tidak akan disuntikkan ke container yang sudah berjalan, melainkan pada deployment berikutnya.</p>
          <Button size="sm" onClick={handleSaveEnv} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Variabel Global
          </Button>
        </CardFooter>
      </Card>

      {/* DANGER ZONE */}
      <div className="mt-10 pt-6 border-t border-red-500/20">
        <h3 className="text-lg font-medium text-red-500 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Factory Reset */}
          <Card className="border-red-500/50 shadow-none bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-base text-red-600">Factory Reset</CardTitle>
              <CardDescription className="text-red-600/80">
                Hapus semua data klien, project, database, container, dan user (kecuali admin). Aksi ini sangat destruktif dan tidak dapat dibatalkan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={() => setShowResetDialog(true)} 
                disabled={isResetting}
                className="w-full"
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Lakukan Factory Reset
              </Button>
            </CardContent>
          </Card>

          {/* Uninstall */}
          <Card className="border-red-500/50 shadow-none bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-base text-red-600">Uninstall Portdock</CardTitle>
              <CardDescription className="text-red-600/80">
                Untuk mencopot pemasangan secara aman dan tuntas, silakan jalankan skrip ini langsung dari Terminal SSH server Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                <Info className="h-4 w-4" />
                <AlertTitle>Perintah Uninstall (Copy & Paste)</AlertTitle>
                <AlertDescription className="mt-2 relative">
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 block bg-black/20 p-3 rounded text-xs break-all overflow-hidden">
                      curl -sSL https://raw.githubusercontent.com/portdock/portdock/main/uninstall.sh | sudo bash
                    </code>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="shrink-0 h-10 w-10 bg-black/20 border-red-500/30 hover:bg-red-500/20 hover:text-red-400"
                      onClick={() => {
                        navigator.clipboard.writeText('curl -sSL https://raw.githubusercontent.com/portdock/portdock/main/uninstall.sh | sudo bash');
                        toast.success('Perintah berhasil disalin');
                      }}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="border-red-500/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Peringatan Keras!
            </DialogTitle>
            <DialogDescription className="pt-2 text-foreground space-y-2">
              <span className="block text-sm">
                Apakah Anda yakin ingin menghapus <strong>SEMUA</strong> Data User, Project, Container, dan Database secara permanen?
              </span>
              <span className="block text-muted-foreground text-sm">
                * Akun admin Anda tidak akan terhapus.
              </span>
              <span className="block text-red-500 font-medium text-sm">Aksi ini tidak dapat dibatalkan!</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Label className="text-sm">Ketik <strong>RESET</strong> untuk melanjutkan</Label>
            <Input 
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="RESET"
              className="border-red-500/30 focus-visible:ring-red-500"
            />
          </div>
          <DialogFooter className="pt-4 flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)} className="flex-1">Batal</Button>
            <Button 
              variant="destructive" 
              onClick={handleFactoryReset}
              disabled={resetConfirmText !== 'RESET' || isResetting}
              className="flex-1"
            >
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Hapus Semua Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
