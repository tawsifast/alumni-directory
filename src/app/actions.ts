"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getServerSession, getServerJwtToken } from "@/lib/auth-server";
import {
  createAlumni,
  deleteAlumni as deleteAlumniRecord,
  updateAlumni as updateAlumniRecord,
} from "@/lib/api";
import { alumniSchema } from "@/lib/schema";
import {
  ApiError,
  type ActionResult,
  type AlumniFormData,
  type ToggleSaveResult,
} from "@/lib/types";

function messageOf(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

/**
 * Create a new alumni record.
 * STRICT: Only users with the ADMIN role are authorized.
 */
export async function createAlumniAction(data: AlumniFormData): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "Authentication required" };
  }
  if (session.user.role !== "ADMIN") {
    return { ok: false, error: "Forbidden: Administrator role required to create alumni records." };
  }

  const jwtToken = await getServerJwtToken();
  if (!jwtToken) {
    return { ok: false, error: "Authentication token could not be generated" };
  }

  const parsed = alumniSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    const created = await createAlumni(parsed.data, jwtToken);
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, id: created.id };
  } catch (error) {
    return { ok: false, error: messageOf(error, "Could not create the alumni record.") };
  }
}

/**
 * Update an existing alumni record.
 * STRICT: Only users with the ADMIN role are authorized.
 */
export async function updateAlumniAction(id: string, data: AlumniFormData): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "Authentication required" };
  }
  if (session.user.role !== "ADMIN") {
    return { ok: false, error: "Forbidden: Administrator role required to edit alumni records." };
  }

  const jwtToken = await getServerJwtToken();
  if (!jwtToken) {
    return { ok: false, error: "Authentication token could not be generated" };
  }

  const parsed = alumniSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    await updateAlumniRecord(id, parsed.data, jwtToken);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/alumni/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: messageOf(error, "Could not update the alumni record.") };
  }
}

/**
 * Delete an alumni record.
 * STRICT: Only users with the ADMIN role are authorized.
 */
export async function deleteAlumniAction(id: string): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "Authentication required" };
  }
  if (session.user.role !== "ADMIN") {
    return { ok: false, error: "Forbidden: Administrator role required to delete alumni records." };
  }

  const jwtToken = await getServerJwtToken();
  if (!jwtToken) {
    return { ok: false, error: "Authentication token could not be generated" };
  }

  try {
    await deleteAlumniRecord(id, jwtToken);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/saved");
    revalidatePath(`/alumni/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: messageOf(error, "Could not delete the alumni record.") };
  }
}


/**
 * Toggle bookmarking/saving an alumni card for the authenticated user.
 * Available to both normal USERs and ADMINs.
 */
export async function toggleSaveAlumniAction(alumniId: string): Promise<ToggleSaveResult> {
  const session = await getServerSession();
  if (!session?.user) {
    return { ok: false, error: "Please log in to save alumni cards to your personal list." };
  }

  if (!alumniId || typeof alumniId !== "string") {
    return { ok: false, error: "Invalid alumni ID" };
  }

  try {
    const userId = session.user.id;

    // Check if alumnus exists
    const alumnus = await prisma.alumni.findUnique({
      where: { id: alumniId },
    });
    if (!alumnus) {
      return { ok: false, error: "Alumni record not found" };
    }

    // Check if already saved
    const existing = await prisma.savedAlumni.findUnique({
      where: {
        userId_alumniId: {
          userId,
          alumniId,
        },
      },
    });

    if (existing) {
      // Remove from saved list
      await prisma.savedAlumni.delete({
        where: { id: existing.id },
      });
      revalidatePath("/saved");
      revalidatePath("/dashboard");
      revalidatePath(`/alumni/${alumniId}`);
      revalidatePath("/");
      return { ok: true, saved: false };
    } else {
      // Add to saved list
      await prisma.savedAlumni.create({
        data: {
          userId,
          alumniId,
        },
      });
      revalidatePath("/saved");
      revalidatePath("/dashboard");
      revalidatePath(`/alumni/${alumniId}`);
      revalidatePath("/");
      return { ok: true, saved: true };
    }
  } catch (error) {
    return { ok: false, error: messageOf(error, "Failed to update saved alumni.") };
  }
}

/**
 * Fetch list of saved alumni IDs for the current user.
 */
export async function getSavedAlumniIdsAction(): Promise<string[]> {
  const session = await getServerSession();
  if (!session?.user) {
    return [];
  }

  const items = await prisma.savedAlumni.findMany({
    where: { userId: session.user.id },
    select: { alumniId: true },
  });

  return items.map((i) => i.alumniId);
}

/**
 * Remove an alumnus card from the user's saved list directly.
 */
export async function removeSavedAlumniAction(alumniId: string): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session?.user) {
    return { ok: false, error: "Authentication required" };
  }

  try {
    await prisma.savedAlumni.deleteMany({
      where: {
        userId: session.user.id,
        alumniId,
      },
    });

    revalidatePath("/saved");
    revalidatePath("/dashboard");
    revalidatePath(`/alumni/${alumniId}`);
    revalidatePath("/");
    return { ok: true, id: alumniId };
  } catch (error) {
    return { ok: false, error: messageOf(error, "Failed to remove saved alumni card.") };
  }
}

/**
 * Update another user's role (ADMIN only).
 * Prevents an admin from modifying their own role to avoid accidental lockout.
 */
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "USER" | "ADMIN"
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session?.user) {
    return { ok: false, error: "Authentication required" };
  }

  if (session.user.role !== "ADMIN") {
    return {
      ok: false,
      error: "Forbidden: Administrator role required to change user roles.",
    };
  }

  if (session.user.id === targetUserId) {
    return {
      ok: false,
      error: "You cannot change your own role to prevent losing administrative access.",
    };
  }

  if (newRole !== "USER" && newRole !== "ADMIN") {
    return { ok: false, error: "Role must be USER or ADMIN." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return { ok: false, error: "User not found." };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { ok: true, id: targetUserId };
  } catch (error) {
    return { ok: false, error: messageOf(error, "Failed to update user role.") };
  }
}
