"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Clock,
  Calendar,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ArticleReaderProps {
  book: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    content?: string | null;
    excerpt?: string | null;
    collectionType: string;
    videoUrl?: string | null;
    audioUrl?: string | null;
    duration?: number | null;
    readingTime?: number | null;
    coverImage?: string | null;
    publishedYear?: number | null;
    author?: { name: string; slug: string } | null;
    category?: { name: string; slug: string } | null;
    files: Array<{ format: string; url: string; size?: number | null }>;
  };
  mode: "article" | "video" | "audio";
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

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}j ${m}m ${s}d`;
  if (m > 0) return `${m}m ${s}d`;
  return `${s}d`;
}

export function ArticleReader({ book, mode }: ArticleReaderProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Scroll progress for article
  useEffect(() => {
    if (mode !== "article") return;
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setScrollProgress(window.scrollY / total);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode]);

  // Check bookmark
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionId = getSessionId();
    fetch(`/api/public/bookmarks/${book.id}`, { headers: { "x-session-id": sessionId } })
      .then((r) => r.json())
      .then((json) => setBookmarked(!!json.bookmarked))
      .catch(() => {});
  }, [book.id]);

  const toggleBookmark = useCallback(async () => {
    const sessionId = getSessionId();
    try {
      const res = await fetch(`/api/public/bookmarks/${book.id}`, {
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
  }, [book.id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${book.title} — ${book.author?.name || "Islamic Knowledge Center"}`;

  const onShare = async (platform: "wa" | "fb" | "tw" | "copy") => {
    const u = encodeURIComponent(shareUrl);
    const t = encodeURIComponent(shareText);
    if (platform === "wa") {
      window.open(`https://wa.me/?text=${t}%20${u}`, "_blank");
    } else if (platform === "fb") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank");
    } else if (platform === "tw") {
      window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "_blank");
    } else if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Tautan disalin");
      } catch {
        toast.error("Gagal menyalin");
      }
    }
  };

  const audioToggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (audioPlaying) {
      a.pause();
    } else {
      a.play().catch(() => {});
    }
    setAudioPlaying(!audioPlaying);
  };

  const onAudioTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    setAudioProgress(a.currentTime / a.duration);
    // Save progress
    const sessionId = getSessionId();
    fetch("/api/public/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-session-id": sessionId },
      body: JSON.stringify({
        bookId: book.id,
        progress: a.currentTime / a.duration,
        lastPage: Math.floor(a.currentTime),
      }),
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen">
      {/* Reading progress bar */}
      {mode === "article" && (
        <div className="fixed top-16 left-0 right-0 h-1 bg-border/40 z-30">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold transition-[width] duration-150"
            style={{ width: `${Math.max(2, scrollProgress * 100)}%` }}
          />
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep pb-10 sm:pb-14">
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-1.5 text-xs text-white/70 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gold">Beranda</Link>
              </li>
              <ChevronRight className="h-3 w-3 opacity-50" />
              <li>
                <Link href="/books" className="hover:text-gold">Buku</Link>
              </li>
              {book.category && (
                <>
                  <ChevronRight className="h-3 w-3 opacity-50" />
                  <li>
                    <Link href={`/categories/${book.category.slug}`} className="hover:text-gold">
                      {book.category.name}
                    </Link>
                  </li>
                </>
              )}
              <ChevronRight className="h-3 w-3 opacity-50" />
              <li className="text-white/90 line-clamp-1 max-w-[40vw]">{book.title}</li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row gap-5 sm:items-end">
            {book.coverImage && (
              <div className="relative w-32 sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden ring-2 ring-gold/40 shadow-xl shrink-0">
                <Image
                  src={book.coverImage}
                  alt={`Cover ${book.title}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="flex-1 text-white">
              {book.category && (
                <Badge className="mb-2 bg-gold/20 text-gold border-gold/40 hover:bg-gold/30">
                  {book.category.name}
                </Badge>
              )}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {book.title}
              </h1>
              {book.author && (
                <Link
                  href={`/authors/${book.author.slug}`}
                  className="mt-2 inline-block text-white/80 hover:text-gold transition-colors text-sm"
                >
                  {book.author.name}
                </Link>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-white/70 flex-wrap">
                {book.readingTime && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {book.readingTime} mnt baca
                  </span>
                )}
                {book.duration && (
                  <span className="inline-flex items-center gap-1">
                    <Play className="h-3 w-3" /> {formatDuration(book.duration)}
                  </span>
                )}
                {book.publishedYear && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {book.publishedYear}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onShare("wa")}
                  className="rounded-full h-9 border-white/30 text-white hover:bg-white/10"
                  aria-label="Bagikan ke WhatsApp"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                {book.files.length > 0 && (
                  <Button asChild size="sm" variant="outline" className="rounded-full h-9 border-white/30 text-white hover:bg-white/10">
                    <a href={book.files[0].url} download>
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Unduh
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media player (video / audio) */}
      {(mode === "video" || mode === "audio") && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          {mode === "video" && book.videoUrl && (
            <div className="relative aspect-video rounded-3xl overflow-hidden glass shadow-2xl">
              <video
                src={book.videoUrl}
                controls
                className="w-full h-full"
                poster={book.coverImage || undefined}
                aria-label={`Video: ${book.title}`}
              />
            </div>
          )}
          {mode === "audio" && book.audioUrl && (
            <div className="rounded-3xl glass p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-4">
                {book.coverImage && (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 ring-2 ring-gold/40">
                    <Image src={book.coverImage} alt={`Cover ${book.title}`} fill sizes="96px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-gold font-semibold">Audio Kajian</p>
                  <h2 className="font-serif font-semibold text-foreground line-clamp-1">{book.title}</h2>
                  {book.author && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{book.author.name}</p>
                  )}
                </div>
                <button
                  onClick={audioToggle}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary text-primary-foreground grid place-items-center hover:scale-105 transition-transform shrink-0"
                  aria-label={audioPlaying ? "Jeda" : "Putar"}
                >
                  {audioPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    const a = audioRef.current;
                    if (!a) return;
                    a.muted = !a.muted;
                    setAudioMuted(a.muted);
                  }}
                  className="h-10 w-10 rounded-full bg-secondary grid place-items-center hover:bg-secondary/80 shrink-0"
                  aria-label={audioMuted ? "Bunyikan" : "Bisukan"}
                >
                  {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-[width] duration-150"
                  style={{ width: `${Math.max(2, audioProgress * 100)}%` }}
                />
              </div>
              <audio
                ref={audioRef}
                src={book.audioUrl}
                onTimeUpdate={onAudioTime}
                onEnded={() => setAudioPlaying(false)}
                className="hidden"
                aria-label={`Audio: ${book.title}`}
              />
            </div>
          )}
        </div>
      )}

      {/* Article content */}
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {book.description && mode !== "article" && (
          <p className="font-serif text-lg text-muted-foreground leading-relaxed mb-8 italic">
            {book.description}
          </p>
        )}
        {book.content ? (
          <div
            className="prose-kitap"
            dangerouslySetInnerHTML={{ __html: book.content }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Konten belum tersedia untuk {book.title}.</p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href={`/books/${book.slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke detail
              </Link>
            </Button>
          </div>
        )}
      </article>

      {/* Footer nav */}
      <div className="border-t border-border/60 py-8 mt-auto">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" className="rounded-full">
            <Link href={`/books/${book.slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Detail buku
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>Dibaca di Islamic Knowledge Center</span>
          </div>
        </div>
      </div>
    </div>
  );
}
