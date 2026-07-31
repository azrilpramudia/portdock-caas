import React from 'react';
import { ExternalLink, Lock, LockOpen, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { AdminProjectListItemDto } from "@/hooks/useAdminProjects";

interface DomainTableProps {
  domains: AdminProjectListItemDto[];
  onView?: (domain: AdminProjectListItemDto) => void;
  onEdit?: (domain: AdminProjectListItemDto) => void;
  onDelete?: (domain: AdminProjectListItemDto) => void;
}

export function DomainTable({ domains, onView, onEdit, onDelete }: DomainTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(domains.length / itemsPerPage));

  // Reset page when domains array changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [domains]);

  if (!domains || domains.length === 0) {
    return (
      <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">No Domains Found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There are no domains mapped to any projects yet.
        </p>
      </Card>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDomains = domains.slice(startIndex, endIndex);

  return (
    <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-border text-[12px] font-semibold text-muted-foreground bg-muted/50">
              <th className="px-4 py-3 font-semibold">Domain</th>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">SSL</th>
              <th className="px-4 py-3 font-semibold">Created At</th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentDomains.map((row: AdminProjectListItemDto) => {
              const userInitials = row.user?.name ? row.user.name.substring(0, 2).toUpperCase() : 'U';
              const createdDate = row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '-';
              const createdTime = row.createdAt ? format(new Date(row.createdAt), 'HH:mm') : '-';
              const isActive = row.status === 'ACTIVE';

              return (
              <tr key={row.id} className="hover:bg-muted/10 transition-colors bg-card group">
                {/* Domain */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isActive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`} />
                    <div className="font-bold text-[13px] text-foreground truncate flex items-center gap-1.5">
                      {row.domain}
                      <a href={`http://${row.domain}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary" />
                      </a>
                    </div>
                  </div>
                </td>

                {/* Project */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-[13px] text-foreground truncate">{row.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{row.templateId}</div>
                </td>

                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-600 text-[10px] font-bold text-white`}>
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[12px] text-foreground truncate">{row.user?.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{row.user?.email}</div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                    isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 
                    'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`} />
                    {isActive ? 'Active' : row.status}
                  </div>
                </td>

                {/* SSL */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isActive ? (
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <LockOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className={`text-[13px] font-semibold ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      {isActive ? 'Valid' : 'Unknown'}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {row.sslExpiresAt ? `Expires: ${format(new Date(row.sslExpiresAt), 'dd MMM yyyy')}` : (isActive ? "Let's Encrypt" : "-")}
                  </div>
                </td>

                {/* Created At */}
                <td className="px-4 py-3">
                  <div className="text-[13px] text-foreground font-medium mb-0.5">{createdDate}</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{createdTime}</div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <TooltipProvider delay={300}>
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-50 shadow-none"
                            onClick={() => onView && onView(row)}
                          />
                        }>
                          <Eye className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Domain Details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delay={300}>
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-50 shadow-none"
                            onClick={() => onEdit && onEdit(row)}
                          />
                        }>
                          <Edit2 className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Domain Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delay={300}>
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg bg-card border-rose-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shadow-none"
                            onClick={() => onDelete && onDelete(row)}
                          />
                        }>
                          <Trash2 className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Domain</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {domains.length === 0 ? 0 : startIndex + 1} {domains.length > 1 ? `to ${Math.min(endIndex, domains.length)} ` : ''}of {domains.length} domains
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 bg-card border-border rounded-lg hover:bg-muted text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1)
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg font-medium bg-card border-border text-muted-foreground hover:bg-muted disabled:opacity-100" disabled>
                    ...
                  </Button>
                )}
                <Button 
                  variant={currentPage === page ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg font-medium ${currentPage === page ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 bg-card border-border rounded-lg hover:bg-muted text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
