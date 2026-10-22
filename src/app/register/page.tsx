"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap, Link2, Lock, Mail, Upload, User, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlumniAvatar } from "@/components/alumni/Avatar";
import { signUp } from "@/lib/auth-client";

function resizeImageFile(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Please choose a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setFileError(null);
    try {
      const dataUrl = await resizeImageFile(file, 256);
      setAvatarUrl(dataUrl);
    } catch {
      setFileError("Could not process image file. Please try another.");
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await signUp.email({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: avatarUrl || undefined,
      });

      if (result.error) {
        const message = result.error.message || "Registration failed";
        setApiError(message);
        toast.error(message);
        return;
      }

      toast.success(`Welcome to AlumniHub, ${fullName.trim()}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setApiError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md mb-4">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Join the AlumniHub community to connect with fellow graduates
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card">
          {apiError && (
            <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Account Role Indicator */}
            <div className="rounded-lg border bg-muted/30 p-3 text-xs flex items-center justify-between">
              <div>
                <span className="font-medium text-foreground block">Assigned Role</span>
                <span className="text-muted-foreground text-[11px]">
                  Standard member access to browse & save alumni cards
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                USER
              </span>
            </div>

            {/* Profile Photo (Upload or URL) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Photo (Optional)</label>
              <div className="flex flex-col gap-3 rounded-lg border border-input/60 bg-muted/20 p-3 sm:flex-row sm:items-center">
                <AlumniAvatar
                  name={fullName || "User"}
                  avatarUrl={avatarUrl}
                  className="h-16 w-16 text-lg border-2 border-card shadow-xs shrink-0"
                />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="avatar-file"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                      {avatarUrl?.startsWith("data:") ? "Change uploaded file" : "Upload photo"}
                      <input
                        id="avatar-file"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                      />
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl(null);
                          setFileError(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Link2 className="h-3.5 w-3.5" /> Or image URL:
                    </span>
                    <input
                      id="avatar-url-input"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatarUrl && !avatarUrl.startsWith("data:") ? avatarUrl : ""}
                      onChange={(e) => {
                        setFileError(null);
                        const val = e.target.value.trim();
                        setAvatarUrl(val || null);
                      }}
                      disabled={isSubmitting}
                      className="field py-1 text-xs flex-1"
                    />
                  </div>

                  {avatarUrl?.startsWith("data:") ? (
                    <p className="text-[11px] text-muted-foreground">
                      Photo uploaded from device (optimized to 256 px)
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Upload from file explorer or paste a direct image URL (JPEG, PNG, WebP)
                    </p>
                  )}
                  {fileError && <p className="text-xs text-destructive">{fileError}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                className="field"
                aria-invalid={!!errors.fullName}
                disabled={isSubmitting}
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

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
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
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

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <Lock className="h-4 w-4 text-muted-foreground" />
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  className="field pr-10"
                  aria-invalid={!!errors.confirmPassword}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-6 gap-2"
              disabled={isSubmitting}
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 border-t pt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
