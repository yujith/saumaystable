import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MealForm } from "./meal-form";

export const metadata: Metadata = {
  title: "Edit Meal | Admin | Saumya's Table",
};

export default async function AdminEditMealPage({
  params,
}: {
  params: { mealId: string };
}) {
  const supabase = createClient();

  const { data: meal } = await supabase
    .from("meals")
    .select("*")
    .eq("id", params.mealId)
    .single();

  if (!meal) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Meal</h1>
      <MealForm meal={meal} categories={categories ?? []} />
    </div>
  );
}
