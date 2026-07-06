/**
 * Admin loading — shown while admin pages fetch data.
 */
export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="h-8 w-64 shimmer rounded mb-2" />
        <div className="h-4 w-96 shimmer rounded" />
      </div>
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-5">
            <div className="h-12 w-12 rounded-2xl shimmer mb-3" />
            <div className="h-7 w-16 shimmer rounded mb-1" />
            <div className="h-3 w-24 shimmer rounded" />
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-5 space-y-3">
            <div className="h-5 w-32 shimmer rounded" />
            <div className="h-4 w-full shimmer rounded" />
            <div className="h-4 w-3/4 shimmer rounded" />
            <div className="h-4 w-5/6 shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
