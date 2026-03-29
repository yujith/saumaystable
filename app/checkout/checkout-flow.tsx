"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store/cart";
import { getDeliveryWeek, formatDeliveryDate } from "@/lib/cutoff";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { DeliveryMap } from "@/components/delivery-map";
import type { Database } from "@/types/database";

type Address = Database["public"]["Tables"]["addresses"]["Row"];

interface CheckoutFlowProps {
  addresses: Address[];
  bankDetails: Record<string, string> | null;
  paymentMethods: { cod_enabled: boolean; bank_transfer_enabled: boolean } | null;
  profile: { name: string | null; phone: string | null; whatsapp_opted_in: boolean } | null;
  userEmail: string;
  defaultDeliveryFee: number;
}

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export function CheckoutFlow({
  addresses,
  bankDetails,
  paymentMethods,
  profile,
  defaultDeliveryFee,
}: CheckoutFlowProps) {
  const items = useCartStore((s) => s.items);
  const deliveryDayPreference = useCartStore((s) => s.deliveryDayPreference);
  const setDeliveryDayPreference = useCartStore((s) => s.setDeliveryDayPreference);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

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
  const [success, setSuccess] = useState<{ orderId: string; orderRef: string } | null>(null);

  const isCodEnabled = paymentMethods?.cod_enabled !== false;
  const isBankTransferEnabled = paymentMethods?.bank_transfer_enabled === true;

  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    district: "",
    lat: 0,
    lng: 0,
  });

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

  const router = useRouter();

  const subtotal = mounted ? getSubtotal() : 0;
  const deliveryFee = defaultDeliveryFee;
  const total = subtotal + deliveryFee;

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="font-body text-secondary text-lg">Your cart is empty.</p>
        <Button onClick={() => window.location.href = "/menu"}>Browse Menu</Button>
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
        setError(result.error || "Failed to place order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Don't clear cart yet - show success first
      setSuccess({
        orderId: result.orderId,
        orderRef: result.orderReferenceCode || result.orderId.slice(0, 8),
      });
      
      // Delay redirect and clear cart after user sees success
      setTimeout(() => {
        clearCart();
        router.push(`/order-confirmation/${result.orderId}`);
      }, 2000);
    } catch (err) {
      console.error("Order placement error:", err);
      setError("An unexpected error occurred. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Checkout Steps */}
      <div className="lg:col-span-8 space-y-12">
        <div className="space-y-2">
          <h1 className="font-headline font-extrabold text-3xl lg:text-4xl tracking-tight text-on-surface">
            Finalize Your Order
          </h1>
          <p className="font-body text-secondary text-lg">
            Secure and simple. Your Sri Lankan feast is just a few steps away.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-tertiary-container/30 border-2 border-tertiary/20 rounded-xl p-8 text-center space-y-4 animate-in fade-in-up">
            <div className="w-16 h-16 rounded-full bg-tertiary/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-tertiary" />
            </div>
            <div className="space-y-2">
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                Order Placed Successfully!
              </h2>
              <p className="font-body text-secondary">
                Your order reference: <span className="font-mono font-bold text-tertiary">{success.orderRef}</span>
              </p>
              <p className="font-body text-sm text-secondary">
                Redirecting you to the confirmation page...
              </p>
            </div>
            <Button 
              onClick={() => router.push(`/order-confirmation/${success.orderId}`)}
              className="bg-tertiary hover:bg-tertiary-container text-on-tertiary"
            >
              Go Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs underline mt-1 hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step 1: Delivery Address - hide when success */}
        {!success && (
          <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-editorial space-y-6">
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-full bg-tertiary-container text-white flex items-center justify-center font-headline font-bold">
              1
            </span>
            <h2 className="font-headline font-bold text-xl lg:text-2xl text-on-surface">
              Delivery Destination
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Address Form */}
            <div className="space-y-4">
              {/* Saved Addresses */}
              {addresses.length > 0 && !showNewAddress && (
                <div className="space-y-3">
                  <Label className="font-headline font-semibold text-xs text-secondary uppercase tracking-widest">
                    Select an Address
                  </Label>
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      className={`w-full text-left rounded-lg p-4 transition-all ${
                        selectedAddressId === addr.id
                          ? "bg-primary/5 border-2 border-primary"
                          : "bg-surface-container hover:bg-surface-container-high border-2 border-transparent"
                      }`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedAddressId === addr.id ? "bg-primary-container/30" : "bg-secondary-container"
                        }`}>
                          <MapPin className={`h-5 w-5 ${selectedAddressId === addr.id ? "text-primary" : "text-secondary"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-headline font-bold text-sm">{addr.label || "Address"}</span>
                            {addr.is_default && (
                              <Badge variant="secondary" className="text-[10px] bg-tertiary-fixed text-tertiary">Default</Badge>
                            )}
                          </div>
                          <p className="text-xs font-label text-secondary mt-0.5">
                            {addr.street}{addr.city ? `, ${addr.city}` : ""}{addr.district ? `, ${addr.district}` : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(true)}
                    className="text-primary font-semibold text-sm hover:underline"
                  >
                    + Add new address
                  </button>
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddress || addresses.length === 0) && (
                <div className="space-y-4">
                  <AddressAutocomplete
                    defaultValue={newAddress.street}
                    onChange={(value) => setNewAddress((p) => ({ ...p, street: value }))}
                    onPlaceSelect={(place) => {
                      setNewAddress((p) => ({
                        ...p,
                        street: place.street,
                        city: place.city,
                        district: place.district,
                        lat: place.lat,
                        lng: place.lng,
                      }));
                    }}
                    label="Street Address"
                    placeholder="Start typing your address..."
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-headline font-semibold text-xs text-secondary uppercase tracking-widest">
                        City
                      </Label>
                      <Input
                        placeholder="Colombo"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                        className="bg-surface-container border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-headline font-semibold text-xs text-secondary uppercase tracking-widest">
                        District
                      </Label>
                      <Input
                        placeholder="Colombo 03"
                        value={newAddress.district}
                        onChange={(e) => setNewAddress((p) => ({ ...p, district: e.target.value }))}
                        className="bg-surface-container border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                      />
                    </div>
                  </div>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(false)}
                      className="text-secondary text-sm hover:underline"
                    >
                      Use saved address instead
                    </button>
                  )}
                </div>
              )}

              {/* Delivery Day Preference */}
              <div className="space-y-2 pt-2">
                <Label className="font-headline font-semibold text-xs text-secondary uppercase tracking-widest">
                  Preferred Delivery Day
                </Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={deliveryDayPreference === "saturday" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeliveryDayPreference("saturday")}
                    className={deliveryDayPreference === "saturday" ? "bg-primary hover:bg-primary/90" : "border-outline-variant hover:bg-surface-container"}
                  >
                    Saturday{deliveryInfo ? ` (${deliveryInfo.sat})` : ""}
                  </Button>
                  <Button
                    type="button"
                    variant={deliveryDayPreference === "sunday" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeliveryDayPreference("sunday")}
                    className={deliveryDayPreference === "sunday" ? "bg-primary hover:bg-primary/90" : "border-outline-variant hover:bg-surface-container"}
                  >
                    Sunday{deliveryInfo ? ` (${deliveryInfo.sun})` : ""}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Map */}
            <div className="hidden lg:block">
              <DeliveryMap
                lat={newAddress.lat}
                lng={newAddress.lng}
                city={newAddress.city}
              />
            </div>
          </div>
        </section>
        )}

        {/* Step 2: Payment Method */}
        {!success && (
          <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-editorial space-y-6">
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-full bg-tertiary-container text-white flex items-center justify-center font-headline font-bold">
              2
            </span>
            <h2 className="font-headline font-bold text-xl lg:text-2xl text-on-surface">
              Payment Method
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash on Delivery */}
            {isCodEnabled && (
              <button
                type="button"
                className={`border-2 p-6 rounded-lg flex flex-col justify-between h-40 transition-all ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/[0.03]"
                    : "border-transparent hover:border-outline-variant bg-surface-container"
                }`}
                onClick={() => setPaymentMethod("cod")}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === "cod" ? "bg-primary-container/20" : "bg-secondary-container"
                  }`}>
                    <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "cod" ? "border-primary" : "border-outline-variant"
                  }`}>
                    {paymentMethod === "cod" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg">Cash on Delivery</h3>
                  <p className="font-body text-secondary text-sm">Pay when you receive your meal.</p>
                </div>
              </button>
            )}

            {/* Bank Transfer */}
            {isBankTransferEnabled && (
              <button
                type="button"
                className={`border-2 p-6 rounded-lg flex flex-col justify-between h-40 transition-all ${
                  paymentMethod === "bank_transfer"
                    ? "border-primary bg-primary/[0.03]"
                    : "border-transparent hover:border-outline-variant bg-surface-container"
                }`}
                onClick={() => setPaymentMethod("bank_transfer")}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === "bank_transfer" ? "bg-primary-fixed" : "bg-secondary-container"
                  }`}>
                    <span className="material-symbols-outlined text-secondary text-2xl">account_balance</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "bank_transfer" ? "border-primary" : "border-outline-variant"
                  }`}>
                    {paymentMethod === "bank_transfer" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg">Bank Transfer</h3>
                  <p className="font-body text-secondary text-sm">Transfer details provided on next step.</p>
                </div>
              </button>
            )}
          </div>

          {/* Bank Transfer Security Details */}
          {paymentMethod === "bank_transfer" && bankDetails && (
            <div className="bg-surface-container p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-tertiary">verified_user</span>
                <p className="font-headline font-semibold text-sm text-tertiary">Bank Transfer Security Details</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm font-headline">
                <div>
                  <p className="text-secondary">Bank Name</p>
                  <p className="font-bold">{bankDetails.bank_name || "Bank"}</p>
                </div>
                <div>
                  <p className="text-secondary">Account No</p>
                  <p className="font-bold font-mono">{bankDetails.account_number || "****"}</p>
                </div>
                <div>
                  <p className="text-secondary">Account Name</p>
                  <p className="font-bold">{bankDetails.account_name || "Account"}</p>
                </div>
                {bankDetails.branch && (
                  <div>
                    <p className="text-secondary">Branch</p>
                    <p className="font-bold">{bankDetails.branch}</p>
                  </div>
                )}
              </div>

              {/* Bank Transfer Instructions */}
              <div className="pt-4 border-t border-outline-variant/20">
                <p className="text-sm text-secondary">
                  After placing your order, you&apos;ll be able to upload your payment slip on the confirmation page for faster verification.
                </p>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-headline font-semibold text-xs text-secondary uppercase tracking-widest">
              Special Instructions (optional)
            </Label>
            <textarea
              id="notes"
              placeholder="Any dietary notes or delivery instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full bg-surface-container border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all resize-none font-label text-sm"
            />
          </div>

          {/* Mobile-only Place Order button — shown when the right aside is below the form */}
          <div className="lg:hidden pt-2 space-y-3">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-lg text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Place Order
                  <span className="material-symbols-outlined">chevron_right</span>
                </>
              )}
            </button>
            <p className="text-center font-body text-[10px] text-secondary">
              By placing an order, you agree to Saumya&apos;s Culinary Terms &amp; Conditions.
            </p>
          </div>
        </section>
        )}
      </div>

      {/* Right Column: Sticky Order Summary - hide when success */}
      {!success && (
        <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-surface-container p-6 lg:p-8 rounded-xl shadow-editorial space-y-8">
            <h2 className="font-headline font-bold text-2xl text-on-surface">Your Selection</h2>

            {/* Cart Items */}
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.meal.id} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                    {item.meal.image_url ? (
                      <Image
                        src={item.meal.image_url}
                        alt={item.meal.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-outline-variant" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-body font-bold text-sm text-on-surface truncate">{item.meal.name}</h4>
                    <p className="text-xs font-headline text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-headline font-bold text-primary">
                    {formatLKR(item.meal.price_lkr * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-outline-variant/30" />

            {/* Totals */}
            <div className="space-y-4 font-headline">
              <div className="flex justify-between text-secondary">
                <span>Subtotal</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : formatLKR(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-4">
                <span className="text-on-surface font-bold text-lg">Total</span>
                <span className="text-primary font-extrabold text-3xl">{formatLKR(total)}</span>
              </div>
            </div>

            {/* WhatsApp Opt-in */}
            <div className="bg-surface-container-low p-4 rounded-lg flex items-start gap-3 border border-outline-variant/20">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  id="whatsapp_opt"
                  className="rounded-sm border-secondary text-primary focus:ring-primary h-5 w-5"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="whatsapp_opt" className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5 cursor-pointer">
                  WhatsApp Updates
                  <span className="bg-[#25D366] text-white px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-tighter">Live</span>
                </label>
                <p className="font-body text-xs text-secondary leading-relaxed">
                  Receive live cooking updates and rider tracking via WhatsApp messages.
                </p>
              </div>
            </div>

            {/* Place Order Button */}
            <div className="space-y-4 pt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-lg text-lg flex items-center justify-center gap-3 hover:bg-primary-container transition-colors shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <span className="material-symbols-outlined">chevron_right</span>
                  </>
                )}
              </button>
              <p className="text-center font-body text-[10px] text-secondary">
                By placing an order, you agree to Saumya&apos;s Culinary Terms &amp; Conditions.
              </p>
            </div>
          </div>

          {/* Handcrafted Signature */}
          <div className="mt-8 bg-tertiary/10 p-6 rounded-xl relative overflow-hidden flex items-center gap-4">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl" />
            <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <div>
              <p className="font-body italic font-bold text-tertiary">Handcrafted with Love</p>
              <p className="font-headline text-xs text-on-tertiary-fixed-variant">All packaging is 100% compostable and plastic-free.</p>
            </div>
          </div>
        </div>
      </aside>
      )}
    </div>
  );
}
