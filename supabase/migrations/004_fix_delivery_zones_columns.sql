-- Migration: Fix delivery_zones table columns to match app code
-- Rename fee_lkr -> delivery_fee_lkr, add is_active, remove partner

-- Add missing is_active column
ALTER TABLE public.delivery_zones 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Rename fee_lkr to delivery_fee_lkr if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'delivery_zones' AND column_name = 'fee_lkr') THEN
    ALTER TABLE public.delivery_zones RENAME COLUMN fee_lkr TO delivery_fee_lkr;
  END IF;
END $$;

-- Ensure delivery_fee_lkr exists (in case fee_lkr didn't exist)
ALTER TABLE public.delivery_zones 
ADD COLUMN IF NOT EXISTS delivery_fee_lkr NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee_lkr >= 0);

-- Remove partner column if exists (not used in app)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'delivery_zones' AND column_name = 'partner') THEN
    ALTER TABLE public.delivery_zones DROP COLUMN partner;
  END IF;
END $$;

-- Update comment
COMMENT ON TABLE public.delivery_zones IS 'Delivery areas with associated fees. Columns: id, name, delivery_fee_lkr, is_active.';
