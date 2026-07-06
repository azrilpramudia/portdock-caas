import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";
import { Card } from "@/components/ui/card";

interface UserTableProps {
  filteredUsers: any[];
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  setUserToView: (user: any) => void;
  setIsViewUserOpen: (open: boolean) => void;
  setUserToEdit: (user: any) => void;
  setIsEditUserOpen: (open: boolean) => void;
  handleDeleteUser: (userId: string, userName: string) => void;
  isDeleting: boolean;
}

export function UserTable({
  filteredUsers,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setUserToView,
  setIsViewUserOpen,
  setUserToEdit,
  setIsEditUserOpen,
  handleDeleteUser,
  isDeleting
}: UserTableProps) {
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  return (
    <Card className="border-border shadow-sm overflow-hidden bg-card">
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
              paginatedUsers.map((user: any) => {
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
                          disabled={isDeleting}
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
            {Array.from({ length: totalPages }).map((_, i) => (
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
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground border border-input hover:bg-accent disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
