"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAlumniAction } from "@/app/actions";
import { AlumniForm } from "./AlumniForm";

export function NewAlumniForm() {
  const router = useRouter();

  return (
    <AlumniForm
      submitLabel="Add Alumni"
      action={createAlumniAction}
      onSuccess={(result) => {
        toast.success("Alumni was added");
        router.push(`/alumni/${result.id}`);
      }}
      onCancel={() => router.push("/")}
    />
  );
}
