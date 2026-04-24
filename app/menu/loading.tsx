import { MenuSkeleton, FilterSkeleton, CountdownSkeleton } from "@/components/menu-skeleton";

export default function MenuLoading() {
  return (
    <main className="pb-32">
      {/* Countdown skeleton */}
      <CountdownSkeleton />
      
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-2">
            This Week&apos;s Menu
          </h1>
          <p className="font-body text-on-surface-variant italic">
            Fresh from the market to your heart.
          </p>
        </div>

        {/* Filter skeleton */}
        <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-md py-4 mb-6">
          <FilterSkeleton />
        </div>

        {/* Meals skeleton */}
        <MenuSkeleton />
      </div>
    </main>
  );
}
