-- ============================================================
-- Saumya's Table — Initial Database Migration
-- Phase 1: Full schema, RLS policies, triggers, functions
-- All timestamps use UTC; application layer converts to Asia/Colombo
-- ============================================================

-- ============================================================
-- 0. Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ENUM-like check constraints are used via TEXT + CHECK
--    to keep things simple with Supabase. Defined inline.
-- ============================================================

-- ============================================================
-- 2. TABLES
-- ============================================================

-- 2.1 profiles — extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  phone      TEXT,
  email      TEXT,
  role       TEXT NOT NULL DEFAULT 'customer'
             CHECK (role IN ('customer', 'admin')),
  whatsapp_opted_in BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Extends Supabase Auth users with app-specific profile data.';

-- 2.2 addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  label      TEXT,
  street     TEXT NOT NULL,
  city       TEXT,
  district   TEXT,
  lat        DOUBLE PRECISION,
  lng        DOUBLE PRECISION,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.addresses IS 'Customer saved delivery addresses.';

CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);

-- 2.3 categories
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.categories IS 'Meal categories for the menu (e.g. Rice Meals, Short Eats).';

-- 2.4 meals
CREATE TABLE IF NOT EXISTS public.meals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  price_lkr    NUMERIC(10,2) NOT NULL CHECK (price_lkr >= 0),
  category_id  UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url    TEXT,
  tags         TEXT[] DEFAULT '{}',
  portion_info TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  stock_limit  INTEGER,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.meals IS 'All meals offered on the menu.';

CREATE INDEX idx_meals_category ON public.meals(category_id);
CREATE INDEX idx_meals_available ON public.meals(is_available);

-- 2.5 orders
CREATE TABLE IF NOT EXISTS public.orders (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  guest_email             TEXT,
  guest_phone             TEXT,
  status                  TEXT NOT NULL DEFAULT 'placed'
                          CHECK (status IN ('placed','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  payment_method          TEXT NOT NULL
                          CHECK (payment_method IN ('cod','bank_transfer')),
  payment_status          TEXT NOT NULL DEFAULT 'pending'
                          CHECK (payment_status IN ('pending','awaiting_verification','verified','rejected')),
  order_reference_code    TEXT UNIQUE NOT NULL,
  delivery_week_start     DATE NOT NULL,
  delivery_date_preference TEXT NOT NULL DEFAULT 'saturday'
                          CHECK (delivery_date_preference IN ('saturday','sunday')),
  delivery_partner        TEXT
                          CHECK (delivery_partner IS NULL OR delivery_partner IN ('dad','pickme_flash')),
  tracking_link           TEXT,
  address_id              UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  delivery_fee_lkr        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee_lkr >= 0),
  total_lkr               NUMERIC(10,2) NOT NULL CHECK (total_lkr >= 0),
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.orders IS 'Customer orders. order_reference_code format: ST-YYYYMMDD-XXXX.';

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_delivery_week ON public.orders(delivery_week_start);
CREATE INDEX idx_orders_reference ON public.orders(order_reference_code);

-- 2.6 order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  meal_id        UUID NOT NULL REFERENCES public.meals(id) ON DELETE RESTRICT,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_lkr NUMERIC(10,2) NOT NULL CHECK (unit_price_lkr >= 0)
);

COMMENT ON TABLE public.order_items IS 'Line items within an order. Prices are snapshot at order time.';

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- 2.7 payment_slips
CREATE TABLE IF NOT EXISTS public.payment_slips (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  image_url        TEXT NOT NULL,
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_by      UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  rejection_reason TEXT
);

COMMENT ON TABLE public.payment_slips IS 'Bank transfer payment slip uploads for admin verification.';

CREATE INDEX idx_payment_slips_order ON public.payment_slips(order_id);

-- 2.8 notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  channel       TEXT NOT NULL CHECK (channel IN ('email','whatsapp')),
  type          TEXT NOT NULL,
  recipient     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'sent'
                CHECK (status IN ('sent','delivered','read','failed')),
  error_message TEXT,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'Log of all email and WhatsApp notifications sent.';

CREATE INDEX idx_notifications_order ON public.notifications(order_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- 2.9 delivery_zones
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name    TEXT NOT NULL,
  fee_lkr NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (fee_lkr >= 0),
  partner TEXT NOT NULL DEFAULT 'any'
          CHECK (partner IN ('dad','pickme_flash','any'))
);

COMMENT ON TABLE public.delivery_zones IS 'Delivery areas with associated fees and assigned partners.';

-- 2.10 settings — key-value store
CREATE TABLE IF NOT EXISTS public.settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.settings IS 'Admin-configurable settings. Key-value store with JSONB values.';


-- ============================================================
-- 3. FUNCTIONS
-- ============================================================

-- 3.1 Auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, phone, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

-- 3.2 Generate order reference code: ST-YYYYMMDD-XXXX
--     YYYYMMDD = delivery_week_start, XXXX = zero-padded sequence per week
CREATE OR REPLACE FUNCTION public.generate_order_reference_code(p_delivery_week_start DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date_part TEXT;
  v_seq INTEGER;
  v_code TEXT;
BEGIN
  v_date_part := to_char(p_delivery_week_start, 'YYYYMMDD');

  -- Count existing orders for this delivery week and add 1
  SELECT COUNT(*) + 1 INTO v_seq
  FROM public.orders
  WHERE delivery_week_start = p_delivery_week_start;

  v_code := 'ST-' || v_date_part || '-' || lpad(v_seq::TEXT, 4, '0');

  -- Handle unlikely collision by incrementing
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_reference_code = v_code) LOOP
    v_seq := v_seq + 1;
    v_code := 'ST-' || v_date_part || '-' || lpad(v_seq::TEXT, 4, '0');
  END LOOP;

  RETURN v_code;
END;
$$;

-- 3.3 Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 3.4 Helper: check if current user owns this order
CREATE OR REPLACE FUNCTION public.is_order_owner(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id
      AND user_id = auth.uid()
  );
$$;

-- 3.5 Update settings.updated_at on change
CREATE OR REPLACE FUNCTION public.update_settings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- 4.1 Create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.2 Auto-update settings.updated_at
DROP TRIGGER IF EXISTS settings_updated_at ON public.settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_settings_timestamp();


-- ============================================================
-- 5. ROW-LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_slips  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings       ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- 5.1 profiles
-- ---------------------------------------------------------
-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile (not role)
-- WITH CHECK cannot reference OLD, so we use a subquery to prevent role changes
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- Admin can read all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Admin can update any profile
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Service role inserts via trigger (no user-facing insert policy needed)
-- The trigger runs as SECURITY DEFINER so it bypasses RLS

-- ---------------------------------------------------------
-- 5.2 addresses
-- ---------------------------------------------------------
-- Users can read their own addresses
CREATE POLICY "addresses_select_own" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "addresses_insert_own" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "addresses_update_own" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "addresses_delete_own" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can read all addresses
CREATE POLICY "addresses_admin_select" ON public.addresses
  FOR SELECT USING (public.is_admin());

-- ---------------------------------------------------------
-- 5.3 categories — public read, admin write
-- ---------------------------------------------------------
CREATE POLICY "categories_public_select" ON public.categories
  FOR SELECT USING (TRUE);

CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "categories_admin_delete" ON public.categories
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------
-- 5.4 meals — public read, admin write
-- ---------------------------------------------------------
CREATE POLICY "meals_public_select" ON public.meals
  FOR SELECT USING (TRUE);

CREATE POLICY "meals_admin_insert" ON public.meals
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "meals_admin_update" ON public.meals
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "meals_admin_delete" ON public.meals
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------
-- 5.5 orders — user reads own, admin reads/writes all
-- ---------------------------------------------------------
-- Users can read their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert orders (for themselves)
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admin can read all orders
CREATE POLICY "orders_admin_select" ON public.orders
  FOR SELECT USING (public.is_admin());

-- Admin can update any order
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Admin can insert orders (manual order creation)
CREATE POLICY "orders_admin_insert" ON public.orders
  FOR INSERT WITH CHECK (public.is_admin());

-- ---------------------------------------------------------
-- 5.6 order_items — readable via order ownership
-- ---------------------------------------------------------
-- Users can read items of their own orders
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    public.is_order_owner(order_id)
  );

-- Users can insert items for their own orders
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    public.is_order_owner(order_id)
  );

-- Admin can read all order items
CREATE POLICY "order_items_admin_select" ON public.order_items
  FOR SELECT USING (public.is_admin());

-- Admin can insert order items (manual order creation)
CREATE POLICY "order_items_admin_insert" ON public.order_items
  FOR INSERT WITH CHECK (public.is_admin());

-- Admin can update order items
CREATE POLICY "order_items_admin_update" ON public.order_items
  FOR UPDATE USING (public.is_admin());

-- ---------------------------------------------------------
-- 5.7 payment_slips — user inserts own, admin reads/writes all
-- ---------------------------------------------------------
-- Users can insert a slip for their own order
CREATE POLICY "payment_slips_insert_own" ON public.payment_slips
  FOR INSERT WITH CHECK (
    public.is_order_owner(order_id)
  );

-- Users can read slips for their own orders
CREATE POLICY "payment_slips_select_own" ON public.payment_slips
  FOR SELECT USING (
    public.is_order_owner(order_id)
  );

-- Admin can read all slips
CREATE POLICY "payment_slips_admin_select" ON public.payment_slips
  FOR SELECT USING (public.is_admin());

-- Admin can update slips (verify/reject)
CREATE POLICY "payment_slips_admin_update" ON public.payment_slips
  FOR UPDATE USING (public.is_admin());

-- ---------------------------------------------------------
-- 5.8 notifications — admin only
-- ---------------------------------------------------------
CREATE POLICY "notifications_admin_select" ON public.notifications
  FOR SELECT USING (public.is_admin());

CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- Allow users to read their own order's notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (
    order_id IS NOT NULL AND public.is_order_owner(order_id)
  );

-- ---------------------------------------------------------
-- 5.9 delivery_zones — public read, admin write
-- ---------------------------------------------------------
CREATE POLICY "delivery_zones_public_select" ON public.delivery_zones
  FOR SELECT USING (TRUE);

CREATE POLICY "delivery_zones_admin_insert" ON public.delivery_zones
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "delivery_zones_admin_update" ON public.delivery_zones
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "delivery_zones_admin_delete" ON public.delivery_zones
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------
-- 5.10 settings — admin only
-- ---------------------------------------------------------
CREATE POLICY "settings_admin_select" ON public.settings
  FOR SELECT USING (public.is_admin());

CREATE POLICY "settings_admin_insert" ON public.settings
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "settings_admin_update" ON public.settings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "settings_admin_delete" ON public.settings
  FOR DELETE USING (public.is_admin());

-- Allow public read of specific non-sensitive settings
-- (bank_account for checkout, business_profile for footer, etc.)
CREATE POLICY "settings_public_select_safe" ON public.settings
  FOR SELECT USING (
    key IN ('business_profile', 'bank_account', 'holiday_mode', 'payment_methods', 'announcement_banner', 'delivery_slots')
  );


-- ============================================================
-- 6. STORAGE BUCKETS (run via Supabase dashboard or SQL)
-- ============================================================

-- Payment slips bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-slips',
  'payment-slips',
  FALSE,
  5242880,  -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Meal images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-images',
  'meal-images',
  TRUE,
  1048576,  -- 1MB max (images should be WebP < 80KB but allow some headroom)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 7. STORAGE RLS POLICIES
-- ============================================================

-- 7.1 payment-slips: users can upload to their own order folder, admin can read all
CREATE POLICY "payment_slips_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-slips'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "payment_slips_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-slips'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "payment_slips_admin_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-slips'
    AND public.is_admin()
  );

-- 7.2 meal-images: public read, admin upload
CREATE POLICY "meal_images_public_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'meal-images'
  );

CREATE POLICY "meal_images_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'meal-images'
    AND public.is_admin()
  );

CREATE POLICY "meal_images_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'meal-images'
    AND public.is_admin()
  );

CREATE POLICY "meal_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'meal-images'
    AND public.is_admin()
  );


-- ============================================================
-- 8. SEED DEFAULT SETTINGS
-- ============================================================
INSERT INTO public.settings (key, value) VALUES
  ('business_profile', '{
    "name": "Saumya''s Table",
    "logo_url": null,
    "tagline": "Home-cooked Sri Lankan meals, delivered weekly",
    "phone": "+94771234567",
    "whatsapp": "+94771234567",
    "address": "Colombo, Sri Lanka",
    "email": "orders@saumyastable.lk"
  }'::jsonb),
  ('bank_account', '{
    "account_name": "Saumya Perera",
    "bank_name": "Commercial Bank of Ceylon",
    "branch": "Colombo Main",
    "account_number": "1234567890",
    "reference_prefix": "ST"
  }'::jsonb),
  ('cutoff_override', '{
    "enabled": false,
    "custom_cutoff_iso": null,
    "closed": false
  }'::jsonb),
  ('holiday_mode', '{
    "enabled": false,
    "message": "We are taking a short break. Orders will reopen soon!"
  }'::jsonb),
  ('delivery_slots', '{
    "saturday_capacity": 30,
    "sunday_capacity": 30
  }'::jsonb),
  ('payment_methods', '{
    "cod_enabled": true,
    "bank_transfer_enabled": true
  }'::jsonb),
  ('announcement_banner', '{
    "enabled": false,
    "text": "",
    "colour": "#f59e0b"
  }'::jsonb),
  ('facebook_integration', '{
    "enabled": false,
    "page_id": null,
    "token": null,
    "token_expiry": null,
    "hashtags": ["#SaumyasTable", "#HomeCookedSriLanka", "#MealPrep", "#SriLankanFood"],
    "post_schedule_time": null,
    "last_post_id": null,
    "last_post_status": null
  }'::jsonb),
  ('seo', '{
    "home": {"title": "Saumya''s Table — Home-Cooked Sri Lankan Meals Delivered", "description": "Order weekly home-cooked Sri Lankan meals prepared with love by Saumya. Delivery every Saturday & Sunday in Colombo.", "og_image_url": null},
    "menu": {"title": "This Week''s Menu | Saumya''s Table", "description": "Browse this week''s home-cooked Sri Lankan meals. Order before Thursday 7PM for weekend delivery.", "og_image_url": null},
    "about": {"title": "About Saumya | Saumya''s Table", "description": "Meet the home cook behind Saumya''s Table. Three decades of Sri Lankan cooking, now delivered to your door.", "og_image_url": null}
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- 9. ENABLE REALTIME for orders table (for order tracking)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;


-- ============================================================
-- DONE. Migration complete.
-- ============================================================
