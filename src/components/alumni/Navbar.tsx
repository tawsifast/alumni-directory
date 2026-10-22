"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlumniAvatar } from "@/components/alumni/Avatar";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">AlumniHub</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin-only Add Alumni Button */}
          {user && isAdmin && (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link href="/alumni/new">
                <Plus className="h-4 w-4" /> Add Alumni
              </Link>
            </Button>
          )}

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Saved Alumni link for all authenticated users */}
                  <Button asChild size="sm" variant="ghost" className="gap-1.5 hidden md:inline-flex">
                    <Link href="/saved">
                      <Bookmark className="h-3.5 w-3.5" /> Saved
                    </Link>
                  </Button>

                  {isAdmin ? (
                    <Button
                      asChild
                      size="sm"
                      variant="default"
                      className="gap-1.5 hidden md:inline-flex bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      <Link href="/admin">
                        <ShieldCheck className="h-3.5 w-3.5" /> Admin Panel
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="ghost" className="gap-1.5 hidden md:inline-flex">
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                      </Link>
                    </Button>
                  )}

                  <div className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border">
                    <AlumniAvatar
                      name={user.name}
                      avatarUrl={user.image}
                      className="h-6 w-6 text-[10px]"
                    />
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isAdmin
                          ? "bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive gap-1.5"
                    title="Log out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/login" className="gap-1.5">
                      <LogIn className="h-4 w-4" />
                      <span>Log in</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile Admin Add Button */}
          {user && isAdmin && (
            <Button asChild size="sm" className="sm:hidden">
              <Link href="/alumni/new" aria-label="Add Alumni">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
