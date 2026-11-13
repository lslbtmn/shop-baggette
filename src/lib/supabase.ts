import { createClient } from '@supabase/supabase-js';
import { Product, Order, UserProfile } from '../types';
import { INITIAL_PRODUCTS, SAMPLE_ORDERS } from './mockData';

// Retrieve Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes('placeholder')
  );
};

// Create client or fallback dummy client to avoid crashes
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-baggette.supabase.co', 'dummy-key-for-local-preview');

// --- LOCAL PERSISTENCE LAYER (FALLBACK & SEED STORE) ---
const PRODUCTS_STORAGE_KEY = 'baggette_products_v1';
const ORDERS_STORAGE_KEY = 'baggette_orders_v1';
const WISHLIST_STORAGE_KEY = 'baggette_wishlist_v1';
const USERS_STORAGE_KEY = 'baggette_users_v1';

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading products from local storage:', e);
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products:', e);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
      return SAMPLE_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading orders from local storage:', e);
    return SAMPLE_ORDERS;
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders:', e);
  }
};

// --- DATABASE SERVICE API (HYBRID: SUPABASE IF CONFIGURED, ELSE REACTIVE LOCALSTORE) ---

export const dbService = {
  // Fetch Products
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Product[];
        }
        if (error) {
          console.warn('Supabase fetch products error, using cached:', error.message);
        }
      } catch (err) {
        console.warn('Supabase network error, fallback to local store:', err);
      }
    }
    return getStoredProducts();
  },

  // Save / Upsert Product
  async upsertProduct(product: Product): Promise<{ success: boolean; product: Product }> {
    const localProducts = getStoredProducts();
    const existingIndex = localProducts.findIndex((p) => p.id === product.id);
    let updatedList: Product[];

    if (existingIndex >= 0) {
      updatedList = [...localProducts];
      updatedList[existingIndex] = product;
    } else {
      updatedList = [product, ...localProducts];
    }
    saveStoredProducts(updatedList);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('products').upsert(product);
        if (error) console.error('Supabase upsert product error:', error);
      } catch (e) {
        console.error('Failed to sync product to Supabase:', e);
      }
    }

    return { success: true, product };
  },

  // Delete Product
  async deleteProduct(productId: string): Promise<boolean> {
    const localProducts = getStoredProducts().filter((p) => p.id !== productId);
    saveStoredProducts(localProducts);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (e) {
        console.error('Supabase delete error:', e);
      }
    }
    return true;
  },

  // Fetch Orders
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Order[];
        }
      } catch (e) {
        console.warn('Supabase orders fetch error, fallback to local store:', e);
      }
    }
    return getStoredOrders();
  },

  // Create Order
  async createOrder(order: Order): Promise<Order> {
    const currentOrders = getStoredOrders();
    const updated = [order, ...currentOrders];
    saveStoredOrders(updated);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('orders').insert([order]);
        if (error) console.error('Supabase create order error:', error);
      } catch (e) {
        console.error('Supabase create order exception:', e);
      }
    }

    // Decrement stock in products
    const currentProducts = getStoredProducts().map((p) => {
      const orderItem = order.items.find((item) => item.product_id === p.id);
      if (orderItem) {
        return {
          ...p,
          stock_quantity: Math.max(0, p.stock_quantity - orderItem.quantity),
        };
      }
      return p;
    });
    saveStoredProducts(currentProducts);

    return order;
  },

  // Update Order Status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    const currentOrders = getStoredOrders().map((o) => (o.id === orderId ? { ...o, status } : o));
    saveStoredOrders(currentOrders);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').update({ status }).eq('id', orderId);
      } catch (e) {
        console.error('Supabase update status error:', e);
      }
    }
    return true;
  },

  // Reset to initial seed
  resetCatalog() {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    return INITIAL_PRODUCTS;
  }
};
