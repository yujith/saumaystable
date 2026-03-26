import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Customers | Admin | Saumya's Table",
};

export default async function AdminCustomersPage() {
  const supabase = createClient();

  const { data: customers, count } = await supabase
    .from("profiles")
    .select("*, orders:orders(count)", { count: "exact" })
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">{count ?? 0} total</p>
      </div>

      {!customers || customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No customers yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => {
            const orderCount =
              (customer.orders as unknown as { count: number }[])?.[0]?.count ?? 0;

            return (
              <div
                key={customer.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {customer.name || "Unnamed"}
                    </p>
                    {customer.whatsapp_opted_in && (
                      <Badge variant="secondary" className="text-[10px]">
                        WhatsApp
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {customer.email || "No email"}{" "}
                    {customer.phone && `· ${customer.phone}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{orderCount} orders</p>
                  <p className="text-[10px] text-muted-foreground">
                    Joined{" "}
                    {format(new Date(customer.created_at), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
