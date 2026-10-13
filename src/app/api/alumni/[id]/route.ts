import type { NextRequest } from "next/server";
import { deleteAlumni, fetchAlumniById as getAlumniById, updateAlumni } from "@/lib/api";
import { alumniSchema } from "@/lib/schema";
import { ApiError } from "@/lib/types";

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ message: error.message }, { status: error.status });
  }
  return Response.json({ message: "Something went wrong" }, { status: 500 });
}

export async function GET(_request: NextRequest, context: RouteContext<"/api/alumni/[id]">) {
  const { id } = await context.params;
  try {
    const alumni = await getAlumniById(id);
    return Response.json(alumni);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext<"/api/alumni/[id]">) {
  const { id } = await context.params;

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

  try {
    const updated = await updateAlumni(id, parsed.data);
    return Response.json(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext<"/api/alumni/[id]">) {
  const { id } = await context.params;
  try {
    await deleteAlumni(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
