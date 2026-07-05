"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Sun,
  Moon,
  Bookmark,
  BookmarkCheck,
  Download,
  Search,
  Type,
  Loader2,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface EpubReaderProps {
  bookId: string;
  bookTitle: string;
  epubUrl: string;
  downloadUrl?: string;
}

const SESSION_KEY = "mdta_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = "sess-" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function EpubReader({ bookId, bookTitle, epubUrl, downloadUrl }: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<any[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize EPUB.js
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ePub = (await import("epubjs")).default;
        const book = ePub(epubUrl);
        bookRef.current = book;
        const rendition = book.renderTo(viewerRef.current!, {
          width: "100%",
          height: "100%",
          spread: "none",
          flow: "paginated",
        });
        renditionRef.current = rendition;

        // Restore last location if available
        const sessionId = getSessionId();
        let savedCfi: string | null = null;
        try {
          const r = await fetch("/api/public/progress", {
            headers: { "x-session-id": sessionId },
          });
          const json = await r.json();
          const items: any[] = json.data || [];
          const item = items.find((x) => x.bookId === bookId);
          if (item && item.metadata) {
            try {
              const md = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata;
              if (md?.cfi) savedCfi = md.cfi;
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* ignore */
        }

        await rendition.display(savedCfi || undefined);
        if (cancelled) return;

        // TOC
        book.loaded.navigation.then((nav: any) => {
          setToc(nav.toc || []);
        });

        // Track location
        rendition.on("relocated", (location: any) => {
          const pct = location.start?.percentage ?? 0;
          setProgress(pct);
          if (location.start?.href) {
            const chapter = toc.find((t) => t.href === location.start.href);
            if (chapter) setCurrentChapter(chapter.label.trim());
          }
          // Save progress (CFI inside metadata via lastPage=0 trick — we use a custom payload)
          try {
            const cfi = location.start?.cfi;
            fetch("/api/public/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-session-id": sessionId },
              body: JSON.stringify({
                bookId,
                progress: pct,
                lastPage: 0,
                metadata: cfi ? JSON.stringify({ cfi }) : null,
              }),
            }).catch(() => {});
          } catch {
            /* noop */
          }
        });

        // Generate locations for percentage
        book.ready
          .then(() => book.locations.generate(1024))
          .then(() => {
            rendition.on("relocated", (location: any) => {
              const pct = book.locations.percentageFromCfi(location.start.cfi);
              if (typeof pct === "number" && !isNaN(pct)) setProgress(pct);
            });
          })
          .catch(() => {
            /* locations gen can fail on some epubs */
          });

        // Check bookmark
        fetch(`/api/public/bookmarks/${bookId}`, { headers: { "x-session-id": sessionId } })
          .then((r) => r.json())
          .then((json) => setBookmarked(!!json.bookmarked))
          .catch(() => {});

        setLoading(false);
      } catch (e: any) {
        console.error("[EpubReader] failed:", e);
        if (!cancelled) {
          setError(e?.message || "Gagal memuat EPUB");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        renditionRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      try {
        bookRef.current?.destroy?.();
      } catch {
        /* noop */
      }
    };
  }, [epubUrl, bookId]);

  // Apply dark mode
  useEffect(() => {
    const r = renditionRef.current;
    if (!r) return;
    if (darkMode) {
      r.themes.register("dark", {
        body: { background: "#1a1a1a", color: "#e8e8e8" },
        a: { color: "#a8d8c8" },
      });
      r.themes.select("dark");
    } else {
      r.themes.register("light", {
        body: { background: "#ffffff", color: "#1a1a1a" },
      });
      r.themes.select("light");
    }
  }, [darkMode]);

  // Apply font size + line height
  useEffect(() => {
    const r = renditionRef.current;
    if (!r) return;
    r.themes.fontSize(`${fontSize}%`);
    r.themes.override("line-height", String(lineHeight));
  }, [fontSize, lineHeight]);

  const goNext = useCallback(() => renditionRef.current?.next(), []);
  const goPrev = useCallback(() => renditionRef.current?.prev(), []);

  const jumpTo = useCallback((href: string) => {
    renditionRef.current?.display(href);
    setShowToc(false);
  }, []);

  const toggleBookmark = useCallback(async () => {
    const sessionId = getSessionId();
    try {
      const res = await fetch(`/api/public/bookmarks/${bookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-id": sessionId },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      setBookmarked(!!json.bookmarked);
      toast.success(json.bookmarked ? "Ditambahkan ke bookmark" : "Dihapus dari bookmark");
    } catch {
      toast.error("Gagal mengubah bookmark");
    }
  }, [bookId]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Basic search via spine Iterate
  const doSearch = useCallback(async () => {
    const book = bookRef.current;
    if (!book || !searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    try {
      const spine = await book.spine.spineItems;
      for (const item of spine) {
        const doc = await item.load(book.load.bind(book));
        const text = doc?.body?.textContent?.toLowerCase() || "";
        if (text.includes(q)) {
          await item.unload();
          await renditionRef.current.display(item.href);
          toast.success(`Ditemukan di: ${item.href}`);
          return;
        }
        await item.unload();
      }
      toast.info("Tidak ditemukan");
    } catch (e) {
      console.error("[EpubReader] search error:", e);
      toast.error("Gagal mencari");
    }
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-screen bg-emerald-deep/5">
      {/* Top toolbar */}
      <div className="glass-strong border-b border-border/60 px-3 sm:px-5 py-2.5 flex flex-wrap items-center gap-2 sticky top-0 z-30">
        <Button
          variant={showToc ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setShowToc((v) => !v)}
          aria-label="Daftar isi"
          title="Daftar isi"
        >
          <List className="h-4 w-4" />
        </Button>

        <div className="hidden md:block w-px h-6 bg-border/60 mx-1" />

        {/* Font controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setFontSize((s) => Math.max(80, s - 10))}
            aria-label="Perkecil teks"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={() => {
              setFontSize(100);
              setLineHeight(1.6);
            }}
            className="text-xs px-2 text-muted-foreground hover:text-foreground inline-flex items-center gap-1 min-w-[3rem]"
            aria-label="Reset font"
          >
            <Type className="h-3 w-3" /> {fontSize}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setFontSize((s) => Math.min(180, s + 10))}
            aria-label="Perbesar teks"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="hidden md:block w-px h-6 bg-border/60 mx-1" />

        <Button
          variant={showSearch ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setShowSearch((v) => !v)}
          aria-label="Cari"
          title="Cari"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant={darkMode ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setDarkMode((v) => !v)}
          aria-label="Mode gelap"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant={bookmarked ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={toggleBookmark}
          aria-label="Bookmark"
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1" />

        {downloadUrl && (
          <Button asChild variant="ghost" size="sm" className="rounded-full h-9">
            <a href={downloadUrl} download>
              <Download className="h-4 w-4 mr-1" /> Unduh
            </a>
          </Button>
        )}
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="glass border-b border-border/60 px-3 sm:px-5 py-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doSearch();
            }}
            placeholder="Cari teks dalam EPUB…"
            className="h-9 flex-1 rounded-lg text-sm"
          />
          <Button size="sm" variant="outline" className="rounded-full h-9" onClick={doSearch}>
            Cari
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full"
            onClick={() => setShowSearch(false)}
            aria-label="Tutup pencarian"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-5 py-3 bg-background/60 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat EPUB…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="h-16 w-16 rounded-full bg-destructive/10 grid place-items-center mb-4">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2">Gagal memuat EPUB</h2>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          {downloadUrl && (
            <Button asChild className="mt-5 rounded-full">
              <a href={downloadUrl} download>
                <Download className="h-4 w-4 mr-2" /> Unduh file EPUB
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Main viewer */}
      {!error && (
        <div className="flex-1 flex overflow-hidden">
          {/* TOC sidebar */}
          {showToc && (
            <aside
              className="w-64 lg:w-72 shrink-0 overflow-y-auto glass border-r border-border/60 p-4"
              aria-label="Daftar isi"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Daftar Isi
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full lg:hidden"
                  onClick={() => setShowToc(false)}
                  aria-label="Tutup daftar isi"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <nav className="space-y-1 text-sm">
                {toc.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Daftar isi tidak tersedia.</p>
                )}
                {toc.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => jumpTo(item.href)}
                    className="block w-full text-left text-muted-foreground hover:text-primary hover:bg-secondary/60 rounded-lg px-3 py-1.5 transition-colors line-clamp-2"
                    style={{ paddingLeft: `${(item.subitems?.length ? 0 : 0) + 12}px` }}
                  >
                    {item.label.trim()}
                  </button>
                ))}
              </nav>
            </aside>
          )}

          {/* EPUB viewer + nav buttons */}
          <div className="flex-1 flex flex-col bg-muted/30">
            <div className="flex-1 relative overflow-hidden">
              <div
                ref={viewerRef}
                className="absolute inset-0 mx-auto bg-white"
                aria-label={`Pembaca EPUB: ${bookTitle}`}
              />
              {/* Prev / next overlay buttons */}
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass-strong grid place-items-center shadow-md hover:bg-background/95 transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass-strong grid place-items-center shadow-md hover:bg-background/95 transition-colors"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar at bottom */}
            <div className="border-t border-border/60 glass px-4 py-2.5 flex items-center gap-3">
              <span className="text-xs text-muted-foreground shrink-0">
                {Math.round(progress * 100)}%
              </span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-[width] duration-300"
                  style={{ width: `${Math.max(2, progress * 100)}%` }}
                />
              </div>
              {currentChapter && (
                <Badge variant="secondary" className="rounded-full hidden sm:inline-flex max-w-[40%] truncate">
                  {currentChapter}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
