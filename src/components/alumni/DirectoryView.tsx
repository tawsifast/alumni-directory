import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAlumniList } from "@/lib/api";
import { parseDirectoryParams, toAlumniQuery, toSearchString } from "@/lib/query";
import { AlumniList } from "./AlumniList";
import { DirectoryControls } from "./DirectoryControls";
import { EmptyState, ErrorState, LoadingState } from "./states";

export async function DirectoryView({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const params = parseDirectoryParams(resolved);

  let data;
  try {
    data = await fetchAlumniList(toAlumniQuery(params));
  } catch (error) {
    return (
      <div>
        <section className="bg-hero text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <p className="text-sm uppercase tracking-widest text-accent">Alumni Directory</p>
            <h1 className="mt-2 max-w-2xl text-4xl font-semibold sm:text-5xl">
              Find the people who walked these halls before you.
            </h1>
          </div>
        </section>
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : "Could not connect to the backend server. Please verify the backend is running."
            }
          />
        </div>
      </div>
    );
  }

  const sort = params.sort ?? "name-asc";
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const hasFilters = !!(params.search || params.year || params.department);

  const pageHref = (targetPage: number) =>
    `/${toSearchString({ ...params, page: targetPage === 1 ? undefined : targetPage })}`;

  return (
    <div>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-sm uppercase tracking-widest text-accent">Alumni Directory</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-semibold sm:text-5xl">
            Find the people who walked these halls before you.
          </h1>
          <p className="mt-3 text-primary-foreground/75">
            {data.total} alumni match your search
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <DirectoryControls
          search={params.search}
          year={params.year}
          department={params.department}
          sort={sort}
        />

        {data.data.length === 0 ? (
          <EmptyState
            title="No alumni found"
            message={
              hasFilters
                ? "Try a different name or clear the filters."
                : "No alumni have been added yet."
            }
            action={
              hasFilters ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Clear filters</Link>
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link href="/alumni/new">
                    <Plus className="h-4 w-4" /> Add the first alumnus
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <AlumniList alumni={data.data} />
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            {data.page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(data.page - 1)}>Previous</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {totalPages}
            </span>
            {data.page < totalPages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(data.page + 1)}>Next</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function DirectoryFallback() {
  return (
    <div>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-sm uppercase tracking-widest text-accent">Alumni Directory</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-semibold sm:text-5xl">
            Find the people who walked these halls before you.
          </h1>
          <p className="mt-3 text-primary-foreground/75">Loading alumni…</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <LoadingState label="Loading alumni…" />
      </div>
    </div>
  );
}
