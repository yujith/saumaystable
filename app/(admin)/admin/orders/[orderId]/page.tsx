import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderActions } from "./order-actions";

export const metadata: Metadata = {
  title: "Order Detail | Admin | Saumya's Table",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.orderId)
    .single();

  if (!order) {
    notFound();
  }

  // Fetch order items with meal names
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*, meals(name)")
    .eq("order_id", order.id);

  // Fetch customer profile
  let customerName = order.guest_email || "Guest";
  let customerPhone = order.guest_phone || "";
  if (order.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, phone, email")
      .eq("user_id", order.user_id)
      .single();
    if (profile) {
      customerName = profile.name || profile.email || "Customer";
      customerPhone = profile.phone || "";
    }
  }

  // Fetch address
  let addressText = "No address";
  if (order.address_id) {
    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", order.address_id)
      .single();
    if (address) {
      addressText = [address.street, address.city, address.district]
        .filter(Boolean)
        .join(", ");
    }
  }

  // Fetch payment slips
  const { data: paymentSlips } = await supabase
    .from("payment_slips")
    .select("*")
    .eq("order_id", order.id)
    .order("uploaded_at", { ascending: false });

  // Fetch notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("order_id", order.id)
    .order("sent_at", { ascending: false });

  function formatLKR(amount: number): string {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono">
            {order.order_reference_code}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {format(new Date(order.created_at), "dd MMM yyyy, h:mm a")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <OrderActions
        orderId={order.id}
        currentStatus={order.status}
        currentPaymentStatus={order.payment_status}
        paymentMethod={order.payment_method}
        trackingLink={order.tracking_link}
      />

      {/* Customer & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{customerName}</p>
            {customerPhone && <p className="text-muted-foreground">{customerPhone}</p>}
            <p className="text-muted-foreground capitalize">
              Delivery: {order.delivery_date_preference}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{addressText}</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orderItems?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
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
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery fee</span>
              <span>
                {order.delivery_fee_lkr === 0
                  ? "Free"
                  : formatLKR(order.delivery_fee_lkr)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{formatLKR(order.total_lkr)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span className="capitalize">
              {order.payment_method.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="capitalize">
              {order.payment_status.replace(/_/g, " ")}
            </span>
          </div>
          {order.notes && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">Notes:</p>
              <p className="text-sm mt-1">{order.notes}</p>
            </div>
          )}
          {paymentSlips && paymentSlips.length > 0 && (
            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">
                Payment Slips
              </p>
              {paymentSlips.map((slip) => (
                <a
                  key={slip.id}
                  href={slip.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-primary hover:underline"
                >
                  Slip uploaded{" "}
                  {format(new Date(slip.uploaded_at), "dd MMM yyyy, h:mm a")} —{" "}
                  {slip.status}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      {notifications && notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
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
                      via {notif.channel} → {notif.recipient}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span
                      className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
