import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * WhatsApp Cloud API webhook for receiving message delivery status updates.
 * Meta sends POST requests with delivery status (sent, delivered, read, failed).
 */

// GET — webhook verification (Meta sends this during setup)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — receive delivery status updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const serviceClient = createServiceClient();

    // Parse Meta webhook payload
    const entries = body?.entry;
    if (!Array.isArray(entries)) {
      return NextResponse.json({ received: true });
    }

    for (const entry of entries) {
      const changes = entry?.changes;
      if (!Array.isArray(changes)) continue;

      for (const change of changes) {
        const statuses = change?.value?.statuses;
        if (!Array.isArray(statuses)) continue;

        for (const status of statuses) {
          const recipientPhone = status.recipient_id;
          const deliveryStatus = status.status; // sent, delivered, read, failed

          if (!recipientPhone || !deliveryStatus) continue;

          // Update the most recent notification for this recipient
          // Match by recipient phone (with +prefix)
          const phoneWithPlus = recipientPhone.startsWith("+")
            ? recipientPhone
            : `+${recipientPhone}`;

          await serviceClient
            .from("notifications")
            .update({ status: deliveryStatus })
            .eq("channel", "whatsapp")
            .eq("recipient", phoneWithPlus)
            .eq("status", "sent")
            .order("sent_at", { ascending: false })
            .limit(1);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
