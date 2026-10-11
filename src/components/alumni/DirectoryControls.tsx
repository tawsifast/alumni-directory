"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEPARTMENTS, type SortOption } from "@/lib/types";
import { toSearchString, type DirectoryParams } from "@/lib/query";
import { SearchBar } from "./SearchBar";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

export function DirectoryControls(props: DirectoryParams) {
  const router = useRouter();
  const pathname = usePathname();

  const update = useCallback(
    (changes: Partial<DirectoryParams>) => {
      const next: DirectoryParams = {
        search: props.search,
        year: props.year,
        department: props.department,
        sort: props.sort,
        ...changes,
        page: undefined,
      };
      router.replace(`${pathname}${toSearchString(next)}`, { scroll: false });
    },
    [props.search, props.year, props.department, props.sort, router, pathname],
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <SearchBar value={props.search ?? ""} onSearch={(search) => update({ search: search || undefined })} />
      <div className="flex flex-wrap gap-2">
        <select
          aria-label="Graduation year"
          className="field w-auto"
          value={props.year ?? ""}
          onChange={(e) => update({ year: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">All years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          aria-label="Department"
          className="field w-auto"
          value={props.department ?? ""}
          onChange={(e) => update({ department: e.target.value || undefined })}
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort"
          className="field w-auto"
          value={props.sort ?? "name-asc"}
          onChange={(e) => update({ sort: e.target.value as SortOption })}
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="year-desc">Newest graduates</option>
          <option value="year-asc">Oldest graduates</option>
        </select>
      </div>
    </div>
  );
}
