export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          name: string | null;
          phone: string | null;
          email: string | null;
          role: "customer" | "admin";
          whatsapp_opted_in: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          role?: "customer" | "admin";
          whatsapp_opted_in?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          role?: "customer" | "admin";
          whatsapp_opted_in?: boolean;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          street: string;
          city: string | null;
          district: string | null;
          lat: number | null;
          lng: number | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          street: string;
          city?: string | null;
          district?: string | null;
          lat?: number | null;
          lng?: number | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          street?: string;
          city?: string | null;
          district?: string | null;
          lat?: number | null;
          lng?: number | null;
          is_default?: boolean;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
        };
      };
      meals: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price_lkr: number;
          category_id: string | null;
          image_url: string | null;
          tags: string[];
          portion_info: string | null;
          is_available: boolean;
          stock_limit: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price_lkr: number;
          category_id?: string | null;
          image_url?: string | null;
          tags?: string[];
          portion_info?: string | null;
          is_available?: boolean;
          stock_limit?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price_lkr?: number;
          category_id?: string | null;
          image_url?: string | null;
          tags?: string[];
          portion_info?: string | null;
          is_available?: boolean;
          stock_limit?: number | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          status: "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
          payment_method: "cod" | "bank_transfer";
          payment_status: "pending" | "awaiting_verification" | "verified" | "rejected";
          order_reference_code: string;
          delivery_week_start: string;
          delivery_date_preference: "saturday" | "sunday";
          delivery_partner: "dad" | "pickme_flash" | null;
          tracking_link: string | null;
          address_id: string | null;
          delivery_fee_lkr: number;
          total_lkr: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          status?: "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
          payment_method: "cod" | "bank_transfer";
          payment_status?: "pending" | "awaiting_verification" | "verified" | "rejected";
          order_reference_code: string;
          delivery_week_start: string;
          delivery_date_preference?: "saturday" | "sunday";
          delivery_partner?: "dad" | "pickme_flash" | null;
          tracking_link?: string | null;
          address_id?: string | null;
          delivery_fee_lkr?: number;
          total_lkr: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          status?: "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
          payment_method?: "cod" | "bank_transfer";
          payment_status?: "pending" | "awaiting_verification" | "verified" | "rejected";
          order_reference_code?: string;
          delivery_week_start?: string;
          delivery_date_preference?: "saturday" | "sunday";
          delivery_partner?: "dad" | "pickme_flash" | null;
          tracking_link?: string | null;
          address_id?: string | null;
          delivery_fee_lkr?: number;
          total_lkr?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          meal_id: string;
          quantity: number;
          unit_price_lkr: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          meal_id: string;
          quantity: number;
          unit_price_lkr: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          meal_id?: string;
          quantity?: number;
          unit_price_lkr?: number;
        };
      };
      payment_slips: {
        Row: {
          id: string;
          order_id: string;
          image_url: string;
          uploaded_at: string;
          verified_by: string | null;
          verified_at: string | null;
          rejection_reason: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          image_url: string;
          uploaded_at?: string;
          verified_by?: string | null;
          verified_at?: string | null;
          rejection_reason?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          image_url?: string;
          uploaded_at?: string;
          verified_by?: string | null;
          verified_at?: string | null;
          rejection_reason?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          order_id: string | null;
          channel: "email" | "whatsapp";
          type: string;
          recipient: string;
          status: "sent" | "delivered" | "read" | "failed";
          error_message: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          channel: "email" | "whatsapp";
          type: string;
          recipient: string;
          status?: "sent" | "delivered" | "read" | "failed";
          error_message?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          channel?: "email" | "whatsapp";
          type?: string;
          recipient?: string;
          status?: "sent" | "delivered" | "read" | "failed";
          error_message?: string | null;
          sent_at?: string;
        };
      };
      delivery_zones: {
        Row: {
          id: string;
          name: string;
          fee_lkr: number;
          partner: "dad" | "pickme_flash" | "any";
        };
        Insert: {
          id?: string;
          name: string;
          fee_lkr?: number;
          partner?: "dad" | "pickme_flash" | "any";
        };
        Update: {
          id?: string;
          name?: string;
          fee_lkr?: number;
          partner?: "dad" | "pickme_flash" | "any";
        };
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_order_owner: {
        Args: { p_order_id: string };
        Returns: boolean;
      };
      generate_order_reference_code: {
        Args: { p_delivery_week_start: string };
        Returns: string;
      };
    };
  };
}
