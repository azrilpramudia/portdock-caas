import React from 'react';
import { ExternalLink, Lock, LockOpen, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const DUMMY_DOMAINS = [
  {
    id: 1,
    domain: 'ecommerce.portdock.id',
    project: 'E-Commerce API',
    framework: 'Node.js',
    userInitials: 'AP',
    userName: 'Azril Pramudia',
    userEmail: 'azril@example.com',
    avatarColor: 'bg-blue-600',
    ip: '103.152.118.45',
    status: 'Active',
    ssl: 'Valid',
    sslProvider: "Let's Encrypt",
    expiresDate: '15 Jun 2026',
    expiresDays: '13 hari lagi',
    createdDate: '15 Apr 2026',
    createdTime: '10:24'
  },
  {
    id: 2,
    domain: 'portfolio.portdock.id',
    project: 'Portfolio Web',
    framework: 'Next.js',
    userInitials: 'BS',
    userName: 'Budi Santoso',
    userEmail: 'budi@example.com',
    avatarColor: 'bg-emerald-600',
    ip: '103.152.118.46',
    status: 'Active',
    ssl: 'Valid',
    sslProvider: "Let's Encrypt",
    expiresDate: '14 Jul 2026',
    expiresDays: '42 hari lagi',
    createdDate: '14 Apr 2026',
    createdTime: '09:12'
  },
  {
    id: 3,
    domain: 'blog.portdock.id',
    project: 'Blog System',
    framework: 'PHP',
    userInitials: 'AW',
    userName: 'Andi Wijaya',
    userEmail: 'andi@example.com',
    avatarColor: 'bg-purple-600',
    ip: '103.152.118.47',
    status: 'Active',
    ssl: 'Valid',
    sslProvider: "Let's Encrypt",
    expiresDate: '12 Jun 2026',
    expiresDays: '10 hari lagi',
    createdDate: '12 Apr 2026',
    createdTime: '14:30'
  },
  {
    id: 4,
    domain: 'company.portdock.id',
    project: 'Company Profile',
    framework: 'Laravel',
    userInitials: 'SR',
    userName: 'Siti Rahma',
    userEmail: 'siti@example.com',
    avatarColor: 'bg-teal-600',
    ip: '103.152.118.48',
    status: 'Active',
    ssl: 'Valid',
    sslProvider: "Let's Encrypt",
    expiresDate: '10 Jul 2026',
    expiresDays: '38 hari lagi',
    createdDate: '10 Apr 2026',
    createdTime: '11:45'
  },
  {
    id: 5,
    domain: 'landing.portdock.id',
    project: 'Landing Page',
    framework: 'Next.js',
    userInitials: 'DR',
    userName: 'Dimas Ramadhan',
    userEmail: 'dimas@example.com',
    avatarColor: 'bg-amber-500',
    ip: '103.152.118.49',
    status: 'Active',
    ssl: 'Valid',
    sslProvider: "Let's Encrypt",
    expiresDate: '08 Jun 2026',
    expiresDays: '6 hari lagi',
    createdDate: '08 Apr 2026',
    createdTime: '16:20'
  },
  {
    id: 6,
    domain: 'staging.tasks.portdock.id',
    project: 'Task Management',
    framework: 'Node.js',
    userInitials: 'MR',
    userName: 'Muhammad Rizky',
    userEmail: 'rizky@example.com',
    avatarColor: 'bg-pink-600',
    ip: '103.152.118.50',
    status: 'Expiring Soon',
    ssl: 'Valid',
    sslProvider: "Let's Encrypt",
    expiresDate: '05 Jun 2026',
    expiresDays: '3 hari lagi',
    createdDate: '07 Apr 2026',
    createdTime: '13:10'
  },
  {
    id: 7,
    domain: 'api.mobile.portdock.id',
    project: 'Mobile Backend',
    framework: 'Express.js',
    userInitials: 'AG',
    userName: 'Agung Prasetyo',
    userEmail: 'agung@example.com',
    avatarColor: 'bg-emerald-600',
    ip: '103.152.118.51',
    status: 'Active',
    ssl: 'Valid',
    sslProvider: "Let's Encrypt",
    expiresDate: '03 Jul 2026',
    expiresDays: '31 hari lagi',
    createdDate: '03 Apr 2026',
    createdTime: '18:33'
  },
  {
    id: 8,
    domain: 'old-project.portdock.id',
    project: 'Old Project',
    framework: 'Python',
    userInitials: 'IN',
    userName: 'Intan Rahayu',
    userEmail: 'intan@example.com',
    avatarColor: 'bg-slate-500',
    ip: '103.152.118.52',
    status: 'Expired',
    ssl: 'Expired',
    sslProvider: "Let's Encrypt",
    expiresDate: '20 Mei 2026',
    expiresDays: 'Sudah Expired',
    createdDate: '20 Feb 2026',
    createdTime: '08:10'
  }
];

export function DomainTable() {
  return (
    <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-border text-[12px] font-semibold text-muted-foreground bg-muted/50">
              <th className="px-4 py-3 font-semibold">Domain</th>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">IP Address</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">SSL</th>
              <th className="px-4 py-3 font-semibold">Expires At</th>
              <th className="px-4 py-3 font-semibold">Created At</th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DUMMY_DOMAINS.map((row) => (
              <tr key={row.id} className="hover:bg-muted/10 transition-colors bg-card group">
                {/* Domain */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      row.status === 'Active' ? 'bg-emerald-500' : 
                      row.status === 'Expiring Soon' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <div className="font-bold text-[13px] text-foreground truncate flex items-center gap-1.5">
                      {row.domain}
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                    </div>
                  </div>
                </td>

                {/* Project */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-[13px] text-foreground truncate">{row.project}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{row.framework}</div>
                </td>

                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${row.avatarColor} text-[10px] font-bold text-white`}>
                      {row.userInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[12px] text-foreground truncate">{row.userName}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{row.userEmail}</div>
                    </div>
                  </div>
                </td>

                {/* IP Address */}
                <td className="px-4 py-3">
                  <div className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{row.ip}</div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                    row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 
                    row.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      row.status === 'Active' ? 'bg-emerald-500' : 
                      row.status === 'Expiring Soon' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    {row.status}
                  </div>
                </td>

                {/* SSL */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {row.ssl === 'Valid' ? (
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <LockOpen className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span className={`text-[13px] font-semibold ${row.ssl === 'Valid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.ssl}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{row.sslProvider}</div>
                </td>

                {/* Expires At */}
                <td className="px-4 py-3">
                  <div className="text-[13px] text-foreground font-medium mb-0.5">{row.expiresDate}</div>
                  <div className={`text-[11px] font-semibold ${
                    row.status === 'Active' ? 'text-emerald-600' : 
                    row.status === 'Expiring Soon' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {row.expiresDays}
                  </div>
                </td>

                {/* Created At */}
                <td className="px-4 py-3">
                  <div className="text-[13px] text-foreground font-medium mb-0.5">{row.createdDate}</div>
                  <div className="text-[11px] text-muted-foreground">{row.createdTime}</div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-50 shadow-none">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-50 shadow-none">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-rose-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shadow-none">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing 1 to 8 of 156 domains
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 bg-card border-border rounded-lg hover:bg-muted text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button variant="default" size="icon" className="h-8 w-8 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent">
            1
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg font-medium bg-card border-border text-muted-foreground hover:bg-muted">
            2
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg font-medium bg-card border-border text-muted-foreground hover:bg-muted">
            3
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg font-medium bg-card border-border text-muted-foreground hover:bg-muted disabled:opacity-100" disabled>
            ...
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg font-medium bg-card border-border text-muted-foreground hover:bg-muted">
            20
          </Button>
          
          <Button variant="outline" size="icon" className="h-8 w-8 bg-card border-border rounded-lg hover:bg-muted text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
