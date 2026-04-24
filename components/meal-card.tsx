"use client";

import Image from "next/image";
import { useCartStore, type CartItem } from "@/lib/store/cart";
import type { Database } from "@/types/database";

type Meal = Database["public"]["Tables"]["meals"]["Row"];

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export function MealCard({ meal, priority = false }: { meal: Meal; priority?: boolean }) {
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
    <article className={`group flex flex-col h-full ${!meal.is_available ? "opacity-70 grayscale-[0.4]" : ""}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-surface-container shrink-0">
        {meal.image_url ? (
          <Image
            src={meal.image_url}
            alt={meal.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl bg-surface-container-low">
            🍛
          </div>
        )}

        {/* Sold-out overlay */}
        {!meal.is_available && (
          <div className="absolute inset-0 z-10 bg-on-surface/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-surface-container-lowest text-on-surface px-6 py-2 rounded-full font-headline font-bold uppercase tracking-[0.2em] shadow-xl text-sm">
              Not Available
            </span>
          </div>
        )}

        {/* Dietary tags */}
        {meal.tags && meal.tags.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
            {(meal.tags as string[]).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-surface-container-lowest/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-body text-xl text-on-surface group-hover:text-primary transition-colors leading-tight pr-4">
          {meal.name}
        </h3>
        <span className="font-headline font-bold text-primary shrink-0">
          {formatLKR(meal.price_lkr)}
        </span>
      </div>

      {meal.description && (
        <p className="font-body text-on-surface-variant text-sm mb-4 line-clamp-2 leading-relaxed">
          {meal.description}
        </p>
      )}

      {meal.portion_info && (
        <p className="font-label text-xs text-on-surface-variant/70 mb-4">{meal.portion_info}</p>
      )}

      {/* CTA */}
      {meal.is_available ? (
        inCart ? (
          <button
            disabled
            className="w-full py-4 rounded-lg bg-tertiary text-on-tertiary font-headline font-bold flex items-center justify-center gap-2 cursor-default"
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            In Your Table
          </button>
        ) : (
          <button
            onClick={() => addItem(cartMeal)}
            className="w-full py-4 rounded-lg bg-primary text-on-primary font-headline font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
            Add to Table
          </button>
        )
      ) : (
        <button
          disabled
          className="w-full py-4 rounded-lg bg-surface-container-high text-on-surface-variant/40 font-headline font-bold cursor-not-allowed"
        >
          Not Available This Week
        </button>
      )}
    </article>
  );
}
