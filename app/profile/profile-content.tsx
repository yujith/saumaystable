"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, MapPin, Star, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateProfileSchema, type UpdateProfileFormData } from "@/types/auth";
import { updateProfile, deleteAddress, setDefaultAddress } from "./actions";
import { logout } from "../(auth)/actions";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Address = Database["public"]["Tables"]["addresses"]["Row"];
type OrderSummary = {
  id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  order_reference_code: string;
  delivery_date_preference: string;
  total_lkr: number;
  created_at: string;
};

const statusColorMap: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  preparing: "bg-yellow-100 text-yellow-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColorMap: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  awaiting_verification: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function ProfileContent({
  profile,
  addresses,
  orders,
  userEmail,
}: {
  profile: Profile | null;
  addresses: Address[];
  orders: OrderSummary[];
  userEmail: string;
}) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      phone: profile?.phone ?? "+94",
      whatsapp_opted_in: profile?.whatsapp_opted_in ?? true,
    },
  });

  async function onUpdateProfile(data: UpdateProfileFormData) {
    setServerMessage(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone || "");
    formData.append("whatsapp_opted_in", String(data.whatsapp_opted_in ?? true));

    const result = await updateProfile(formData);

    if (result.error) {
      setServerMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setServerMessage({ type: "success", text: result.success });
      router.refresh();
    }
  }

  async function handleDeleteAddress(addressId: string) {
    const result = await deleteAddress(addressId);
    if (result.success) {
      router.refresh();
    }
  }

  async function handleSetDefault(addressId: string) {
    const result = await setDefaultAddress(addressId);
    if (result.success) {
      router.refresh();
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
  }

  function formatLKR(amount: number): string {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Log Out
        </Button>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your name, phone number, and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                {serverMessage && (
                  <div
                    className={`rounded-md px-4 py-3 text-sm ${
                      serverMessage.type === "error"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-green-50 text-green-800"
                    }`}
                  >
                    {serverMessage.text}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-display">Email</Label>
                  <Input
                    id="email-display"
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+94771234567"
                    autoComplete="tel"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="whatsapp_opted_in"
                    className="h-4 w-4 rounded border-input"
                    {...register("whatsapp_opted_in")}
                  />
                  <Label htmlFor="whatsapp_opted_in" className="text-sm font-normal">
                    Receive order updates via WhatsApp
                  </Label>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>
                Manage your delivery addresses. You can add new addresses during checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No saved addresses yet. Add one during checkout.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {address.label || "Address"}
                            </p>
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.street}
                            {address.city ? `, ${address.city}` : ""}
                            {address.district ? `, ${address.district}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!address.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(address.id)}
                            title="Set as default"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          title="Delete address"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your last 10 orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No orders yet. Browse the menu to get started!
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <a
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium text-sm font-mono">
                            {order.order_reference_code}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.created_at), "dd MMM yyyy, h:mm a")}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                statusColorMap[order.status] ?? "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status.replace(/_/g, " ")}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                paymentStatusColorMap[order.payment_status] ?? "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.payment_status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatLKR(order.total_lkr)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {order.delivery_date_preference}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
