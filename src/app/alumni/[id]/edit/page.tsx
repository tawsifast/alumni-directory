import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditAlumniForm } from "@/components/alumni/EditAlumniForm";
import { EmptyState, LoadingState } from "@/components/alumni/states";
import { fetchAlumniById } from "@/lib/api";
import { ApiError, type AlumniFormData } from "@/lib/types";

async function EditView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data: AlumniFormData;
  try {
    const record = await fetchAlumniById(id);
    data = {
      fullName: record.fullName,
      email: record.email,
      graduationYear: record.graduationYear,
      department: record.department,
      currentCompany: record.currentCompany,
      currentPosition: record.currentPosition,
      location: record.location,
      avatarUrl: record.avatarUrl,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          title="Profile not found"
          message="This alumni record doesn't exist or was removed."
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

  return <EditAlumniForm id={id} initialValues={data} />;
}

export default function Page(props: PageProps<"/alumni/[id]/edit">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </Link>
      <h1 className="mb-6 text-3xl font-semibold">Edit Alumni</h1>
      <Suspense fallback={<LoadingState label="Loading record…" />}>
        <EditView params={props.params} />
      </Suspense>
    </div>
  );
}
