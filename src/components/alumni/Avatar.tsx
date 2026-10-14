"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AlumniAvatarProps {
  name: string;
  avatarUrl?: string | null | undefined;
  className?: string;
}

/** Profile photo with image display and initials fallback. */
export function AlumniAvatar({ name, avatarUrl, className }: AlumniAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  if (avatarUrl && !hasError) {
    return (
      <div
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={`${name} profile photo`}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={`${name} profile photo`}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-hero font-display font-semibold text-primary-foreground",
        className,
      )}
    >
      {initials}
    </div>
  );
}
