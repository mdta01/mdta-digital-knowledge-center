/**
 * Global loading skeleton — shown by Next.js Suspense while server components fetch data.
 * Lightweight, no animations (just shimmer), renders instantly.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4" aria-label="Memuat halaman">
      <div className="flex flex-col items-center gap-4">
        {/* Islamic geometric spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-secondary" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border border-gold/30 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Memuat…</p>
      </div>
    </div>
  );
}
