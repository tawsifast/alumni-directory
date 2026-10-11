import { Suspense } from "react";
import { DirectoryFallback, DirectoryView } from "@/components/alumni/DirectoryView";

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<DirectoryFallback />}>
      <DirectoryView searchParams={props.searchParams} />
    </Suspense>
  );
}
