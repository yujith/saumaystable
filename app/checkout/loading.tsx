export default function CheckoutLoading() {
  return (
    <main className="flex-1 pt-24 pb-20 px-6">
      <div className="max-w-screen-xl mx-auto max-w-2xl">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>

        {/* Progress steps skeleton */}
        <div className="flex items-center gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 flex-1 bg-muted animate-pulse rounded" />
          ))}
        </div>

        {/* Form card skeleton */}
        <div className="rounded-lg border p-6 space-y-6">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>

          <div className="h-12 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    </main>
  );
}
