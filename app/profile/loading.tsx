export default function ProfileLoading() {
  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-full bg-muted animate-pulse rounded" />

      {/* Card skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        <div className="space-y-3 pt-4">
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
