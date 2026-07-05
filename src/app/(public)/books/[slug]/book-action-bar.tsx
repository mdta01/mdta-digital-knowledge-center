"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  MessageCircle,
  Facebook,
  Twitter,
  BookOpen,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BookActionBarProps {
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  authorName?: string;
  readingTime?: number | null;
  category?: { name: string; slug: string } | null;
  hasReaderFile: boolean;
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

export function BookActionBar({
  bookId,
  bookSlug,
  bookTitle,
  authorName,
  readingTime,
  category,
  hasReaderFile,
}: BookActionBarProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const sessionId = getSessionId();
    fetch(`/api/public/bookmarks/${bookId}`, { headers: { "x-session-id": sessionId } })
      .then((r) => r.json())
      .then((json) => setBookmarked(!!json.bookmarked))
      .catch(() => {});
  }, [bookId]);

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

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/books/${bookSlug}` : "";
  const shareText = `${bookTitle}${authorName ? ` — ${authorName}` : ""}`;

  const onShare = (platform: "wa" | "fb" | "tw" | "copy") => {
    const u = encodeURIComponent(shareUrl);
    const t = encodeURIComponent(shareText);
    if (platform === "wa") {
      window.open(`https://wa.me/?text=${t}%20${u}`, "_blank", "noopener,noreferrer");
    } else if (platform === "fb") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank", "noopener,noreferrer");
    } else if (platform === "tw") {
      window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "_blank", "noopener,noreferrer");
    } else if (platform === "copy") {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => toast.success("Tautan disalin"))
        .catch(() => toast.error("Gagal menyalin"));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-white/70 flex-wrap">
          <li>
            <Link href="/" className="inline-flex items-center gap-1 hover:text-gold">
              <Home className="h-3 w-3" /> Beranda
            </Link>
          </li>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <li>
            <Link href="/books" className="hover:text-gold">Buku</Link>
          </li>
          {category && (
            <>
              <ChevronRight className="h-3 w-3 opacity-50" />
              <li>
                <Link href={`/categories/${category.slug}`} className="hover:text-gold">
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <ChevronRight className="h-3 w-3 opacity-50" />
          <li className="text-white/90 line-clamp-1 max-w-[40vw]">{bookTitle}</li>
        </ol>
      </nav>

      {/* Reading time badge + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {readingTime && (
          <Badge className="bg-gold/20 text-gold border-gold/40 hover:bg-gold/30">
            <BookOpen className="h-3 w-3 mr-1" /> {readingTime} menit baca
          </Badge>
        )}
        <div className="flex-1" />
        <Button
          size="sm"
          variant={bookmarked ? "secondary" : "outline"}
          onClick={toggleBookmark}
          className="rounded-full h-9 border-white/30 text-white hover:bg-white/10"
        >
          {bookmarked ? (
            <>
              <BookmarkCheck className="h-3.5 w-3.5 mr-1.5 text-gold" /> Tersimpan
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5 mr-1.5" /> Simpan
            </>
          )}
        </Button>

        {hasReaderFile && (
          <Button asChild size="sm" className="rounded-full h-9 bg-gold hover:bg-gold/90 text-emerald-deep">
            <Link href={`/read/${bookSlug}`}>
              <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Baca Online
            </Link>
          </Button>
        )}

        {/* Share dropdown */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShareOpen((v) => !v)}
            className="rounded-full h-9 border-white/30 text-white hover:bg-white/10"
            aria-label="Bagikan"
            aria-expanded={shareOpen}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          {shareOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShareOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-2xl glass-strong border border-border/60 shadow-xl p-1.5">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2">
                  Bagikan
                </p>
                <button
                  onClick={() => onShare("wa")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
                </button>
                <button
                  onClick={() => onShare("fb")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground"
                >
                  <Facebook className="h-4 w-4 text-blue-700" /> Facebook
                </button>
                <button
                  onClick={() => onShare("tw")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground"
                >
                  <Twitter className="h-4 w-4" /> Twitter / X
                </button>
                <button
                  onClick={() => onShare("copy")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" /> Salin tautan
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Sticky scroll progress bar that tracks scroll through the article. */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setProgress(window.scrollY / total);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-16 sm:top-18 left-0 right-0 h-1 bg-border/30 z-30" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-gold to-primary transition-[width] duration-150"
        style={{ width: `${Math.max(0, progress * 100)}%` }}
      />
    </div>
  );
}
