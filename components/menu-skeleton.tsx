"use client";

export function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {[...Array(6)].map((_, i) => (
        <article key={i} className="flex flex-col h-full animate-pulse">
          {/* Image skeleton */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-surface-container shrink-0" />
          
          {/* Title + Price skeleton */}
          <div className="flex justify-between items-start mb-2">
            <div className="h-6 bg-surface-container rounded w-2/3" />
            <div className="h-6 bg-surface-container rounded w-20" />
          </div>
          
          {/* Description skeleton */}
          <div className="h-4 bg-surface-container rounded w-full mb-2" />
          <div className="h-4 bg-surface-container rounded w-3/4 mb-4" />
          
          {/* Button skeleton */}
          <div className="mt-auto h-14 bg-surface-container rounded-lg" />
        </article>
      ))}
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-10 w-24 bg-surface-container rounded-full animate-pulse shrink-0" />
      ))}
    </div>
  );
}

export function CountdownSkeleton() {
  return (
    <div className="mb-10 mx-6 max-w-screen-xl xl:mx-auto">
      <div className="rounded-xl bg-primary-container/10 p-6 md:p-10 animate-pulse">
        <div className="h-8 bg-surface-container rounded w-1/3 mb-4" />
        <div className="h-4 bg-surface-container rounded w-1/2" />
      </div>
    </div>
  );
}
