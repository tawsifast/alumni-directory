import { authClient } from "@/lib/auth-client";
import {
  ApiError,
  type Alumni,
  type AlumniFormData,
  type AlumniListResponse,
  type AlumniQuery,
  type AuthResponse,
  type SavedAlumniItem,
  type User,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface BackendListResponse {
  success: boolean;
  data: Alumni[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BackendItemResponse {
  success: boolean;
  data: Alumni;
  message?: string;
}

interface BackendErrorResponse {
  success: boolean;
  message?: string;
}

/**
 * Retrieve the current client JWT token using Better Auth's token API.
 * Returns null when running on server or if unauthenticated.
 */
export async function getClientJwtToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const res = await authClient.token();
    if (res?.data?.token && typeof res.data.token === "string" && res.data.token.trim().length > 0) {
      return res.data.token.trim();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve an authentication token from explicit parameter or from Better Auth client.
 * Never returns empty, null, or undefined strings.
 */
async function resolveAuthToken(explicitToken?: string | null): Promise<string | null> {
  if (explicitToken && typeof explicitToken === "string" && explicitToken.trim().length > 0) {
    return explicitToken.trim();
  }
  const clientToken = await getClientJwtToken();
  if (clientToken && clientToken.trim().length > 0) {
    return clientToken.trim();
  }
  return null;
}

/**
 * Build request headers with Bearer authorization if a valid token exists.
 * Public requests omit Authorization header.
 */
async function buildHeaders(
  explicitToken?: string | null,
  extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extraHeaders,
  };

  const token = await resolveAuthToken(explicitToken);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// ---------------------------------------------------------------------------
// Public API Calls (No Authorization Header)
// ---------------------------------------------------------------------------

export async function fetchAlumniList(query: AlumniQuery = {}, pageSize = 9): Promise<AlumniListResponse> {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search.trim());
  if (query.year) params.set("graduationYear", String(query.year));
  if (query.department) params.set("department", query.department.trim());
  if (query.sort) params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  params.set("limit", String(pageSize));

  const url = `${API_BASE_URL}/api/alumni?${params.toString()}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as BackendErrorResponse;
    throw new ApiError(errorBody.message || "Failed to fetch alumni directory", res.status);
  }

  const json = (await res.json()) as BackendListResponse;

  return {
    data: json.data || [],
    total: json.total ?? 0,
    page: json.page ?? 1,
    pageSize: json.limit ?? pageSize,
  };
}

export async function fetchAlumniById(id: string): Promise<Alumni> {
  const url = `${API_BASE_URL}/api/alumni/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as BackendErrorResponse;
    throw new ApiError(errorBody.message || "Alumni not found", res.status);
  }

  const json = (await res.json()) as BackendItemResponse;
  return json.data;
}

export async function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
}): Promise<User> {
  const url = `${API_BASE_URL}/api/user/register`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = (await res.json().catch(() => ({}))) as AuthResponse;

  if (!res.ok || !json.success || !json.data) {
    throw new ApiError(json.message || "Registration failed", res.status);
  }

  return json.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<User> {
  const url = `${API_BASE_URL}/api/user/login`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = (await res.json().catch(() => ({}))) as AuthResponse;

  if (!res.ok || !json.success || !json.data) {
    throw new ApiError(json.message || "Invalid email or password", res.status);
  }

  return json.data;
}

// ---------------------------------------------------------------------------
// Protected API Calls (Attaches Bearer Token)
// ---------------------------------------------------------------------------

export async function fetchCurrentUser(token?: string | null): Promise<User> {
  const url = `${API_BASE_URL}/api/user/me`;
  const headers = await buildHeaders(token);

  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });

  const json = (await res.json().catch(() => ({}))) as {
    success: boolean;
    data: User;
    message?: string;
  };

  if (!res.ok || !json.success || !json.data) {
    if (res.status === 401) {
      throw new ApiError(json.message || "Authentication required", 401);
    }
    if (res.status === 403) {
      throw new ApiError(json.message || "Forbidden: Insufficient permissions", 403);
    }
    throw new ApiError(json.message || "Failed to fetch user profile", res.status);
  }

  return json.data;
}

export async function createAlumni(data: AlumniFormData, token?: string | null): Promise<Alumni> {
  const url = `${API_BASE_URL}/api/alumni`;
  const headers = await buildHeaders(token, { "Content-Type": "application/json" });

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const json = (await res.json().catch(() => ({}))) as BackendItemResponse;

  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError(json.message || "Authentication required", 401);
    }
    if (res.status === 403) {
      throw new ApiError(json.message || "Forbidden: Administrator role required", 403);
    }
    throw new ApiError(json.message || "Failed to create alumni record", res.status);
  }

  return json.data;
}

export async function updateAlumni(
  id: string,
  data: Partial<AlumniFormData>,
  token?: string | null
): Promise<Alumni> {
  const url = `${API_BASE_URL}/api/alumni/${encodeURIComponent(id)}`;
  const headers = await buildHeaders(token, { "Content-Type": "application/json" });

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });

  const json = (await res.json().catch(() => ({}))) as BackendItemResponse;

  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError(json.message || "Authentication required", 401);
    }
    if (res.status === 403) {
      throw new ApiError(json.message || "Forbidden: Administrator role required", 403);
    }
    throw new ApiError(json.message || "Failed to update alumni record", res.status);
  }

  return json.data;
}

export async function deleteAlumni(id: string, token?: string | null): Promise<void> {
  const url = `${API_BASE_URL}/api/alumni/${encodeURIComponent(id)}`;
  const headers = await buildHeaders(token);

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as BackendErrorResponse;
    if (res.status === 401) {
      throw new ApiError(errorBody.message || "Authentication required", 401);
    }
    if (res.status === 403) {
      throw new ApiError(errorBody.message || "Forbidden: Administrator role required", 403);
    }
    throw new ApiError(errorBody.message || "Failed to delete alumni record", res.status);
  }
}

export async function fetchSavedAlumni(token?: string | null): Promise<SavedAlumniItem[]> {
  const url = `${API_BASE_URL}/api/saved`;
  const headers = await buildHeaders(token);

  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as BackendErrorResponse;
    if (res.status === 401) {
      throw new ApiError(errorBody.message || "Authentication required", 401);
    }
    throw new ApiError(errorBody.message || "Failed to fetch saved alumni", res.status);
  }

  const json = (await res.json()) as { success: boolean; data: SavedAlumniItem[] };
  return json.data || [];
}

export async function saveAlumniCard(alumniId: string, token?: string | null): Promise<void> {
  const url = `${API_BASE_URL}/api/saved`;
  const headers = await buildHeaders(token, { "Content-Type": "application/json" });

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ alumniId }),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as BackendErrorResponse;
    if (res.status === 401) {
      throw new ApiError(errorBody.message || "Authentication required", 401);
    }
    throw new ApiError(errorBody.message || "Failed to save alumni card", res.status);
  }
}

export async function unsaveAlumniCard(alumniId: string, token?: string | null): Promise<void> {
  const url = `${API_BASE_URL}/api/saved/${encodeURIComponent(alumniId)}`;
  const headers = await buildHeaders(token);

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as BackendErrorResponse;
    if (res.status === 401) {
      throw new ApiError(errorBody.message || "Authentication required", 401);
    }
    throw new ApiError(errorBody.message || "Failed to remove alumni card", res.status);
  }
}

export async function fetchAdminStats(token?: string | null) {
  const url = `${API_BASE_URL}/api/admin/stats`;
  const headers = await buildHeaders(token);

  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError(json.message || "Authentication required", 401);
    }
    if (res.status === 403) {
      throw new ApiError(json.message || "Forbidden: Administrator role required", 403);
    }
    throw new ApiError(json.message || "Failed to fetch admin stats", res.status);
  }
  return json.data;
}

export async function fetchAdminUsers(token?: string | null) {
  const url = `${API_BASE_URL}/api/admin/users`;
  const headers = await buildHeaders(token);

  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError(json.message || "Authentication required", 401);
    }
    if (res.status === 403) {
      throw new ApiError(json.message || "Forbidden: Administrator role required", 403);
    }
    throw new ApiError(json.message || "Failed to fetch admin users", res.status);
  }
  return json.data;
}

export async function updateAdminUserRole(
  userId: string,
  role: "USER" | "ADMIN",
  token?: string | null
) {
  const url = `${API_BASE_URL}/api/admin/users/${encodeURIComponent(userId)}/role`;
  const headers = await buildHeaders(token, { "Content-Type": "application/json" });

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ role }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError(json.message || "Authentication required", 401);
    }
    if (res.status === 403) {
      throw new ApiError(json.message || "Forbidden: Administrator role required", 403);
    }
    throw new ApiError(json.message || "Failed to update user role", res.status);
  }
  return json.data;
}
