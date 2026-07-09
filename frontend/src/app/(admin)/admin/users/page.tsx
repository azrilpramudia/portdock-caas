"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";;
import {
  Users, UserCheck, UserX, UserPlus, 
  Download, Plus, Loader2, ArrowUp
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// Extracted Components
import { UserToolbar } from "@/components/admin/users/UserToolbar";
import { UserTable } from "@/components/admin/users/UserTable";
import { AddUserModal, EditUserModal, ViewUserModal, DeleteUserModal } from "@/components/admin/users/UserModals";

export default function AdminUsersPage() {
  const { data, isLoading } = useAdminUsers();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Active filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, 7DAYS, 30DAYS

  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [userToView, setUserToView] = useState<any>(null);

  const handleExport = () => {
    if (!data?.users || data.users.length === 0) return;
    const csvRows = [];
    const headers = ['Name', 'Email', 'Role', 'Status', 'Projects', 'Containers', 'Joined At'];
    csvRows.push(headers.join(','));

    for (const user of data.users) {
      const row = [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        `"${user.status}"`,
        user.projectsCount || 0,
        user.containersCount || 0,
        `"${format(new Date(user.createdAt), "dd MMM yyyy")}"`
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portdock_users_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data?.stats;
  const users = data?.users || [];

  // Filter logic
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    const matchesStatus = statusFilter === "All Status" || user.status.toUpperCase() === statusFilter.toUpperCase();

    let matchesDate = true;
    if (dateFilter !== "ALL") {
      const userDate = new Date(user.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - userDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "7DAYS") matchesDate = diffDays <= 7;
      if (dateFilter === "30DAYS") matchesDate = diffDays <= 30;
    }

    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  });

  const activeFilterCount = (roleFilter !== "All Roles" ? 1 : 0) + 
                            (statusFilter !== "All Status" ? 1 : 0) + 
                            (dateFilter !== "ALL" ? 1 : 0) + 
                            (searchQuery !== "" ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("All Roles");
    setStatusFilter("All Status");
    setDateFilter("ALL");
    setCurrentPage(1);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setIsDeleteUserOpen(true);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-foreground">Users</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats?.totalUsers || 0}</h3>
              <div className="flex items-start text-[10px] xl:text-[11px] mt-0.5">
                <span className="font-bold flex items-center shrink-0 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 8%
                </span>
                <span className="text-muted-foreground ml-1.5 font-medium leading-tight pt-[1px]">dari minggu lalu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats?.activeUsers || 0}</h3>
              <div className="flex items-start text-[10px] xl:text-[11px] mt-0.5">
                <span className="font-bold flex items-center shrink-0 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 10%
                </span>
                <span className="text-muted-foreground ml-1.5 font-medium leading-tight pt-[1px]">dari minggu lalu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suspended Users */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspended Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats?.suspendedUsers || 0}</h3>
              <div className="flex items-start text-[10px] xl:text-[11px] mt-0.5">
                <span className="font-bold flex items-center shrink-0 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 2%
                </span>
                <span className="text-muted-foreground ml-1.5 font-medium leading-tight pt-[1px]">dari minggu lalu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Users */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Users (7 Hari)</p>
              <h3 className="text-2xl font-bold mt-1">{stats?.newUsers || 0}</h3>
              <div className="flex items-start text-[10px] xl:text-[11px] mt-0.5">
                <span className="font-bold flex items-center shrink-0 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 15%
                </span>
                <span className="text-muted-foreground ml-1.5 font-medium leading-tight pt-[1px]">dari minggu lalu</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        setCurrentPage={setCurrentPage}
        activeFilterCount={activeFilterCount}
        resetFilters={resetFilters}
      />

      <UserTable 
        filteredUsers={filteredUsers}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setUserToView={setUserToView}
        setIsViewUserOpen={setIsViewUserOpen}
        setUserToEdit={setUserToEdit}
        setIsEditUserOpen={setIsEditUserOpen}
        handleDeleteUser={handleDeleteUser}
        isDeleting={false}
      />

      {/* Modals */}
      <AddUserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} />
      <DeleteUserModal isOpen={isDeleteUserOpen} onClose={() => setIsDeleteUserOpen(false)} user={userToDelete} />
      <EditUserModal isOpen={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} user={userToEdit} />
      <ViewUserModal isOpen={isViewUserOpen} onClose={() => setIsViewUserOpen(false)} user={userToView} />
    </div>
  );
}
