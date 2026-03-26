import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PublishMenuButton } from "./publish-menu-button";

export const metadata: Metadata = {
  title: "Meals | Admin | Saumya's Table",
};

export default async function AdminMealsPage() {
  const supabase = createClient();

  const { data: meals } = await supabase
    .from("meals")
    .select("*, categories(name)")
    .order("sort_order", { ascending: true });

  function formatLKR(amount: number): string {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  const availableCount = meals?.filter((m) => m.is_available).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Meals</h1>
          <p className="text-sm text-muted-foreground">
            {availableCount} of {meals?.length ?? 0} meals available this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PublishMenuButton />
          <Link href="/admin/meals/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Meal
            </Button>
          </Link>
        </div>
      </div>

      {!meals || meals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No meals yet. Add your first meal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {meals.map((meal) => {
            const category = meal.categories as unknown as {
              name: string;
            } | null;

            return (
              <Link
                key={meal.id}
                href={`/admin/meals/${meal.id}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{meal.name}</p>
                    {!meal.is_available && (
                      <Badge variant="secondary" className="text-[10px]">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {category && <span>{category.name}</span>}
                    {meal.tags && meal.tags.length > 0 && (
                      <>
                        <span>&middot;</span>
                        <span>{meal.tags.join(", ")}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {formatLKR(meal.price_lkr)}
                  </p>
                  {meal.stock_limit !== null && (
                    <p className="text-[10px] text-muted-foreground">
                      Stock: {meal.stock_limit}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
