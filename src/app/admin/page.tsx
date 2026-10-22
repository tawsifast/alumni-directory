import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { AdminAlumniManager } from "@/components/admin/AdminAlumniManager";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default async function AdminDashboardPage() {
  // Strictly enforce server-side ADMIN authentication
  const session = await requireAdmin();

  // Load administrative summary and data
  const [totalAlumni, totalUsers, totalAdmins, registeredUsers, alumniList] = await Promise.all([
    prisma.alumni.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.alumni.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const currentAdmin = session.user;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Administration Dashboard
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              ADMIN
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Signed in as <span className="font-medium text-foreground">{currentAdmin.name}</span> ({currentAdmin.email})
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" /> User Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/" className="gap-1.5">
              <BookOpen className="h-4 w-4" /> View Directory
            </Link>
          </Button>
          <AdminLogoutButton />
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Alumni</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <GraduationCap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">{totalAlumni}</p>
          <p className="text-xs text-muted-foreground mt-1">Registered alumni records</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">{totalUsers}</p>
          <p className="text-xs text-muted-foreground mt-1">Accounts created in system</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Administrators</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">{totalAdmins}</p>
          <p className="text-xs text-muted-foreground mt-1">Users with elevated permissions</p>
        </div>
      </div>

      {/* Alumni Directory Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Alumni Management</h2>
            <p className="text-xs text-muted-foreground">
              Create, view, update, and delete directory records with full administrative privileges
            </p>
          </div>
        </div>

        <AdminAlumniManager initialAlumni={alumniList} />
      </div>

      {/* Registered Users & Role Management Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Registered Users & Role Management</h2>
            <p className="text-xs text-muted-foreground">
              Overview of all registered member accounts and manage administrative privileges
            </p>
          </div>
        </div>

        <AdminUsersManager
          initialUsers={registeredUsers}
          currentAdminId={currentAdmin.id}
        />
      </div>
    </div>
  );
}
