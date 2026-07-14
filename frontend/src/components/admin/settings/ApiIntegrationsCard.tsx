import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Webhook, Key, ExternalLink } from "lucide-react";

export function ApiIntegrationsCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>API & Integrations</CardTitle>
        <CardDescription>
          Kelola API keys dan integrasi dengan layanan pihak ketiga
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-blue-500/10">
                <Key className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Personal Access Tokens</p>
                <p className="text-sm text-muted-foreground">Digunakan untuk mengakses Portdock API</p>
              </div>
            </div>
            <Button variant="outline" className="h-10 px-4 py-2 shadow-sm rounded-md font-medium">Manage</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-purple-500/10">
                <Webhook className="w-5 h-5 text-purple-600 dark:text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Webhooks</p>
                <p className="text-sm text-muted-foreground">Kirim event notifikasi ke layanan lain</p>
              </div>
            </div>
            <Button variant="outline" className="h-10 px-4 py-2 shadow-sm rounded-md font-medium">Manage</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-slate-500/10">
                <ExternalLink className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">OAuth Applications</p>
                <p className="text-sm text-muted-foreground">Aplikasi yang terhubung dengan Portdock</p>
              </div>
            </div>
            <Button variant="outline" className="h-10 px-4 py-2 shadow-sm rounded-md font-medium">Manage</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
