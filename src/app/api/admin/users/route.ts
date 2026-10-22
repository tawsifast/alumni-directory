import { requireAdminApi } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export async function GET() {
  const authCheck = await requireAdminApi();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  return Response.json({
    success: true,
    data: users,
  });
}

