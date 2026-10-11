import type { Alumni } from "@/lib/types";
import { AlumniCard } from "./AlumniCard";

export function AlumniList({ alumni }: { alumni: Alumni[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alumni.map((a) => (
        <AlumniCard key={a.id} alumni={a} />
      ))}
    </div>
  );
}
