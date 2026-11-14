export interface ProductColor {
  name: string;
  hex: string;
  inStock: boolean;
}

export type ProductCategory = 
  | 'All'
  | 'Baggettes'
  | 'Minis & Pouches'
  | 'Totes & Shoulders'
  | 'Ribbon & Bow Editions';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number; // in USD or GH₵ equivalent
  compare_at_price?: number;
  category: ProductCategory;
  description: string;
  details: string[];
  materials: string;
  dimensions: string;
  care: string;
  colors: ProductColor[];
  images: string[];
  tags: string[];
  stock_quantity: number;
  is_featured?: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: ProductColor;
  quantity: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string; // Region (e.g. Greater Accra, Ashanti)
  zip: string; // Ghana Post GPS (e.g. GA-183-9021) or postal code
  country: string; // Defaults to Ghana
  phone?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
  shipping_address?: ShippingAddress;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  color_name: string;
  image: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_email: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  tracking_number?: string;
  created_at: string;
}

export interface LookbookItem {
  id: string;
  title: string;
  image: string;
  season: string;
  location: string;
  featuredProductId: string;
  quote: string;
}

export interface HeroConfig {
  badgeText: string;
  title: string;
  subtitle: string;
  fig1ProductId: string;
  fig1Caption: string;
  fig2ProductId: string;
  fig2Caption: string;
  note1: string;
  note2: string;
  note3: string;
}
