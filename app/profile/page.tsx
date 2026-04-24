import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "./profile-content";

export const metadata: Metadata = {
  title: "My Profile | Saumya's Table",
  description: "Manage your Saumya's Table account, addresses, and order history.",
};

export const revalidate = 60; // Cache for 1 minute

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/profile");
  }

  // Run independent queries in parallel for faster loading
  const [profileResult, addressesResult, ordersResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, status, payment_method, payment_status, order_reference_code, delivery_date_preference, total_lkr, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const profile = profileResult.data;
  const addresses = addressesResult.data;
  const orders = ordersResult.data;

  return (
    <ProfileContent
      profile={profile}
      addresses={addresses ?? []}
      orders={orders ?? []}
      userEmail={user.email ?? ""}
    />
  );
}
