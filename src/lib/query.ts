import type { AlumniQuery, SortOption } from "@/lib/types";

export const SORT_OPTIONS: SortOption[] = ["name-asc", "name-desc", "year-desc", "year-asc"];

export interface DirectoryParams {
  search?: string | undefined;
  year?: number | undefined;
  department?: string | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseDirectoryParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): DirectoryParams {
  const search = first(searchParams["search"])?.trim() || undefined;
  const department = first(searchParams["department"])?.trim() || undefined;

  const yearRaw = first(searchParams["year"]);
  const yearParsed = yearRaw ? Number(yearRaw) : NaN;
  const year = Number.isInteger(yearParsed) && yearParsed > 0 ? yearParsed : undefined;

  const sortRaw = first(searchParams["sort"]);
  const sort = SORT_OPTIONS.includes(sortRaw as SortOption) ? (sortRaw as SortOption) : undefined;

  const pageRaw = first(searchParams["page"]);
  const pageParsed = pageRaw ? Number(pageRaw) : NaN;
  const page = Number.isInteger(pageParsed) && pageParsed > 1 ? pageParsed : undefined;

  return { search, year, department, sort, page };
}

export function toAlumniQuery(params: DirectoryParams): AlumniQuery {
  return {
    search: params.search,
    year: params.year,
    department: params.department,
    sort: params.sort ?? "name-asc",
    page: params.page ?? 1,
  };
}

/** Build a `?a=b` query string from directory params, omitting defaults. */
export function toSearchString(params: DirectoryParams): string {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.year) search.set("year", String(params.year));
  if (params.department) search.set("department", params.department);
  if (params.sort && params.sort !== "name-asc") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
