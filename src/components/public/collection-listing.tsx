"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookCard, BookCardSkeleton } from "@/components/public/book-card";
import { EmptyState } from "@/components/public/section-utils";
import { BookX, Filter, X, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryWithRelations } from "@/lib/repositories";

interface CollectionListingProps {
  collectionType: string;
  collectionLabel: string;
  categories: CategoryWithRelations[];
  pageSize?: number;
}

/**
 * Reusable listing component for collection-type pages (KITAB, ARTICLE, AUDIO, VIDEO, DINIYAH).
 * Renders search bar, category filter, BookCard grid, and pagination.
 * TanStack Query fetches `/api/public/books?collectionType=…`.
 */
export function CollectionListing({
  collectionType,
  collectionLabel,
  categories,
  pageSize = 12,
}: CollectionListingProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["collection", collectionType, { search, category, page, pageSize }],
    queryFn: async () => {
      const url = new URL("/api/public/books", window.location.origin);
      url.searchParams.set("collectionType", collectionType);
      if (search) url.searchParams.set("search", search);
      if (category) url.searchParams.set("categoryId", category);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch");
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

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={onSearchSubmit} className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari di ${collectionLabel.toLowerCase()}…`}
            aria-label="Pencarian"
            className="w-full pl-11 pr-10 h-11 rounded-full bg-background/80 backdrop-blur-md border-border/60 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
        <Select
          value={category || "all"}
          onValueChange={(v) => {
            setCategory(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-60 h-11 rounded-full">
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
                  setPage(1);
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
                  setPage(1);
                }}
                className="h-4 w-4 rounded-full hover:bg-background grid place-items-center"
                aria-label="Hapus filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
          >
            Reset semua
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="mb-5 text-sm text-muted-foreground">
        {data ? (
          <>Menampilkan {data.data.length} dari {data.total} {collectionLabel.toLowerCase()}</>
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
          title={`Belum ada ${collectionLabel.toLowerCase()} yang ditemukan`}
          description="Coba ubah kata kunci pencarian atau pilih kategori lain."
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
