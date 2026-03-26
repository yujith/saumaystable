"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateProfileSchema } from "@/types/auth";

export type ProfileActionResult = {
  error?: string;
  success?: string;
};

export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const rawData = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    whatsapp_opted_in: formData.get("whatsapp_opted_in") === "true",
  };

  const parsed = updateProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      whatsapp_opted_in: parsed.data.whatsapp_opted_in ?? true,
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: "Profile updated successfully." };
}

export async function deleteAddress(addressId: string): Promise<ProfileActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: "Address deleted." };
}

export async function setDefaultAddress(addressId: string): Promise<ProfileActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Clear all defaults first
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  // Set the new default
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: "Default address updated." };
}
