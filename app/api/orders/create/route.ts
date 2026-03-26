import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createOrderSchema } from "@/types/checkout";
import { getDeliveryWeek } from "@/lib/cutoff";
import { format } from "date-fns";
import { sendEmail } from "@/lib/notifications/email";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";
import { orderPlacedEmail } from "@/lib/notifications/templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createClient();
    const serviceClient = createServiceClient();

    // Get current user (optional — guest checkout allowed)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Calculate delivery week
    const deliveryWeek = getDeliveryWeek();
    const deliveryWeekStart = format(deliveryWeek.deliveryWeekStart, "yyyy-MM-dd");

    // Generate order reference code using the DB function
    const { data: refCode, error: refError } = await serviceClient.rpc(
      "generate_order_reference_code",
      { p_delivery_week_start: deliveryWeekStart }
    );

    if (refError || !refCode) {
      return NextResponse.json(
        { error: "Failed to generate order reference code" },
        { status: 500 }
      );
    }

    // Verify all meals exist and get current prices
    const mealIds = data.items.map((item) => item.meal_id);
    const { data: meals, error: mealsError } = await serviceClient
      .from("meals")
      .select("id, price_lkr, is_available, stock_limit, name")
      .in("id", mealIds);

    if (mealsError || !meals) {
      return NextResponse.json(
        { error: "Failed to fetch meal details" },
        { status: 500 }
      );
    }

    // Validate meal availability
    for (const item of data.items) {
      const meal = meals.find((m) => m.id === item.meal_id);
      if (!meal) {
        return NextResponse.json(
          { error: `Meal not found: ${item.meal_id}` },
          { status: 400 }
        );
      }
      if (!meal.is_available) {
        return NextResponse.json(
          { error: `"${meal.name}" is not available this week` },
          { status: 400 }
        );
      }
    }

    // Calculate totals using server-side prices (not client-submitted prices)
    const orderItems = data.items.map((item) => {
      const meal = meals.find((m) => m.id === item.meal_id)!;
      return {
        meal_id: item.meal_id,
        quantity: item.quantity,
        unit_price_lkr: meal.price_lkr,
      };
    });

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unit_price_lkr * item.quantity,
      0
    );

    // Get delivery fee from the address's zone (simplified: flat fee for now)
    // TODO: look up delivery zone fee based on address
    const deliveryFeeLkr = 0;
    const totalLkr = subtotal + deliveryFeeLkr;

    // Determine payment status
    const paymentStatus =
      data.payment_method === "bank_transfer"
        ? "awaiting_verification"
        : "pending";

    // Update WhatsApp opt-in if user is logged in
    if (user && data.whatsapp_opted_in !== undefined) {
      await serviceClient
        .from("profiles")
        .update({ whatsapp_opted_in: data.whatsapp_opted_in })
        .eq("user_id", user.id);
    }

    // Insert order
    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        guest_email: !user ? data.guest_email || null : null,
        guest_phone: !user ? data.guest_phone || null : null,
        status: "placed",
        payment_method: data.payment_method,
        payment_status: paymentStatus,
        order_reference_code: refCode as string,
        delivery_week_start: deliveryWeekStart,
        delivery_date_preference: data.delivery_date_preference,
        address_id: data.address_id,
        delivery_fee_lkr: deliveryFeeLkr,
        total_lkr: totalLkr,
        notes: data.notes || null,
      })
      .select("id, order_reference_code")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Insert order items
    const itemsToInsert = orderItems.map((item) => ({
      order_id: order.id,
      meal_id: item.meal_id,
      quantity: item.quantity,
      unit_price_lkr: item.unit_price_lkr,
    }));

    const { error: itemsError } = await serviceClient
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback: delete the order if items failed
      await serviceClient.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to save order items" },
        { status: 500 }
      );
    }

    // Fire-and-forget: send order placed notifications
    // Gather customer info for the email
    let customerEmail = data.guest_email || "";
    let customerName = "there";
    let customerPhone = data.guest_phone || "";
    let whatsappOptedIn = false;

    if (user) {
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("name, email, phone, whatsapp_opted_in")
        .eq("user_id", user.id)
        .single();
      if (profile) {
        customerEmail = profile.email || customerEmail;
        customerName = profile.name || "there";
        customerPhone = profile.phone || customerPhone;
        whatsappOptedIn = profile.whatsapp_opted_in;
      }
    }

    // Build item names for the email
    const emailItems = orderItems.map((item) => {
      const meal = meals.find((m) => m.id === item.meal_id)!;
      return {
        name: meal.name,
        quantity: item.quantity,
        unit_price_lkr: item.unit_price_lkr,
      };
    });

    const emailData = orderPlacedEmail({
      customerName,
      orderRefCode: order.order_reference_code,
      items: emailItems,
      deliveryFee: deliveryFeeLkr,
      total: totalLkr,
      deliveryDay: data.delivery_date_preference,
      paymentMethod: data.payment_method,
      orderId: order.id,
    });

    if (customerEmail) {
      sendEmail({
        type: "order_placed",
        recipient: customerEmail,
        subject: emailData.subject,
        html: emailData.html,
        orderId: order.id,
      }).catch(() => {});
    }

    if (whatsappOptedIn && customerPhone) {
      sendWhatsApp({
        type: "order_placed",
        recipient: customerPhone,
        templateName: "order_placed",
        templateParams: [
          customerName,
          order.order_reference_code,
          `LKR ${totalLkr.toFixed(2)}`,
        ],
        orderId: order.id,
      }).catch(() => {});
    }

    return NextResponse.json({
      orderId: order.id,
      orderReferenceCode: order.order_reference_code,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
