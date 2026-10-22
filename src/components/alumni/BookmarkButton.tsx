"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { toggleSaveAlumniAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

interface BookmarkButtonProps {
  alumniId: string;
  initialSaved?: boolean;
  alumniName?: string;
  showLabel?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  onSavedChange?: (isSaved: boolean) => void;
}

export function BookmarkButton({
  alumniId,
  initialSaved = false,
  alumniName,
  showLabel = false,
  size = "icon",
  variant = "ghost",
  className = "",
  onSavedChange,
}: BookmarkButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  async function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please sign in to bookmark alumni cards.", {
        action: {
          label: "Log in",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    const previousState = isSaved;
    const nextState = !previousState;
    setIsSaved(nextState);
    if (onSavedChange) onSavedChange(nextState);

    startTransition(async () => {
      const res = await toggleSaveAlumniAction(alumniId);
      if (res.ok) {
        const saved = res.saved ?? nextState;
        setIsSaved(saved);
        if (onSavedChange) onSavedChange(saved);

        if (saved) {
          toast.success(
            alumniName ? `Saved ${alumniName} to your list.` : "Alumnus saved to your list."
          );
        } else {
          toast.info(
            alumniName
              ? `Removed ${alumniName} from your list.`
              : "Alumnus removed from your list."
          );
        }
      } else {
        // Revert on error
        setIsSaved(previousState);
        if (onSavedChange) onSavedChange(previousState);
        toast.error(res.error || "Could not update saved status.");
      }
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      variant={variant}
      size={size}
      aria-label={isSaved ? "Remove from saved alumni" : "Save alumni card"}
      title={isSaved ? "Remove from saved alumni" : "Save alumni card"}
      className={`transition-colors ${
        isSaved
          ? "text-primary hover:text-primary/80 fill-primary"
          : "text-muted-foreground hover:text-foreground"
      } ${className}`}
    >
      <Bookmark
        className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`}
      />
      {showLabel && (
        <span className="ml-1.5 text-xs font-medium">
          {isSaved ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
}

