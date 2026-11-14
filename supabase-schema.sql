-- ==============================================================================
-- BAGGETTE SHOP 🎀 SUPABASE DATABASE SCHEMA (V2 - FULL PERMISSIVE & ROBUST)
-- Tables: products, profiles, orders, wishlists
-- Includes: Triggers for automatic user profile creation & permissive RLS policies
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PRODUCTS Table
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

-- Drop previous restrictive policies if they exist
DROP POLICY IF EXISTS "Products are publicly viewable" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Admin write products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.products;

-- Allow public read access
CREATE POLICY "Enable read access for all users" 
  ON public.products FOR SELECT 
  USING (true);

-- Allow inserting, updating, and deleting products (Permissive for store management)
CREATE POLICY "Enable all access for all users" 
  ON public.products FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 3. Create PROFILES Table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles readable" ON public.profiles;
DROP POLICY IF EXISTS "Profiles self update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles permit all select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles permit all insert" ON public.profiles;
DROP POLICY IF EXISTS "Profiles permit all update" ON public.profiles;

CREATE POLICY "Profiles permit all select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles permit all insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles permit all update" ON public.profiles FOR UPDATE USING (true);

-- Automatic Trigger Function: Create Profile on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email LIKE '%admin%' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create ORDERS Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- Allow text so both UUID and guest ids are accepted without type mismatch
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

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
DROP POLICY IF EXISTS "Admins can view and update all orders" ON public.orders;
DROP POLICY IF EXISTS "Orders read write" ON public.orders;
DROP POLICY IF EXISTS "Orders permit all select" ON public.orders;
DROP POLICY IF EXISTS "Orders permit all insert" ON public.orders;
DROP POLICY IF EXISTS "Orders permit all update" ON public.orders;

CREATE POLICY "Orders permit all select" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders permit all insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders permit all update" ON public.orders FOR UPDATE USING (true);

-- 5. Create WISHLISTS Table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Wishlists permit all" ON public.wishlists;
CREATE POLICY "Wishlists permit all" ON public.wishlists FOR ALL USING (true) WITH CHECK (true);

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
),
(
  'bag-3',
  'The Ludlow Ballet Puffer Cloud Shoulder',
  'ludlow-ballet-puffer',
  295.00,
  NULL,
  'Totes & Shoulders',
  'Ultra-lightweight cloud quilted nylon bag with ruched scrunchie shoulder strap and mini grosgrain side ties. Perfect for carrying daily treasures.',
  '["Cloud pillowed quilting with hypoallergenic micro-fill", "Comfortable ruched ruffle shoulder strap", "Dual side drawstring bows for adjustable cinching"]'::jsonb,
  'Recycled technical memory nylon, poly fill, metal hardware',
  '13.0" W x 8.0" H x 4.0" D',
  'Machine wash cold on gentle cycle in mesh laundry bag. Air dry completely.',
  '[{"name": "Powder Rose", "hex": "#F4C8D0", "inStock": true}, {"name": "Midnight Onyx", "hex": "#1C1B1B", "inStock": true}]'::jsonb,
  '["https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
  '["STAFF SWEETHEART"]'::jsonb,
  19,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  stock_quantity = EXCLUDED.stock_quantity;
