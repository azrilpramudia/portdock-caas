import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteAdminUser, useUpdateAdminUser, UserListItemDto } from "@/hooks/useAdminUsers";
import api from "@/lib/api";
import { AxiosError } from "axios";

export function AddUserModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
    }
  }, [isOpen]);

  const handleAddUser = async () => {
    try {
      setIsSubmitting(true);
      await api.post('/admin/users', newUser);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User created successfully");
      onClose();
    } catch (error: AxiosError<{ message: string | string[] }> | Error | unknown) {
      const msg = (error as AxiosError<{ message: string | string[] }>).response?.data?.message;
      const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Failed to create user";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleAddUser}
            disabled={isSubmitting || !newUser.name || !newUser.email || !newUser.password}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteUserModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: { id: string, name: string } | null }) {
  const deleteUserMutation = useDeleteAdminUser();

  const confirmDelete = () => {
    if (user) {
      deleteUserMutation.mutate(user.id, {
        onSuccess: () => {
          toast.success("User deleted successfully");
          onClose();
        },
        onError: (error: AxiosError<{ message: string }> | Error | any) => {
        toast.error(error.response?.data?.message || "Failed to update user");
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user "{user?.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <button 
            onClick={onClose}
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
  );
}

export function EditUserModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: UserListItemDto | null }) {
  const updateMutation = useUpdateAdminUser();
  const [userToEdit, setUserToEdit] = useState<(UserListItemDto & { password?: string }) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setUserToEdit({ ...user, password: '' });
    }
  }, [user, isOpen]);

  const handleEditSubmit = () => {
    if (!userToEdit) return;
    setIsSubmitting(true);
    
    const dataToSend = { ...userToEdit };
    if (!dataToSend.password) {
      delete (dataToSend as any).password;
    }

    updateMutation.mutate({ id: userToEdit.id, data: dataToSend }, {
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success("User updated successfully");
        onClose();
      },
      onError: (error: Error | any) => {
        setIsSubmitting(false);
        const msg = error.response?.data?.message;
        const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Failed to update user";
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                value={(userToEdit as any).password || ''} 
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
                  onChange={(e) => setUserToEdit({...userToEdit, role: e.target.value as "ADMIN" | "USER"})}
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
                  onChange={(e) => setUserToEdit({...userToEdit, status: e.target.value as "ACTIVE" | "SUSPENDED"})}
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
            onClick={onClose}
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
  );
}

export function ViewUserModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: UserListItemDto | null }) {
  if (!user) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="grid gap-4 py-4 text-sm">
            <div className="flex flex-col items-center justify-center gap-2 pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-blue-500">
                {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Status</p>
                <p className="font-medium">{user.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Projects</p>
                <p className="font-medium">{user.projectsCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Containers</p>
                <p className="font-medium">{user.containersCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Joined</p>
                <p className="font-medium">{format(new Date(user.createdAt), "dd MMM yyyy", { locale: id })}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Last Login</p>
                <p className="font-medium">
                  {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true, locale: id }) : 'Never'}
                </p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors w-full"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
