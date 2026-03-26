import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "./profile-content";

export const metadata: Metadata = {
  title: "My Profile | Saumya's Table",
  description: "Manage your Saumya's Table account, addresses, and order history.",
};

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, payment_method, payment_status, order_reference_code, delivery_date_preference, total_lkr, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <ProfileContent
      profile={profile}
      addresses={addresses ?? []}
      orders={orders ?? []}
      userEmail={user.email ?? ""}
    />
  );
}
