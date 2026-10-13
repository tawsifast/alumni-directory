import { ApiError, type Alumni, type AlumniFormData, type AlumniListResponse, type AlumniQuery } from "@/lib/types";

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

export async function createAlumni(data: AlumniFormData): Promise<Alumni> {
  const url = `${API_BASE_URL}/api/alumni`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = (await res.json().catch(() => ({}))) as BackendItemResponse;

  if (!res.ok) {
    throw new ApiError(json.message || "Failed to create alumni record", res.status);
  }

  return json.data;
}

export async function updateAlumni(id: string, data: Partial<AlumniFormData>): Promise<Alumni> {
  const url = `${API_BASE_URL}/api/alumni/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = (await res.json().catch(() => ({}))) as BackendItemResponse;

  if (!res.ok) {
    throw new ApiError(json.message || "Failed to update alumni record", res.status);
  }

  return json.data;
}

export async function deleteAlumni(id: string): Promise<void> {
  const url = `${API_BASE_URL}/api/alumni/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as BackendErrorResponse;
    throw new ApiError(errorBody.message || "Failed to delete alumni record", res.status);
  }
}

