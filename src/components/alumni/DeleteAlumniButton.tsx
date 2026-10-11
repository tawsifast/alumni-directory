"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAlumniAction } from "@/app/actions";
import { DeleteConfirmation } from "./DeleteConfirmation";

export function DeleteAlumniButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteAlumniAction(id);
      if (result.ok) {
        toast.success("Alumni record deleted");
        router.push("/");
      } else {
        toast.error(result.error ?? "Could not delete the alumni record.");
      }
    });
  }

  return <DeleteConfirmation name={name} isDeleting={isDeleting} onConfirm={onConfirm} />;
}
