import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { OrderTimeline } from "./order-timeline";
import { SlipUpload } from "../../order-confirmation/[orderId]/slip-upload";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Tracking | Saumya's Table",
  description: "Track your Saumya's Table order in real-time.",
};

export default async function OrderTrackingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.orderId)
    .single();

  if (!order) {
    notFound();
  }

  // Verify ownership (user owns the order or is admin)
  if (user) {
    if (order.user_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (profile?.role !== "admin") {
        notFound();
      }
    }
  }

  // Fetch order items with meal names
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*, meals(name)")
    .eq("order_id", order.id);

  // Fetch notification history
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("order_id", order.id)
    .order("sent_at", { ascending: false });

  function formatLKR(amount: number): string {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-2xl py-8 space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Order Tracking
            </p>
            <h1 className="text-xl font-bold font-mono">
              {order.order_reference_code}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on{" "}
              {format(new Date(order.created_at), "dd MMM yyyy, h:mm a")}
            </p>
          </div>

          {/* Realtime Timeline */}
          <OrderTimeline
            orderId={order.id}
            initialStatus={order.status}
            trackingLink={order.tracking_link}
          />

          {/* Order details */}
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-semibold">Order Details</p>
            <div className="space-y-2">
              {orderItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1">
                    <span>
                      {(
                        item as Record<string, unknown> & {
                          meals: { name: string } | null;
                        }
                      ).meals?.name ?? "Meal"}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      &times;{item.quantity}
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatLKR(item.unit_price_lkr * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span>
                  {order.delivery_fee_lkr === 0
                    ? "Free"
                    : formatLKR(order.delivery_fee_lkr)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatLKR(order.total_lkr)}</span>
              </div>
            </div>
            <div className="border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="capitalize">
                  {order.delivery_date_preference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>
                  {order.payment_method === "cod"
                    ? "Cash on Delivery"
                    : "Bank Transfer"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment status</span>
                <span className="capitalize">
                  {order.payment_status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Payment slip upload for bank transfer orders - only for logged-in owners */}
          {order.payment_method === "bank_transfer" &&
            (order.payment_status === "pending" ||
              order.payment_status === "awaiting_verification" ||
              order.payment_status === "rejected") &&
            user &&
            order.user_id === user.id && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-900">
                  {order.payment_status === "rejected"
                    ? "Payment Rejected — Please Re-upload"
                    : order.payment_status === "awaiting_verification"
                    ? "Payment Slip Under Review"
                    : "Upload Payment Slip"}
                </p>
                {order.payment_status === "awaiting_verification" ? (
                  <p className="text-xs text-amber-800">
                    Your payment slip is being reviewed. We&apos;ll notify you once it&apos;s verified.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-amber-800">
                      Transfer to our bank account using <strong>{order.order_reference_code}</strong> as reference, then upload your slip.
                    </p>
                    <SlipUpload orderId={order.id} />
                  </>
                )}
              </div>
            )}

          {/* Payment upload/view link for bank transfer orders - shown to all users including guests */}
          {order.payment_method === "bank_transfer" &&
            (order.payment_status === "pending" ||
              order.payment_status === "awaiting_verification" ||
              order.payment_status === "rejected") && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      {order.payment_status === "rejected"
                        ? "Payment Rejected — Action Required"
                        : order.payment_status === "awaiting_verification"
                        ? "Payment Verification In Progress"
                        : "Payment Required"}
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      {order.payment_status === "rejected"
                        ? "Your payment slip was rejected. Please review the bank details and upload a new slip."
                        : order.payment_status === "awaiting_verification"
                        ? "Your payment slip has been uploaded and is being reviewed. Click below to view details or upload a new slip if needed."
                        : `This order requires bank transfer payment. Use reference code ${order.order_reference_code} when transferring.`}
                    </p>
                  </div>
                </div>
                <Link href={`/order-confirmation/${order.id}`}>
                  <Button className="w-full" variant="outline">
                    {order.payment_status === "rejected"
                      ? "Re-upload Payment Slip"
                      : order.payment_status === "awaiting_verification"
                      ? "View Payment Details"
                      : "Complete Payment & Upload Slip"}
                  </Button>
                </Link>
              </div>
            )}

          {/* Notification history */}
          {notifications && notifications.length > 0 && (
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">Notification History</p>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium capitalize">
                        {notif.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-muted-foreground">
                        via {notif.channel} to {notif.recipient}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          notif.status === "sent" || notif.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : notif.status === "read"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {notif.status}
                      </span>
                      <p className="text-muted-foreground">
                        {format(new Date(notif.sent_at), "dd MMM, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
