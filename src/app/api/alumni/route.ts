import type { NextRequest } from "next/server";
import { createAlumni, fetchAlumniList } from "@/lib/api";
import { alumniSchema } from "@/lib/schema";
import { SORT_OPTIONS } from "@/lib/query";
import type { SortOption } from "@/lib/types";
import { requireAdminApi } from "@/lib/auth-server";

function parseSort(value: string | null): SortOption | undefined {
  return SORT_OPTIONS.includes(value as SortOption) ? (value as SortOption) : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const year = params.get("graduationYear");
  const page = params.get("page");
  const limit = params.get("limit");

  const result = await fetchAlumniList(
    {
      search: params.get("search") ?? undefined,
      year: year ? Number(year) : undefined,
      department: params.get("department") ?? undefined,
      sort: parseSort(params.get("sort")),
      page: page ? Number(page) : undefined,
    },
    limit ? Number(limit) : undefined,
  );

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminApi();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = alumniSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const created = await createAlumni(parsed.data, authCheck.session.session.token);
  return Response.json(created, { status: 201 });
}
