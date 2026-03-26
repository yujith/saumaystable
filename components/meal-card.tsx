"use client";

import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore, type CartItem } from "@/lib/store/cart";
import type { Database } from "@/types/database";

type Meal = Database["public"]["Tables"]["meals"]["Row"];

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export function MealCard({ meal }: { meal: Meal }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  const inCart = items.find((item) => item.meal.id === meal.id);

  const cartMeal: CartItem["meal"] = {
    id: meal.id,
    name: meal.name,
    slug: meal.slug,
    price_lkr: meal.price_lkr,
    image_url: meal.image_url,
    portion_info: meal.portion_info,
  };

  return (
    <Card className="overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {meal.image_url ? (
          <Image
            src={meal.image_url}
            alt={meal.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">
            🍛
          </div>
        )}

        {/* Sold out overlay */}
        {!meal.is_available && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground bg-background/90 rounded-full px-4 py-1.5">
              Not available this week
            </span>
          </div>
        )}

        {/* Tags */}
        {meal.tags && meal.tags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {meal.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] bg-background/90 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {meal.name}
          </h3>
          {meal.portion_info && (
            <p className="text-xs text-muted-foreground">{meal.portion_info}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="font-bold text-base text-primary">
            {formatLKR(meal.price_lkr)}
          </p>

          {meal.is_available ? (
            inCart ? (
              <Button size="sm" variant="secondary" className="gap-1.5" disabled>
                <Check className="h-3.5 w-3.5" />
                In Cart
              </Button>
            ) : (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => addItem(cartMeal)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            )
          ) : (
            <Button size="sm" variant="outline" disabled>
              Unavailable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
