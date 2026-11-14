import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, UserProfile, HeroConfig } from '../types';
import { INITIAL_PRODUCTS, SAMPLE_ORDERS, DEFAULT_HERO_CONFIG } from './mockData';

// Config storage keys
const SUPABASE_URL_KEY = 'baggette_supabase_url_custom';
const SUPABASE_KEY_KEY = 'baggette_supabase_key_custom';
const HERO_CONFIG_KEY = 'baggette_hero_config_v1';

export const getSupabaseCredentials = () => {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_URL_KEY) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_KEY_KEY) : null;

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = (customUrl && customUrl.trim()) || envUrl.trim();
  const key = (customKey && customKey.trim()) || envKey.trim();

  return { url, key };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return (
    typeof url === 'string' &&
    url.length > 0 &&
    !url.includes('placeholder') &&
    !url.includes('your-project') &&
    typeof key === 'string' &&
    key.length > 0 &&
    !key.includes('placeholder')
  );
};

// Singleton Client Management
let currentClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (currentClient) return currentClient;

  const { url, key } = getSupabaseCredentials();
  if (isSupabaseConfigured()) {
    currentClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } else {
    currentClient = createClient('https://mock-baggette.supabase.co', 'dummy-key-for-local-preview');
  }
  return currentClient;
};

export const setSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
  }
  currentClient = null;
  return getSupabaseClient();
};

export const resetSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_KEY_KEY);
  }
  currentClient = null;
  return getSupabaseClient();
};

export const supabase = getSupabaseClient();

// --- LOCAL PERSISTENCE LAYER ---
const PRODUCTS_STORAGE_KEY = 'baggette_products_v1';
const ORDERS_STORAGE_KEY = 'baggette_orders_v1';

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

export const getStoredHeroConfig = (): HeroConfig => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(HERO_CONFIG_KEY) : null;
    return raw ? JSON.parse(raw) : DEFAULT_HERO_CONFIG;
  } catch {
    return DEFAULT_HERO_CONFIG;
  }
};

export const saveStoredHeroConfig = (config: HeroConfig) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HERO_CONFIG_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.error('Error saving hero config:', e);
  }
};

// --- DATABASE SERVICE API ---

export const dbService = {
  // Fetch Products
  async getProducts(): Promise<Product[]> {
    const client = getSupabaseClient();
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await client
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          saveStoredProducts(data as Product[]);
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
  async upsertProduct(product: Product): Promise<{ success: boolean; product: Product; error?: string; inDatabase?: boolean }> {
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

    const client = getSupabaseClient();
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await client.from('products').upsert(product).select();
        if (error) {
          console.error('Supabase upsert product error:', error);
          return {
            success: false,
            product,
            error: error.message || 'Supabase write error',
            inDatabase: false,
          };
        }
        return { success: true, product, inDatabase: true };
      } catch (e: any) {
        console.error('Failed to sync product to Supabase:', e);
        return {
          success: false,
          product,
          error: e.message || 'Network exception syncing to Supabase',
          inDatabase: false,
        };
      }
    }

    return { success: true, product, inDatabase: false };
  },

  // Delete Product
  async deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    const localProducts = getStoredProducts().filter((p) => p.id !== productId);
    saveStoredProducts(localProducts);

    const client = getSupabaseClient();
    if (isSupabaseConfigured()) {
      try {
        const { error } = await client.from('products').delete().eq('id', productId);
        if (error) {
          console.error('Supabase delete error:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (e: any) {
        console.error('Supabase delete error:', e);
        return { success: false, error: e.message };
      }
    }
    return { success: true };
  },

  // Fetch Orders
  async getOrders(): Promise<Order[]> {
    const client = getSupabaseClient();
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await client
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          saveStoredOrders(data as Order[]);
          return data as Order[];
        }
      } catch (e) {
        console.warn('Supabase orders fetch error, fallback to local store:', e);
      }
    }
    return getStoredOrders();
  },

  // Create Order
  async createOrder(order: Order): Promise<{ success: boolean; order: Order; error?: string }> {
    const currentOrders = getStoredOrders();
    const updated = [order, ...currentOrders];
    saveStoredOrders(updated);

    const client = getSupabaseClient();
    if (isSupabaseConfigured()) {
      try {
        const isUUID = order.user_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.user_id);
        const orderPayload = {
          ...order,
          user_id: isUUID ? order.user_id : null,
        };

        const { error } = await client.from('orders').insert([orderPayload]);
        if (error) {
          console.error('Supabase create order error:', error);
          return { success: false, order, error: error.message };
        }
      } catch (e: any) {
        console.error('Supabase create order exception:', e);
        return { success: false, order, error: e.message };
      }
    }

    // Decrement stock in products
    const currentProducts = getStoredProducts().map((p) => {
      const orderItem = order.items.find((item) => item.product_id === p.id);
      if (orderItem) {
        const newStock = Math.max(0, p.stock_quantity - orderItem.quantity);
        if (isSupabaseConfigured()) {
          client.from('products').update({ stock_quantity: newStock }).eq('id', p.id).then();
        }
        return {
          ...p,
          stock_quantity: newStock,
        };
      }
      return p;
    });
    saveStoredProducts(currentProducts);

    return { success: true, order };
  },

  // Update Order Status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error?: string }> {
    const currentOrders = getStoredOrders().map((o) => (o.id === orderId ? { ...o, status } : o));
    saveStoredOrders(currentOrders);

    const client = getSupabaseClient();
    if (isSupabaseConfigured()) {
      try {
        const { error } = await client.from('orders').update({ status }).eq('id', orderId);
        if (error) {
          console.error('Supabase update status error:', error);
          return { success: false, error: error.message };
        }
      } catch (e: any) {
        console.error('Supabase update status error:', e);
        return { success: false, error: e.message };
      }
    }
    return { success: true };
  },

  // Cancel Order by User (restores inventory stock)
  async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    const orders = getStoredOrders();
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found' };

    // Update status to Cancelled
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' as Order['status'] } : o));
    saveStoredOrders(updatedOrders);

    // Restore stock
    const products = getStoredProducts();
    const updatedProducts = products.map((p) => {
      const item = targetOrder.items.find((i) => i.product_id === p.id);
      if (item) {
        return { ...p, stock_quantity: p.stock_quantity + item.quantity };
      }
      return p;
    });
    saveStoredProducts(updatedProducts);

    // Sync to Supabase
    const client = getSupabaseClient();
    if (isSupabaseConfigured()) {
      try {
        await client.from('orders').update({ status: 'Cancelled' }).eq('id', orderId);
        // restore product stock in Supabase
        for (const item of targetOrder.items) {
          const product = updatedProducts.find((p) => p.id === item.product_id);
          if (product) {
            await client.from('products').update({ stock_quantity: product.stock_quantity }).eq('id', product.id);
          }
        }
      } catch (e: any) {
        console.error('Error syncing order cancellation to Supabase:', e);
      }
    }

    return { success: true };
  },

  // Delete Order Record (Customer or Admin)
  async deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    const currentOrders = getStoredOrders().filter((o) => o.id !== orderId);
    saveStoredOrders(currentOrders);

    const client = getSupabaseClient();
    if (isSupabaseConfigured()) {
      try {
        const { error } = await client.from('orders').delete().eq('id', orderId);
        if (error) {
          console.error('Supabase delete order error:', error);
          return { success: false, error: error.message };
        }
      } catch (e: any) {
        console.error('Supabase delete order error:', e);
        return { success: false, error: e.message };
      }
    }
    return { success: true };
  },

  // Update Profile Details (Full Name, Phone, Shipping Address)
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (isSupabaseConfigured() && userId && !userId.startsWith('usr_')) {
      try {
        const { error } = await client
          .from('profiles')
          .update({
            full_name: updates.full_name,
            phone: updates.phone,
            shipping_address: updates.shipping_address,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating Supabase profile:', error);
          return { success: false, error: error.message };
        }
      } catch (e: any) {
        console.error('Profile update exception:', e);
        return { success: false, error: e.message };
      }
    }
    return { success: true };
  },

  // Hero Configuration API
  getHeroConfig(): HeroConfig {
    return getStoredHeroConfig();
  },

  saveHeroConfig(config: HeroConfig) {
    saveStoredHeroConfig(config);
    return config;
  },

  // Seed / Sync All Initial Products into Supabase
  async seedAllToSupabase(): Promise<{ count: number; error?: string }> {
    const client = getSupabaseClient();
    if (!isSupabaseConfigured()) {
      return { count: 0, error: 'Supabase credentials not configured' };
    }

    try {
      const { data, error } = await client
        .from('products')
        .upsert(INITIAL_PRODUCTS, { onConflict: 'id' })
        .select();

      if (error) {
        return { count: 0, error: error.message };
      }
      return { count: data?.length || INITIAL_PRODUCTS.length };
    } catch (e: any) {
      return { count: 0, error: e.message };
    }
  },

  // Test / Diagnose Supabase tables
  async testConnection(): Promise<{
    connected: boolean;
    productsOk: boolean;
    profilesOk: boolean;
    ordersOk: boolean;
    canInsertProduct: boolean;
    details: string;
  }> {
    const client = getSupabaseClient();
    if (!isSupabaseConfigured()) {
      return {
        connected: false,
        productsOk: false,
        profilesOk: false,
        ordersOk: false,
        canInsertProduct: false,
        details: 'No Supabase URL/Key provided in .env or settings.',
      };
    }

    try {
      const { data: prodData, error: prodErr } = await client.from('products').select('id').limit(1);
      const productsOk = !prodErr;

      const { error: profErr } = await client.from('profiles').select('id').limit(1);
      const profilesOk = !profErr;

      const { error: ordErr } = await client.from('orders').select('id').limit(1);
      const ordersOk = !ordErr;

      const testId = 'test-ping-' + Date.now().toString(36);
      const testItem = {
        id: testId,
        name: 'Database Health Check',
        slug: 'db-health-check-' + Date.now().toString(36),
        price: 1,
        category: 'Baggettes',
        description: 'Auto ping',
        stock_quantity: 1,
        colors: [{ name: 'Noir', hex: '#000000', inStock: true }],
        images: ['https://example.com/check.jpg'],
        tags: ['HEALTH_CHECK'],
      };

      const { error: insertErr } = await client.from('products').insert([testItem]);
      let canInsertProduct = !insertErr;
      if (canInsertProduct) {
        await client.from('products').delete().eq('id', testId);
      }

      let details = '';
      if (!productsOk) details += `Products table error: ${prodErr?.message}. `;
      if (!profilesOk) details += `Profiles table error: ${profErr?.message}. `;
      if (!ordersOk) details += `Orders table error: ${ordErr?.message}. `;
      if (insertErr) details += `Write permission check failed (RLS): ${insertErr.message}. Run supabase-schema.sql to fix RLS policies!`;

      return {
        connected: productsOk || profilesOk,
        productsOk,
        profilesOk,
        ordersOk,
        canInsertProduct,
        details: details || 'All database checks passed! Read & write permissions are active.',
      };
    } catch (err: any) {
      return {
        connected: false,
        productsOk: false,
        profilesOk: false,
        ordersOk: false,
        canInsertProduct: false,
        details: err.message || 'Network error connecting to Supabase.',
      };
    }
  },

  // Reset to initial seed
  resetCatalog() {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    return INITIAL_PRODUCTS;
  },
};
