import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export interface ServerSessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "USER" | "ADMIN" | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServerSession {
  user: ServerSessionUser;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    userId: string;
  };
}

/**
 * Retrieve the current authenticated session on the server from Better Auth.
 * Reads trusted headers directly from the incoming request.
 */
export async function getServerSession(): Promise<ServerSession | null> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user) {
    return null;
  }

  return {
    session: session.session,
    user: {
      ...session.user,
      role: ((session.user as Record<string, unknown>).role as string) || "USER",
    },
  };
}

/**
 * Enforce authentication for protected pages on the server.
 * Redirects to /login if unauthenticated.
 */
export async function requireUser() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Enforce ADMIN role for protected administrative pages on the server.
 * Redirects to /login if unauthenticated.
 * Redirects to /dashboard with an unauthorized notice if the user is not ADMIN.
 */
export async function requireAdmin() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?next=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard?error=unauthorized");
  }

  return session;
}

/**
 * Server authorization check for API route handlers.
 * Returns a 401 response if unauthenticated or 403 response if not an ADMIN.
 */
export async function requireAdminApi(): Promise<
  | { authorized: true; session: ServerSession }
  | { authorized: false; response: Response }
> {
  const session = await getServerSession();

  if (!session) {
    return {
      authorized: false,
      response: Response.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      authorized: false,
      response: Response.json(
        { success: false, message: "Forbidden: Administrator role required" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    session,
  };
}

/**
 * Retrieve the current authenticated user's Better Auth JWT token on the server.
 * Returns null if the user is unauthenticated.
 */
export async function getServerJwtToken(): Promise<string | null> {
  try {
    const reqHeaders = await headers();
    const tokenRes = await auth.api.getToken({
      headers: reqHeaders,
    });
    return tokenRes?.token || null;
  } catch {
    return null;
  }
}

