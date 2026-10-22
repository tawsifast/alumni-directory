import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/saved/[alumniId]">
) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const { alumniId } = await context.params;
  if (!alumniId) {
    return Response.json(
      { success: false, message: "Valid alumniId is required" },
      { status: 400 }
    );
  }

  await prisma.savedAlumni.deleteMany({
    where: {
      userId: session.user.id,
      alumniId,
    },
  });

  return Response.json({
    success: true,
    message: "Alumni card removed from saved list",
  });
}

