import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookOpen,
  GraduationCap,
  Mail,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { AlumniAvatar } from "@/components/alumni/Avatar";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const session = await requireUser();
  const params = await searchParams;
  const isUnauthorized = params.error === "unauthorized";

  const user = session.user;
  const isAdmin = user.role === "ADMIN";

  // Fetch directory and user statistics
  const [totalAlumni, departments, savedCount] = await Promise.all([
    prisma.alumni.count(),
    prisma.alumni.groupBy({
      by: ["department"],
      _count: { department: true },
    }),
    prisma.savedAlumni.count({
      where: { userId: user.id },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Unauthorized alert if redirected from /admin */}
      {isUnauthorized && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h4 className="font-semibold">Access Restricted</h4>
            <p className="mt-0.5 text-xs text-amber-700/90 dark:text-amber-300/90">
              You do not have administrative privileges to access the requested page. Only users with the <span className="font-semibold">ADMIN</span> role can access the administration dashboard or modify alumni records.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <AlumniAvatar
            name={user.name}
            avatarUrl={user.image}
            className="h-16 w-16 text-xl border-2 border-primary/20 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome, {user.name}!
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isAdmin
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="h-3 w-3 mr-1" /> ADMIN
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3 w-3 mr-1" /> USER
                  </>
                )}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin ? (
            <>
              <Button asChild variant="default" size="sm" className="bg-purple-700 hover:bg-purple-800 text-white">
                <Link href="/admin" className="gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Go to Admin Panel
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/alumni/new" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add Alumni
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/saved" className="gap-1.5">
                <Bookmark className="h-4 w-4" /> Saved Alumni ({savedCount})
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/" className="gap-1.5">
              <BookOpen className="h-4 w-4" /> Browse Directory
            </Link>
          </Button>
        </div>
      </div>

      {/* Directory Quick Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Alumni</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold">{totalAlumni}</p>
          <p className="text-xs text-muted-foreground mt-1">Verified alumni in the directory</p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Saved Cards</span>
            <Bookmark className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold">{savedCount}</p>
          <Link href="/saved" className="text-xs text-primary hover:underline mt-1 inline-block">
            View bookmarked cards &rarr;
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Departments</span>
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold">{departments.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active academic departments</p>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">Alumni Directory</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Explore the complete directory of graduates, filter by graduation year or department, and bookmark profiles to your saved list.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/">
                Browse All Alumni <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <Bookmark className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">My Saved Alumni</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Access your personal list of saved alumni cards and contact details anytime. Manage and organize your bookmarked graduates.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button asChild size="sm" className="w-full justify-between">
              <Link href="/saved">
                View Saved Alumni ({savedCount}) <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
