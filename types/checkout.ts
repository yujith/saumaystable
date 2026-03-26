import { z } from "zod";

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().optional(),
  street: z.string().min(5, "Please enter a full street address"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        meal_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(50),
        unit_price_lkr: z.number().positive(),
      })
    )
    .min(1, "Cart is empty"),
  address_id: z.string().uuid("Please select or add a delivery address"),
  delivery_date_preference: z.enum(["saturday", "sunday"]),
  payment_method: z.enum(["cod", "bank_transfer"]),
  notes: z.string().max(500).optional(),
  whatsapp_opted_in: z.boolean().optional(),
  // Guest fields (used when not logged in)
  guest_email: z.string().email().optional().or(z.literal("")),
  guest_phone: z
    .string()
    .regex(/^\+94\d{9}$/, "Phone must be a valid Sri Lankan number")
    .optional()
    .or(z.literal("")),
});

export type CreateOrderData = z.infer<typeof createOrderSchema>;

export const createOrderResponseSchema = z.object({
  orderId: z.string().uuid(),
  orderReferenceCode: z.string(),
});

export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;
