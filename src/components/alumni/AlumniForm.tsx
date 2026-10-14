"use client";

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { alumniformSchema } from "@/lib/schema";
import { DEPARTMENTS, type ActionResult, type AlumniFormData } from "@/lib/types";
import { AlumniAvatar } from "./Avatar";

type FormValues = Record<keyof AlumniFormData, string>;
type FormErrors = Partial<Record<keyof AlumniFormData, string>>;

interface AlumniFormProps {
  initialValues?: AlumniFormData | undefined;
  submitLabel: string;
  action: (data: AlumniFormData) => Promise<ActionResult>;
  onSuccess: (result: ActionResult) => void;
  onCancel: () => void;
}

function resizeImageFile(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AlumniForm({
  initialValues,
  submitLabel,
  action,
  onSuccess,
  onCancel,
}: AlumniFormProps) {
  const [values, setValues] = useState<FormValues>({
    fullName: initialValues?.fullName ?? "",
    email: initialValues?.email ?? "",
    graduationYear: initialValues ? String(initialValues.graduationYear) : "",
    department: initialValues?.department ?? "",
    currentCompany: initialValues?.currentCompany ?? "",
    currentPosition: initialValues?.currentPosition ?? "",
    location: initialValues?.location ?? "",
    avatarUrl: initialValues?.avatarUrl ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  function update(field: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Please choose a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setFileError(null);
    try {
      const dataUrl = await resizeImageFile(file, 256);
      update("avatarUrl", dataUrl);
    } catch {
      setFileError("Could not process image file. Please try another.");
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    const result = alumniformSchema.safeParse(values);
    if (!result.success) {
      const newErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        if (!newErrors[key]) newErrors[key] = issue.message;
      }
      setErrors(newErrors);
      return;
    }
    const d = result.data;
    const payload: AlumniFormData = {
      ...d,
      currentCompany: d.currentCompany || null,
      currentPosition: d.currentPosition || null,
      location: d.location || null,
      avatarUrl: d.avatarUrl || null,
    };

    startTransition(async () => {
      const res = await action(payload);
      if (res.ok) onSuccess(res);
      else setApiError(res.error ?? "Something went wrong.");
    });
  }

  function field(name: keyof FormValues, label: string, required = false, type = "text") {
    return (
      <div className="space-y-1.5">
        <label htmlFor={name} className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <input
          id={name}
          type={type}
          value={values[name]}
          onChange={(e) => update(name, e.target.value)}
          className="field"
          aria-invalid={!!errors[name]}
        />
        {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
      </div>
    );
  }

  const departments =
    values.department && !DEPARTMENTS.includes(values.department)
      ? [values.department, ...DEPARTMENTS]
      : DEPARTMENTS;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-lg border bg-card p-6 shadow-card"
    >
      {apiError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {field("fullName", "Full name", true)}
        {field("email", "Email", true, "email")}
        {field("graduationYear", "Graduation year", true, "number")}
        <div className="space-y-1.5">
          <label htmlFor="department" className="text-sm font-medium">
            Department <span className="text-destructive">*</span>
          </label>
          <select
            id="department"
            value={values.department}
            onChange={(e) => update("department", e.target.value)}
            className="field"
            aria-invalid={!!errors.department}
          >
            <option value="">Select a department</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
        </div>
        {field("currentCompany", "Current company")}
        {field("currentPosition", "Current position")}
        {field("location", "Location")}

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Profile photo</label>
          <div className="flex flex-col gap-4 rounded-md border border-input/60 bg-muted/20 p-3 sm:flex-row sm:items-center">
            <AlumniAvatar
              name={values.fullName || "Alumni"}
              avatarUrl={values.avatarUrl}
              className="h-16 w-16 text-lg border-2 border-card shadow-xs"
            />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="photo-file"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  Choose from computer
                  <input
                    id="photo-file"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                {values.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => update("avatarUrl", "")}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" /> Remove photo
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Or URL:</span>
                <input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={values.avatarUrl.startsWith("data:") ? "" : values.avatarUrl}
                  onChange={(e) => update("avatarUrl", e.target.value)}
                  className="field py-1 text-xs"
                  aria-invalid={!!errors.avatarUrl}
                />
              </div>
            </div>
          </div>
          {fileError && <p className="text-xs text-destructive">{fileError}</p>}
          {errors.avatarUrl && <p className="text-xs text-destructive">{errors.avatarUrl}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
