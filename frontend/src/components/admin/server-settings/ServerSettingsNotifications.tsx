'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, Bell, Webhook, Mail, Send, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export function ServerSettingsNotifications() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Webhook
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Email
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/notifications/config');
      const data = res.data;
      
      setWebhookEnabled(data.webhook?.enabled || false);
      setWebhookUrl(data.webhook?.url || '');
      
      setEmailEnabled(data.email?.enabled || false);
      setSmtpHost(data.email?.host || '');
      setSmtpPort(data.email?.port?.toString() || '587');
      setSmtpUser(data.email?.user || '');
      setSmtpPass(data.email?.pass || '');
      setSmtpFrom(data.email?.from || '');
      
    } catch (error: any) {
      toast.error('Gagal mengambil konfigurasi notifikasi');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);
      const payload = {
        webhook: {
          enabled: webhookEnabled,
          url: webhookUrl
        },
        email: {
          enabled: emailEnabled,
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          user: smtpUser,
          pass: smtpPass,
          from: smtpFrom
        }
      };

      await api.patch('/admin/notifications/config', payload);
      toast.success('Konfigurasi notifikasi berhasil disimpan');
    } catch (error: any) {
      toast.error('Gagal menyimpan konfigurasi');
    } finally {
      setIsSaving(false);
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl) return toast.error('Harap isi URL Webhook terlebih dahulu');
    try {
      setIsTesting(true);
      await api.post('/admin/notifications/test/webhook', { url: webhookUrl });
      toast.success('Notifikasi test berhasil dikirim ke Webhook!');
    } catch (error: any) {
      toast.error('Gagal mengirim webhook test', { description: error?.response?.data?.message || error.message });
    } finally {
      setIsTesting(false);
    }
  };

  const testEmail = async () => {
    if (!testEmailAddress) return toast.error('Harap isi alamat email penerima test');
    if (!smtpHost || !smtpUser || !smtpPass) return toast.error('Harap lengkapi konfigurasi SMTP (Host, User, Pass)');
    
    try {
      setIsTesting(true);
      const emailConfig = {
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom
      };
      await api.post('/admin/notifications/test/email', { emailConfig, toEmail: testEmailAddress });
      toast.success(`Email test berhasil dikirim ke ${testEmailAddress}!`);
    } catch (error: any) {
      toast.error('Gagal mengirim email test', { description: error?.response?.data?.message || error.message });
    } finally {
      setIsTesting(false);
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Bell className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Server Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Atur integrasi webhook dan SMTP untuk menerima peringatan jika memori penuh, CPU tinggi, atau terjadi kegagalan sistem.
          </p>
        </div>
      </div>

      {/* WEBHOOK */}
      <Card className="shadow-none border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2 text-blue-500">
                <Webhook className="w-4 h-4" />
                Webhook Integration (Discord/Slack/Custom)
              </CardTitle>
              <CardDescription>
                Kirim payload JSON peringatan ke URL eksternal (contoh: Discord Webhook, Slack, dll).
              </CardDescription>
            </div>
            <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} disabled={isSaving} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input 
                type="url"
                placeholder="https://discord.com/api/webhooks/..." 
                value={webhookUrl} 
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={!webhookEnabled}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={testWebhook}
                disabled={!webhookEnabled || isTesting || !webhookUrl}
              >
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP EMAIL */}
      <Card className="shadow-none border-orange-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2 text-orange-500">
                <Mail className="w-4 h-4" />
                SMTP Email (Postmark/SendGrid/dll)
              </CardTitle>
              <CardDescription>
                Kirim email peringatan otomatis menggunakan server SMTP Anda.
              </CardDescription>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} disabled={isSaving} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input 
                placeholder="smtp.postmarkapp.com" 
                value={smtpHost} 
                onChange={(e) => setSmtpHost(e.target.value)}
                disabled={!emailEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input 
                type="number"
                placeholder="587" 
                value={smtpPort} 
                onChange={(e) => setSmtpPort(e.target.value)}
                disabled={!emailEnabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Username</Label>
              <Input 
                placeholder="api_key" 
                value={smtpUser} 
                onChange={(e) => setSmtpUser(e.target.value)}
                disabled={!emailEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input 
                type="password"
                placeholder="********" 
                value={smtpPass} 
                onChange={(e) => setSmtpPass(e.target.value)}
                disabled={!emailEnabled}
              />
            </div>
          </div>

          <div className="space-y-2 border-b pb-4">
            <Label>Email Pengirim (From)</Label>
            <Input 
              type="email"
              placeholder="no-reply@domain.com" 
              value={smtpFrom} 
              onChange={(e) => setSmtpFrom(e.target.value)}
              disabled={!emailEnabled}
            />
            <p className="text-xs text-muted-foreground mt-1">Sistem akan otomatis mengirimkan peringatan ke alamat email Administrator.</p>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Kirim Uji Coba Email</Label>
            <div className="flex gap-2">
              <Input 
                type="email"
                placeholder="Alamat penerima uji coba..." 
                value={testEmailAddress} 
                onChange={(e) => setTestEmailAddress(e.target.value)}
                disabled={!emailEnabled}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={testEmail}
                disabled={!emailEnabled || isTesting || !testEmailAddress}
              >
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={saveConfig} disabled={isSaving || isTesting}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Konfigurasi Notifikasi
        </Button>
      </div>
    </div>
  );
}
