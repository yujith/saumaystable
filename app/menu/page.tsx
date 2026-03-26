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

  // Filter by category
  if (searchParams.category && searchParams.category !== "all") {
    mealsQuery = mealsQuery.eq("category_id", searchParams.category);
  }

  // Filter by dietary tags
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
      <CountdownTimer />
      <main className="flex-1">
        <section className="container py-8 space-y-6">
          {/* Holiday Mode Banner */}
          {holidayMode?.enabled && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-4">
              <p className="text-sm text-amber-800 font-medium text-center">
                {holidayMode.message || "We are currently on a break. Orders will resume soon."}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">This Week&apos;s Menu</h1>
            <p className="text-sm text-muted-foreground">
              Order before Thursday 7 PM Sri Lanka time for weekend delivery.
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <CategoryFilter categories={categories ?? []} />
            <DietaryFilter />
          </div>

          {/* Meals Grid */}
          {sortedMeals.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No meals match your filters. Try removing some filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
