import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

/**
 * Single Better Auth client instance for the entire frontend.
 * Used on client components for signIn, signUp, signOut, and useSession.
 */
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  plugins: [
    inferAdditionalFields<typeof auth>(),
    jwtClient(),
  ],
});


export const { signIn, signUp, signOut, useSession } = authClient;