import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendEmail } from "@/lib/notifications/email";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";
import { statusUpdateEmail } from "@/lib/notifications/templates";

const updateOrderSchema = z.object({
  status: z
    .enum([
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ])
    .optional(),
  tracking_link: z.string().url().nullable().optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(
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
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    const updateData: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.tracking_link !== undefined)
      updateData.tracking_link = parsed.data.tracking_link;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

    const { error } = await serviceClient
      .from("orders")
      .update(updateData)
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fire-and-forget: send status change notifications
    if (parsed.data.status) {
      const { data: order } = await serviceClient
        .from("orders")
        .select("id, order_reference_code, user_id, guest_email, guest_phone, tracking_link")
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

        const emailData = statusUpdateEmail({
          customerName,
          orderRefCode: order.order_reference_code,
          orderId: order.id,
          newStatus: parsed.data.status,
          trackingLink: order.tracking_link,
        });

        if (customerEmail) {
          sendEmail({
            type: parsed.data.status === "delivered" ? "order_delivered" : "order_confirmed",
            recipient: customerEmail,
            subject: emailData.subject,
            html: emailData.html,
            orderId: order.id,
          }).catch(() => {});
        }

        if (whatsappOptedIn && customerPhone) {
          sendWhatsApp({
            type: parsed.data.status as "order_confirmed" | "preparing" | "out_for_delivery" | "order_delivered" | "order_cancelled",
            recipient: customerPhone,
            templateName: parsed.data.status,
            templateParams: [
              customerName,
              order.order_reference_code,
            ],
            orderId: order.id,
          }).catch(() => {});
        }
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
