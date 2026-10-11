import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewAlumniForm } from "@/components/alumni/NewAlumniForm";

export default function NewAlumniPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </Link>
      <h1 className="mb-6 text-3xl font-semibold">Add Alumni</h1>
      <NewAlumniForm />
    </div>
  );
}
