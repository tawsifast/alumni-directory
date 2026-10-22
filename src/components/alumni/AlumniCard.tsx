import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import type { Alumni } from "@/lib/types";
import { AlumniAvatar } from "./Avatar";
import { BookmarkButton } from "./BookmarkButton";

export function AlumniCard({
  alumni,
  isSaved = false,
}: {
  alumni: Alumni;
  isSaved?: boolean;
}) {
  return (
    <div className="group relative flex flex-col justify-between rounded-lg border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40">
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/alumni/${alumni.id}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <AlumniAvatar
              name={alumni.fullName}
              avatarUrl={alumni.avatarUrl}
              className="h-12 w-12 text-base shrink-0"
            />
            <div className="min-w-0">
              <h3 className="truncate text-lg leading-tight font-semibold group-hover:text-primary transition-colors">
                {alumni.fullName}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Class of {alumni.graduationYear} · {alumni.department}
              </p>
            </div>
          </Link>

          <BookmarkButton
            alumniId={alumni.id}
            initialSaved={isSaved}
            alumniName={alumni.fullName}
            size="icon"
            variant="ghost"
            className="h-8 w-8 -mr-1 -mt-1 shrink-0"
          />
        </div>

        <Link href={`/alumni/${alumni.id}`} className="mt-4 block space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 truncate">
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {[alumni.currentPosition, alumni.currentCompany].filter(Boolean).join(" at ") ||
                "Not specified"}
            </span>
          </p>
          <p className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{alumni.location || "Not specified"}</span>
          </p>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
        <Link
          href={`/alumni/${alumni.id}`}
          className="text-primary font-medium hover:underline"
        >
          View Profile &rarr;
        </Link>
        <span className="text-[11px] text-muted-foreground/80">
          {alumni.department}
        </span>
      </div>
    </div>
  );
}
