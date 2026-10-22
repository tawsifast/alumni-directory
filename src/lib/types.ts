export interface Alumni {
  id: string;
  fullName: string;
  email: string;
  graduationYear: number;
  department: string;
  currentCompany?: string | null | undefined;
  currentPosition?: string | null | undefined;
  location?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/** Data sent when creating or updating an alumnus. */
export type AlumniFormData = Omit<Alumni, "id" | "createdAt" | "updatedAt">;

export type SortOption = "name-asc" | "name-desc" | "year-desc" | "year-asc";

export interface AlumniQuery {
  search?: string | undefined;
  year?: number | undefined;
  department?: string | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
}

export interface AlumniListResponse {
  data: Alumni[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Result returned by Server Actions that mutate alumni data. */
export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

export const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Economics",
  "Architecture",
  "Mathematics",
  "Physics",
];

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: "USER" | "ADMIN" | string;
  image?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: User;
}

export interface SavedAlumniItem {
  id: string;
  savedAt: string | Date;
  alumni: Alumni;
}

export interface ToggleSaveResult {
  ok: boolean;
  saved?: boolean;
  error?: string;
}

