"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "all";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  function setCategory(categoryId: string) {
    const qs = createQueryString("category", categoryId);
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={activeCategory === "all" ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => setCategory("all")}
      >
        All
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={activeCategory === cat.id ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setCategory(cat.id)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
}

const DIETARY_TAGS = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "spicy",
];

export function DietaryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];

  function toggleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    let newTags: string[];

    if (activeTags.includes(tag)) {
      newTags = activeTags.filter((t) => t !== tag);
    } else {
      newTags = [...activeTags, tag];
    }

    if (newTags.length > 0) {
      params.set("tags", newTags.join(","));
    } else {
      params.delete("tags");
    }

    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DIETARY_TAGS.map((tag) => (
        <Button
          key={tag}
          variant={activeTags.includes(tag) ? "secondary" : "ghost"}
          size="sm"
          className="rounded-full text-xs capitalize"
          onClick={() => toggleTag(tag)}
        >
          {tag}
        </Button>
      ))}
    </div>
  );
}
