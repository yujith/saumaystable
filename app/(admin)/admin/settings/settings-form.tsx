"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SettingsFormProps {
  settings: Record<string, unknown>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Bank account details
  const bankAccount = (settings.bank_account ?? {}) as Record<string, string>;
  const [bankName, setBankName] = useState(bankAccount.bank_name ?? "");
  const [accountName, setAccountName] = useState(bankAccount.account_name ?? "");
  const [accountNumber, setAccountNumber] = useState(bankAccount.account_number ?? "");
  const [branch, setBranch] = useState(bankAccount.branch ?? "");

  // Business profile
  const businessProfile = (settings.business_profile ?? {}) as Record<string, string>;
  const [businessName, setBusinessName] = useState(businessProfile.name ?? "Saumya's Table");
  const [whatsappNumber, setWhatsappNumber] = useState(businessProfile.whatsapp_number ?? "+94");
  const [businessEmail, setBusinessEmail] = useState(businessProfile.email ?? "");

  // Delivery fee
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(
    String((settings.default_delivery_fee as number) ?? 0)
  );

  // Holiday mode
  const holidayConfig = (settings.holiday_mode ?? {}) as Record<string, unknown>;
  const [holidayEnabled, setHolidayEnabled] = useState(Boolean(holidayConfig.enabled));
  const [holidayMessage, setHolidayMessage] = useState(String(holidayConfig.message ?? ""));

  // Payment methods
  const paymentConfig = (settings.payment_methods ?? { cod: true, bank_transfer: true }) as Record<string, boolean>;
  const [codEnabled, setCodEnabled] = useState(paymentConfig.cod !== false);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(paymentConfig.bank_transfer !== false);

  // Announcement banner
  const [announcementBanner, setAnnouncementBanner] = useState(
    String((settings.announcement_banner as string) ?? "")
  );

  // Cutoff override
  const cutoffConfig = (settings.cutoff_override ?? {}) as Record<string, unknown>;
  const [cutoffOverrideEnabled, setCutoffOverrideEnabled] = useState(Boolean(cutoffConfig.enabled));
  const [cutoffOverrideTime, setCutoffOverrideTime] = useState(String(cutoffConfig.override_time ?? ""));

  async function saveSetting(key: string, value: unknown) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save setting");
    }
  }

  async function handleSaveAll() {
    setIsSaving(true);
    setMessage(null);

    try {
      await saveSetting("bank_account", {
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber,
        branch,
      });

      await saveSetting("business_profile", {
        name: businessName,
        whatsapp_number: whatsappNumber,
        email: businessEmail,
      });

      await saveSetting("default_delivery_fee", Number(defaultDeliveryFee) || 0);

      await saveSetting("holiday_mode", {
        enabled: holidayEnabled,
        message: holidayMessage,
      });

      await saveSetting("payment_methods", {
        cod: codEnabled,
        bank_transfer: bankTransferEnabled,
      });

      await saveSetting("announcement_banner", announcementBanner.trim() || null);

      await saveSetting("cutoff_override", {
        enabled: cutoffOverrideEnabled,
        override_time: cutoffOverrideTime || null,
      });

      setMessage({ type: "success", text: "Settings saved successfully." });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-green-50 text-green-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Bank Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bank Account Details</CardTitle>
          <CardDescription>
            Displayed to customers who choose bank transfer payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input id="bank_name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name</Label>
            <Input id="account_name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input id="account_number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Profile</CardTitle>
          <CardDescription>
            Used in emails, WhatsApp messages, and the website footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input id="business_name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input id="whatsapp_number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_email">Email</Label>
              <Input id="business_email" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="delivery_fee">Default Delivery Fee (LKR)</Label>
            <Input
              id="delivery_fee"
              type="number"
              step="0.01"
              value={defaultDeliveryFee}
              onChange={(e) => setDefaultDeliveryFee(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Set to 0 for free delivery. Zone-specific fees can be set in the delivery zones section.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Holiday Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Holiday Mode</CardTitle>
          <CardDescription>
            When enabled, the menu page shows a custom message and orders are paused.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="holiday_enabled"
              className="h-4 w-4 rounded border-input"
              checked={holidayEnabled}
              onChange={(e) => setHolidayEnabled(e.target.checked)}
            />
            <Label htmlFor="holiday_enabled" className="text-sm font-normal">
              Enable holiday mode
            </Label>
          </div>
          {holidayEnabled && (
            <div className="space-y-2">
              <Label htmlFor="holiday_message">Holiday Message</Label>
              <Input
                id="holiday_message"
                value={holidayMessage}
                onChange={(e) => setHolidayMessage(e.target.value)}
                placeholder="We're taking a break this week! Back next Saturday."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Methods</CardTitle>
          <CardDescription>
            Toggle which payment methods are available to customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="cod_enabled"
              className="h-4 w-4 rounded border-input"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
            />
            <Label htmlFor="cod_enabled" className="text-sm font-normal">
              Cash on Delivery
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bank_transfer_enabled"
              className="h-4 w-4 rounded border-input"
              checked={bankTransferEnabled}
              onChange={(e) => setBankTransferEnabled(e.target.checked)}
            />
            <Label htmlFor="bank_transfer_enabled" className="text-sm font-normal">
              Bank Transfer
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Cutoff Override */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cutoff Override</CardTitle>
          <CardDescription>
            Override the default Thursday 7PM cutoff. When enabled, orders close at the specified time instead.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="cutoff_override_enabled"
              className="h-4 w-4 rounded border-input"
              checked={cutoffOverrideEnabled}
              onChange={(e) => setCutoffOverrideEnabled(e.target.checked)}
            />
            <Label htmlFor="cutoff_override_enabled" className="text-sm font-normal">
              Override cutoff time
            </Label>
          </div>
          {cutoffOverrideEnabled && (
            <div className="space-y-2">
              <Label htmlFor="cutoff_time">New Cutoff (ISO date-time)</Label>
              <Input
                id="cutoff_time"
                type="datetime-local"
                value={cutoffOverrideTime}
                onChange={(e) => setCutoffOverrideTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Set a specific date and time. Orders will close at this time instead of Thursday 7PM.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcement Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Announcement Banner</CardTitle>
          <CardDescription>
            Displayed at the top of every page. Leave empty to hide.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="announcement">Banner Text</Label>
            <Input
              id="announcement"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="e.g. Free delivery this week on all orders!"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button onClick={handleSaveAll} disabled={isSaving} className="w-full">
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save All Settings"
        )}
      </Button>
    </div>
  );
}
