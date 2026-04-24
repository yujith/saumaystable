"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signUpSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/types/auth";

export type AuthActionResult = {
  error?: string;
  success?: string;
};

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "An account with this email already exists. Please log in instead." };
    }
    return { error: error.message };
  }

  // Update profile with name and phone after signup
  // The trigger creates the profile row, but we need to update name/phone
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("profiles")
      .update({
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      })
      .eq("user_id", user.id);
  }

  return { success: "Account created! Please check your email to verify your account." };
}

export async function login(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email address before logging in. Check your inbox." };
    }
    return { error: error.message };
  }

  const rawRedirect = formData.get("redirect") as string;
  const redirectTo =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";
  redirect(redirectTo);
}

export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPassword(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
  };

  const parsed = forgotPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "If an account exists with this email, you will receive a password reset link." };
}

export async function resetPassword(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?message=Password+updated+successfully.+Please+log+in.");
}

export async function sendPhoneOtp(phone: string): Promise<AuthActionResult> {
  if (!/^\+94\d{9}$/.test(phone)) {
    return { error: "Please enter a valid Sri Lankan phone number (+94XXXXXXXXX)" };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "OTP sent to your phone number." };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<AuthActionResult> {
  if (!/^\+94\d{9}$/.test(phone)) {
    return { error: "Invalid phone number" };
  }
  if (!/^\d{6}$/.test(token)) {
    return { error: "OTP must be 6 digits" };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
