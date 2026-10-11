"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { alumniformSchema } from "@/lib/schema";
import { DEPARTMENTS, type ActionResult, type AlumniFormData } from "@/lib/types";

type FormValues = Record<keyof AlumniFormData, string>;
type FormErrors = Partial<Record<keyof AlumniFormData, string>>;

interface AlumniFormProps {
  initialValues?: AlumniFormData | undefined;
  submitLabel: string;
  action: (data: AlumniFormData) => Promise<ActionResult>;
  onSuccess: (result: ActionResult) => void;
  onCancel: () => void;
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
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  function update(field: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
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
