import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Orders | Admin | Saumya's Table",
};

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  preparing: "bg-yellow-100 text-yellow-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  awaiting_verification: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_reference_code, status, payment_method, payment_status, total_lkr, delivery_date_preference, created_at, user_id, guest_email, profiles(name, phone)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status);
  }

  const page = parseInt(searchParams.page ?? "1", 10);
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: orders, count } = await query;

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  function formatLKR(amount: number): string {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  const statusFilters = [
    "all",
    "placed",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  const activeStatus = searchParams.status ?? "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{count ?? 0} total</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <Link
            key={s}
            href={`/admin/orders${s === "all" ? "" : `?status=${s}`}`}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeStatus === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {/* Orders list */}
      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No orders found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const profile = order.profiles as unknown as {
              name: string | null;
              phone: string | null;
            } | null;
            const customerName =
              profile?.name || order.guest_email || "Guest";

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
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
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        paymentStatusColors[order.payment_status] ??
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.payment_status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {customerName} &middot;{" "}
                    {format(new Date(order.created_at), "dd MMM yyyy, h:mm a")}{" "}
                    &middot; {order.delivery_date_preference}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatLKR(order.total_lkr)}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {order.payment_method.replace(/_/g, " ")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/orders?${activeStatus !== "all" ? `status=${activeStatus}&` : ""}page=${page - 1}`}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/orders?${activeStatus !== "all" ? `status=${activeStatus}&` : ""}page=${page + 1}`}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
