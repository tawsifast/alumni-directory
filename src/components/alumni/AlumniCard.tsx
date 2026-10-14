import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import type { Alumni } from "@/lib/types";
import { AlumniAvatar } from "./Avatar";

export function AlumniCard({ alumni }: { alumni: Alumni }) {
  return (
    <Link
      href={`/alumni/${alumni.id}`}
      className="group flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="flex items-center gap-3">
        <AlumniAvatar name={alumni.fullName} avatarUrl={alumni.avatarUrl} className="h-12 w-12 text-base" />
        <div className="min-w-0">
          <h3 className="truncate text-lg leading-tight group-hover:text-primary">
            {alumni.fullName}
          </h3>
          <p className="text-xs text-muted-foreground">
            Class of {alumni.graduationYear} · {alumni.department}
          </p>
        </div>
      </div>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5" />
          {[alumni.currentPosition, alumni.currentCompany].filter(Boolean).join(" at ") ||
            "Not specified"}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          {alumni.location || "Not specified"}
        </p>
      </div>
    </Link>
  );
}
