"use client";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, BookmarkX, Loader2 } from "lucide-react";
import { BookCard } from "@/components/public/book-card";
import { EmptyState } from "@/components/public/section-utils";
import { Button } from "@/components/ui/button";

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

interface BookmarkItem {
  id: string;
  bookId: string;
  sessionId: string;
  note: string | null;
  createdAt: string;
  book: any;
}

export default function BookmarksPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const sessionId = getSessionId();
      const res = await fetch("/api/public/bookmarks", {
        headers: { "x-session-id": sessionId },
      });
      if (!res.ok) throw new Error("Gagal memuat bookmark");
      const json = await res.json();
      return json.data as BookmarkItem[];
    },
    enabled: typeof window !== "undefined",
  });

  const items = data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl mb-8 sm:mb-10 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep p-6 sm:p-10 lg:p-14">
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gold/20 ring-2 ring-gold/40 grid place-items-center shrink-0">
            <Bookmark className="h-8 w-8 sm:h-10 sm:w-10 text-gold fill-gold/40" strokeWidth={1.4} aria-hidden="true" />
          </div>
          <div className="flex-1 text-white">
            <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
              Koleksi Pribadi
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Bookmark Saya
            </h1>
            <p className="mt-2 text-white/85 text-sm sm:text-base max-w-2xl">
              Buku yang Anda tandai untuk dibaca kembali. Disimpan otomatis di perangkat ini tanpa perlu login.
            </p>
            {data && (
              <p className="mt-3 text-gold text-sm font-medium">
                {items.length} judul ditandai
              </p>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden glass">
              <div className="aspect-[3/4] shimmer" />
              <div className="p-5 space-y-2.5">
                <div className="h-4 rounded shimmer w-3/4" />
                <div className="h-3 rounded shimmer w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">
              Menampilkan {items.length} bookmark
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-full"
            >
              {isFetching ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
              Muat ulang
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item, i) => (
              <BookCard key={item.id} book={item.book} index={i} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={BookmarkX}
          title="Belum ada bookmark"
          description="Tandai buku yang ingin Anda baca kembali dengan menekan tombol bookmark pada halaman detail buku."
          actionHref="/books"
          actionLabel="Jelajahi koleksi buku"
        />
      )}
    </div>
  );
}
