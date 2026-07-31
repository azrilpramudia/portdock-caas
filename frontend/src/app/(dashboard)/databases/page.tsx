"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings";
import { DatabaseTable } from "@/components/databases/DatabaseTable";
import { DatabaseModals } from "@/components/databases/DatabaseModals";
import { useDatabases, useDatabaseBackups } from "@/hooks/useDatabases";
import { ManagedDatabase } from "@/types";

export default function DatabasesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [backupDb, setBackupDb] = useState<ManagedDatabase | null>(null);
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [deleteBackupId, setDeleteBackupId] = useState<string | null>(null);
  const { settings } = useSettingsStore();
  const dbPortalUrl = settings?.dbPortalUrl;

  const {
    databases,
    isLoading,
    refetch,
    deleteMutation,
    startMutation,
    stopMutation,
    restartMutation,
  } = useDatabases();

  const {
    backups,
    isBackupsLoading,
    createBackupMutation,
    deleteBackupMutation,
    restoreBackupMutation,
  } = useDatabaseBackups(backupDb?.id);

  const handleDeleteSuccess = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null)
      });
    }
  };

  return (
    <div className="space-y-8">
      <DatabaseTable 
        databases={databases}
        isLoading={isLoading}
        refetch={refetch}
        startMutation={startMutation}
        stopMutation={stopMutation}
        restartMutation={restartMutation}
        setDeleteId={setDeleteId}
        setBackupDb={setBackupDb}
        dbPortalUrl={dbPortalUrl}
      />

      <DatabaseModals 
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        deleteMutation={deleteMutation}
        backupDb={backupDb}
        setBackupDb={setBackupDb}
        backups={backups}
        isBackupsLoading={isBackupsLoading}
        createBackupMutation={createBackupMutation}
        restoreBackupId={restoreBackupId}
        setRestoreBackupId={setRestoreBackupId}
        restoreBackupMutation={restoreBackupMutation}
        deleteBackupId={deleteBackupId}
        setDeleteBackupId={setDeleteBackupId}
        deleteBackupMutation={deleteBackupMutation}
        handleDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
