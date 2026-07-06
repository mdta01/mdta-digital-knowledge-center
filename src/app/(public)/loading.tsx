/**
 * Public layout loading — shown while public pages fetch data.
 * Full-width skeleton matching the public layout structure.
 */
export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero skeleton */}
      <div className="mb-8">
        <div className="h-4 w-32 shimmer rounded mb-3" />
        <div className="h-10 w-2/3 shimmer rounded mb-2" />
        <div className="h-10 w-1/2 shimmer rounded mb-4" />
        <div className="h-4 w-full shimmer rounded mb-1" />
        <div className="h-4 w-3/4 shimmer rounded" />
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-3xl overflow-hidden glass">
            <div className="aspect-[3/4] shimmer" />
            <div className="p-4 space-y-2">
              <div className="h-4 rounded shimmer w-3/4" />
              <div className="h-3 rounded shimmer w-1/2" />
              <div className="h-3 rounded shimmer w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
