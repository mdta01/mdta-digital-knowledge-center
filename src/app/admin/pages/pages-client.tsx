"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Pencil, Trash2, FileText, Plus, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { apiFetch, formatDateTime, useDebounced } from "@/components/admin/utils";
import { toast } from "sonner";

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  data: PageItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function PagesClient({ initialData }: { initialData: ListResponse }) {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounced(search, 350);

  React.useEffect(() => setPage(1), [debouncedSearch]);

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["admin", "pages", page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      return apiFetch<ListResponse>(`/api/admin/pages?${params}`);
    },
    initialData,
    placeholderData: (prev) => prev,
  });

  const [deleting, setDeleting] = React.useState<PageItem | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch(`/api/admin/pages/${deleting.id}`, { method: "DELETE" });
      toast.success("Halaman berhasil dihapus");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["admin", "pages"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus halaman");
    }
  };

  return (
    <>
      <DataTableShell
        title="Master Halaman"
        description="Kelola halaman statis seperti Tentang, Kebijakan Privasi, Syarat & Ketentuan."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari judul halaman…"
        actionLabel="Tambah Halaman"
        onActionClick={() => {}}
        action={
          <Button asChild className="rounded-full">
            <Link href="/admin/pages/new">
              <Plus className="h-4 w-4" /> Tambah Halaman
            </Link>
          </Button>
        }
        loading={isLoading}
        page={page}
        pageSize={data?.pageSize ?? 20}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="Belum ada halaman. Klik 'Tambah Halaman' untuk membuat baru."
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead className="pl-4">Judul</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Diperbarui</TableHead>
              <TableHead className="text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((p) => {
              const published = p.status === "PUBLISHED";
              return (
                <TableRow key={p.id} className="hover:bg-secondary/30">
                  <TableCell className="pl-4">
                    <Link
                      href={`/admin/pages/${p.id}`}
                      className="inline-flex items-center gap-3 min-w-[240px] group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground group-hover:text-primary truncate">
                          {p.title}
                        </div>
                        {p.excerpt && (
                          <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                            {p.excerpt}
                          </div>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    /{p.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        published
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      }
                    >
                      {published ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(p.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Link href={`/admin/pages/${p.id}`} aria-label="Edit halaman">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleting(p)}
                        aria-label="Hapus halaman"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataTableShell>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Hapus Halaman"
        description={
          <>
            Anda akan menghapus halaman{" "}
            <span className="font-semibold text-foreground">{deleting?.title}</span>.
          </>
        }
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
      />
    </>
  );
}
