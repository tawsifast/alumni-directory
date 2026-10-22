"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AlumniAvatar } from "@/components/alumni/Avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateUserRoleAction } from "@/app/actions";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: Date | string;
}

interface AdminUsersManagerProps {
  initialUsers: AdminUserRecord[];
  currentAdminId: string;
}

export function AdminUsersManager({ initialUsers, currentAdminId }: AdminUsersManagerProps) {
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isUpdating, startUpdateTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  function handleRoleChange(userId: string, newRole: "USER" | "ADMIN", name: string) {
    setUpdatingId(userId);
    startUpdateTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(
          newRole === "ADMIN"
            ? `"${name}" has been promoted to Administrator.`
            : `"${name}" has been demoted to Standard User.`
        );
      } else {
        toast.error(res.error || "Failed to update user role.");
      }
      setUpdatingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field pl-9 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground self-center">
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Current Role</th>
              <th className="px-4 py-3">Registered On</th>
              <th className="px-4 py-3 text-right">Role Management</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium text-sm">No registered users found</p>
                    <p className="text-xs">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isUserAdmin = u.role === "ADMIN";
                const isCurrentAdmin = u.id === currentAdminId;
                const nextRole: "USER" | "ADMIN" = isUserAdmin ? "USER" : "ADMIN";
                const isPendingThis = isUpdating && updatingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AlumniAvatar
                          name={u.name}
                          avatarUrl={u.image}
                          className="h-8 w-8 text-xs"
                        />
                        <div>
                          <p className="font-medium text-foreground flex items-center gap-1.5">
                            {u.name}
                            {isCurrentAdmin && (
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                (You)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          isUserAdmin
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                            : "bg-muted text-muted-foreground border"
                        }`}
                      >
                        {isUserAdmin ? (
                          <>
                            <ShieldCheck className="h-3 w-3 mr-1" /> ADMIN
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" /> USER
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isCurrentAdmin ? (
                        <span className="text-xs text-muted-foreground/60 italic">
                          Active session
                        </span>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isPendingThis}
                              className={`h-8 text-xs gap-1.5 font-medium ${
                                isUserAdmin
                                  ? "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 border-amber-200 dark:border-amber-800/60"
                                  : "text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/40 border-purple-200 dark:border-purple-800/60"
                              }`}
                            >
                              {isUserAdmin ? (
                                <>
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                  Demote to User
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Make Admin
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {isUserAdmin
                                  ? "Demote Administrator to Standard User?"
                                  : "Promote User to Administrator?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <span>
                                  Are you sure you want to change the role of{" "}
                                  <span className="font-semibold text-foreground">{u.name}</span>{" "}
                                  ({u.email}) from{" "}
                                  <span className="font-semibold">{u.role}</span> to{" "}
                                  <span className="font-semibold text-foreground">{nextRole}</span>?
                                </span>
                                {isUserAdmin ? (
                                  <span className="block text-xs text-muted-foreground">
                                    This user will no longer be able to access the admin dashboard or
                                    create, edit, and delete directory records.
                                  </span>
                                ) : (
                                  <span className="block text-xs text-muted-foreground">
                                    This user will gain full administrative privileges to manage all alumni
                                    records and access the admin dashboard.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRoleChange(u.id, nextRole, u.name)}
                                className={
                                  isUserAdmin
                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                    : "bg-purple-700 hover:bg-purple-800 text-white"
                                }
                              >
                                {isUserAdmin ? "Confirm Demotion" : "Confirm Promotion"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

