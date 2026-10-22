import type { Alumni } from "@/lib/types";
import { AlumniCard } from "./AlumniCard";

export function AlumniList({
  alumni,
  savedIds = [],
}: {
  alumni: Alumni[];
  savedIds?: string[];
}) {
  const savedSet = new Set(savedIds);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alumni.map((a) => (
        <AlumniCard key={a.id} alumni={a} isSaved={savedSet.has(a.id)} />
      ))}
    </div>
  );
}
