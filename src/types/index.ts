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
  price: number;
  compare_at_price?: number;
  category: ProductCategory;
  description: string;
  details: string[];
  materials: string;
  dimensions: string;
  care: string;
  colors: ProductColor[];
  images: string[]; // [primary, hover/editorial, angle1, angle2...]
  tags: string[]; // e.g. "NEW ARRIVAL", "SOLD OUT", "PRE-ORDER", "STAFF SWEETHEART"
  stock_quantity: number;
  is_featured?: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: ProductColor;
  quantity: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
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
  shipping_address: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
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
