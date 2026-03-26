-- ============================================================
-- Saumya's Table — Seed Data
-- 3 sample categories, 8 sample meals, 2 delivery zones
-- Admin user must be created via Supabase Auth first, then
-- manually promoted by running the UPDATE at the bottom.
-- ============================================================

-- Categories
INSERT INTO public.categories (id, name, sort_order) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Rice Meals', 1),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Short Eats', 2),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Desserts & Sweets', 3)
ON CONFLICT (id) DO NOTHING;

-- Meals
INSERT INTO public.meals (id, name, slug, description, price_lkr, category_id, image_url, tags, portion_info, is_available, stock_limit, sort_order) VALUES
  (
    'b1b2c3d4-0001-4000-8000-000000000001',
    'Chicken Fried Rice Pack',
    'chicken-fried-rice-pack',
    'Aromatic fried rice with tender chicken pieces, mixed vegetables, and Saumya''s special soy sauce blend. A hearty meal that reminds you of home.',
    850.00,
    'a1b2c3d4-0001-4000-8000-000000000001',
    NULL,
    ARRAY['high-protein'],
    'Serves 1, ~500g',
    TRUE,
    25,
    1
  ),
  (
    'b1b2c3d4-0002-4000-8000-000000000002',
    'Vegetable Biriyani',
    'vegetable-biriyani',
    'Fragrant basmati rice layered with seasonal vegetables, cashews, and a blend of Sri Lankan spices. Slow-cooked to perfection.',
    700.00,
    'a1b2c3d4-0001-4000-8000-000000000001',
    NULL,
    ARRAY['vegetarian', 'vegan'],
    'Serves 1, ~450g',
    TRUE,
    20,
    2
  ),
  (
    'b1b2c3d4-0003-4000-8000-000000000003',
    'Lamprais (Lump Rice)',
    'lamprais',
    'The classic Sri Lankan Dutch Burgher dish — rice cooked in stock, paired with frikkadels, ash plantain curry, brinjal pahi, and seeni sambol. Wrapped in banana leaf.',
    1250.00,
    'a1b2c3d4-0001-4000-8000-000000000001',
    NULL,
    ARRAY['signature'],
    'Serves 1, ~600g',
    TRUE,
    15,
    3
  ),
  (
    'b1b2c3d4-0004-4000-8000-000000000004',
    'Fish Ambulthiyal Rice Box',
    'fish-ambulthiyal-rice-box',
    'Tangy, spicy tuna ambulthiyal (sour fish curry) with steamed rice, dhal curry, coconut sambol, and papadam.',
    950.00,
    'a1b2c3d4-0001-4000-8000-000000000001',
    NULL,
    ARRAY['spicy', 'high-protein'],
    'Serves 1, ~500g',
    TRUE,
    20,
    4
  ),
  (
    'b1b2c3d4-0005-4000-8000-000000000005',
    'Vegetable Cutlets (6 pcs)',
    'vegetable-cutlets',
    'Golden, crispy cutlets filled with spiced vegetables. A beloved Sri Lankan snack, perfect for tea time or as a side.',
    450.00,
    'a1b2c3d4-0002-4000-8000-000000000002',
    NULL,
    ARRAY['vegetarian', 'snack'],
    '6 pieces',
    TRUE,
    30,
    1
  ),
  (
    'b1b2c3d4-0006-4000-8000-000000000006',
    'Fish Patties (4 pcs)',
    'fish-patties',
    'Flaky pastry filled with a spiced fish and onion filling. Baked to golden perfection.',
    500.00,
    'a1b2c3d4-0002-4000-8000-000000000002',
    NULL,
    ARRAY['snack'],
    '4 pieces',
    TRUE,
    25,
    2
  ),
  (
    'b1b2c3d4-0007-4000-8000-000000000007',
    'Watalappan',
    'watalappan',
    'Traditional Sri Lankan coconut custard pudding made with jaggery, cardamom, and cashew nuts. A Malay-Sri Lankan heritage dessert.',
    400.00,
    'a1b2c3d4-0003-4000-8000-000000000003',
    NULL,
    ARRAY['vegetarian', 'gluten-free'],
    'Serves 1, ~200g',
    TRUE,
    15,
    1
  ),
  (
    'b1b2c3d4-0008-4000-8000-000000000008',
    'Kokis (8 pcs)',
    'kokis',
    'Crispy, rosette-shaped oil cakes made from rice flour and coconut milk. A festive Sri Lankan treat.',
    350.00,
    'a1b2c3d4-0003-4000-8000-000000000003',
    NULL,
    ARRAY['vegetarian', 'gluten-free', 'snack'],
    '8 pieces',
    TRUE,
    20,
    2
  )
ON CONFLICT (id) DO NOTHING;

-- Delivery Zones
INSERT INTO public.delivery_zones (id, name, fee_lkr, partner) VALUES
  ('c1b2c3d4-0001-4000-8000-000000000001', 'Colombo (within city limits)', 200.00, 'dad'),
  ('c1b2c3d4-0002-4000-8000-000000000002', 'Suburbs (Nugegoda, Dehiwala, Mt. Lavinia)', 350.00, 'any')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- PROMOTE A USER TO ADMIN
-- After creating an account via the app's signup flow, run:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE email = 'your-admin-email@example.com';
--
-- Replace with the actual admin email address.
-- ============================================================
