import { requireAdminApi } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export async function GET() {
  const authCheck = await requireAdminApi();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const [totalAlumni, totalUsers, totalAdmins] = await Promise.all([
    prisma.alumni.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  return Response.json({
    success: true,
    data: {
      totalAlumni,
      totalUsers,
      totalAdmins,
    },
  });
}

