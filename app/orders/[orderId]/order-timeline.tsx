"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function getStepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export function OrderTimeline({
  orderId,
  initialStatus,
  trackingLink,
}: {
  orderId: string;
  initialStatus: string;
  trackingLink: string | null;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus as OrderStatus);
  const [currentTrackingLink, setCurrentTrackingLink] = useState(trackingLink);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as OrderStatus;
          const newTrackingLink = payload.new.tracking_link as string | null;
          setStatus(newStatus);
          setCurrentTrackingLink(newTrackingLink);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const activeIndex = getStepIndex(status);
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-xl">✕</span>
        </div>
        <p className="font-semibold text-red-800">Order Cancelled</p>
        <p className="text-sm text-red-600">
          This order has been cancelled. Please contact us if you have any questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vertical timeline */}
      <div className="relative pl-8">
        {STATUS_STEPS.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;
          const isFuture = index > activeIndex;

          return (
            <div key={step.key} className="relative pb-8 last:pb-0">
              {/* Connecting line */}
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`absolute left-[-20px] top-6 w-0.5 h-full ${
                    isComplete ? "bg-primary" : "bg-border"
                  }`}
                />
              )}

              {/* Dot */}
              <div
                className={`absolute left-[-26px] top-1 h-3 w-3 rounded-full border-2 ${
                  isActive
                    ? "border-primary bg-primary animate-pulse"
                    : isComplete
                    ? "border-primary bg-primary"
                    : "border-border bg-background"
                }`}
              />

              {/* Content */}
              <div className={isFuture ? "opacity-40" : ""}>
                <p
                  className={`text-sm font-medium ${
                    isActive ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {isActive && step.key === "out_for_delivery" && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Your order is on its way!
                    </p>
                    {currentTrackingLink && (
                      <a
                        href={currentTrackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Track your driver
                        </Button>
                      </a>
                    )}
                  </div>
                )}
                {isActive && step.key === "delivered" && (
                  <p className="text-xs text-green-600 mt-1">
                    Your order has been delivered. Enjoy your meal!
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
