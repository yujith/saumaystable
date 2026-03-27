-- Migration: Add bank_reference to orders table
-- Allows customers to provide their bank transfer reference at checkout

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS bank_reference TEXT;

COMMENT ON COLUMN public.orders.bank_reference IS 'Optional bank transfer reference/transaction ID provided by customer at checkout';
