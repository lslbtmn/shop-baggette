-- ==============================================================================
-- BAGGETTE SHOP 🎀 SUPABASE DATABASE SCHEMA
-- Inspired by sandyliang.info
-- Tables: profiles, products, orders, order_items, wishlists
-- Row Level Security (RLS) included
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES Table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2),
  category TEXT NOT NULL,
  description TEXT,
  details JSONB DEFAULT '[]'::jsonb,
  materials TEXT,
  dimensions TEXT,
  care TEXT,
  colors JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  stock_quantity INTEGER DEFAULT 10,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can read products
CREATE POLICY "Products are publicly viewable" 
  ON public.products FOR SELECT USING (true);

-- Only authenticated admins can insert/update/delete products
CREATE POLICY "Admins can insert products" 
  ON public.products FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products" 
  ON public.products FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products" 
  ON public.products FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Create ORDERS Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping NUMERIC(10, 2) DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Anyone can create an order" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view and update all orders" 
  ON public.orders FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5. Create WISHLISTS Table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wishlist" 
  ON public.wishlists FOR ALL 
  USING (auth.uid() = user_id);

-- 6. Seed Initial Sandy Liang Style Baggettes
INSERT INTO public.products (id, name, slug, price, compare_at_price, category, description, details, materials, dimensions, care, colors, images, tags, stock_quantity, is_featured)
VALUES 
(
  'bag-1',
  'The Bacio Satin Baggette with Oversized Bow',
  'bacio-satin-baggette',
  345.00,
  385.00,
  'Ribbon & Bow Editions',
  'Our signature downtown baggette crafted in heavyweight lustrous Italian duchess satin. Finished with an exaggerated double-drape bow, dainty silver logo coin, and magnetic flap closure.',
  '["Delicate hand-tied double bow detail with soft draped tails", "Lined in signature ballet-pink grosgrain", "Concealed magnetic snap flap closure", "Engraved silver-tone Baggette heart charm at zipper"]'::jsonb,
  '100% Italian Duchess Satin with Cotton Grosgrain lining; Custom silver palladium hardware',
  '10.5" W x 5.25" H x 2.75" D',
  'Spot clean delicately with damp cotton cloth. Store in provided dustbag with bow laid flat.',
  '[{"name": "Noir Black", "hex": "#111111", "inStock": true}, {"name": "Ballet Slippers Pink", "hex": "#FAD8DD", "inStock": true}, {"name": "Cherry Red", "hex": "#A81C2E", "inStock": true}]'::jsonb,
  '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
  '["BESTSELLER", "RIBBON EDITION"]'::jsonb,
  14,
  true
),
(
  'bag-2',
  'The Orchard Pleated Leather Baggette',
  'orchard-pleated-baggette',
  460.00,
  NULL,
  'Baggettes',
  'Sculptural knife-pleated calf leather baggette inspired by downtown Chinatown bakeries and vintage 90s shoulder silhouettes. Features chunky polished nickel grommets and a vintage key keepsake.',
  '["Accordion knife-pleated sides for expandable capacity", "Removable metal antique key charm", "Top zip with extended pull tab"]'::jsonb,
  '100% Supple full-grain nappa leather; nickel-free silver hardware',
  '11.0" W x 4.75" H x 3.0" D',
  'Condition periodically with leather balm.',
  '[{"name": "Espresso Bean", "hex": "#2A1D1A", "inStock": true}, {"name": "Butter Pecan", "hex": "#F0DEC3", "inStock": true}]'::jsonb,
  '["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
  '["NEW ARRIVAL"]'::jsonb,
  8,
  true
)
ON CONFLICT (id) DO NOTHING;
