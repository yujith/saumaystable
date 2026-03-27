-- Migration: Shorten order reference code with customer name
-- Format: FIRSTNAME-## (e.g., SAUMYA-01, YUJITH-02)
-- Falls back to ST-## for guest orders

-- Drop the old function
DROP FUNCTION IF EXISTS public.generate_order_reference_code(DATE);

-- Create new function with user name parameter
CREATE OR REPLACE FUNCTION public.generate_order_reference_code(
  p_delivery_week_start DATE,
  p_user_name TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name_part TEXT;
  v_seq INTEGER;
  v_code TEXT;
BEGIN
  -- Extract first name (first word), uppercase, max 8 chars, alphanumeric only
  IF p_user_name IS NOT NULL AND p_user_name <> '' THEN
    v_name_part := split_part(p_user_name, ' ', 1); -- Get first word
    v_name_part := upper(regexp_replace(v_name_part, '[^a-zA-Z]', '', 'g')); -- Remove non-letters, uppercase
    v_name_part := left(v_name_part, 8); -- Max 8 chars
  ELSE
    v_name_part := 'ST'; -- Fallback for guests
  END IF;

  -- Ensure we have something
  IF v_name_part = '' THEN
    v_name_part := 'GUEST';
  END IF;

  -- Get count of orders with this name prefix this week + 1
  SELECT COUNT(*) + 1 INTO v_seq
  FROM public.orders
  WHERE delivery_week_start = p_delivery_week_start
    AND order_reference_code LIKE v_name_part || '-%';

  -- Format: NAME-## (2 digits max 99)
  v_code := v_name_part || '-' || lpad(least(v_seq, 99)::TEXT, 2, '0');

  -- Handle collision (unlikely but possible)
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_reference_code = v_code) LOOP
    v_seq := v_seq + 1;
    v_code := v_name_part || '-' || lpad(least(v_seq, 99)::TEXT, 2, '0');
    -- Safety: if we exceed 99, append random letter
    IF v_seq > 99 THEN
      v_code := v_name_part || '-' || chr(65 + (v_seq % 26)) || chr(65 + ((v_seq + 3) % 26));
    END IF;
  END LOOP;

  RETURN v_code;
END;
$$;

-- Update the comment
COMMENT ON TABLE public.orders IS 'Customer orders. order_reference_code format: FIRSTNAME-## (e.g., SAUMYA-01).';
