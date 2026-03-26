import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notifications/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify order ownership
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, payment_method, payment_status")
      .eq("id", params.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.payment_method !== "bank_transfer") {
      return NextResponse.json(
        { error: "This order does not use bank transfer" },
        { status: 400 }
      );
    }

    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, WebP, or HEIC)" },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${params.id}/${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await serviceClient.storage
      .from("payment-slips")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = serviceClient.storage
      .from("payment-slips")
      .getPublicUrl(filePath);

    // Insert payment slip record
    const { error: slipError } = await serviceClient
      .from("payment_slips")
      .insert({
        order_id: params.id,
        image_url: urlData.publicUrl,
        status: "pending",
      });

    if (slipError) {
      return NextResponse.json(
        { error: "Failed to save payment slip record" },
        { status: 500 }
      );
    }

    // Update order payment status
    await serviceClient
      .from("orders")
      .update({ payment_status: "awaiting_verification" })
      .eq("id", params.id);

    // Fire-and-forget: notify admin about new payment slip
    const { data: orderData } = await serviceClient
      .from("orders")
      .select("order_reference_code, total_lkr")
      .eq("id", params.id)
      .single();

    if (orderData) {
      // Find admin email(s)
      const { data: admins } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("role", "admin");

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saumyastable.lk";
      for (const admin of admins ?? []) {
        if (admin.email) {
          sendEmail({
            type: "order_placed",
            recipient: admin.email,
            subject: `Payment Slip Uploaded — ${orderData.order_reference_code}`,
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">New Payment Slip</h2>
                <p>A payment slip has been uploaded for order <strong>${orderData.order_reference_code}</strong> (LKR ${orderData.total_lkr.toFixed(2)}).</p>
                <p><a href="${siteUrl}/admin/orders/${params.id}" style="display: inline-block; background: #16a34a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Review Payment</a></p>
              </div>
            `,
            orderId: params.id,
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
