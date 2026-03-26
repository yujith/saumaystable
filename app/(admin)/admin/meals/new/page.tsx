import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MealForm } from "../[mealId]/meal-form";

export const metadata: Metadata = {
  title: "New Meal | Admin | Saumya's Table",
};

export default async function AdminNewMealPage() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Add New Meal</h1>
      <MealForm meal={null} categories={categories ?? []} />
    </div>
  );
}
