"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STATUS_FLOW: { key: OrderStatus; label: string; color: string }[] = [
  { key: "placed", label: "Placed", color: "bg-blue-500" },
  { key: "confirmed", label: "Confirmed", color: "bg-indigo-500" },
  { key: "preparing", label: "Preparing", color: "bg-yellow-500" },
  { key: "out_for_delivery", label: "Out for Delivery", color: "bg-orange-500" },
  { key: "delivered", label: "Delivered", color: "bg-green-500" },
];

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  paymentMethod: string;
  trackingLink: string | null;
}

export function OrderActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
  paymentMethod,
  trackingLink: initialTrackingLink,
}: OrderActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingLink, setTrackingLink] = useState(initialTrackingLink ?? "");

  const currentIndex = STATUS_FLOW.findIndex((s) => s.key === currentStatus);
  const isCancelled = currentStatus === "cancelled";
  const isDelivered = currentStatus === "delivered";

  async function updateStatus(newStatus: string) {
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update status");
      } else {
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  }

  async function verifyPayment(action: "verify" | "reject") {
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update payment");
      } else {
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  }

  async function saveTrackingLink() {
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_link: trackingLink || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save tracking link");
      } else {
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Status progression */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Visual status bar */}
          <div className="flex items-center gap-1">
            {STATUS_FLOW.map((step, idx) => (
              <div
                key={step.key}
                className={`h-2 flex-1 rounded-full ${
                  idx <= currentIndex ? step.color : "bg-muted"
                }`}
              />
            ))}
          </div>

          <p className="text-sm font-medium capitalize">
            Current: {currentStatus.replace(/_/g, " ")}
          </p>

          {/* Action buttons */}
          {!isCancelled && !isDelivered && (
            <div className="flex flex-wrap gap-2">
              {currentIndex < STATUS_FLOW.length - 1 && (
                <Button
                  size="sm"
                  onClick={() => updateStatus(STATUS_FLOW[currentIndex + 1].key)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Move to {STATUS_FLOW[currentIndex + 1].label}
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatus("cancelled")}
                disabled={isUpdating}
              >
                Cancel Order
              </Button>
            </div>
          )}

          {isCancelled && (
            <p className="text-sm text-red-600 font-medium">
              This order has been cancelled.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment verification (bank transfer only) */}
      {paymentMethod === "bank_transfer" &&
        currentPaymentStatus === "awaiting_verification" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payment Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                This order uses bank transfer. Verify the payment slip.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => verifyPayment("verify")}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Verify Payment
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => verifyPayment("reject")}
                  disabled={isUpdating}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Tracking link */}
      {(currentStatus === "out_for_delivery" || currentStatus === "preparing") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tracking Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="https://pickme.lk/track/..."
                value={trackingLink}
                onChange={(e) => setTrackingLink(e.target.value)}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={saveTrackingLink}
                disabled={isUpdating}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Customer will see a &quot;Track your driver&quot; button when this is set.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
