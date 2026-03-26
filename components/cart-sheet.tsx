"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cart";
import { getDeliveryWeek, formatDeliveryDate } from "@/lib/cutoff";

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export function CartSheet() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  // Hydration-safe count
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const itemCount = mounted ? getItemCount() : 0;
  const subtotal = mounted ? getSubtotal() : 0;

  // Delivery week info
  const [deliveryInfo, setDeliveryInfo] = useState<{
    sat: string;
    sun: string;
    isNextWeek: boolean;
  } | null>(null);

  useEffect(() => {
    const week = getDeliveryWeek();
    setDeliveryInfo({
      sat: formatDeliveryDate(week.deliverySat),
      sun: formatDeliveryDate(week.deliverySun),
      isNextWeek: week.isNextWeek,
    });
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {mounted && itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {itemCount}
            </Badge>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-left">Your Cart</SheetTitle>
        </SheetHeader>

        {/* Delivery week banner */}
        {deliveryInfo && itemCount > 0 && (
          <div
            className={`rounded-md px-3 py-2 text-xs font-medium ${
              deliveryInfo.isNextWeek
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            {deliveryInfo.isNextWeek ? "⚠ Next week: " : "This week: "}
            {deliveryInfo.sat} / {deliveryInfo.sun}
          </div>
        )}

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto mt-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
              <SheetClose asChild>
                <Link href="/menu">
                  <Button variant="outline" size="sm">
                    Browse Menu
                  </Button>
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.meal.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">
                      {item.meal.name}
                    </p>
                    {item.meal.portion_info && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.meal.portion_info}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-primary mt-1">
                      {formatLKR(item.meal.price_lkr * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.meal.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.meal.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.meal.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t pt-4 mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-base font-bold">{formatLKR(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Delivery fee calculated at checkout.
            </p>
            <SheetClose asChild>
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Checkout &middot; {formatLKR(subtotal)}
                </Button>
              </Link>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
