import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Orders | Saumya's Table",
  description: "View your order history.",
};

export const revalidate = 60; // Cache for 1 minute

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  preparing: "bg-yellow-100 text-yellow-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function MyOrdersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_reference_code, status, payment_method, payment_status, total_lkr, delivery_date_preference, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  function formatLKR(amount: number): string {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-2xl py-8 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>

          {!orders || orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
                <Link
                  href="/menu"
                  className="inline-block text-sm font-medium text-primary hover:underline"
                >
                  Browse the menu &rarr;
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-medium">
                          {order.order_reference_code}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            statusColors[order.status] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "dd MMM yyyy, h:mm a")}
                        {" · "}
                        {order.delivery_date_preference}
                        {" · "}
                        <span className="capitalize">
                          {order.payment_method.replace(/_/g, " ")}
                        </span>
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatLKR(order.total_lkr)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
