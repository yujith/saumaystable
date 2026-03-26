import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { format } from "date-fns";
import { CopyRefCode } from "./copy-ref-code";
import { SlipUpload } from "./slip-upload";

export const metadata: Metadata = {
  title: "Order Confirmed | Saumya's Table",
  description: "Your order has been placed successfully.",
};

export default async function OrderConfirmationPage({
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

  // Fetch bank details if bank transfer
  let bankDetails: Record<string, string> | null = null;
  if (order.payment_method === "bank_transfer") {
    const { data: bankSettings } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "bank_account")
      .single();
    bankDetails = bankSettings?.value as Record<string, string> | null;
  }

  function formatLKR(amount: number): string {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-lg py-12 space-y-6">
          {/* Success header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Order Placed!</h1>
            <p className="text-sm text-muted-foreground">
              Thank you for your order. We&apos;ll send you updates via email
              {order.payment_method === "bank_transfer"
                ? " once your payment is verified."
                : "."}
            </p>
          </div>

          {/* Reference code */}
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Order Reference Code
              </p>
              <CopyRefCode code={order.order_reference_code} />
              <p className="text-xs text-muted-foreground">
                Keep this code for your records.
              </p>
            </CardContent>
          </Card>

          {/* Bank transfer instructions */}
          {order.payment_method === "bank_transfer" && bankDetails && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm font-semibold text-amber-800">
                  Bank Transfer Instructions
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Bank:</span>{" "}
                    {bankDetails.bank_name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Account Name:</span>{" "}
                    {bankDetails.account_name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Account Number:</span>{" "}
                    <span className="font-mono">{bankDetails.account_number}</span>
                  </p>
                  {bankDetails.branch && (
                    <p>
                      <span className="text-muted-foreground">Branch:</span>{" "}
                      {bankDetails.branch}
                    </p>
                  )}
                </div>
                <Separator className="bg-amber-200" />
                <p className="text-xs text-amber-800">
                  Use <strong>{order.order_reference_code}</strong> as the payment
                  reference when transferring. After transferring, upload your
                  payment slip below.
                </p>
                <SlipUpload orderId={order.id} />
              </CardContent>
            </Card>
          )}

          {/* Order details */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm font-semibold">Order Details</p>

              {/* Items */}
              <div className="space-y-2">
                {orderItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="truncate">
                        {(item as Record<string, unknown> & { meals: { name: string } | null })
                          .meals?.name ?? "Meal"}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        &times;{item.quantity}
                      </span>
                    </div>
                    <span className="font-medium ml-4">
                      {formatLKR(item.unit_price_lkr * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

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
                  <span className="text-primary">
                    {formatLKR(order.total_lkr)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
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
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href={`/orders/${order.id}`}>
              <Button className="w-full gap-2">
                Track Your Order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" className="w-full">
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
