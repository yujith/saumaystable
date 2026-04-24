import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notifications/email";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  try {
    // Fetch all customers who are opted into WhatsApp
    const { data: customers } = await serviceClient
      .from("profiles")
      .select("email, phone, name, whatsapp_opted_in")
      .eq("role", "customer");

    if (!customers || customers.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saumyastable.org";
    let emailsSent = 0;
    let whatsappSent = 0;

    for (const customer of customers) {
      // Send email to all customers with an email
      if (customer.email) {
        await sendEmail({
          type: "cutoff_reminder",
          recipient: customer.email,
          subject: "⏰ 3 hours left to order from Saumya's Table!",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #16a34a;">⏰ Only 3 hours left!</h2>
              <p>Hi ${customer.name || "there"},</p>
              <p>Orders for this weekend close at <strong>7:00 PM today</strong> (Thursday).</p>
              <p>Don't miss out on Saumya's home-cooked meals — fresh, nutritious, and delivered to your door.</p>
              <p><a href="${siteUrl}/menu" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Browse the Menu</a></p>
              <p style="color: #6b7280; font-size: 12px;">Saumya's Table — Home-cooked Sri Lankan meals, delivered weekly.</p>
            </div>
          `,
        });
        emailsSent++;
      }

      // Send WhatsApp to opted-in customers with a phone number
      if (customer.whatsapp_opted_in && customer.phone) {
        await sendWhatsApp({
          type: "cutoff_reminder",
          recipient: customer.phone,
          templateName: "cutoff_reminder",
          templateParams: [
            "3",
            `${siteUrl}/menu`,
          ],
        });
        whatsappSent++;
      }
    }

    return NextResponse.json({
      sent: emailsSent + whatsappSent,
      emails: emailsSent,
      whatsapp: whatsappSent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
