export default function OrderConfirmationLoading() {
  return (
    <main className="flex-1">
      <div className="container max-w-lg py-12 space-y-6">
        {/* Success header skeleton */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 bg-muted animate-pulse rounded-full" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto" />
        </div>

        {/* Reference code card skeleton */}
        <div className="rounded-lg border p-6 space-y-2">
          <div className="h-3 w-32 bg-muted animate-pulse rounded mx-auto" />
          <div className="h-8 w-40 bg-muted animate-pulse rounded mx-auto" />
        </div>

        {/* Order details skeleton */}
        <div className="rounded-lg border p-6 space-y-4">
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
