import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  RefreshCw,
  Search,
  Key,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Product, Order, ProductCategory, ProductColor } from '../../types';
import {
  dbService,
  isSupabaseConfigured,
  getSupabaseCredentials,
  setSupabaseCredentials,
  resetSupabaseCredentials,
} from '../../lib/supabase';
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
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

  // Supabase Credentials Settings State
  const credentials = getSupabaseCredentials();
  const [inputUrl, setInputUrl] = useState(credentials.url);
  const [inputKey, setInputKey] = useState(credentials.key);
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState<any>(null);

  // Banners & Notifications
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;
  const lowStockCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 5).length;

  // Run initial diagnostic check if Supabase is configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      runDiagnostics();
    }
  }, []);

  const runDiagnostics = async () => {
    setDiagRunning(true);
    const result = await dbService.testConnection();
    setDiagResult(result);
    setDiagRunning(false);
  };

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

    // Save with full error checking
    const res = await dbService.upsertProduct(newProduct);
    await onRefreshData();
    setIsProductModalOpen(false);

    if (res.inDatabase) {
      showBanner('Product successfully written to Supabase PostgreSQL database! 🟢', 'success');
    } else if (res.error) {
      showBanner(`Saved locally, but Supabase rejected write: "${res.error}". Run supabase-schema.sql to fix RLS!`, 'error');
    } else {
      showBanner('Product saved to catalog! 🎀', 'success');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to remove this bag from the catalog?')) {
      const res = await dbService.deleteProduct(productId);
      await onRefreshData();
      if (res.success) {
        showBanner('Product removed from catalog and database.', 'success');
      } else {
        showBanner(`Deleted locally, but Supabase error: ${res.error}`, 'warning');
      }
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
    const res = await dbService.updateOrderStatus(orderId, status);
    await onRefreshData();
    if (res.success) {
      showBanner(`Order ${orderId} status updated to ${status}.`, 'success');
    } else {
      showBanner(`Status updated locally, Supabase error: ${res.error}`, 'warning');
    }
  };

  const handleSeedAllToSupabase = async () => {
    const res = await dbService.seedAllToSupabase();
    if (res.error) {
      showBanner(`Error seeding to Supabase: ${res.error}. Check RLS policies!`, 'error');
    } else {
      showBanner(`Successfully uploaded ${res.count} bags directly into Supabase! 🎀`, 'success');
      await onRefreshData();
      runDiagnostics();
    }
  };

  const handleSaveCredentials = () => {
    if (!inputUrl.trim() || !inputKey.trim()) {
      showBanner('Please provide both a valid Supabase URL and Anon Key.', 'error');
      return;
    }
    setSupabaseCredentials(inputUrl, inputKey);
    showBanner('Supabase credentials saved and active! Running diagnostics...', 'success');
    runDiagnostics();
    onRefreshData();
  };

  const handleResetCredentials = () => {
    resetSupabaseCredentials();
    const creds = getSupabaseCredentials();
    setInputUrl(creds.url);
    setInputKey(creds.key);
    showBanner('Reset to .env credentials.', 'success');
    runDiagnostics();
    onRefreshData();
  };

  const showBanner = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleCopySql = () => {
    const sql = `-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX ALL RLS PERMISSIONS & SEED:
-- 1. Products Table Permissive RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 2. Profiles Table & Trigger
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles permit all select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles permit all insert" ON public.profiles;
DROP POLICY IF EXISTS "Profiles permit all update" ON public.profiles;

CREATE POLICY "Profiles permit all select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles permit all insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles permit all update" ON public.profiles FOR UPDATE USING (true);

-- 3. Orders Table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders permit all" ON public.orders;
CREATE POLICY "Orders permit all" ON public.orders FOR ALL USING (true) WITH CHECK (true);
`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const isSupabaseLive = isSupabaseConfigured();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 sm:pb-6 border-b border-ink-200 gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🎀</span>
            <span className="text-[10px] sm:text-xs font-mono-tag uppercase tracking-[0.25em] text-ink-500">
              Operations & Database Control
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-ink-900">
            Admin Dashboard
          </h1>
          <p className="text-[11px] sm:text-xs font-mono-tag text-ink-500 mt-0.5 truncate">
            {user?.full_name} ({user?.email}) • Admin Director
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="p-2 border border-ink-300 rounded-sm hover:bg-cream-100 text-ink-700 transition-colors"
            title="Refresh database"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onCloseAdmin}
            className="flex-1 sm:flex-initial bg-ink-900 text-cream-50 px-4 py-2 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors shadow-xs text-center"
          >
            Storefront
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`mt-4 p-3 border text-xs font-mono-tag rounded-sm flex items-start justify-between gap-2 animate-fade-in ${
            statusMessage.type === 'error'
              ? 'bg-rosebud-50 border-rosebud-300 text-rosebud-800'
              : statusMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="font-bold p-0.5 hover:opacity-75 flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* Database Diagnostic Notice if RLS write is blocked */}
      {diagResult && !diagResult.canInsertProduct && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-sm text-xs font-mono-tag text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>Supabase RLS Policy Warning: Writes to database are currently blocked by Row Level Security!</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Your Supabase tables exist, but PostgreSQL RLS is rejecting inserts. To enable adding/editing bags and placing orders in Supabase, run the one-click permissive SQL snippet in your Supabase SQL editor:
          </p>
          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 text-cream-50 rounded-xs text-[11px] font-bold hover:bg-amber-800 transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied Permissive SQL!' : 'Copy 1-Click Permissive RLS Script'}</span>
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
        <div className="bg-white/80 border border-ink-200 p-3.5 sm:p-5 rounded-sm">
          <div className="flex items-center justify-between text-ink-500 text-[10px] sm:text-xs font-mono-tag uppercase">
            <span>Gross Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          </div>
          <div className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold text-ink-900 mt-1 sm:mt-2">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-[9px] sm:text-[10px] font-mono-tag text-ink-400 mt-0.5 truncate">
            {orders.length} orders
          </p>
        </div>

        <div className="bg-white/80 border border-ink-200 p-3.5 sm:p-5 rounded-sm">
          <div className="flex items-center justify-between text-ink-500 text-[10px] sm:text-xs font-mono-tag uppercase">
            <span>Customer Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rosebud-600" />
          </div>
          <div className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold text-ink-900 mt-1 sm:mt-2">
            {orders.length}
          </div>
          <p className="text-[9px] sm:text-[10px] font-mono-tag text-ink-400 mt-0.5 truncate">
            Fulfillment queue
          </p>
        </div>

        <div className="bg-white/80 border border-ink-200 p-3.5 sm:p-5 rounded-sm">
          <div className="flex items-center justify-between text-ink-500 text-[10px] sm:text-xs font-mono-tag uppercase">
            <span>Bag Models</span>
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ink-600" />
          </div>
          <div className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold text-ink-900 mt-1 sm:mt-2">
            {products.length}
          </div>
          <p className="text-[9px] sm:text-[10px] font-mono-tag text-ink-400 mt-0.5 truncate">
            Active catalog entries
          </p>
        </div>

        <div className="bg-white/80 border border-ink-200 p-3.5 sm:p-5 rounded-sm">
          <div className="flex items-center justify-between text-ink-500 text-[10px] sm:text-xs font-mono-tag uppercase">
            <span>Inventory Alert</span>
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          </div>
          <div className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold text-ink-900 mt-1 sm:mt-2">
            {outOfStockCount + lowStockCount}
          </div>
          <p className="text-[9px] sm:text-[10px] font-mono-tag text-rosebud-600 mt-0.5 truncate">
            {outOfStockCount} out • {lowStockCount} low
          </p>
        </div>
      </div>

      {/* Tabs Bar (Scrollable on mobile) */}
      <div className="flex border-b border-ink-200 mb-6 text-xs font-mono-tag uppercase tracking-wider overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'products'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-800'
          }`}
        >
          <Package className="w-4 h-4 flex-shrink-0" />
          <span>Products ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 flex-shrink-0" />
          <span>Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'database'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-800'
          }`}
        >
          <Database className="w-4 h-4 flex-shrink-0" />
          <span>Supabase Sync</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Controls: Search, Filter, View Toggler, Add */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bags..."
                  className="w-full bg-cream-100 border border-ink-200 pl-8 pr-3 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-cream-100 border border-ink-200 px-2.5 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900 max-w-[130px] sm:max-w-none"
              >
                <option value="All">All Categories</option>
                <option value="Baggettes">Baggettes</option>
                <option value="Minis & Pouches">Minis</option>
                <option value="Totes & Shoulders">Totes</option>
                <option value="Ribbon & Bow Editions">Ribbon Editions</option>
              </select>
            </div>

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              {/* View Mode Toggler (Cards vs Table) */}
              <div className="flex items-center border border-ink-200 rounded-sm bg-cream-100 p-0.5 text-ink-600">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-xs transition-colors ${
                    viewMode === 'cards' ? 'bg-white text-ink-900 shadow-2xs font-bold' : 'hover:text-ink-900'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-xs transition-colors ${
                    viewMode === 'table' ? 'bg-white text-ink-900 shadow-2xs font-bold' : 'hover:text-ink-900'
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={openAddProductModal}
                className="bg-ink-900 text-cream-50 px-3.5 py-2 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Baguette</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE A: RESPONSIVE CARDS (Ideal on mobile screens) */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/80 border border-ink-200 rounded-sm p-3.5 flex gap-3 shadow-2xs hover:border-ink-300 transition-colors"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-16 h-20 object-cover rounded-sm border border-ink-200 bg-cream-100 flex-shrink-0"
                  />
                  <div className="flex-1 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-editorial text-xs sm:text-sm font-semibold text-ink-900 line-clamp-1">
                          {p.name}
                        </h4>
                        <span className="font-mono-tag text-xs font-bold text-ink-900 whitespace-nowrap">
                          ${p.price}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono-tag text-ink-400 mt-0.5 truncate">{p.category}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-ink-100">
                      {/* Inventory Stepper */}
                      <div className="flex items-center gap-1.5 text-xs font-mono-tag">
                        <span className="text-[10px] text-ink-500">Stock:</span>
                        <div className="flex items-center border border-ink-200 rounded-xs bg-cream-50 px-1">
                          <button
                            onClick={() => handleStockDelta(p, -1)}
                            className="px-1 text-ink-500 hover:text-ink-900 font-bold"
                          >
                            -
                          </button>
                          <span
                            className={`px-1 font-bold ${
                              p.stock_quantity === 0 ? 'text-rosebud-600' : 'text-ink-900'
                            }`}
                          >
                            {p.stock_quantity}
                          </span>
                          <button
                            onClick={() => handleStockDelta(p, 1)}
                            className="px-1 text-ink-500 hover:text-ink-900 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1 text-ink-600 hover:text-ink-900 border border-ink-200 rounded-xs"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 text-rosebud-600 hover:text-rosebud-800 border border-rosebud-200 rounded-xs"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE B: DESKTOP TABLE */}
          {viewMode === 'table' && (
            <div className="bg-white/80 border border-ink-200 rounded-sm overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs font-mono-tag min-w-[650px]">
                <thead className="bg-cream-100/80 border-b border-ink-200 uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="py-2.5 px-3">Image</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Tags</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-12 object-cover rounded-sm border border-ink-200 bg-cream-100"
                        />
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-editorial text-xs sm:text-sm font-semibold text-ink-900 line-clamp-1">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-ink-400">ID: {p.id}</div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-700">{p.category}</td>
                      <td className="py-2.5 px-3 font-bold text-ink-900">${p.price}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockDelta(p, -1)}
                            className="w-4 h-4 border border-ink-300 rounded flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className={`font-bold ${p.stock_quantity === 0 ? 'text-rosebud-600' : ''}`}>
                            {p.stock_quantity}
                          </span>
                          <button
                            onClick={() => handleStockDelta(p, 1)}
                            className="w-4 h-4 border border-ink-300 rounded flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[9px] bg-rosebud-50 border border-rosebud-200 text-rosebud-800 px-1 py-0.5 rounded-sm">
                          {p.tags[0] || 'Standard'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1 text-ink-600 hover:text-ink-900 border border-ink-200 rounded-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 text-rosebud-600 hover:text-rosebud-800 border border-rosebud-200 rounded-sm"
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
          )}
        </div>
      )}

      {/* TAB 2: CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white/80 border border-ink-200 rounded-sm overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs font-mono-tag min-w-[650px]">
            <thead className="bg-cream-100/80 border-b border-ink-200 uppercase tracking-wider text-ink-500">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-ink-900">{order.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-ink-900">{order.customer_name}</div>
                      <div className="text-[10px] text-ink-400">{order.customer_email}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[11px]">
                            <span className="text-rosebud-600">🎀</span>
                            <span className="line-clamp-1">{i.product_name}</span>
                            <span className="text-ink-400 font-bold">x{i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-ink-900">${order.total} USD</td>
                    <td className="py-2.5 px-3 text-ink-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value as Order['status'])
                        }
                        className="bg-cream-100 border border-ink-300 text-xs font-mono-tag px-2 py-1 rounded-sm focus:outline-none focus:border-ink-900"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing (Wrapping)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SUPABASE DATABASE SYNC & DIAGNOSTICS */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Diagnostic Status Card */}
          <div className="bg-white/80 border border-ink-200 p-4 sm:p-6 rounded-sm shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    diagResult?.canInsertProduct ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <div>
                  <h3 className="font-editorial text-base sm:text-lg text-ink-900">
                    {diagResult?.canInsertProduct
                      ? 'Supabase PostgreSQL Database Connected & Active'
                      : isSupabaseLive
                      ? 'Connected to Supabase (RLS Writes Need Configuration)'
                      : 'Running in Local Storage Mode'}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-mono-tag text-ink-500">
                    Endpoint: {credentials.url || 'Not configured'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={runDiagnostics}
                  disabled={diagRunning}
                  className="px-3 py-1.5 border border-ink-300 text-xs font-mono-tag text-ink-700 hover:text-ink-900 rounded-sm flex items-center gap-1.5 hover:bg-cream-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${diagRunning ? 'animate-spin' : ''}`} />
                  <span>{diagRunning ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSeedAllToSupabase}
                  className="px-3 py-1.5 bg-ink-900 text-cream-50 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors flex items-center gap-1.5"
                >
                  <span>Sync 8 Bags to DB</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Table */}
            {diagResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tag pt-2">
                <div className="p-2.5 bg-cream-50 border border-ink-200 rounded-xs flex items-center justify-between">
                  <span>products table</span>
                  {diagResult.productsOk ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rosebud-600" />
                  )}
                </div>
                <div className="p-2.5 bg-cream-50 border border-ink-200 rounded-xs flex items-center justify-between">
                  <span>profiles table</span>
                  {diagResult.profilesOk ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rosebud-600" />
                  )}
                </div>
                <div className="p-2.5 bg-cream-50 border border-ink-200 rounded-xs flex items-center justify-between">
                  <span>orders table</span>
                  {diagResult.ordersOk ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rosebud-600" />
                  )}
                </div>
                <div className="p-2.5 bg-cream-50 border border-ink-200 rounded-xs flex items-center justify-between">
                  <span>Write Permissions</span>
                  {diagResult.canInsertProduct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600" />
                  )}
                </div>
              </div>
            )}

            {diagResult?.details && (
              <p className="text-[11px] font-mono-tag text-ink-600 bg-cream-100 p-2.5 rounded-sm">
                Status: {diagResult.details}
              </p>
            )}
          </div>

          {/* Supabase Dynamic Credentials Editor */}
          <div className="bg-white/80 border border-ink-200 p-4 sm:p-6 rounded-sm shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs font-mono-tag uppercase text-ink-900">
              <Key className="w-4 h-4" />
              <span>Supabase Connection Credentials</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-tag">
              <div>
                <label className="block uppercase text-ink-500 mb-1 text-[10px]">Project URL</label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full bg-cream-50 border border-ink-300 px-3 py-1.5 rounded-sm font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block uppercase text-ink-500 mb-1 text-[10px]">Anon / Public Key</label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="sb_publishable_..."
                  className="w-full bg-cream-50 border border-ink-300 px-3 py-1.5 rounded-sm font-mono text-[11px]"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveCredentials}
                className="bg-ink-900 text-cream-50 px-4 py-1.5 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors"
              >
                Save Credentials
              </button>
              <button
                type="button"
                onClick={handleResetCredentials}
                className="border border-ink-300 text-ink-700 px-3 py-1.5 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-cream-100 transition-colors"
              >
                Reset to .env
              </button>
            </div>
          </div>

          {/* SQL Script Quick Copy */}
          <div className="bg-white/80 border border-ink-200 p-4 sm:p-6 rounded-sm shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono-tag uppercase tracking-wider text-ink-800 font-bold">
                1-Click Permissive SQL Script (Run in Supabase SQL Editor)
              </span>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 text-cream-50 text-xs font-mono-tag rounded-sm hover:bg-rosebud-600 transition-colors shadow-2xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="bg-ink-900 text-cream-100 p-3 sm:p-4 rounded-sm text-[10px] sm:text-[11px] font-mono overflow-x-auto max-h-48">
{`-- Products Table Permissive Policy
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.products;
CREATE POLICY "Enable all access for all users" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Profiles Table Permissive Policy
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles permit all select" ON public.profiles;
CREATE POLICY "Profiles permit all select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles permit all insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles permit all update" ON public.profiles FOR UPDATE USING (true);

-- Orders Table Permissive Policy
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders permit all" ON public.orders;
CREATE POLICY "Orders permit all" ON public.orders FOR ALL USING (true) WITH CHECK (true);`}
            </pre>
          </div>
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL (Fully Responsive) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs"
            onClick={() => setIsProductModalOpen(false)}
          />

          <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8 flex items-end sm:items-center justify-center">
            <div className="relative bg-cream-50 w-full max-w-2xl border border-ink-200 shadow-2xl rounded-t-lg sm:rounded-sm p-5 sm:p-8 z-10 animate-fade-in my-auto max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-ink-200 pb-3 mb-4">
                <div>
                  <h3 className="font-editorial text-xl sm:text-2xl text-ink-900">
                    {editingProduct ? 'Edit Baguette Silhouette' : 'Add New Baguette to Catalog'}
                  </h3>
                  <p className="text-[11px] font-mono-tag text-ink-500">
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

              <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs font-mono-tag">
                <div>
                  <label className="block uppercase text-ink-600 mb-1">Bag Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. The Orchard Pleated Baggette"
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
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
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Compare Price (Optional)</label>
                    <input
                      type="number"
                      value={formComparePrice || ''}
                      onChange={(e) =>
                        setFormComparePrice(e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="e.g. 385"
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-ink-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Materials</label>
                    <input
                      type="text"
                      value={formMaterials}
                      onChange={(e) => setFormMaterials(e.target.value)}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={formDimensions}
                      onChange={(e) => setFormDimensions(e.target.value)}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 rounded-sm"
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
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 rounded-sm font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="NEW ARRIVAL, BESTSELLER"
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 rounded-sm"
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
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 rounded-sm"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-ink-200 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 border border-ink-300 rounded-sm hover:bg-cream-100 uppercase text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ink-900 text-cream-50 px-5 py-2 rounded-sm hover:bg-rosebud-600 transition-colors uppercase tracking-wider text-xs"
                  >
                    Save Baguette
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
