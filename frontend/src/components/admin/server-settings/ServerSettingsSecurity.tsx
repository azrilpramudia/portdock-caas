'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, ShieldAlert, ShieldCheck, Trash2, Shield, Lock, Server } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface UfwRule {
  to: string;
  action: string;
  from: string;
}

interface SecurityStatus {
  ufw: {
    enabled: boolean;
    rules: UfwRule[];
  };
  fail2ban: {
    installed: boolean;
    enabled: boolean;
    maxretry: number;
    bantime: number;
  };
  ssh: {
    port: number;
    permitRootLogin: boolean;
  };
}

export function ServerSettingsSecurity() {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Forms
  const [newPort, setNewPort] = useState('');
  const [newProtocol, setNewProtocol] = useState('tcp');
  const [sshPort, setSshPort] = useState<number | string>(22);
  const [rootLogin, setRootLogin] = useState(false);
  const [f2bRetry, setF2bRetry] = useState<number | string>(5);
  const [f2bTime, setF2bTime] = useState<number | string>(10);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/admin/security/status');
      const data = res.data;
      setStatus(data);
      setSshPort(data.ssh.port);
      setRootLogin(data.ssh.permitRootLogin);
      setF2bRetry(data.fail2ban.maxretry);
      setF2bTime(data.fail2ban.bantime);
    } catch (error: any) {
      toast.error('Gagal mengambil status keamanan server.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUfw = async (enable: boolean) => {
    try {
      setIsSaving(true);
      await api.post('/admin/security/ufw/toggle', { enable });
      toast.success(`Firewall UFW berhasil di${enable ? 'aktifkan' : 'matikan'}.`);
      fetchStatus();
    } catch (error: any) {
      toast.error('Gagal mengubah status UFW.', { description: error?.response?.data?.message || error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const addUfwRule = async () => {
    if (!newPort) return;
    try {
      setIsSaving(true);
      await api.post('/admin/security/ufw/rule', { port: newPort, protocol: newProtocol });
      toast.success(`Aturan port ${newPort}/${newProtocol} berhasil ditambahkan.`);
      setNewPort('');
      fetchStatus();
    } catch (error: any) {
      toast.error('Gagal menambahkan aturan port.', { description: error?.response?.data?.message || error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUfwRule = async (portString: string) => {
    try {
      setIsSaving(true);
      const parts = portString.split('/');
      const port = parts[0];
      const protocol = parts[1] || 'tcp';
      await api.delete('/admin/security/ufw/rule', { data: { port, protocol } });
      toast.success(`Aturan port ${portString} berhasil dihapus.`);
      fetchStatus();
    } catch (error: any) {
      toast.error('Penghapusan dibatalkan', { description: error?.response?.data?.message || error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const saveFail2Ban = async (enable: boolean) => {
    try {
      setIsSaving(true);
      await api.post('/admin/security/fail2ban', { enable, maxretry: Number(f2bRetry) || 0, bantime: Number(f2bTime) || 0 });
      toast.success(`Fail2Ban berhasil di${enable ? 'aktifkan' : 'matikan'}.`);
      fetchStatus();
    } catch (error: any) {
      toast.error('Gagal mengatur Fail2Ban.', { description: error?.response?.data?.message || error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSsh = async () => {
    const port = Number(sshPort);
    if (isNaN(port) || port < 1 || port > 65535) {
      return toast.error('Port SSH harus antara 1-65535');
    }
    const confirmed = confirm('PERHATIAN: Mengubah Port SSH atau menonaktifkan Root Login dapat menyebabkan Anda kehilangan akses ke server jika terjadi kesalahan. Lanjutkan?');
    if (!confirmed) return;

    try {
      setIsSaving(true);
      await api.post('/admin/security/ssh', { port: sshPort, permitRootLogin: rootLogin });
      toast.success('Konfigurasi SSH berhasil diperbarui. Layanan SSH telah direstart.');
      fetchStatus();
    } catch (error: any) {
      toast.error('Gagal memperbarui konfigurasi SSH.', { description: error?.response?.data?.message || error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !status) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/10 rounded-lg">
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Server Security</h3>
          <p className="text-sm text-muted-foreground">
            Pengaturan firewall UFW, Fail2Ban, dan keamanan tingkat OS. Hati-hati mengubah konfigurasi di bawah ini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UFW FIREWALL */}
        <Card className="shadow-none flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              UFW Firewall
            </CardTitle>
            <CardDescription>
              Kontrol akses port jaringan ke peladen. Pastikan Port SSH selalu terbuka.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border rounded-xl bg-card/50">
              <div className="space-y-0.5">
                <Label className="text-base">Status UFW</Label>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {status.ufw.enabled ? (
                    <><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Aktif (Melindungi)</>
                  ) : (
                    <><div className="w-2 h-2 rounded-full bg-red-500"></div> Nonaktif (Berbahaya)</>
                  )}
                </div>
              </div>
              <Switch 
                checked={status.ufw.enabled} 
                onCheckedChange={toggleUfw} 
                disabled={isSaving}
              />
            </div>

            {status.ufw.enabled && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Contoh: 8080" 
                    value={newPort}
                    onChange={(e) => setNewPort(e.target.value)}
                    className="flex-1"
                  />
                  <select 
                    className="h-10 px-3 py-2 rounded-md border bg-background text-sm"
                    value={newProtocol}
                    onChange={(e) => setNewProtocol(e.target.value)}
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                  </select>
                  <Button onClick={addUfwRule} disabled={isSaving || !newPort}>Add Rule</Button>
                </div>

                <div className="border rounded-lg overflow-hidden flex-1 bg-muted/20">
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
                    {status.ufw.rules.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada aturan khusus.</div>
                    ) : (
                      <div className="divide-y">
                        {status.ufw.rules.map((rule, idx) => {
                          const isSSH = rule.to === status.ssh.port.toString() || rule.to === `${status.ssh.port}/tcp`;
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors">
                              <div className="flex flex-col">
                                <span className="font-mono text-sm font-medium">{rule.to}</span>
                                <span className="text-xs text-muted-foreground">{rule.action} from {rule.from}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className={isSSH ? "opacity-50 cursor-not-allowed" : "text-destructive hover:bg-destructive/10"}
                                onClick={() => !isSSH && deleteUfwRule(rule.to)}
                                disabled={isSaving || isSSH}
                                title={isSSH ? "Port SSH tidak bisa dihapus" : "Hapus Aturan"}
                              >
                                {isSSH ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {/* SSH CONFIG */}
          <Card className="shadow-none border-red-500/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-500">
                <Server className="w-4 h-4" />
                SSH Access
              </CardTitle>
              <CardDescription>
                Pengaturan protokol Remote SSH. <strong className="text-red-500">Berbahaya jika salah konfigurasi.</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Port SSH</Label>
                <Input 
                  type="number" 
                  value={sshPort} 
                  onChange={(e) => setSshPort(e.target.value === '' ? '' : parseInt(e.target.value))} 
                  min={1} max={65535}
                />
                <p className="text-xs text-muted-foreground">Default adalah 22. Jika Anda mengubahnya, Port UFW akan disesuaikan otomatis.</p>
              </div>

              <div className="flex items-center justify-between border p-3 rounded-lg bg-card/50">
                <div className="space-y-0.5">
                  <Label>Allow Root Login</Label>
                  <p className="text-xs text-muted-foreground">Izinkan login langsung menggunakan user root</p>
                </div>
                <Switch checked={rootLogin} onCheckedChange={setRootLogin} disabled={isSaving} />
              </div>

              <Button variant="destructive" className="w-full" onClick={saveSsh} disabled={isSaving}>
                Simpan & Restart SSH
              </Button>
            </CardContent>
          </Card>

          {/* FAIL2BAN */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />
                Fail2Ban (Bruteforce Protection)
              </CardTitle>
              <CardDescription>
                Mendeteksi kegagalan login dan memblokir IP penyerang sementara waktu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border p-3 rounded-lg bg-card/50">
                <div className="space-y-0.5">
                  <Label>Status Fail2Ban</Label>
                  <p className="text-xs text-muted-foreground">{status.fail2ban.installed ? 'Terpasang' : 'Belum dipasang (akan diinstal otomatis)'}</p>
                </div>
                <Switch 
                  checked={status.fail2ban.enabled} 
                  onCheckedChange={(checked) => {
                    if (!checked) saveFail2Ban(false);
                  }}
                  disabled={isSaving} 
                />
              </div>

              {status.fail2ban.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Retries (Kali)</Label>
                      <Input 
                        type="number" 
                        value={f2bRetry} 
                        onChange={(e) => setF2bRetry(e.target.value === '' ? '' : parseInt(e.target.value))} 
                        min={1} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ban Time (Menit)</Label>
                      <Input 
                        type="number" 
                        value={f2bTime} 
                        onChange={(e) => setF2bTime(e.target.value === '' ? '' : parseInt(e.target.value))} 
                        min={1} 
                      />
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => saveFail2Ban(true)} disabled={isSaving}>
                    Simpan Konfigurasi Fail2Ban
                  </Button>
                </>
              )}
              {!status.fail2ban.enabled && (
                <Button className="w-full" onClick={() => saveFail2Ban(true)} disabled={isSaving}>
                  Aktifkan & Install Fail2Ban
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
