import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DeliveryZonesManager } from "./delivery-zones-manager";

export const metadata: Metadata = {
  title: "Delivery Zones | Admin | Saumya's Table",
};

export default async function AdminDeliveryPage() {
  const supabase = createClient();

  const { data: zones } = await supabase
    .from("delivery_zones")
    .select("*")
    .order("name", { ascending: true });

  return (
    <DeliveryZonesManager
      initialZones={
        (zones ?? []).map((z) => ({
          id: z.id,
          name: z.name,
          delivery_fee_lkr: z.delivery_fee_lkr,
          is_active: z.is_active,
        }))
      }
    />
  );
}
