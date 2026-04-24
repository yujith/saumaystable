const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "https://saumyastable.org";

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px;">
  <div style="text-align:center;padding:16px 0;">
    <span style="font-size:20px;font-weight:700;color:#16a34a;">Saumya's Table</span>
  </div>
  <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:24px;">
    ${content}
  </div>
  <div style="text-align:center;padding:16px 0;color:#9ca3af;font-size:11px;">
    <p>Saumya's Table — Home-cooked Sri Lankan meals, delivered weekly.</p>
    <p><a href="${siteUrl()}" style="color:#9ca3af;">saumyastable.org</a></p>
  </div>
</div>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<div style="text-align:center;margin:20px 0;">
    <a href="${href}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${text}</a>
  </div>`;
}

interface OrderItem {
  name: string;
  quantity: number;
  unit_price_lkr: number;
}

interface OrderEmailData {
  customerName: string;
  orderRefCode: string;
  items: OrderItem[];
  deliveryFee: number;
  total: number;
  deliveryDay: string;
  paymentMethod: string;
  orderId: string;
}

export function orderPlacedEmail(data: OrderEmailData): { subject: string; html: string } {
  const itemsHtml = data.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 0;font-size:13px;">${i.name} × ${i.quantity}</td><td style="padding:4px 0;text-align:right;font-size:13px;">${formatLKR(i.unit_price_lkr * i.quantity)}</td></tr>`
    )
    .join("");

  const bankNote =
    data.paymentMethod === "bank_transfer"
      ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin:16px 0;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#92400e;">Bank Transfer Required</p>
          <p style="margin:0;font-size:12px;color:#92400e;">Use <strong>${data.orderRefCode}</strong> as your payment reference. Upload your slip on the order page.</p>
        </div>`
      : "";

  return {
    subject: `Order Confirmed — ${data.orderRefCode}`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#111;">Order Confirmed! 🎉</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">Hi ${data.customerName}, your order has been placed.</p>
      <div style="background:#f0fdf4;border-radius:8px;padding:12px;text-align:center;margin-bottom:16px;">
        <p style="margin:0;font-size:11px;color:#6b7280;text-transform:uppercase;">Order Reference</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:700;font-family:monospace;color:#16a34a;">${data.orderRefCode}</p>
      </div>
      ${bankNote}
      <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="font-size:12px;color:#6b7280;padding:2px 0;">Delivery fee</td><td style="text-align:right;font-size:12px;">${data.deliveryFee === 0 ? "Free" : formatLKR(data.deliveryFee)}</td></tr>
        <tr><td style="font-size:14px;font-weight:700;padding:4px 0;">Total</td><td style="text-align:right;font-size:14px;font-weight:700;color:#16a34a;">${formatLKR(data.total)}</td></tr>
      </table>
      <p style="font-size:12px;color:#6b7280;margin:12px 0 0;">Delivery: <strong>${data.deliveryDay}</strong> · Payment: <strong>${data.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</strong></p>
      ${ctaButton("Track Your Order", `${siteUrl()}/orders/${data.orderId}`)}
    `),
  };
}

export function paymentVerifiedEmail(data: {
  customerName: string;
  orderRefCode: string;
  orderId: string;
}): { subject: string; html: string } {
  return {
    subject: `Payment Verified — ${data.orderRefCode}`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#111;">Payment Verified ✅</h2>
      <p style="font-size:14px;color:#6b7280;">Hi ${data.customerName}, your bank transfer for order <strong>${data.orderRefCode}</strong> has been verified.</p>
      <p style="font-size:14px;color:#6b7280;">We're preparing your meal now!</p>
      ${ctaButton("Track Your Order", `${siteUrl()}/orders/${data.orderId}`)}
    `),
  };
}

export function paymentRejectedEmail(data: {
  customerName: string;
  orderRefCode: string;
  orderId: string;
  reason?: string;
}): { subject: string; html: string } {
  return {
    subject: `Payment Issue — ${data.orderRefCode}`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#dc2626;">Payment Issue ⚠️</h2>
      <p style="font-size:14px;color:#6b7280;">Hi ${data.customerName}, we were unable to verify your bank transfer for order <strong>${data.orderRefCode}</strong>.</p>
      ${data.reason ? `<p style="font-size:13px;color:#6b7280;">Reason: ${data.reason}</p>` : ""}
      <p style="font-size:14px;color:#6b7280;">Please re-upload your payment slip or contact us on WhatsApp.</p>
      ${ctaButton("View Order", `${siteUrl()}/orders/${data.orderId}`)}
    `),
  };
}

export function statusUpdateEmail(data: {
  customerName: string;
  orderRefCode: string;
  orderId: string;
  newStatus: string;
  trackingLink?: string | null;
}): { subject: string; html: string } {
  const statusLabels: Record<string, { emoji: string; title: string; description: string }> = {
    confirmed: {
      emoji: "✅",
      title: "Order Confirmed",
      description: "Your order has been confirmed and will be prepared soon.",
    },
    preparing: {
      emoji: "👩‍🍳",
      title: "Being Prepared",
      description: "Saumya is preparing your meal with love!",
    },
    out_for_delivery: {
      emoji: "🚗",
      title: "Out for Delivery",
      description: "Your meal is on its way!",
    },
    delivered: {
      emoji: "🎉",
      title: "Delivered",
      description: "Your meal has been delivered. Enjoy!",
    },
    cancelled: {
      emoji: "❌",
      title: "Order Cancelled",
      description: "Your order has been cancelled. Contact us if you have questions.",
    },
  };

  const info = statusLabels[data.newStatus] ?? {
    emoji: "📋",
    title: data.newStatus.replace(/_/g, " "),
    description: "Your order status has been updated.",
  };

  const trackingHtml =
    data.trackingLink && data.newStatus === "out_for_delivery"
      ? ctaButton("Track Your Driver", data.trackingLink)
      : "";

  return {
    subject: `${info.emoji} ${info.title} — ${data.orderRefCode}`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#111;">${info.emoji} ${info.title}</h2>
      <p style="font-size:14px;color:#6b7280;">Hi ${data.customerName}, your order <strong>${data.orderRefCode}</strong> — ${info.description}</p>
      ${trackingHtml}
      ${ctaButton("View Order", `${siteUrl()}/orders/${data.orderId}`)}
    `),
  };
}
