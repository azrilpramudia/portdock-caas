"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminUsers, useDeleteAdminUser, useUpdateAdminUser } from "@/hooks/useAdmin";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Users, UserCheck, UserX, UserPlus, 
  Search, Filter, Plus, Download,
  Eye, Pencil, Trash2, Loader2, Calendar, ChevronDown, X,
  ChevronLeft, ChevronRight, MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminUsersPage() {
  const { data, isLoading } = useAdminUsers();
  const deleteUserMutation = useDeleteAdminUser();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Active filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, 7DAYS, 30DAYS
  const [showFilters, setShowFilters] = useState(true);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);
  
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const updateUserMutation = useUpdateAdminUser();

  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [userToView, setUserToView] = useState<any>(null);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddUser = async () => {
    try {
      setIsSubmitting(true);
      await api.post('/admin/users', newUser);
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User created successfully");
    } catch (error: any) {
      const msg = error.response?.data?.message;
      const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Failed to create user";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
    // 1. Search filter
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Role filter
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    
    // 3. Status filter
    const matchesStatus = statusFilter === "All Status" || user.status.toUpperCase() === statusFilter.toUpperCase();

    // 4. Date filter
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

  const activeFilterCount = (roleFilter !== "All Roles" ? 1 : 0) + (statusFilter !== "All Status" ? 1 : 0) + (dateFilter !== "ALL" ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("All Roles");
    setStatusFilter("All Status");
    setDateFilter("ALL");
    setCurrentPage(1);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setUserToDelete(null);
          toast.success("User deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete user");
        }
      });
    }
  };

  const handleEditSubmit = () => {
    if (!userToEdit) return;
    setIsSubmitting(true);
    
    // Only send password if it was changed
    const dataToSend = { ...userToEdit };
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    updateUserMutation.mutate({ id: userToEdit.id, data: dataToSend }, {
      onSuccess: () => {
        setIsEditUserOpen(false);
        setUserToEdit(null);
        setIsSubmitting(false);
        toast.success("User updated successfully");
      },
      onError: (error: any) => {
        setIsSubmitting(false);
        const msg = error.response?.data?.message;
        const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Failed to update user";
        toast.error(errorMessage);
      }
    });
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
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
                ↑ 8% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
              </p>
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
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
                ↑ 10% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
              </p>
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
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
                ↑ 2% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
              </p>
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
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
                ↑ 15% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar Box */}
      <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-start xl:items-end">
        {/* Left: Search */}
        <div className="relative w-full flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 bg-background border-input h-[42px] rounded-md text-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all truncate"
          />
        </div>
        
        {/* Right: Filters */}
        <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
          {/* Role Dropdown */}
          <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Role</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                {roleFilter} <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => { setRoleFilter("All Roles"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setRoleFilter("USER"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  USER
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setRoleFilter("ADMIN"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  ADMIN
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Status</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                {statusFilter === "All Status" ? "All Status" : statusFilter === "ACTIVE" ? "Active" : "Suspended"} <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => { setStatusFilter("All Status"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("ACTIVE"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("SUSPENDED"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Date Range Dropdown */}
          <div className="flex flex-col w-[48%] sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  {dateFilter === "ALL" ? "All Time" : dateFilter === "7DAYS" ? "Last 7 Days" : "Last 30 Days"}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => { setDateFilter("ALL"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDateFilter("7DAYS"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDateFilter("30DAYS"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  Last 30 Days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filter Button */}
          <div className="flex flex-col w-full sm:w-auto">
            <button className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-border bg-card hover:bg-muted h-[42px] px-4 text-foreground shadow-none">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-y border-border text-[12px] font-semibold text-muted-foreground bg-muted/50">
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold text-center">Role</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Projects</th>
                <th className="px-6 py-3 font-semibold text-center">Containers</th>
                <th className="px-6 py-3 font-semibold">Last Login</th>
                <th className="px-6 py-3 font-semibold">Joined At</th>
                <th className="px-6 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user: any) => {
                  const initials = user.name
                    .split(' ')
                    .map((n: any) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();
                  
                  const isAdmin = user.role === 'ADMIN';
                  const isActive = user.status === 'ACTIVE';

                  return (
                    <tr key={user.id} className="hover:bg-muted/10 transition-colors bg-card">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white
                            ${isAdmin ? 'bg-purple-500' : 'bg-blue-500'}`}
                          >
                            {initials}
                          </div>
                          <span className="font-semibold text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide
                          ${isAdmin 
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' 
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold
                          ${isActive 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {isActive ? 'Active' : 'Suspended'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-foreground">{user.projectsCount}</td>
                      <td className="px-6 py-4 text-center font-medium text-foreground">{user.containersCount}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${user.lastLogin ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}></span>
                          {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true, locale: id }) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {format(new Date(user.createdAt), "dd MMM yyyy", { locale: id })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setUserToView(user);
                              setIsViewUserOpen(true);
                            }}
                            className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setUserToEdit({ ...user, password: '' });
                              setIsEditUserOpen(true);
                            }}
                            className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={deleteUserMutation.isPending}
                            className="w-8 h-8 rounded-md border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="text-[13px] text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium text-foreground">{filteredUsers.length}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground border border-input hover:bg-accent disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage)) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md text-[13px] font-medium transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))))}
              disabled={currentPage === Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))}
              className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground border border-input hover:bg-accent disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account manually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={newUser.name} 
                onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                placeholder="John Doe" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={newUser.email} 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                placeholder="john@example.com" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                placeholder="••••••••" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select 
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddUser}
              disabled={isSubmitting || !newUser.name || !newUser.email || !newUser.password}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button 
              onClick={() => {
                setDeleteConfirmOpen(false);
                setUserToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending}
              className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleteUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details. Leave password blank to keep it unchanged.
            </DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  value={userToEdit.name} 
                  onChange={(e) => setUserToEdit({...userToEdit, name: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  value={userToEdit.email} 
                  onChange={(e) => setUserToEdit({...userToEdit, email: e.target.value})} 
                  placeholder="john@example.com" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input 
                  id="edit-password" 
                  type="password" 
                  value={userToEdit.password} 
                  onChange={(e) => setUserToEdit({...userToEdit, password: e.target.value})} 
                  placeholder="••••••••" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <select 
                    id="edit-role"
                    value={userToEdit.role}
                    onChange={(e) => setUserToEdit({...userToEdit, role: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select 
                    id="edit-status"
                    value={userToEdit.status}
                    onChange={(e) => setUserToEdit({...userToEdit, status: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <button 
              onClick={() => setIsEditUserOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleEditSubmit}
              disabled={isSubmitting || !userToEdit?.name || !userToEdit?.email}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userToView && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="flex flex-col items-center justify-center gap-2 pb-4 border-b border-border">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-blue-500">
                  {userToView.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{userToView.name}</h3>
                  <p className="text-muted-foreground">{userToView.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Role</p>
                  <p className="font-medium">{userToView.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Status</p>
                  <p className="font-medium">{userToView.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Projects</p>
                  <p className="font-medium">{userToView.projectsCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Containers</p>
                  <p className="font-medium">{userToView.containersCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Joined</p>
                  <p className="font-medium">{format(new Date(userToView.createdAt), "dd MMM yyyy", { locale: id })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Last Login</p>
                  <p className="font-medium">
                    {userToView.lastLogin ? formatDistanceToNow(new Date(userToView.lastLogin), { addSuffix: true, locale: id }) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <button 
              onClick={() => setIsViewUserOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors w-full"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
