import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const items = await prisma.savedAlumni.findMany({
    where: { userId: session.user.id },
    include: {
      alumni: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    success: true,
    data: items.map((item) => ({
      id: item.id,
      savedAt: item.createdAt,
      alumni: item.alumni,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  let body: { alumniId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const alumniId = body?.alumniId?.trim();
  if (!alumniId) {
    return Response.json({ success: false, message: "alumniId is required" }, { status: 400 });
  }

  // Validate that the alumnus exists
  const alumnus = await prisma.alumni.findUnique({
    where: { id: alumniId },
  });

  if (!alumnus) {
    return Response.json({ success: false, message: "Alumni record not found" }, { status: 404 });
  }

  const saved = await prisma.savedAlumni.upsert({
    where: {
      userId_alumniId: {
        userId: session.user.id,
        alumniId,
      },
    },
    create: {
      userId: session.user.id,
      alumniId,
    },
    update: {},
    include: {
      alumni: true,
    },
  });

  return Response.json(
    {
      success: true,
      message: "Alumni card saved successfully",
      data: saved,
    },
    { status: 201 }
  );
}

