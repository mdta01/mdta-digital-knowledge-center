"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Users,
  LayoutGrid,
  FileText,
  CornerDownLeft,
  Search as SearchIcon,
  ArrowRight,
  Home as HomeIcon,
  Info,
  Phone,
  Bookmark,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuickSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  type: "book" | "author" | "category" | "page";
  href: string;
}

interface QuickSearchResult {
  books: Array<{ id: string; title: string; slug: string; author?: { name: string } }>;
  authors: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  pages: Array<{ id: string; title: string; slug: string }>;
}

const QUICK_LINKS = [
  { label: "Beranda", href: "/", icon: HomeIcon },
  { label: "Knowledge Hub", href: "/knowledge", icon: BookOpen },
  { label: "Pusat Pengetahuan", href: "/books", icon: BookOpen },
  { label: "Kitab Klasik", href: "/kitab", icon: BookOpen },
  { label: "Artikel", href: "/artikel", icon: FileText },
  { label: "Audio", href: "/audio", icon: TrendingUp },
  { label: "Video", href: "/video", icon: TrendingUp },
  { label: "Materi Diniyah", href: "/materi", icon: Info },
  { label: "Kategori", href: "/categories", icon: LayoutGrid },
  { label: "Penulis & Kontributor", href: "/authors", icon: Users },
  { label: "Tentang", href: "/about", icon: Info },
  { label: "Kontak", href: "/contact", icon: Phone },
  { label: "Bookmark Saya", href: "/bookmarks", icon: Bookmark },
];

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-gold/30 text-foreground rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults(null);
      setActiveIndex(0);
    }
  }, [open]);

  // Debounced search
  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/public/search/quick?q=${encodeURIComponent(q)}&limit=8`);
        if (res.ok) {
          const data = (await res.json()) as QuickSearchResult;
          setResults(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  useEffect(() => {
    doSearch(query);
    setActiveIndex(0);
  }, [query, doSearch]);

  // Build flat list of items for keyboard navigation
  const allItems: QuickSearchItem[] = [
    ...(results?.books || []).map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.author?.name,
      slug: b.slug,
      type: "book" as const,
      href: `/books/${b.slug}`,
    })),
    ...(results?.authors || []).map((a) => ({
      id: a.id,
      title: a.name,
      subtitle: "Penulis",
      slug: a.slug,
      type: "author" as const,
      href: `/authors/${a.slug}`,
    })),
    ...(results?.categories || []).map((c) => ({
      id: c.id,
      title: c.name,
      subtitle: "Kategori",
      slug: c.slug,
      type: "category" as const,
      href: `/categories/${c.slug}`,
    })),
    ...(results?.pages || []).map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: "Halaman",
      slug: p.slug,
      type: "page" as const,
      href: `/${p.slug}`,
    })),
  ];

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && allItems[activeIndex]) {
      e.preventDefault();
      const item = allItems[activeIndex];
      setOpen(false);
      router.push(item.href);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "book": return <BookOpen className="h-4 w-4" />;
      case "author": return <Users className="h-4 w-4" />;
      case "category": return <LayoutGrid className="h-4 w-4" />;
      case "page": return <FileText className="h-4 w-4" />;
      default: return <SearchIcon className="h-4 w-4" />;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "book": return "Buku";
      case "author": return "Penulis";
      case "category": return "Kategori";
      case "page": return "Halaman";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden rounded-3xl"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Pencarian Cepat</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative border-b border-border/60">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari buku, kitab, penulis, kategori…"
            className="border-0 h-14 pl-12 pr-12 text-base rounded-none focus-visible:ring-0 bg-transparent"
            aria-label="Pencarian cepat"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!loading && query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted"
              aria-label="Hapus"
            >
              Esc
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                Akses Cepat
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-secondary text-sm text-foreground transition-colors"
                  >
                    <link.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && allItems.length === 0 && !loading && (
            <div className="p-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Tidak ada hasil untuk &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {allItems.length > 0 && (
            <div className="p-2">
              {allItems.map((item, i) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
                    i === activeIndex ? "bg-primary/10" : "hover:bg-secondary"
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg grid place-items-center shrink-0",
                      i === activeIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {typeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {highlightMatch(item.title, query)}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {typeLabel(item.type)}
                  </Badge>
                  {i === activeIndex && (
                    <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          )}

          {query && allItems.length > 0 && (
            <div className="border-t border-border/60 px-4 py-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">↑↓</kbd>{" "}
                navigasi{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono ml-2">↵</kbd>{" "}
                buka
              </span>
              <Link
                href={`/books?search=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Lihat semua hasil <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
