import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CheckoutFlow } from "./checkout-flow";

export const metadata: Metadata = {
  title: "Checkout | Saumya's Table",
  description: "Complete your order for weekly home-cooked Sri Lankan meals.",
};

export default async function CheckoutPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  // Fetch saved addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch bank account details from settings
  const { data: bankSettings } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "bank_account")
    .single();

  // Fetch payment methods settings
  const { data: paymentMethodsSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "payment_methods")
    .single();

  // Fetch user profile for WhatsApp opt-in default
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, whatsapp_opted_in")
    .eq("user_id", user.id)
    .single();

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <CheckoutFlow
            addresses={addresses ?? []}
            bankDetails={bankSettings?.value as Record<string, string> | null}
            paymentMethods={paymentMethodsSetting?.value as { cod_enabled: boolean; bank_transfer_enabled: boolean } | null}
            profile={profile}
            userEmail={user.email ?? ""}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
