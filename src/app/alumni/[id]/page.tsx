import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlumniAvatar } from "@/components/alumni/Avatar";
import { DeleteAlumniButton } from "@/components/alumni/DeleteAlumniButton";
import { EmptyState, LoadingState } from "@/components/alumni/states";
import { fetchAlumniById } from "@/lib/api";
import { ApiError } from "@/lib/types";

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | number | null | undefined;
}) {
  return (
    <div className="flex gap-3 rounded-md bg-muted/60 p-4">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "Not specified"}</p>
      </div>
    </div>
  );
}

async function ProfileView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data;
  try {
    data = await fetchAlumniById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          title="Profile not found"
          message="This alumni profile doesn't exist or was removed."
          action={
            <Button asChild size="sm">
              <Link href="/">Back to Directory</Link>
            </Button>
          }
        />
      );
    }
    throw error;
  }

  return (
    <article className="overflow-hidden rounded-lg border bg-card shadow-card">
      <div className="h-24 bg-hero" />
      <div className="px-6 pb-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <AlumniAvatar name={data.fullName} avatarUrl={data.avatarUrl} className="h-24 w-24 border-4 border-card text-3xl" />
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/alumni/${id}/edit`}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
            <DeleteAlumniButton id={id} name={data.fullName} />
          </div>
        </div>
        <h1 className="mt-4 text-3xl font-semibold">{data.fullName}</h1>
        <p className="text-muted-foreground">
          {[data.currentPosition, data.currentCompany].filter(Boolean).join(" at ") || "Alumnus"}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Detail
            icon={<Calendar className="h-4 w-4" />}
            label="Graduation year"
            value={data.graduationYear}
          />
          <Detail
            icon={<GraduationCap className="h-4 w-4" />}
            label="Department"
            value={data.department}
          />
          <Detail
            icon={<Building2 className="h-4 w-4" />}
            label="Current company"
            value={data.currentCompany}
          />
          <Detail
            icon={<Briefcase className="h-4 w-4" />}
            label="Current position"
            value={data.currentPosition}
          />
          <Detail icon={<MapPin className="h-4 w-4" />} label="Location" value={data.location} />
          <Detail icon={<Mail className="h-4 w-4" />} label="Email" value={data.email} />
        </div>
      </div>
    </article>
  );
}

export default function Page(props: PageProps<"/alumni/[id]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </Link>
      <Suspense fallback={<LoadingState label="Loading profile…" />}>
        <ProfileView params={props.params} />
      </Suspense>
    </div>
  );
}
