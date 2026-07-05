"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ScrollText,
  FileText,
  Headphones,
  Video,
  Moon,
  FileArchive,
  LayoutGrid,
  List,
  Rows3,
  Search,
  Library,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { BookCard } from "@/components/public/book-card";
import { SearchBar } from "@/components/public/search-bar";
import { EmptyState } from "@/components/public/section-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CategoryWithRelations } from "@/lib/repositories";
import Link from "next/link";

type ViewMode = "grid" | "list" | "compact";
type CollectionFilter = "ALL" | "KITAB" | "BOOK" | "ARTICLE" | "AUDIO" | "VIDEO" | "DINIYAH" | "DOCUMENT";

const COLLECTION_TABS: Array<{
  key: CollectionFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  { key: "ALL", label: "Semua", icon: Library, color: "from-emerald-500 to-teal-600" },
  { key: "KITAB", label: "Kitab", icon: ScrollText, color: "from-amber-500 to-yellow-600" },
  { key: "BOOK", label: "Buku", icon: BookOpen, color: "from-emerald-500 to-teal-600" },
  { key: "ARTICLE", label: "Artikel", icon: FileText, color: "from-sky-500 to-indigo-600" },
  { key: "AUDIO", label: "Audio", icon: Headphones, color: "from-violet-500 to-purple-600" },
  { key: "VIDEO", label: "Video", icon: Video, color: "from-rose-500 to-pink-600" },
  { key: "DINIYAH", label: "Materi Diniyah", icon: Moon, color: "from-lime-500 to-green-600" },
  { key: "DOCUMENT", label: "Dokumen", icon: FileArchive, color: "from-orange-500 to-red-600" },
];

interface KnowledgeHubClientProps {
  categories: CategoryWithRelations[];
  counts: {
    total: number;
    published: number;
    byType: Record<string, number>;
  };
}

export function KnowledgeHubClient({ categories, counts }: KnowledgeHubClientProps) {
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["knowledge-hub", { activeFilter, category, page }],
    queryFn: async () => {
      const url = new URL("/api/public/books", window.location.origin);
      if (activeFilter !== "ALL") url.searchParams.set("collectionType", activeFilter);
      if (category) url.searchParams.set("categoryId", category);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", viewMode === "compact" ? "24" : "12");
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

  const totalLabel = useMemo(() => {
    if (activeFilter === "ALL") return counts.published || counts.total;
    return counts.byType[activeFilter] || 0;
  }, [activeFilter, counts]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep p-8 sm:p-12">
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="relative text-center">
          <Badge className="mb-3 bg-gold/15 text-gold border-gold/30">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Pusat Eksplorasi Pengetahuan
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Knowledge Hub
          </h1>
          <p className="mt-3 text-white/85 text-sm sm:text-base max-w-2xl mx-auto">
            Jelajahi seluruh pengetahuan Islam dalam satu tempat — Kitab, Buku,
            Artikel, Audio, Video, Materi Diniyah, dan Dokumen.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Library className="h-4 w-4 text-gold" />
              {counts.published || counts.total} Knowledge Assets
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-gold" />
              {Object.keys(counts.byType).length} Jenis Koleksi
            </span>
          </div>
        </div>
      </div>

      {/* Collection filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {COLLECTION_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.key === "ALL" ? counts.published || counts.total : counts.byType[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveFilter(tab.key);
                setPage(1);
              }}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-foreground/80 hover:bg-secondary/70 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                activeFilter === tab.key ? "bg-white/20" : "bg-background/60"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar: search + category + view mode */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar
          className="flex-1"
          placeholder="Cari di Knowledge Hub…"
          redirectTo="/books"
        />
        <Select
          value={category || "all"}
          onValueChange={(v) => {
            setCategory(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-56 h-11 rounded-full">
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
        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-secondary">
          {([
            { mode: "grid", icon: LayoutGrid, label: "Grid" },
            { mode: "list", icon: List, label: "List" },
            { mode: "compact", icon: Rows3, label: "Compact" },
          ] as const).map((v) => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className={cn(
                "h-9 w-9 grid place-items-center rounded-full transition-all",
                viewMode === v.mode
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={v.label}
              title={v.label}
            >
              <v.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data ? `${data.data.length} dari ${data.total} item` : "Memuat…"}
        </span>
        <span className="text-xs">
          Mode: <span className="font-medium text-foreground capitalize">{viewMode}</span>
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={cn(
          viewMode === "grid" && "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6",
          viewMode === "list" && "space-y-3",
          viewMode === "compact" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        )}>
          {Array.from({ length: viewMode === "compact" ? 9 : 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl glass overflow-hidden">
              <div className={cn("shimmer", viewMode === "list" ? "h-20" : "aspect-[3/4]")} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded shimmer w-3/4" />
                <div className="h-3 rounded shimmer w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {data.data.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-3">
            {data.data.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
              >
                <Link
                  href={`/books/${book.slug}`}
                  className="group flex gap-4 p-4 rounded-2xl glass card-hover"
                >
                  <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center bg-gradient-to-br from-primary/20 to-gold/20">
                        <BookOpen className="h-6 w-6 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {book.collectionType}
                      </Badge>
                      {book.featured && (
                        <Badge className="text-[10px] bg-gold/20 text-gold border-0">★</Badge>
                      )}
                    </div>
                    <h3 className="font-serif font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {book.author?.name} · {book.category?.name}
                    </p>
                    {book.excerpt && (
                      <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-1">
                        {book.excerpt || book.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span>👁 {book.views}</span>
                      {book.readingTime && <span>⏱ {book.readingTime} mnt</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Compact view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.data.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
              >
                <Link
                  href={`/books/${book.slug}`}
                  className="group flex items-center gap-3 p-3 rounded-xl glass card-hover"
                >
                  <div className="relative w-10 h-14 rounded-md overflow-hidden shrink-0 bg-muted">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center bg-gradient-to-br from-primary/20 to-gold/20">
                        <BookOpen className="h-4 w-4 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {book.author?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[9px] py-0">
                        {book.collectionType}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">👁 {book.views}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={Library}
          title="Belum ada pengetahuan di kategori ini"
          description="Coba pilih jenis koleksi atau kategori lain untuk menjelajahi."
          actionHref="/knowledge"
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
