"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookCard, BookCardSkeleton } from "@/components/public/book-card";
import { SearchBar } from "@/components/public/search-bar";
import { EmptyState } from "@/components/public/section-utils";
import { BookX, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryWithRelations } from "@/lib/repositories";

interface BooksClientProps {
  initialSearch?: string;
  initialCategory?: string;
  categories: CategoryWithRelations[];
}

export function BooksClient({
  initialSearch = "",
  initialCategory = "",
  categories,
}: BooksClientProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);

  // Sync with URL
  useEffect(() => {
    const urlSearch = params.get("search") || "";
    const urlCat = params.get("category") || "";
    if (urlSearch !== search) setSearch(urlSearch);
    if (urlCat !== category) setCategory(urlCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["books", { search, category, page }],
    queryFn: async () => {
      const url = new URL("/api/public/books", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (category) url.searchParams.set("categoryId", category);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", "12");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json() as Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>;
    },
    placeholderData: (prev) => prev,
  });

  const updateUrl = (next: { search?: string; category?: string }) => {
    const sp = new URLSearchParams();
    if (next.search !== undefined ? next.search : search) sp.set("search", (next.search !== undefined ? next.search : search) || "");
    if (next.category !== undefined ? next.category : category) sp.set("category", (next.category !== undefined ? next.category : category) || "");
    router.push(`/books${sp.toString() ? `?${sp.toString()}` : ""}`);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <SearchBar
          defaultValue={search}
          placeholder="Cari judul atau penulis…"
          className="flex-1"
        />
        <Select
          value={category || "all"}
          onValueChange={(v) => {
            const next = v === "all" ? "" : v;
            setCategory(next);
            setPage(1);
            updateUrl({ category: next });
          }}
        >
          <SelectTrigger className="w-full sm:w-56 h-11 rounded-full">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c._count?.books || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filter chips */}
      {(search || category) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {search && (
            <Badge variant="secondary" className="rounded-full pl-3 pr-1.5 py-1 gap-1.5">
              Pencarian: &ldquo;{search}&rdquo;
              <button
                onClick={() => {
                  setSearch("");
                  updateUrl({ search: "" });
                }}
                className="h-4 w-4 rounded-full hover:bg-background grid place-items-center"
                aria-label="Hapus pencarian"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="rounded-full pl-3 pr-1.5 py-1 gap-1.5">
              Kategori: {categories.find((c) => c.id === category)?.name}
              <button
                onClick={() => {
                  setCategory("");
                  updateUrl({ category: "" });
                }}
                className="h-4 w-4 rounded-full hover:bg-background grid place-items-center"
                aria-label="Hapus filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-5 text-sm text-muted-foreground">
        {data ? (
          <>Menampilkan {data.data.length} dari {data.total} buku</>
        ) : (
          "Memuat…"
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {data.data.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookX}
          title="Belum ada buku yang ditemukan"
          description="Coba ubah kata kunci pencarian atau pilih kategori lain."
          actionHref="/books"
          actionLabel="Reset filter"
        />
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full"
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Hal. {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            className="rounded-full"
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  );
}
