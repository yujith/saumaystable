import { createServiceClient } from "@/lib/supabase/server";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

export type WhatsAppTemplateType =
  | "order_placed"
  | "bank_transfer_instructions"
  | "payment_verified"
  | "payment_rejected"
  | "order_confirmed"
  | "preparing"
  | "out_for_delivery"
  | "order_delivered"
  | "order_modified"
  | "order_cancelled"
  | "cutoff_reminder"
  | "weekly_menu_published";

interface SendWhatsAppParams {
  type: WhatsAppTemplateType;
  recipient: string; // Phone number in international format e.g. +94771234567
  templateName: string;
  templateParams: string[];
  orderId?: string;
}

/**
 * Send a WhatsApp template message via Meta Cloud API.
 * Fire-and-forget: catches errors and logs them, never throws.
 */
export async function sendWhatsApp({
  type,
  recipient,
  templateName,
  templateParams,
  orderId,
}: SendWhatsAppParams): Promise<void> {
  const serviceClient = createServiceClient();

  // Strip + prefix for WhatsApp API (expects digits only)
  const phone = recipient.replace(/^\+/, "");

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: templateParams.map((p) => ({
                  type: "text",
                  text: p,
                })),
              },
            ],
          },
        }),
      }
    );

    const result = await response.json();
    const failed = !response.ok || result.error;

    await serviceClient.from("notifications").insert({
      order_id: orderId ?? null,
      channel: "whatsapp",
      type,
      recipient,
      status: failed ? "failed" : "sent",
      error_message: failed
        ? result.error?.message || `HTTP ${response.status}`
        : null,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown WhatsApp error";
    await serviceClient.from("notifications").insert({
      order_id: orderId ?? null,
      channel: "whatsapp",
      type,
      recipient,
      status: "failed",
      error_message: message,
    });
  }
}
