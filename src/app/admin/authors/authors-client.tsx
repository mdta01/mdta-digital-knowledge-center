"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  Plus,
  BookOpen,
  Globe,
  UserCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AuthorForm, type Author } from "./author-form";
import { apiFetch, formatDateTime, useDebounced } from "@/components/admin/utils";
import { toast } from "sonner";

interface ListResponse {
  data: Author[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function AuthorsClient({
  initialData,
}: {
  initialData: ListResponse;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounced(search, 350);

  // Reset page when search changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useQuery<ListResponse>({
    queryKey: ["admin", "authors", page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      return apiFetch<ListResponse>(`/api/admin/authors?${params}`);
    },
    initialData,
    placeholderData: (prev) => prev,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Author | null>(null);
  const [deleting, setDeleting] = React.useState<Author | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (a: Author) => {
    setEditing(a);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "authors"] });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch(`/api/admin/authors/${deleting.id}`, { method: "DELETE" });
      toast.success("Penulis berhasil dihapus");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["admin", "authors"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus penulis");
    }
  };

  return (
    <>
      <DataTableShell
        title="Master Penulis"
        description="Kelola data penulis buku-buku di perpustakaan digital."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama penulis…"
        actionLabel="Tambah Penulis"
        onActionClick={openCreate}
        loading={isLoading}
        page={page}
        pageSize={data?.pageSize ?? 20}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="Belum ada penulis terdaftar. Klik 'Tambah Penulis' untuk membuat baru."
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead className="pl-4">Penulis</TableHead>
              <TableHead>Kebangsaan</TableHead>
              <TableHead>Jumlah Buku</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((a) => (
              <TableRow key={a.id} className="hover:bg-secondary/30">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <Avatar className="h-10 w-10 rounded-2xl">
                      {a.photo ? (
                         
                        <img
                          src={a.photo}
                          alt={a.name}
                          className="h-full w-full object-cover rounded-2xl"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-2xl bg-primary/10 text-primary">
                        <UserCircle2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {a.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        /{a.slug}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {a.nationality ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-foreground/80">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      {a.nationality}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    {a.books?.length ?? 0} buku
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(a.createdAt)}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => openEdit(a)}
                      aria-label="Edit penulis"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleting(a)}
                      aria-label="Hapus penulis"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableShell>

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-primary" />
              {editing ? "Edit Penulis" : "Tambah Penulis Baru"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui informasi penulis di bawah ini."
                : "Lengkapi data penulis untuk menambahkannya ke perpustakaan."}
            </DialogDescription>
          </DialogHeader>
          <AuthorForm
            author={editing}
            onSaved={handleSaved}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Hapus Penulis"
        description={
          <>
            Anda akan menghapus{" "}
            <span className="font-semibold text-foreground">{deleting?.name}</span>.
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
      />

      {/* Hidden trigger for Plus icon usage in shell action button */}
      <span className="sr-only">
        <Plus />
      </span>
    </>
  );
}
