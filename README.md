# BAGGETTE SHOP 🎀
### *A delicate downtown bag store modelled after sandyliang.info*

Built with **Vite**, **React 18**, **TypeScript**, and **Tailwind CSS**, linked to a **Supabase database** with customer authentication, shopping bag drawer, and a full-featured admin management dashboard.

---

## 🌸 Aesthetics & Features (Sandy Liang Inspired)

- **Downtown LES Editorial Aesthetic**: Playfair Display serif typography paired with Courier Prime monospace tags, subtle cream backgrounds, ballet ribbons (`🎀`), and nostalgic Lower East Side street photography.
- **SS26 Bag Archive**: Curated silhouettes including the *Bacio Satin Baggette with Oversized Bow*, *Orchard Pleated Baggette*, *Ludlow Ballet Puffer Cloud*, *Pierrot Silk Satin Pouch*, and *Chinatown Gingham Utility Tote*.
- **Interactive Product Experience**:
  - Image cross-fade on card hover to reveal styling / editorial angle
  - Colorway swatches with real-time selection
  - Accordion details (*Dimensions & Fit*, *Materials & Origin*, *Signature Pink Bow Dustbag packaging*)
  - Quick Add to Bag & Sweetheart Wishlist
- **Sliding Cart Drawer**:
  - Real-time free messenger delivery threshold bar ($250+)
  - Promo code support (e.g. `SANDY10` for 10% off, `SWEETHEART20` for 20% off)
  - Color swatch indicators, quantity steppers, and price calculations
- **Checkout & Confetti Experience**:
  - Full checkout simulation with shipping address & card simulation
  - Automatic inventory stock decrementing
  - Celebration confetti burst via `canvas-confetti`
- **Customer Account Portal**:
  - Profile status
  - Recent orders with a 4-step delivery progress tracker (*Placed -> Pink Dustbag -> Dispatched -> Stoop Delivery*)
  - Saved Sweethearts Wishlist with 1-click add to cart
- **Admin Dashboard**:
  - **Metrics Overview**: Gross revenue, order volume, active bag models, and out-of-stock alerts
  - **Product Catalog Management**: Add new baguettes, edit existing models, upload image URLs, adjust tags and colorways, delete products, and inline (+ / -) inventory stock steppers
  - **Orders & Fulfillment Management**: Live order list with status updates (*Pending*, *Processing*, *Shipped*, *Delivered*, *Cancelled*)
  - **Supabase Database Inspector**: Direct database connection health indicator, step-by-step setup guide, and 1-click SQL copy button

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Open your browser at the URL shown (e.g. `http://localhost:5173`).

### 2. Build for Production
```bash
npm run build
```
Creates an optimized static bundle in `dist/`.

---

## 🗄️ Supabase Database Integration

The application contains a dual-layer data architecture:
1. **Out-of-the-Box Demo Mode**: If no Supabase credentials are provided, the app uses a reactive local storage persistence layer with sample bags, orders, and 1-click demo logins (*Admin Director* or *Shopper*).
2. **Real Supabase Integration**: When `.env` is configured with your Supabase credentials, the app connects directly to PostgreSQL tables with Row Level Security (RLS).

### Setting up Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase project dashboard.
3. Open [`supabase-schema.sql`](file:///Users/leslie/Downloads/Baggette%20Shop/supabase-schema.sql) in this repository, copy its contents, and run it. This creates:
   - `profiles` table (linked to `auth.users`)
   - `products` table (catalog, prices, tags, colors, inventory)
   - `orders` table (customer info, line items, status, tracking)
   - `wishlists` table (user-saved bags)
   - Row Level Security (RLS) policies
   - Seed data with initial SS26 bag silhouettes
4. Update your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. Restart `npm run dev` to enjoy real-time PostgreSQL synchronization!

---

## 🎀 Quick Test Logins
Click the **Sign In** button in the header to view 1-click instant login shortcuts:
- **Admin Director**: `admin@baggetteshop.info` (Grants full access to the Admin Dashboard)
- **Customer Shopper**: `leslie.shopper@nyc.org` (Shows past orders & saved wishlist items)

*(Any account email containing `"admin"` automatically receives admin privileges).*
