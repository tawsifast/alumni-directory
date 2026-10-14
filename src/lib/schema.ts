import { z } from "zod";

export function maxGraduationYear() {
  return new Date().getFullYear() + 6;
}

/** Schema for the raw string values produced by the form inputs. */
export const alumniformSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Max 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(255, "Max 255 characters")
    .email("Enter a valid email"),
  graduationYear: z.coerce
    .number()
    .int("Enter a whole year")
    .min(1950, "Year must be 1950 or later")
    .max(maxGraduationYear(), `Year must be ${maxGraduationYear()} or earlier`),
  department: z.string().trim().min(1, "Department is required"),
  currentCompany: z.string().trim().max(100, "Max 100 characters"),
  currentPosition: z.string().trim().max(100, "Max 100 characters"),
  location: z.string().trim().max(100, "Max 100 characters"),
  avatarUrl: z.string().trim().max(1000000, "Image is too large").optional().or(z.literal("")),
});

export type AlumniFormValues = z.infer<typeof alumniformSchema>;

/** Schema for a fully-formed alumni payload (used by Server Actions and Route Handlers). */
export const alumniSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Max 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(255, "Max 255 characters")
    .email("Enter a valid email"),
  graduationYear: z
    .number()
    .int("Enter a whole year")
    .min(1950, "Year must be 1950 or later")
    .max(maxGraduationYear(), `Year must be ${maxGraduationYear()} or earlier`),
  department: z.string().trim().min(1, "Department is required"),
  currentCompany: z.string().trim().max(100, "Max 100 characters").nullish(),
  currentPosition: z.string().trim().max(100, "Max 100 characters").nullish(),
  location: z.string().trim().max(100, "Max 100 characters").nullish(),
  avatarUrl: z.string().trim().max(1000000, "Image is too large").nullish(),
});
