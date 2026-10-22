"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, GraduationCap, Lock, LogIn, Mail, ShieldCheck, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient, signIn } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUnauthorized = searchParams.get("error") === "unauthorized";
  const nextUrl = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFillDemo(role: "user" | "admin") {
    setApiError(null);
    setErrors({});
    if (role === "user") {
      setEmail("levi@gmai.com");
      setPassword("Levi12345");
      toast.info("Filled with demo User credentials");
    } else {
      setEmail("eren@gmail.com");
      setPassword("Eren12345");
      toast.info("Filled with demo Admin credentials");
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        const message = result.error.message || "Invalid email or password";
        setApiError(message);
        toast.error(message);
        return;
      }

      // Retrieve the trusted role from the server-verified session
      const sessionResult = await authClient.getSession();
      const user = sessionResult.data?.user as { role?: string; name?: string } | undefined;
      const role = user?.role || "USER";

      toast.success(`Welcome back, ${user?.name || "User"}!`);

      // Redirect ADMIN users to /admin, and normal USER users to /dashboard (or requested next page)
      if (role === "ADMIN") {
        router.push(nextUrl || "/admin");
      } else {
        router.push(nextUrl && !nextUrl.startsWith("/admin") ? nextUrl : "/dashboard");
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed. Please try again.";
      setApiError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md mb-4">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Sign In to AlumniHub</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your credentials to access your account
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card">
        {isUnauthorized && (
          <div className="mb-5 flex items-start gap-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Administrator access required. Please sign in with an administrator account.</span>
          </div>
        )}

        {apiError && (
          <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {apiError}
          </div>
        )}

        {/* Demo Account Quick Buttons */}
        <div className="mb-6 rounded-lg border border-border/80 bg-muted/40 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Demo Credentials
            </span>
            <span className="text-[11px] text-muted-foreground">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("user")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-accent hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>User Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("admin")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className="field"
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className="field pr-10"
                aria-invalid={!!errors.password}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            className="w-full mt-6 gap-2"
            disabled={isSubmitting}
          >
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 border-t pt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
