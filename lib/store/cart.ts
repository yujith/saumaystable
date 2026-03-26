import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Database } from "@/types/database";

type Meal = Database["public"]["Tables"]["meals"]["Row"];

export interface CartItem {
  meal: Pick<Meal, "id" | "name" | "slug" | "price_lkr" | "image_url" | "portion_info">;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  deliveryDayPreference: "saturday" | "sunday";

  // Actions
  addItem: (meal: CartItem["meal"]) => void;
  removeItem: (mealId: string) => void;
  updateQty: (mealId: string, quantity: number) => void;
  setDeliveryDayPreference: (day: "saturday" | "sunday") => void;
  clearCart: () => void;

  // Computed helpers (not stored, called as functions)
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryDayPreference: "saturday",

      addItem: (meal) => {
        set((state) => {
          const existing = state.items.find((item) => item.meal.id === meal.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.meal.id === meal.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { meal, quantity: 1 }],
          };
        });
      },

      removeItem: (mealId) => {
        set((state) => ({
          items: state.items.filter((item) => item.meal.id !== mealId),
        }));
      },

      updateQty: (mealId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(mealId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.meal.id === mealId ? { ...item, quantity } : item
          ),
        }));
      },

      setDeliveryDayPreference: (day) => {
        set({ deliveryDayPreference: day });
      },

      clearCart: () => {
        set({ items: [], deliveryDayPreference: "saturday" });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.meal.price_lkr * item.quantity,
          0
        );
      },
    }),
    {
      name: "saumyas-table-cart",
      // Only persist items and delivery preference
      partialize: (state) => ({
        items: state.items,
        deliveryDayPreference: state.deliveryDayPreference,
      }),
    }
  )
);
