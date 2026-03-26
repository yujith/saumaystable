"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store/cart";
import { getDeliveryWeek, formatDeliveryDate } from "@/lib/cutoff";
import type { Database } from "@/types/database";

type Address = Database["public"]["Tables"]["addresses"]["Row"];

interface CheckoutFlowProps {
  addresses: Address[];
  bankDetails: Record<string, string> | null;
  paymentMethods: { cod_enabled: boolean; bank_transfer_enabled: boolean } | null;
  profile: { name: string | null; phone: string | null; whatsapp_opted_in: boolean } | null;
  userEmail: string;
}

type Step = "address" | "payment" | "summary";

const steps: { key: Step; label: string; icon: typeof MapPin }[] = [
  { key: "address", label: "Address", icon: MapPin },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "summary", label: "Confirm", icon: CheckCircle2 },
];

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export function CheckoutFlow({
  addresses,
  bankDetails,
  paymentMethods,
  profile,
  userEmail,
}: CheckoutFlowProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const deliveryDayPreference = useCartStore((s) => s.deliveryDayPreference);
  const setDeliveryDayPreference = useCartStore((s) => s.setDeliveryDayPreference);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">(
    paymentMethods?.bank_transfer_enabled ? "bank_transfer" : "cod"
  );
  const [notes, setNotes] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(profile?.whatsapp_opted_in ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment method settings - default to enabled if not set
  const isCodEnabled = paymentMethods?.cod_enabled !== false;
  const isBankTransferEnabled = paymentMethods?.bank_transfer_enabled === true;

  // New address form state
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    district: "",
  });

  // Delivery info
  const [deliveryInfo, setDeliveryInfo] = useState<{
    sat: string;
    sun: string;
    isNextWeek: boolean;
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const week = getDeliveryWeek();
    setDeliveryInfo({
      sat: formatDeliveryDate(week.deliverySat),
      sun: formatDeliveryDate(week.deliverySun),
      isNextWeek: week.isNextWeek,
    });
  }, []);

  const subtotal = mounted ? getSubtotal() : 0;
  const deliveryFee = 0; // TODO: Calculate based on delivery zone
  const total = subtotal + deliveryFee;

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button onClick={() => router.push("/menu")}>Browse Menu</Button>
      </div>
    );
  }

  async function handleSaveNewAddress(): Promise<string | null> {
    if (!newAddress.street || !newAddress.city || !newAddress.district) {
      setError("Please fill in all address fields.");
      return null;
    }

    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save address.");
      return null;
    }

    const data = await res.json();
    return data.id;
  }

  async function handlePlaceOrder() {
    setIsSubmitting(true);
    setError(null);

    try {
      let addressId = selectedAddressId;

      // If creating new address, save it first
      if (showNewAddress) {
        const newId = await handleSaveNewAddress();
        if (!newId) {
          setIsSubmitting(false);
          return;
        }
        addressId = newId;
      }

      if (!addressId) {
        setError("Please select or add a delivery address.");
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        items: items.map((item) => ({
          meal_id: item.meal.id,
          quantity: item.quantity,
          unit_price_lkr: item.meal.price_lkr,
        })),
        address_id: addressId,
        delivery_date_preference: deliveryDayPreference,
        payment_method: paymentMethod,
        notes: notes || undefined,
        whatsapp_opted_in: whatsappOptIn,
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to place order.");
        setIsSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${result.orderId}`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => {
                if (idx < stepIndex) setCurrentStep(step.key);
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                idx === stepIndex
                  ? "bg-primary text-primary-foreground"
                  : idx < stepIndex
                  ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <step.icon className="h-3.5 w-3.5" />
              {step.label}
            </button>
            {idx < steps.length - 1 && (
              <div className="w-8 h-px bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Delivery week banner */}
      {deliveryInfo && (
        <div
          className={`rounded-md px-4 py-2.5 text-sm font-medium text-center ${
            deliveryInfo.isNextWeek
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-green-50 text-green-800 border border-green-200"
          }`}
        >
          {deliveryInfo.isNextWeek ? "⚠ Delivery next week: " : "Delivery this week: "}
          {deliveryInfo.sat} / {deliveryInfo.sun}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Address */}
      {currentStep === "address" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Delivery day preference */}
            <div className="space-y-2">
              <Label>Preferred Delivery Day</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={deliveryDayPreference === "saturday" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeliveryDayPreference("saturday")}
                >
                  Saturday{deliveryInfo ? ` (${deliveryInfo.sat})` : ""}
                </Button>
                <Button
                  type="button"
                  variant={deliveryDayPreference === "sunday" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeliveryDayPreference("sunday")}
                >
                  Sunday{deliveryInfo ? ` (${deliveryInfo.sun})` : ""}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Saved addresses */}
            {addresses.length > 0 && !showNewAddress && (
              <div className="space-y-3">
                <Label>Select an address</Label>
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{addr.label || "Address"}</span>
                      {addr.is_default && (
                        <Badge variant="secondary" className="text-[10px]">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      {addr.street}{addr.city ? `, ${addr.city}` : ""}{addr.district ? `, ${addr.district}` : ""}
                    </p>
                  </button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewAddress(true)}
                >
                  + Add new address
                </Button>
              </div>
            )}

            {/* New address form */}
            {(showNewAddress || addresses.length === 0) && (
              <div className="space-y-3">
                <Label>New delivery address</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Label (e.g. Home, Office)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))}
                  />
                  <Input
                    placeholder="Street address *"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress((p) => ({ ...p, street: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="City *"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                    />
                    <Input
                      placeholder="District *"
                      value={newAddress.district}
                      onChange={(e) => setNewAddress((p) => ({ ...p, district: e.target.value }))}
                    />
                  </div>
                </div>
                {addresses.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewAddress(false)}
                  >
                    Use saved address instead
                  </Button>
                )}
              </div>
            )}

            <div className="pt-2">
              <Button
                className="w-full"
                onClick={() => {
                  if (!showNewAddress && !selectedAddressId) {
                    setError("Please select an address.");
                    return;
                  }
                  if (showNewAddress && (!newAddress.street || !newAddress.city || !newAddress.district)) {
                    setError("Please fill in all address fields.");
                    return;
                  }
                  setError(null);
                  setCurrentStep("payment");
                }}
              >
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment */}
      {currentStep === "payment" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* COD */}
            {isCodEnabled && (
              <button
                type="button"
                className={`w-full text-left rounded-lg border p-4 transition-colors ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPaymentMethod("cod")}
              >
                <p className="font-medium text-sm">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay when your meal is delivered.
                </p>
              </button>
            )}

            {/* Bank Transfer */}
            {isBankTransferEnabled && (
              <button
                type="button"
                className={`w-full text-left rounded-lg border p-4 transition-colors ${
                  paymentMethod === "bank_transfer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPaymentMethod("bank_transfer")}
              >
                <p className="font-medium text-sm">Bank Transfer</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Transfer to our bank account and upload the payment slip.
                </p>
              </button>
            )}

            {/* No payment methods warning */}
            {!isCodEnabled && !isBankTransferEnabled && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                No payment methods are currently available. Please contact support.
              </div>
            )}

            {/* Bank details shown when bank transfer is selected */}
            {paymentMethod === "bank_transfer" && bankDetails && (
              <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Bank Account Details
                </p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Bank:</span> {bankDetails.bank_name}</p>
                  <p><span className="text-muted-foreground">Account Name:</span> {bankDetails.account_name}</p>
                  <p><span className="text-muted-foreground">Account Number:</span> <span className="font-mono">{bankDetails.account_number}</span></p>
                  {bankDetails.branch && (
                    <p><span className="text-muted-foreground">Branch:</span> {bankDetails.branch}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your unique Order Reference Code will be shown after placing the order.
                  Use it as the payment reference.
                </p>
              </div>
            )}

            {/* // TODO: v2 — PayHere integration */}

            {/* Special instructions */}
            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any dietary notes or delivery instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            {/* WhatsApp opt-in */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="whatsapp_opt"
                className="h-4 w-4 rounded border-input"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
              />
              <Label htmlFor="whatsapp_opt" className="text-sm font-normal">
                Send me order updates via WhatsApp
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setCurrentStep("address")}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => setCurrentStep("summary")}
                disabled={!isCodEnabled && !isBankTransferEnabled}
              >
                Review Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Summary */}
      {currentStep === "summary" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Line items */}
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.meal.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="truncate">{item.meal.name}</span>
                    <span className="text-muted-foreground ml-1">&times;{item.quantity}</span>
                  </div>
                  <span className="font-medium ml-4">
                    {formatLKR(item.meal.price_lkr * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery fee</span>
                <span>{deliveryFee === 0 ? "Free" : formatLKR(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>Total</span>
                <span className="text-primary">{formatLKR(total)}</span>
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery day</span>
                <span className="capitalize">{deliveryDayPreference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>{paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</span>
              </div>
              {notes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="text-right max-w-[200px] truncate">{notes}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setCurrentStep("payment")}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order · ${formatLKR(total)}`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
