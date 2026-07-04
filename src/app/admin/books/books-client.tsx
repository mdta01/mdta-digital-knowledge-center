"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Plus,
  BookOpen,
  Eye,
  Star,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { apiFetch, useDebounced } from "@/components/admin/utils";
import { toast } from "sonner";

interface BookItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  pages?: number | null;
  language: string;
  status: string;
  featured: boolean;
  views: number;
  downloads: number;
  category?: { id: string; name: string } | null;
  author?: { id: string; name: string } | null;
}

interface ListResponse {
  data: BookItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OptionItem {
  id: string;
  name: string;
  slug?: string;
}

const STATUS_BADGES: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  DRAFT: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  ARCHIVED: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
};

export function BooksClient({
  initialData,
  categories,
}: {
  initialData: ListResponse;
  categories: OptionItem[];
}) {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounced(search, 350);

  React.useEffect(() => setPage(1), [debouncedSearch, statusFilter, categoryFilter]);

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["admin", "books", page, debouncedSearch, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await apiFetch<ListResponse>(`/api/admin/books?${params}`);
      // Client-side filter by category (API doesn't support it for admin list)
      if (categoryFilter !== "all") {
        return {
          ...res,
          data: res.data.filter((b) => b.category?.id === categoryFilter),
        };
      }
      return res;
    },
    initialData,
    placeholderData: (prev) => prev,
  });

  const [deleting, setDeleting] = React.useState<BookItem | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch(`/api/admin/books/${deleting.id}`, { method: "DELETE" });
      toast.success("Buku berhasil dihapus");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["admin", "books"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus buku");
    }
  };

  return (
    <>
      <DataTableShell
        title="Master Buku"
        description="Kelola koleksi buku di perpustakaan digital."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari judul, ISBN, atau slug…"
        action={
          <Button asChild className="rounded-full">
            <Link href="/admin/books/new">
              <Plus className="h-4 w-4" /> Tambah Buku
            </Link>
          </Button>
        }
        loading={isLoading}
        page={page}
        pageSize={data?.pageSize ?? 20}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="Belum ada buku. Klik 'Tambah Buku' untuk menambahkan."
        filters={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] rounded-full">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-full">
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead className="pl-4">Buku</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((b) => (
              <TableRow key={b.id} className="hover:bg-secondary/30">
                <TableCell className="pl-4">
                  <Link
                    href={`/admin/books/${b.id}`}
                    className="flex items-center gap-3 min-w-[260px] group"
                  >
                    <div className="h-14 w-10 rounded-lg overflow-hidden bg-secondary/60 grid place-items-center shrink-0 shadow-sm">
                      {b.coverImage ? (
                         
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground group-hover:text-primary truncate">
                        {b.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate">
                        /{b.slug}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-foreground/80">
                  {b.author?.name ?? "—"}
                </TableCell>
                <TableCell>
                  {b.category ? (
                    <Badge variant="secondary" className="bg-secondary text-foreground/80">
                      {b.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={STATUS_BADGES[b.status] ?? "bg-secondary"}
                  >
                    {b.status === "PUBLISHED" && <Eye className="h-3 w-3" />}
                    {b.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {b.featured ? (
                    <Star className="h-4 w-4 text-gold fill-current" />
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-foreground/80">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    {b.views}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="inline-flex items-center gap-1">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                      <Link href={`/admin/books/${b.id}`} aria-label="Edit buku">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleting(b)}
                      aria-label="Hapus buku"
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

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Hapus Buku"
        description={
          <>
            Anda akan menghapus buku{" "}
            <span className="font-semibold text-foreground">{deleting?.title}</span>.
            Buku akan dipindahkan ke sampah (soft delete).
          </>
        }
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
      />
    </>
  );
}
