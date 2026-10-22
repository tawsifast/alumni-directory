import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/users/[id]/role">
) {
  const authCheck = await requireAdminApi();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { id } = await context.params;
  if (!id) {
    return Response.json({ success: false, message: "Valid ID is required" }, { status: 400 });
  }

  if (authCheck.session.user.id === id) {
    return Response.json(
      {
        success: false,
        message: "Administrators cannot change their own role to prevent self-lockout",
      },
      { status: 400 }
    );
  }

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const role = body?.role?.trim().toUpperCase();
  if (!role || (role !== "USER" && role !== "ADMIN")) {
    return Response.json(
      { success: false, message: "Valid role is required (USER or ADMIN)" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return Response.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({
    success: true,
    message: `User role successfully updated to ${role}`,
    data: updated,
  });
}

