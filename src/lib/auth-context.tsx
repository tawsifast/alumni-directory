"use client";

import React, { createContext, useContext } from "react";
import { useSession, signOut } from "@/lib/auth-client";

/**
 * Better Auth's User shape with role support:
 *   id, name, email, emailVerified, image, role, createdAt, updatedAt
 */
export interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "USER" | "ADMIN" | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface AuthContextType {
  user: BetterAuthUser | null;
  /** true while the session is being fetched */
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  const user: BetterAuthUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image,
        role: ((session.user as Record<string, unknown>).role as string) || "USER",
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      }
    : null;

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isPending, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
