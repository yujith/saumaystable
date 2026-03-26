import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendEmail } from "@/lib/notifications/email";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";
import { paymentVerifiedEmail, paymentRejectedEmail } from "@/lib/notifications/templates";

const verifyPaymentSchema = z.object({
  action: z.enum(["verify", "reject"]),
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    const newPaymentStatus =
      parsed.data.action === "verify" ? "verified" : "rejected";

    const { error } = await serviceClient
      .from("orders")
      .update({ payment_status: newPaymentStatus })
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update payment slip status if exists
    await serviceClient
      .from("payment_slips")
      .update({
        status: parsed.data.action === "verify" ? "approved" : "rejected",
        admin_note: parsed.data.reason || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("order_id", params.id)
      .eq("status", "pending");

    // Fire-and-forget: send payment verification notifications
    const { data: order } = await serviceClient
      .from("orders")
      .select("id, order_reference_code, user_id, guest_email, guest_phone")
      .eq("id", params.id)
      .single();

    if (order) {
      let customerEmail = order.guest_email || "";
      let customerName = "there";
      let customerPhone = order.guest_phone || "";
      let whatsappOptedIn = false;

      if (order.user_id) {
        const { data: custProfile } = await serviceClient
          .from("profiles")
          .select("name, email, phone, whatsapp_opted_in")
          .eq("user_id", order.user_id)
          .single();
        if (custProfile) {
          customerEmail = custProfile.email || customerEmail;
          customerName = custProfile.name || "there";
          customerPhone = custProfile.phone || customerPhone;
          whatsappOptedIn = custProfile.whatsapp_opted_in;
        }
      }

      const isVerified = parsed.data.action === "verify";
      const emailData = isVerified
        ? paymentVerifiedEmail({
            customerName,
            orderRefCode: order.order_reference_code,
            orderId: order.id,
          })
        : paymentRejectedEmail({
            customerName,
            orderRefCode: order.order_reference_code,
            orderId: order.id,
            reason: parsed.data.reason,
          });

      if (customerEmail) {
        sendEmail({
          type: isVerified ? "payment_verified" : "payment_rejected",
          recipient: customerEmail,
          subject: emailData.subject,
          html: emailData.html,
          orderId: order.id,
        }).catch(() => {});
      }

      if (whatsappOptedIn && customerPhone) {
        sendWhatsApp({
          type: isVerified ? "payment_verified" : "payment_rejected",
          recipient: customerPhone,
          templateName: isVerified ? "payment_verified" : "payment_rejected",
          templateParams: [
            customerName,
            order.order_reference_code,
          ],
          orderId: order.id,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
