"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  List,
  Bookmark,
  BookmarkCheck,
  Download,
  Printer,
  Sun,
  Moon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PdfReaderProps {
  bookId: string;
  bookTitle: string;
  pdfUrl: string;
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

interface PdfDoc {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
}
interface PdfPage {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
  getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
}

export function PdfReader({ bookId, bookTitle, pdfUrl, downloadUrl }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<void> } | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PdfDoc | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  // Restore last page + check bookmark
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionId = getSessionId();
    // Load reading progress (list by session) and restore last page for this book
    fetch("/api/public/progress", { headers: { "x-session-id": sessionId } })
      .then((r) => r.json())
      .then((json) => {
        const items: any[] = json.data || [];
        const item = items.find((x) => x.bookId === bookId);
        if (item && item.lastPage && item.lastPage > 0) {
          setPageNum(item.lastPage);
        }
      })
      .catch(() => {});
    // Check bookmark status
    fetch(`/api/public/bookmarks/${bookId}`, { headers: { "x-session-id": sessionId } })
      .then((r) => r.json())
      .then((json) => setBookmarked(!!json.bookmarked))
      .catch(() => {});
  }, [bookId]);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setLoadProgress(0);

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        // @ts-ignore — workerSrc accepts a string URL
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          // Disable workers'c map fetching that often fails offline
          cMapUrl: undefined,
          useWorkerFetch: false,
        });
        // Progress events
        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (total > 0) setLoadProgress(Math.round((loaded / total) * 100));
        };

        const doc = (await loadingTask.promise) as unknown as PdfDoc;
        if (cancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (e: any) {
        console.error("[PdfReader] failed to load:", e);
        if (!cancelled) {
          setError(e?.message || "Gagal memuat PDF");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          /* noop */
        }
      }
    };
  }, [pdfUrl]);

  // Render current page
  const renderPage = useCallback(
    async (num: number, s: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      // Cancel any in-flight render
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          /* noop */
        }
      }
      try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: s });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Hi-DPI rendering
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
        const renderTask = page.render({
          canvasContext: context,
          viewport,
          // @ts-ignore — transform is a valid option
          transform,
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (e: any) {
        if (e?.name !== "RenderingCancelledException") {
          console.warn("[PdfReader] render error:", e);
        }
      }
    },
    [pdfDoc]
  );

  useEffect(() => {
    if (!pdfDoc) return;
    renderPage(pageNum, scale);
  }, [pdfDoc, pageNum, scale, renderPage]);

  // Save reading progress whenever page changes
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;
    const sessionId = getSessionId();
    const progress = pageNum / numPages;
    fetch("/api/public/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-session-id": sessionId },
      body: JSON.stringify({ bookId, progress, lastPage: pageNum }),
    }).catch(() => {});
  }, [pageNum, numPages, pdfDoc, bookId]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't capture when typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        setPageNum((p) => Math.min(numPages, p + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setPageNum((p) => Math.max(1, p - 1));
      } else if (e.key === "+" || e.key === "=") {
        setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)));
      } else if (e.key === "-") {
        setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)));
      } else if (e.key === "Home") {
        setPageNum(1);
      } else if (e.key === "End") {
        setPageNum(numPages);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Bookmark toggle
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

  // Search within PDF
  const doSearch = useCallback(async () => {
    if (!pdfDoc || !searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const matches: number[] = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const tc = await page.getTextContent();
        const text = tc.items.map((it: any) => it.str || "").join(" ").toLowerCase();
        if (text.includes(q)) matches.push(i);
      } catch {
        /* skip page */
      }
    }
    setSearchMatches(matches);
    setSearchMatchIndex(0);
    if (matches.length > 0) {
      setPageNum(matches[0]);
      toast.success(`Ditemukan di ${matches.length} halaman`);
    } else {
      toast.info("Tidak ditemukan");
    }
  }, [pdfDoc, searchQuery]);

  const gotoNextMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    const next = (searchMatchIndex + 1) % searchMatches.length;
    setSearchMatchIndex(next);
    setPageNum(searchMatches[next]);
  }, [searchMatches, searchMatchIndex]);

  // Print
  const handlePrint = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    } else {
      window.print();
    }
  }, [downloadUrl]);

  // Render thumbnail
  const renderThumb = useCallback(
    async (page: number, canvas: HTMLCanvasElement | null) => {
      if (!pdfDoc || !canvas) return;
      try {
        const p = await pdfDoc.getPage(page);
        const viewport = p.getViewport({ scale: 0.25 });
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await p.render({ canvasContext: ctx, viewport }).promise;
      } catch {
        /* noop */
      }
    },
    [pdfDoc]
  );

  return (
    <div className="flex flex-col h-screen bg-emerald-deep/5">
      {/* Top toolbar */}
      <div className="glass-strong border-b border-border/60 px-3 sm:px-5 py-2.5 flex flex-wrap items-center gap-2 sticky top-0 z-30">
        {/* Page nav */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            disabled={pageNum <= 1 || loading}
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5 px-1">
            <Input
              type="number"
              value={pageNum}
              min={1}
              max={numPages}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= numPages) setPageNum(v);
              }}
              className="h-9 w-14 text-center rounded-lg text-sm"
              aria-label="Nomor halaman"
            />
            <span className="text-xs text-muted-foreground">/ {numPages}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            disabled={pageNum >= numPages || loading}
            onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden md:block w-px h-6 bg-border/60 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            disabled={scale <= 0.5}
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))}
            aria-label="Perkecil"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            onClick={() => setScale(1.2)}
            className="text-xs px-2 text-muted-foreground hover:text-foreground min-w-[3rem]"
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            disabled={scale >= 3}
            onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}
            aria-label="Perbesar"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden md:block w-px h-6 bg-border/60 mx-1" />

        {/* Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant={showThumbs ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setShowThumbs((v) => !v)}
            aria-label="Daftar halaman"
            title="Daftar halaman"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={showSearch ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setShowSearch((v) => !v)}
            aria-label="Cari teks"
            title="Cari teks"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant={darkMode ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setDarkMode((v) => !v)}
            aria-label="Mode gelap"
            title="Mode gelap PDF"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant={bookmarked ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={toggleBookmark}
            aria-label="Bookmark"
            title={bookmarked ? "Hapus bookmark" : "Tambahkan ke bookmark"}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {downloadUrl && (
            <Button asChild variant="ghost" size="sm" className="rounded-full h-9">
              <a href={downloadUrl} download>
                <Download className="h-4 w-4 mr-1" /> Unduh
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-9"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-1" /> Cetak
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
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
            placeholder="Cari teks dalam PDF…"
            className="h-9 flex-1 rounded-lg text-sm"
          />
          <Button size="sm" variant="outline" className="rounded-full h-9" onClick={doSearch}>
            Cari
          </Button>
          {searchMatches.length > 0 && (
            <>
              <Badge variant="secondary" className="rounded-full">
                {searchMatchIndex + 1}/{searchMatches.length}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full h-9"
                onClick={gotoNextMatch}
              >
                Berikutnya
              </Button>
            </>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full"
            onClick={() => {
              setShowSearch(false);
              setSearchMatches([]);
            }}
            aria-label="Tutup pencarian"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Loading bar */}
      {loading && (
        <div className="px-5 py-3 bg-background/60">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Memuat PDF… {loadProgress}%</span>
          </div>
          <Progress value={loadProgress} className="mt-2 h-1.5" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="h-16 w-16 rounded-full bg-destructive/10 grid place-items-center mb-4">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2">Gagal memuat PDF</h2>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          {downloadUrl && (
            <Button asChild className="mt-5 rounded-full">
              <a href={downloadUrl} download>
                <Download className="h-4 w-4 mr-2" /> Unduh file PDF
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Main viewer */}
      {!error && (
        <div className="flex-1 flex overflow-hidden">
          {/* Thumbnails sidebar */}
          {showThumbs && (
            <aside
              className="hidden sm:block w-44 lg:w-56 shrink-0 overflow-y-auto glass border-r border-border/60 p-3"
              aria-label="Daftar halaman"
            >
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
                Halaman
              </p>
              <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: numPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPageNum(p)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        p === pageNum
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border/60 hover:border-primary/40"
                      }`}
                      aria-label={`Halaman ${p}`}
                      aria-current={p === pageNum}
                    >
                      <ThumbRenderer
                        page={p}
                        active={p === pageNum}
                        renderThumb={renderThumb}
                      />
                      <span className="absolute bottom-1 right-1 text-[10px] font-medium bg-background/90 text-foreground px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {/* PDF canvas */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto bg-muted/30 grid place-items-start py-6"
          >
            <div className="mx-auto px-4">
              <canvas
                ref={canvasRef}
                className={`mx-auto shadow-2xl rounded-sm bg-white transition-[filter] duration-300 ${
                  darkMode ? "invert hue-rotate-180" : ""
                }`}
                aria-label={`Halaman ${pageNum} dari ${numPages}`}
              />
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {bookTitle} — hal. {pageNum} / {numPages}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Lazy thumbnail renderer — only renders when scrolled into view (or always for small PDFs). */
function ThumbRenderer({
  page,
  active,
  renderThumb,
}: {
  page: number;
  active: boolean;
  renderThumb: (page: number, canvas: HTMLCanvasElement | null) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const renderedRef = useRef(false);
  useEffect(() => {
    if (ref.current && !renderedRef.current) {
      renderThumb(page, ref.current);
      renderedRef.current = true;
    }
  }, [page, renderThumb, active]);
  return <canvas ref={ref} className="block w-full h-auto bg-white" />;
}
