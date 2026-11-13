import React, { useState } from 'react';
import {
  Package,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Database,
  Check,
  Copy,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  Eye,
} from 'lucide-react';
import { Product, Order, ProductCategory, ProductColor } from '../../types';
import { dbService, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => Promise<void>;
  onCloseAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onRefreshData,
  onCloseAdmin,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'database'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Baggettes');
  const [formPrice, setFormPrice] = useState(320);
  const [formComparePrice, setFormComparePrice] = useState<number | undefined>(undefined);
  const [formStock, setFormStock] = useState(10);
  const [formDescription, setFormDescription] = useState('');
  const [formMaterials, setFormMaterials] = useState('');
  const [formDimensions, setFormDimensions] = useState('10.5" W x 5.0" H x 2.5" D');
  const [formCare, setFormCare] = useState('Spot clean with damp cloth.');
  const [formImages, setFormImages] = useState('');
  const [formTags, setFormTags] = useState('NEW ARRIVAL');
  const [formColors, setFormColors] = useState('Noir Black:#111111, Ballet Pink:#FAD8DD');

  // SQL Copy state
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Compute Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;
  const lowStockCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 5).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Baggettes');
    setFormPrice(320);
    setFormComparePrice(undefined);
    setFormStock(12);
    setFormDescription('Our newest downtown baggette silhouette in lustrous satin.');
    setFormMaterials('Duchess Satin & Palladium hardware');
    setFormDimensions('10.0" W x 5.0" H x 2.5" D');
    setFormCare('Spot clean with dry cloth.');
    setFormImages(
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80\nhttps://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
    );
    setFormTags('NEW DROP, 🎀 RIBBON');
    setFormColors('Noir Black:#111111, Ribbon Pink:#FAD8DD');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormComparePrice(product.compare_at_price);
    setFormStock(product.stock_quantity);
    setFormDescription(product.description);
    setFormMaterials(product.materials);
    setFormDimensions(product.dimensions);
    setFormCare(product.care);
    setFormImages(product.images.join('\n'));
    setFormTags(product.tags.join(', '));
    setFormColors(product.colors.map((c) => `${c.name}:${c.hex}`).join(', '));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedImages = formImages
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedTags = formTags
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedColors: ProductColor[] = formColors
      .split(',')
      .map((c) => {
        const [name, hex] = c.split(':').map((s) => s.trim());
        return {
          name: name || 'Standard',
          hex: hex || '#111111',
          inStock: true,
        };
      })
      .filter((c) => c.name);

    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : 'bag-' + Date.now().toString(36),
      name: formName,
      slug: editingProduct ? editingProduct.slug : slug,
      price: Number(formPrice),
      compare_at_price: formComparePrice ? Number(formComparePrice) : undefined,
      category: formCategory,
      description: formDescription,
      details: editingProduct?.details || [
        'Finished with signature grosgrain ribbon ties',
        'Lined in soft cotton with card pocket',
      ],
      materials: formMaterials,
      dimensions: formDimensions,
      care: formCare,
      colors: parsedColors.length > 0 ? parsedColors : [{ name: 'Noir', hex: '#111111', inStock: true }],
      images:
        parsedImages.length > 0
          ? parsedImages
          : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'],
      tags: parsedTags,
      stock_quantity: Number(formStock),
      is_featured: editingProduct ? editingProduct.is_featured : true,
      created_at: editingProduct?.created_at || new Date().toISOString(),
    };

    await dbService.upsertProduct(newProduct);
    await onRefreshData();
    setIsProductModalOpen(false);
    showBanner('Product successfully saved to catalog! 🎀');
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to remove this bag from the catalog?')) {
      await dbService.deleteProduct(productId);
      await onRefreshData();
      showBanner('Product deleted.');
    }
  };

  const handleStockDelta = async (product: Product, delta: number) => {
    const updated = {
      ...product,
      stock_quantity: Math.max(0, product.stock_quantity + delta),
    };
    await dbService.upsertProduct(updated);
    await onRefreshData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await dbService.updateOrderStatus(orderId, status);
    await onRefreshData();
    showBanner(`Order ${orderId} status updated to ${status}.`);
  };

  const showBanner = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCopySql = () => {
    const sql = `-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

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

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON public.products FOR ALL USING (true);

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
  status TEXT DEFAULT 'Pending',
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders read write" ON public.orders FOR ALL USING (true);
`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleResetCatalog = async () => {
    if (confirm('Reset catalog and orders to default factory seed bags?')) {
      dbService.resetCatalog();
      await onRefreshData();
      showBanner('Catalog reset to initial SS26 seed! 🎀');
    }
  };

  const isSupabaseLive = isSupabaseConfigured();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-ink-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🎀</span>
            <span className="text-xs font-mono-tag uppercase tracking-[0.25em] text-ink-500">
              Back-Office Operations
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-ink-900">
            Baggette Shop Admin Dashboard
          </h1>
          <p className="text-xs font-mono-tag text-ink-500 mt-1">
            Logged in as {user?.full_name} ({user?.email}) • Role: Admin Director
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshData}
            className="p-2 border border-ink-300 rounded-sm hover:bg-cream-100 text-ink-700 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onCloseAdmin}
            className="bg-ink-900 text-cream-50 px-5 py-2 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors shadow-sm"
          >
            Return to Storefront
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono-tag rounded-sm flex items-center justify-between animate-fade-in">
          <span>🎀 {statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-600 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div className="bg-white/70 border border-ink-200 p-5 rounded-sm">
          <div className="flex items-center justify-between text-ink-500 text-xs font-mono-tag uppercase">
            <span>Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-editorial text-2xl sm:text-3xl font-bold text-ink-900 mt-2">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] font-mono-tag text-ink-400 mt-1">Calculated from all customer orders</p>
        </div>

        <div className="bg-white/70 border border-ink-200 p-5 rounded-sm">
          <div className="flex items-center justify-between text-ink-500 text-xs font-mono-tag uppercase">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-rosebud-600" />
          </div>
          <div className="font-editorial text-2xl sm:text-3xl font-bold text-ink-900 mt-2">
            {orders.length}
          </div>
          <p className="text-[10px] font-mono-tag text-ink-400 mt-1">Fulfillment queue active</p>
        </div>

        <div className="bg-white/70 border border-ink-200 p-5 rounded-sm">
          <div className="flex items-center justify-between text-ink-500 text-xs font-mono-tag uppercase">
            <span>Bag Models</span>
            <Package className="w-4 h-4 text-ink-600" />
          </div>
          <div className="font-editorial text-2xl sm:text-3xl font-bold text-ink-900 mt-2">
            {products.length}
          </div>
          <p className="text-[10px] font-mono-tag text-ink-400 mt-1">Active catalog entries</p>
        </div>

        <div className="bg-white/70 border border-ink-200 p-5 rounded-sm">
          <div className="flex items-center justify-between text-ink-500 text-xs font-mono-tag uppercase">
            <span>Stock Alerts</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-editorial text-2xl sm:text-3xl font-bold text-ink-900 mt-2">
            {outOfStockCount + lowStockCount}
          </div>
          <p className="text-[10px] font-mono-tag text-rosebud-600 mt-1">
            {outOfStockCount} sold out • {lowStockCount} low
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-200 mb-6 text-xs font-mono-tag uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
            activeTab === 'products'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
            activeTab === 'database'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase Database Sync</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Controls: Search, Filter, Add */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bags by name or ID..."
                  className="w-full bg-cream-100 border border-ink-200 pl-9 pr-3 py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-cream-100 border border-ink-200 px-3 py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
              >
                <option value="All">All Categories</option>
                <option value="Baggettes">Baggettes</option>
                <option value="Minis & Pouches">Minis & Pouches</option>
                <option value="Totes & Shoulders">Totes & Shoulders</option>
                <option value="Ribbon & Bow Editions">Ribbon & Bow Editions</option>
              </select>
            </div>

            <button
              onClick={openAddProductModal}
              className="bg-ink-900 text-cream-50 px-4 py-2 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Baguette</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white/80 border border-ink-200 rounded-sm overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs font-mono-tag">
              <thead className="bg-cream-100/80 border-b border-ink-200 uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="py-3 px-4">Bag Image</th>
                  <th className="py-3 px-4">Model & Silhouette</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Inventory</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-14 object-cover rounded-sm border border-ink-200 bg-cream-100"
                      />
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-editorial text-sm font-semibold text-ink-900 line-clamp-1">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-ink-400 mt-0.5">ID: {p.id}</div>
                    </td>
                    <td className="py-3 px-4 text-ink-700">{p.category}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-ink-900">${p.price}</span>
                      {p.compare_at_price && (
                        <span className="text-[10px] text-ink-400 line-through ml-1.5">
                          ${p.compare_at_price}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStockDelta(p, -1)}
                          className="w-5 h-5 border border-ink-300 rounded flex items-center justify-center hover:bg-cream-200 text-xs font-bold"
                          title="Decrement stock"
                        >
                          -
                        </button>
                        <span
                          className={`font-bold ${
                            p.stock_quantity === 0
                              ? 'text-rosebud-600 font-extrabold'
                              : p.stock_quantity < 5
                              ? 'text-amber-600'
                              : 'text-ink-900'
                          }`}
                        >
                          {p.stock_quantity}
                        </span>
                        <button
                          onClick={() => handleStockDelta(p, 1)}
                          className="w-5 h-5 border border-ink-300 rounded flex items-center justify-center hover:bg-cream-200 text-xs font-bold"
                          title="Increment stock"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] bg-rosebud-50 border border-rosebud-200 text-rosebud-800 px-1.5 py-0.5 rounded-sm"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 text-ink-600 hover:text-ink-900 border border-ink-200 hover:border-ink-400 rounded-sm"
                          title="Edit Bag"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-rosebud-600 hover:text-rosebud-800 border border-rosebud-200 hover:border-rosebud-400 rounded-sm"
                          title="Delete Bag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white/80 border border-ink-200 rounded-sm overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs font-mono-tag">
            <thead className="bg-cream-100/80 border-b border-ink-200 uppercase tracking-wider text-ink-500">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-cream-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-ink-900">{order.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink-900">{order.customer_name}</div>
                    <div className="text-[10px] text-ink-400">{order.customer_email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-rosebud-600">🎀</span>
                          <span className="line-clamp-1">{i.product_name}</span>
                          <span className="text-ink-400 font-bold">x{i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-ink-900">${order.total} USD</td>
                  <td className="py-3 px-4 text-ink-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order.id, e.target.value as Order['status'])
                      }
                      className="bg-cream-100 border border-ink-300 text-xs font-mono-tag px-2.5 py-1 rounded-sm focus:outline-none focus:border-ink-900"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing (Wrapping)</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SUPABASE DATABASE PORTAL */}
      {activeTab === 'database' && (
        <div className="space-y-8">
          {/* Connection Status Card */}
          <div className="bg-white/80 border border-ink-200 p-6 rounded-sm shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full ${
                    isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <div>
                  <h3 className="font-editorial text-lg text-ink-900">
                    {isSupabaseLive ? 'Supabase Database Connected' : 'Local Persistence & Sync Sandbox'}
                  </h3>
                  <p className="text-xs font-mono-tag text-ink-500">
                    {isSupabaseLive
                      ? 'Live PostgreSQL connection active. All catalog mutations sync directly with Supabase.'
                      : 'Running in built-in offline-resilient sandbox with local storage persistence. Ready to link your Supabase database.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetCatalog}
                  className="px-3 py-1.5 border border-ink-300 text-xs font-mono-tag text-ink-700 hover:text-ink-900 rounded-sm flex items-center gap-1.5 hover:bg-cream-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Seed Data</span>
                </button>
              </div>
            </div>

            {/* Step by step to connect Supabase */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold">
                How to link your Supabase Database:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-tag">
                <div className="bg-cream-100/60 p-4 border border-ink-200 rounded-sm space-y-2">
                  <div className="font-bold text-ink-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <span>Create Supabase Project</span>
                  </div>
                  <p className="text-ink-600">
                    Head to{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-rosebud-600"
                    >
                      supabase.com
                    </a>{' '}
                    and create a new free PostgreSQL project.
                  </p>
                </div>

                <div className="bg-cream-100/60 p-4 border border-ink-200 rounded-sm space-y-2">
                  <div className="font-bold text-ink-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <span>Run Database Schema</span>
                  </div>
                  <p className="text-ink-600">
                    Copy the SQL script below and paste it into the <strong>SQL Editor</strong> in Supabase to create the tables.
                  </p>
                </div>

                <div className="bg-cream-100/60 p-4 border border-ink-200 rounded-sm space-y-2">
                  <div className="font-bold text-ink-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center text-[11px]">
                      3
                    </span>
                    <span>Set .env Credentials</span>
                  </div>
                  <p className="text-ink-600">
                    Add <code className="bg-cream-200 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> &{' '}
                    <code className="bg-cream-200 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> to your `.env` file.
                  </p>
                </div>
              </div>
            </div>

            {/* SQL Schema Copy Box */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-tag uppercase tracking-wider text-ink-700 font-bold">
                  PostgreSQL Schema (`supabase-schema.sql`)
                </span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-3 py-1 bg-ink-900 text-cream-50 text-xs font-mono-tag rounded-sm hover:bg-rosebud-600 transition-colors shadow-sm"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="bg-ink-900 text-cream-100 p-4 rounded-sm text-[11px] font-mono overflow-x-auto max-h-72">
{`-- BAGGETTE SHOP SUPABASE SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  status TEXT DEFAULT 'Pending',
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm"
            onClick={() => setIsProductModalOpen(false)}
          />

          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div className="relative bg-cream-50 w-full max-w-2xl border border-ink-200 shadow-2xl rounded-sm p-6 sm:p-8 z-10 animate-fade-in my-auto">
              <div className="flex justify-between items-center border-b border-ink-200 pb-4 mb-6">
                <div>
                  <h3 className="font-editorial text-2xl text-ink-900">
                    {editingProduct ? 'Edit Baguette Silhouette' : 'Add New Baguette to Catalog'}
                  </h3>
                  <p className="text-xs font-mono-tag text-ink-500">
                    Modelled with Sandy Liang downtown aesthetic
                  </p>
                </div>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 text-ink-400 hover:text-ink-900"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono-tag">
                <div>
                  <label className="block uppercase text-ink-600 mb-1">Bag Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. The Orchard Pleated Baggette"
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    >
                      <option value="Baggettes">Baggettes</option>
                      <option value="Minis & Pouches">Minis & Pouches</option>
                      <option value="Totes & Shoulders">Totes & Shoulders</option>
                      <option value="Ribbon & Bow Editions">Ribbon & Bow Editions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Price (USD)</label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Compare At Price (Optional)</label>
                    <input
                      type="number"
                      value={formComparePrice || ''}
                      onChange={(e) =>
                        setFormComparePrice(e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="e.g. 385"
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-ink-600 mb-1">Editorial Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Materials</label>
                    <input
                      type="text"
                      value={formMaterials}
                      onChange={(e) => setFormMaterials(e.target.value)}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={formDimensions}
                      onChange={(e) => setFormDimensions(e.target.value)}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-ink-600 mb-1">
                    Image URLs (one per line, first is primary)
                  </label>
                  <textarea
                    rows={2}
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="NEW ARRIVAL, BESTSELLER"
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">
                      Colors (Format: Name:#HEX, Name:#HEX)
                    </label>
                    <input
                      type="text"
                      value={formColors}
                      onChange={(e) => setFormColors(e.target.value)}
                      placeholder="Noir:#111111, Pink:#FAD8DD"
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-2 rounded-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-ink-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 border border-ink-300 rounded-sm hover:bg-cream-100 uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ink-900 text-cream-50 px-6 py-2 rounded-sm hover:bg-rosebud-600 transition-colors uppercase tracking-wider"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
