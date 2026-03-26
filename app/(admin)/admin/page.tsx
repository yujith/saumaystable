import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, DollarSign, Clock, CheckCircle2, Users } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard | Saumya's Table",
};

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekStartISO = weekStart.toISOString();
  const weekEndISO = weekEnd.toISOString();

  // KPIs — all in parallel
  const [ordersThisWeek, pendingOrders, recentOrders, customerCount] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, total_lkr", { count: "exact" })
        .gte("created_at", weekStartISO)
        .lte("created_at", weekEndISO),
      supabase
        .from("orders")
        .select("id", { count: "exact" })
        .in("status", ["placed", "confirmed"]),
      supabase
        .from("orders")
        .select(
          "id, order_reference_code, status, payment_method, payment_status, total_lkr, created_at, delivery_date_preference"
        )
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("role", "customer"),
    ]);

  const weeklyRevenue =
    ordersThisWeek.data?.reduce((sum, o) => sum + (o.total_lkr ?? 0), 0) ?? 0;
  const weeklyOrderCount = ordersThisWeek.count ?? 0;
  const pendingCount = pendingOrders.count ?? 0;
  const totalCustomers = customerCount.count ?? 0;

  function formatLKR(amount: number): string {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  const statusColors: Record<string, string> = {
    placed: "bg-blue-100 text-blue-800",
    confirmed: "bg-indigo-100 text-indigo-800",
    preparing: "bg-yellow-100 text-yellow-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Orders This Week
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{weeklyOrderCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Revenue This Week
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatLKR(weeklyRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCustomers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Link
            href="/admin/orders"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            View all &rarr;
          </Link>
        </CardHeader>
        <CardContent>
          {!recentOrders.data || recentOrders.data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentOrders.data.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-mono font-medium">
                      {order.order_reference_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), "dd MMM, h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        statusColors[order.status] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatLKR(order.total_lkr)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
