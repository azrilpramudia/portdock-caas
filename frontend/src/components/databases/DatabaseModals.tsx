"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Archive, Plus, Download, Undo2 } from "lucide-react";
import { ManagedDatabase, DatabaseBackup } from "@/types";

interface DatabaseModalsProps {
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  deleteMutation: any;
  backupDb: ManagedDatabase | null;
  setBackupDb: (db: ManagedDatabase | null) => void;
  backups: DatabaseBackup[];
  isBackupsLoading: boolean;
  createBackupMutation: any;
  restoreBackupId: string | null;
  setRestoreBackupId: (id: string | null) => void;
  restoreBackupMutation: any;
  deleteBackupId: string | null;
  setDeleteBackupId: (id: string | null) => void;
  deleteBackupMutation: any;
  handleDeleteSuccess: () => void;
}

export function DatabaseModals({
  deleteId,
  setDeleteId,
  deleteMutation,
  backupDb,
  setBackupDb,
  backups,
  isBackupsLoading,
  createBackupMutation,
  restoreBackupId,
  setRestoreBackupId,
  restoreBackupMutation,
  deleteBackupId,
  setDeleteBackupId,
  deleteBackupMutation,
  handleDeleteSuccess
}: DatabaseModalsProps) {
  return (
    <>
      {/* Delete Database Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Database
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              Are you sure you want to delete this database? This will permanently erase all data, volumes, and configurations. This action <strong>cannot</strong> be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSuccess}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Backups Dialog */}
      <Dialog open={!!backupDb} onOpenChange={(open) => !open && setBackupDb(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-purple-500" /> Manage Backups for {backupDb?.name}
            </DialogTitle>
            <DialogDescription>
              Create, restore, or download backups for this database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
            <div className="flex justify-end">
              <Button 
                onClick={() => backupDb && createBackupMutation.mutate(backupDb.id)}
                disabled={createBackupMutation.isPending || backupDb?.status !== 'RUNNING'}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md text-xs h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> 
                {createBackupMutation.isPending ? "Creating..." : "Create Backup"}
              </Button>
            </div>
            
            {backupDb?.status !== 'RUNNING' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-lg text-xs font-medium">
                Database must be running to create or restore backups.
              </div>
            )}

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs">File</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Size</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isBackupsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">Loading backups...</td>
                    </tr>
                  ) : backups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">No backups found.</td>
                    </tr>
                  ) : (
                    backups.map((backup: DatabaseBackup) => (
                      <tr key={backup.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-xs">
                          {new Date(backup.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono truncate max-w-[150px]" title={backup.filename}>
                          {backup.filename}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {backup.sizeBytes ? `${(backup.sizeBytes / 1024 / 1024).toFixed(2)} MB` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            backup.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                            backup.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                          }`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <a 
                              href={backupDb ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/databases/${backupDb.id}/backups/${backup.id}/download` : '#'}
                              target="_blank"
                              download
                              className={backup.status !== 'SUCCESS' || !backupDb ? 'pointer-events-none opacity-50' : ''}
                            >
                              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={backup.status !== 'SUCCESS' || !backupDb}>
                                <Download className="w-3.5 h-3.5 text-blue-500" />
                              </Button>
                            </a>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              disabled={backup.status !== 'SUCCESS' || restoreBackupMutation.isPending || backupDb?.status !== 'RUNNING'}
                              onClick={() => setRestoreBackupId(backup.id)}
                            >
                              <Undo2 className="w-3.5 h-3.5 text-amber-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              disabled={deleteBackupMutation.isPending}
                              onClick={() => setDeleteBackupId(backup.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Confirm Dialog */}
      <Dialog open={!!restoreBackupId} onOpenChange={() => setRestoreBackupId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-amber-600 flex items-center gap-2">
              <Undo2 className="w-5 h-5" /> Restore Backup
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              Are you sure you want to restore this backup? This will <strong>overwrite</strong> your current database data and cannot be undone!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setRestoreBackupId(null)} disabled={restoreBackupMutation.isPending}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                if (backupDb && restoreBackupId) {
                  restoreBackupMutation.mutate({ dbId: backupDb.id, backupId: restoreBackupId });
                  setRestoreBackupId(null);
                }
              }}
              disabled={restoreBackupMutation.isPending}
            >
              {restoreBackupMutation.isPending ? "Restoring..." : "Restore Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Backup Confirm Dialog */}
      <Dialog open={!!deleteBackupId} onOpenChange={() => setDeleteBackupId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Backup File
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              Are you sure you want to delete this backup file? This action <strong>cannot</strong> be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteBackupId(null)} disabled={deleteBackupMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (backupDb && deleteBackupId) {
                  deleteBackupMutation.mutate({ dbId: backupDb.id, backupId: deleteBackupId });
                  setDeleteBackupId(null);
                }
              }}
              disabled={deleteBackupMutation.isPending}
            >
              {deleteBackupMutation.isPending ? "Deleting..." : "Delete Backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
