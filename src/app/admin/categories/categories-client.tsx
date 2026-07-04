"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, BookOpen, ArrowUpDown } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CategoryForm, CATEGORY_ICONS, type Category } from "./category-form";
import { apiFetch, formatDateTime, useDebounced } from "@/components/admin/utils";
import { toast } from "sonner";

interface ListResponse {
  data: Category[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function IconBadge({ name, color }: { name?: string | null; color?: string | null }) {
  const found = CATEGORY_ICONS.find((o) => o.name === name);
  const I = found ? found.icon : BookOpen;
  return (
    <div
      className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
      style={{ backgroundColor: color || "#059669" }}
    >
      <I className="h-4 w-4 text-white" />
    </div>
  );
}

export function CategoriesClient({
  initialData,
}: {
  initialData: ListResponse;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounced(search, 350);

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["admin", "categories", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: "100" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      return apiFetch<ListResponse>(`/api/admin/categories?${params}`);
    },
    initialData,
    placeholderData: (prev) => prev,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [deleting, setDeleting] = React.useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch(`/api/admin/categories/${deleting.id}`, { method: "DELETE" });
      toast.success("Kategori berhasil dihapus");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus kategori");
    }
  };

  return (
    <>
      <DataTableShell
        title="Master Kategori"
        description="Kelola kategori untuk mengelompokkan buku."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama kategori…"
        actionLabel="Tambah Kategori"
        onActionClick={openCreate}
        loading={isLoading}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 100}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={() => {}}
        emptyMessage="Belum ada kategori. Tambahkan kategori pertama Anda."
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead className="pl-4">Kategori</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Jumlah Buku</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((c) => (
              <TableRow key={c.id} className="hover:bg-secondary/30">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <IconBadge name={c.icon} color={c.color} />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {c.name}
                      </div>
                      {c.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                          {c.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  /{c.slug}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    {c.sortOrder}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    {c._count?.books ?? 0} buku
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(c.createdAt)}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => openEdit(c)}
                      aria-label="Edit kategori"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleting(c)}
                      aria-label="Hapus kategori"
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
              <BookOpen className="h-5 w-5 text-primary" />
              {editing ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui informasi kategori."
                : "Lengkapi data kategori baru."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editing}
            onSaved={handleSaved}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Hapus Kategori"
        description={
          <>
            Anda akan menghapus kategori{" "}
            <span className="font-semibold text-foreground">{deleting?.name}</span>.
            Buku-buku di dalamnya tetap ada tetapi tidak akan terkait kategori ini.
          </>
        }
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
      />
    </>
  );
}
