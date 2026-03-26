import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export type EmailType =
  | "order_placed"
  | "payment_verified"
  | "payment_rejected"
  | "order_confirmed"
  | "out_for_delivery"
  | "order_delivered"
  | "order_modified"
  | "order_cancelled"
  | "cutoff_reminder";

interface SendEmailParams {
  type: EmailType;
  recipient: string;
  subject: string;
  html: string;
  orderId?: string;
}

/**
 * Send an email via Resend and log the result to the notifications table.
 * Fire-and-forget: catches errors and logs them, never throws.
 */
export async function sendEmail({
  type,
  recipient,
  subject,
  html,
  orderId,
}: SendEmailParams): Promise<void> {
  const serviceClient = createServiceClient();

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@saumyastable.lk";
    const { error } = await getResend().emails.send({
      from: fromEmail,
      to: recipient,
      subject,
      html,
    });

    await serviceClient.from("notifications").insert({
      order_id: orderId ?? null,
      channel: "email",
      type,
      recipient,
      status: error ? "failed" : "sent",
      error_message: error ? error.message : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    await serviceClient.from("notifications").insert({
      order_id: orderId ?? null,
      channel: "email",
      type,
      recipient,
      status: "failed",
      error_message: message,
    });
  }
}
