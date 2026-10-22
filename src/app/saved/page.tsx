import Link from "next/link";
import { Bookmark, BookOpen, GraduationCap } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { AlumniList } from "@/components/alumni/AlumniList";
import { EmptyState } from "@/components/alumni/states";

export default async function SavedAlumniPage() {
  const session = await requireUser();

  const savedRecords = await prisma.savedAlumni.findMany({
    where: { userId: session.user.id },
    include: {
      alumni: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const alumniList = savedRecords.map((r) => ({
    id: r.alumni.id,
    fullName: r.alumni.fullName,
    email: r.alumni.email,
    graduationYear: r.alumni.graduationYear,
    department: r.alumni.department,
    currentCompany: r.alumni.currentCompany,
    currentPosition: r.alumni.currentPosition,
    location: r.alumni.location,
    avatarUrl: r.alumni.avatarUrl,
    createdAt: r.alumni.createdAt.toISOString(),
    updatedAt: r.alumni.updatedAt.toISOString(),
  }));
  const savedIds = savedRecords.map((r) => r.alumniId);

  return (
    <div>
      {/* Header Banner */}
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15 text-accent shadow-xs">
                  <Bookmark className="h-4 w-4 fill-accent" />
                </span>
                <p className="text-sm uppercase tracking-widest text-accent font-semibold">
                  Personal Collection
                </p>
              </div>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                My Saved Alumni
              </h1>
              <p className="mt-2 text-sm sm:text-base text-primary-foreground/80 max-w-xl">
                Alumni profiles and contact cards bookmarked for your personal reference.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs font-medium border border-primary-foreground/20">
                <GraduationCap className="h-3.5 w-3.5" />
                {savedRecords.length} {savedRecords.length === 1 ? "card" : "cards"} saved
              </span>
              <Button asChild variant="outline" size="sm" className="bg-card/20 text-white hover:bg-card/30 border-white/20">
                <Link href="/" className="gap-1.5">
                  <BookOpen className="h-4 w-4" /> Browse Directory
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {alumniList.length === 0 ? (
          <EmptyState
            title="No saved alumni yet"
            message="When you browse the alumni directory, click the bookmark icon on any card to save it here for quick access."
            action={
              <Button asChild size="sm">
                <Link href="/" className="gap-1.5">
                  <BookOpen className="h-4 w-4" /> Explore Alumni Directory
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-3">
              <span>Showing {alumniList.length} bookmarked alumni</span>
              <span>Click the bookmark icon on any card to remove it</span>
            </div>
            <AlumniList alumni={alumniList} savedIds={savedIds} />
          </div>
        )}
      </div>
    </div>
  );
}

