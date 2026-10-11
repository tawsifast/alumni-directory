import { cn } from "@/lib/utils";

/** Profile photo placeholder built from the person's initials. */
export function AlumniAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
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
