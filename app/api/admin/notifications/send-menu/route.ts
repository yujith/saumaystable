import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notifications/email";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";
import { postToPage, generateMenuCaption } from "@/lib/notifications/facebook";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serviceClient = createServiceClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saumyastable.org";

    // Fetch this week's available meals
    const { data: meals } = await serviceClient
      .from("meals")
      .select("id, name, price_lkr, description, image_url, tags, categories(name)")
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    if (!meals || meals.length === 0) {
      return NextResponse.json(
        { error: "No available meals to publish. Mark meals as available first." },
        { status: 400 }
      );
    }

    // Build menu list for email
    const menuListHtml = meals
      .map(
        (m) =>
          `<tr>
            <td style="padding:6px 0;font-size:13px;">${m.name}</td>
            <td style="padding:6px 0;text-align:right;font-size:13px;font-weight:600;color:#16a34a;">LKR ${m.price_lkr.toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="text-align:center;padding:12px 0;">
          <span style="font-size:20px;font-weight:700;color:#16a34a;">Saumya's Table</span>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:24px;">
          <h2 style="margin:0 0 8px;font-size:18px;color:#111;">This Week's Menu is Live! 🍽️</h2>
          <p style="font-size:14px;color:#6b7280;">Fresh home-cooked Sri Lankan meals, ready for weekend delivery.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${menuListHtml}</table>
          <p style="font-size:12px;color:#6b7280;">Orders close <strong>Thursday 7:00 PM</strong>.</p>
          <div style="text-align:center;margin:20px 0;">
            <a href="${siteUrl}/menu" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Order Now</a>
          </div>
        </div>
        <div style="text-align:center;padding:12px 0;color:#9ca3af;font-size:11px;">
          <p>Saumya's Table — Home-cooked Sri Lankan meals, delivered weekly.</p>
        </div>
      </div>
    `;

    // Fetch all customers
    const { data: customers } = await serviceClient
      .from("profiles")
      .select("email, phone, name, whatsapp_opted_in")
      .eq("role", "customer");

    let emailsSent = 0;
    let whatsappSent = 0;

    for (const customer of customers ?? []) {
      if (customer.email) {
        sendEmail({
          type: "cutoff_reminder",
          recipient: customer.email,
          subject: "🍽️ This Week's Menu is Live — Saumya's Table",
          html: emailHtml,
        }).catch(() => {});
        emailsSent++;
      }

      if (customer.whatsapp_opted_in && customer.phone) {
        sendWhatsApp({
          type: "cutoff_reminder",
          recipient: customer.phone,
          templateName: "weekly_menu_published",
          templateParams: [
            customer.name || "there",
            `${siteUrl}/menu`,
          ],
        }).catch(() => {});
        whatsappSent++;
      }
    }

    // Facebook auto-post (fire-and-forget)
    // TODO: v2 — Instagram cross-post
    const mealData = meals.map((m) => ({
      name: m.name,
      price_lkr: m.price_lkr,
      description: (m as Record<string, unknown>).description as string | null | undefined,
    }));
    const hashtags = ["#SaumyasTable", "#SriLankanFood", "#HomeCookedMeals", "#Colombo"];
    const caption = generateMenuCaption(mealData, `${siteUrl}/menu`, hashtags);
    const firstMealWithImage = meals.find((m) => m.image_url);
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (firstMealWithImage?.image_url && pageId && pageAccessToken) {
      postToPage({
        photoUrl: firstMealWithImage.image_url,
        caption,
        pageId,
        accessToken: pageAccessToken,
      }).catch(() => {});
    }

    // TODO: v2 — WhatsApp Channel post (pending Meta API)

    return NextResponse.json({
      success: true,
      mealsPublished: meals.length,
      emailsSent,
      whatsappSent,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
