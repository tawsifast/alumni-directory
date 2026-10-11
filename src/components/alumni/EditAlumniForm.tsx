"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAlumniAction } from "@/app/actions";
import { AlumniForm } from "./AlumniForm";
import type { AlumniFormData } from "@/lib/types";

export function EditAlumniForm({
  id,
  initialValues,
}: {
  id: string;
  initialValues: AlumniFormData;
}) {
  const router = useRouter();

  return (
    <AlumniForm
      initialValues={initialValues}
      submitLabel="Save changes"
      action={(data) => updateAlumniAction(id, data)}
      onSuccess={() => {
        toast.success("Changes saved");
        router.push(`/alumni/${id}`);
      }}
      onCancel={() => router.push(`/alumni/${id}`)}
    />
  );
}
