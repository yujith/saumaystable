import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CountdownTimer } from "@/components/countdown-timer";
import { MealCard } from "@/components/meal-card";
import { CategoryFilter, DietaryFilter } from "@/components/menu-filters";

export const metadata: Metadata = {
  title: "Menu | Saumya's Table",
  description:
    "Browse this week's home-cooked Sri Lankan meals. Order before Thursday 7 PM for weekend delivery.",
};

export const revalidate = 60;

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { category?: string; tags?: string };
}) {
  const supabase = createClient();

  // Fetch holiday mode setting
  const { data: holidaySetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "holiday_mode")
    .single();

  const holidayMode = holidaySetting?.value as { enabled: boolean; message: string } | null;

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // Build meals query
  let mealsQuery = supabase
    .from("meals")
    .select("*")
    .order("sort_order", { ascending: true });

  if (searchParams.category && searchParams.category !== "all") {
    mealsQuery = mealsQuery.eq("category_id", searchParams.category);
  }

  if (searchParams.tags) {
    const tags = searchParams.tags.split(",").filter(Boolean);
    if (tags.length > 0) {
      mealsQuery = mealsQuery.contains("tags", tags);
    }
  }

  const { data: meals } = await mealsQuery;

  // Sort: available first, then unavailable
  const sortedMeals = [...(meals ?? [])].sort((a, b) => {
    if (a.is_available === b.is_available) return 0;
    return a.is_available ? -1 : 1;
  });

  return (
    <>
      <Navbar />
      <main className="pb-32">
        {/* Holiday Mode Banner */}
        {holidayMode?.enabled && (
          <div className="mx-6 max-w-screen-xl xl:mx-auto mb-6 rounded-xl bg-amber-50 border border-amber-200 px-6 py-4">
            <p className="text-sm text-amber-800 font-headline font-semibold text-center">
              {holidayMode.message || "We are currently on a break. Orders will resume soon."}
            </p>
          </div>
        )}

        {/* Live Kitchen Banner / Countdown */}
        <CountdownTimer />

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

          {/* Sticky Category Filter */}
          <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-md py-4 mb-6">
            <CategoryFilter categories={categories ?? []} />
          </div>

          {/* Dietary Filters */}
          <div className="mb-10">
            <DietaryFilter />
          </div>

          {/* Meals Grid */}
          {sortedMeals.length === 0 ? (
            <div className="text-center py-24">
              <span className="text-6xl mb-6 block">🍛</span>
              <p className="font-body text-on-surface-variant text-lg italic">
                No meals match your selection — try removing some filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {sortedMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}

          {/* Load more hint */}
          {sortedMeals.length > 0 && (
            <div className="mt-20 flex flex-col items-center">
              <p className="font-body text-on-surface-variant italic mb-6">
                Showing {sortedMeals.length} seasonal delights
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
