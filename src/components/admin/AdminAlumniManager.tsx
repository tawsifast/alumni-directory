"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit2, ExternalLink, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { AlumniAvatar } from "@/components/alumni/Avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAlumniAction } from "@/app/actions";

interface AdminAlumniItem {
  id: string;
  fullName: string;
  email: string;
  graduationYear: number;
  department: string;
  currentCompany: string | null;
  currentPosition: string | null;
  location: string | null;
  avatarUrl: string | null;
  createdAt: Date | string;
}

interface AdminAlumniManagerProps {
  initialAlumni: AdminAlumniItem[];
}

export function AdminAlumniManager({ initialAlumni }: AdminAlumniManagerProps) {
  const [alumni, setAlumni] = useState<AdminAlumniItem[]>(initialAlumni);
  const [search, setSearch] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredAlumni = alumni.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q) ||
      (item.currentCompany && item.currentCompany.toLowerCase().includes(q)) ||
      (item.currentPosition && item.currentPosition.toLowerCase().includes(q))
    );
  });

  function handleDelete(id: string, name: string) {
    setDeletingId(id);
    startDeleteTransition(async () => {
      const res = await deleteAlumniAction(id);
      if (res.ok) {
        setAlumni((prev) => prev.filter((a) => a.id !== id));
        toast.success(`Alumni record for "${name}" deleted.`);
      } else {
        toast.error(res.error || "Failed to delete alumni record.");
      }
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search alumni by name, department, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field pl-9 text-sm"
          />
        </div>
        <Button asChild size="sm" className="gap-1.5 self-start sm:self-auto">
          <Link href="/alumni/new">
            <Plus className="h-4 w-4" /> Add Alumni
          </Link>
        </Button>
      </div>

      {/* Alumni Table */}
      <div className="overflow-x-auto rounded-lg border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Alumnus</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Career</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAlumni.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium text-sm">No alumni records found</p>
                    <p className="text-xs">
                      {search ? "Try adjusting your search criteria" : "Click 'Add Alumni' to create the first record"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAlumni.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AlumniAvatar
                        name={item.fullName}
                        avatarUrl={item.avatarUrl}
                        className="h-9 w-9 text-xs"
                      />
                      <div>
                        <p className="font-medium text-foreground">{item.fullName}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.department}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.graduationYear}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.currentPosition || item.currentCompany ? (
                      <div>
                        <p className="text-foreground text-xs font-medium">{item.currentPosition || "—"}</p>
                        <p className="text-[11px] text-muted-foreground">{item.currentCompany || ""}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View details">
                        <Link href={`/alumni/${item.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700" title="Edit alumnus">
                        <Link href={`/alumni/${item.id}/edit`}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete alumnus"
                            disabled={isDeleting && deletingId === item.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Alumni Record?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete the alumni record for{" "}
                              <span className="font-semibold text-foreground">{item.fullName}</span>?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id, item.fullName)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Record
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Showing {filteredAlumni.length} of {alumni.length} alumni records</span>
      </div>
    </div>
  );
}

