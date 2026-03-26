"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
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

  const pillBase =
    "px-6 py-2.5 rounded-full font-headline font-semibold text-sm whitespace-nowrap transition-all";
  const pillActive = "bg-primary text-on-primary shadow-md";
  const pillInactive =
    "bg-secondary-container text-on-secondary-container hover:bg-surface-container-high";

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
      <button
        className={`${pillBase} ${activeCategory === "all" ? pillActive : pillInactive}`}
        onClick={() => setCategory("all")}
      >
        All Delicacies
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${pillBase} ${activeCategory === cat.id ? pillActive : pillInactive}`}
          onClick={() => setCategory(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

const DIETARY_TAGS = [
  { label: "Vegan", value: "vegan" },
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Gluten Free", value: "gluten-free" },
  { label: "Dairy Free", value: "dairy-free" },
  { label: "Nut Free", value: "nut-free" },
  { label: "Spicy", value: "spicy" },
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

    router.push(
      `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false }
    );
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
      {DIETARY_TAGS.map((tag) => (
        <button
          key={tag.value}
          onClick={() => toggleTag(tag.value)}
          className={`px-4 py-1.5 rounded-full font-label text-xs font-semibold whitespace-nowrap transition-all ${
            activeTags.includes(tag.value)
              ? "bg-tertiary text-on-tertiary"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}
