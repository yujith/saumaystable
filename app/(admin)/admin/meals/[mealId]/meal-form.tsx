"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/types/database";

type Meal = Database["public"]["Tables"]["meals"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const mealSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  price_lkr: z.coerce.number().positive("Price must be positive"),
  category_id: z.string().uuid("Select a category"),
  tags: z.string().optional(),
  portion_info: z.string().optional(),
  is_available: z.boolean(),
  stock_limit: z.coerce.number().int().min(0).nullable().optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
});

type MealFormData = z.infer<typeof mealSchema>;

export function MealForm({
  meal,
  categories,
}: {
  meal: Meal | null;
  categories: Category[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isNew = !meal;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: meal?.name ?? "",
      slug: meal?.slug ?? "",
      description: meal?.description ?? "",
      price_lkr: meal?.price_lkr ?? 0,
      category_id: meal?.category_id ?? "",
      tags: meal?.tags?.join(", ") ?? "",
      portion_info: meal?.portion_info ?? "",
      is_available: meal?.is_available ?? true,
      stock_limit: meal?.stock_limit ?? undefined,
      sort_order: meal?.sort_order ?? 0,
    },
  });

  const watchName = watch("name");

  function generateSlug() {
    const slug = watchName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setValue("slug", slug);
  }

  async function onSubmit(data: MealFormData) {
    setError(null);

    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price_lkr: data.price_lkr,
      category_id: data.category_id,
      tags: data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      portion_info: data.portion_info || null,
      is_available: data.is_available,
      stock_limit: data.stock_limit ?? null,
      sort_order: data.sort_order ?? 0,
    };

    try {
      const url = isNew
        ? "/api/admin/meals"
        : `/api/admin/meals/${meal.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Failed to save meal");
        return;
      }

      router.push("/admin/meals");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    }
  }

  async function handleDelete() {
    if (!meal) return;
    if (!confirm("Are you sure you want to delete this meal?")) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/meals/${meal.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Failed to delete meal");
        setIsDeleting(false);
        return;
      }

      router.push("/admin/meals");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <div className="flex gap-2">
              <Input id="name" {...register("name")} className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={generateSlug}>
                Generate Slug
              </Button>
            </div>
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" {...register("slug")} />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_lkr">Price (LKR) *</Label>
              <Input id="price_lkr" type="number" step="0.01" {...register("price_lkr")} />
              {errors.price_lkr && <p className="text-sm text-destructive">{errors.price_lkr.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select
                defaultValue={meal?.category_id ?? ""}
                onValueChange={(val) => setValue("category_id", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Dietary Tags (comma-separated)</Label>
            <Input id="tags" placeholder="vegan, gluten-free, spicy" {...register("tags")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portion_info">Portion Info</Label>
            <Input id="portion_info" placeholder="Serves 1 (350g)" {...register("portion_info")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_limit">Stock Limit</Label>
              <Input id="stock_limit" type="number" {...register("stock_limit")} />
              <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" type="number" {...register("sort_order")} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_available"
              className="h-4 w-4 rounded border-input"
              {...register("is_available")}
            />
            <Label htmlFor="is_available" className="text-sm font-normal">
              Available this week
            </Label>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isNew ? (
                  "Create Meal"
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/meals")}
              >
                Cancel
              </Button>
            </div>

            {!isNew && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
