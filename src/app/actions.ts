"use server";

import { revalidatePath } from "next/cache";
import {
  createAlumni,
  deleteAlumni as deleteAlumniRecord,
  updateAlumni as updateAlumniRecord,
} from "@/lib/store";
import { alumniSchema } from "@/lib/schema";
import { ApiError, type ActionResult, type AlumniFormData } from "@/lib/types";

function messageOf(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function createAlumniAction(data: AlumniFormData): Promise<ActionResult> {
  const parsed = alumniSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    const created = await createAlumni(parsed.data);
    revalidatePath("/");
    return { ok: true, id: created.id };
  } catch (error) {
    return { ok: false, error: messageOf(error, "Could not create the alumni record.") };
  }
}

export async function updateAlumniAction(id: string, data: AlumniFormData): Promise<ActionResult> {
  const parsed = alumniSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    await updateAlumniRecord(id, parsed.data);
    revalidatePath("/");
    revalidatePath(`/alumni/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: messageOf(error, "Could not update the alumni record.") };
  }
}

export async function deleteAlumniAction(id: string): Promise<ActionResult> {
  try {
    await deleteAlumniRecord(id);
    revalidatePath("/");
    revalidatePath(`/alumni/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: messageOf(error, "Could not delete the alumni record.") };
  }
}
