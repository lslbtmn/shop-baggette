import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { SearchModal } from './components/layout/SearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProductCard } from './components/shop/ProductCard';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { HeroBanner } from './components/shop/HeroBanner';
import { LookbookModal } from './components/shop/LookbookModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerAccount } from './components/customer/CustomerAccount';
import { Product, Order, ProductCategory } from './types';
import { dbService } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { useWishlist } from './context/WishlistContext';
import { SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { wishlistIds } = useWishlist();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [currentView, setCurrentView] = useState<'shop' | 'admin' | 'account'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLookbookOpen, setIsLookbookOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Fetch initial data
  const loadData = async () => {
    try {
      const [fetchedProducts, fetchedOrders] = await Promise.all([
        dbService.getProducts(),
        dbService.getOrders(),
      ]);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
    } catch (e) {
      console.error('Failed to load database:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Sort Products
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Filter by Wishlist Only toggle
    if (showWishlistOnly) {
      list = list.filter((p) => wishlistIds.includes(p.id));
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // In-stock toggle
    if (onlyInStock) {
      list = list.filter((p) => p.stock_quantity > 0);
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    } else {
      // featured
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, sortBy, onlyInStock, showWishlistOnly, wishlistIds]);

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-ink-900 selection:bg-rosebud-200">
      {/* Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLookbook={() => setIsLookbookOpen(true)}
        onOpenWishlist={() => {
          setCurrentView('shop');
          setShowWishlistOnly(!showWishlistOnly);
        }}
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenAccount={() => {
          if (!user) {
            setIsAuthOpen(true);
          } else {
            setCurrentView('account');
          }
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setShowWishlistOnly(false);
          setCurrentView('shop');
        }}
        currentView={currentView}
        onNavigateHome={() => {
          setCurrentView('shop');
          setShowWishlistOnly(false);
          setSelectedCategory('All');
        }}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* VIEW 1: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            onRefreshData={loadData}
            onCloseAdmin={() => setCurrentView('shop')}
          />
        )}

        {/* VIEW 2: CUSTOMER ACCOUNT */}
        {currentView === 'account' && (
          <CustomerAccount
            orders={orders}
            products={products}
            onOpenProduct={(p) => setDetailProduct(p)}
            onNavigateShop={() => setCurrentView('shop')}
            onOpenAdmin={() => setCurrentView('admin')}
          />
        )}

        {/* VIEW 3: STOREFRONT */}
        {currentView === 'shop' && (
          <div>
            {/* Hero Banner (Shown when viewing all & not filtering wishlist) */}
            {selectedCategory === 'All' && !showWishlistOnly && (
              <HeroBanner
                onExplore={() => {
                  const el = document.getElementById('bag-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenLookbook={() => setIsLookbookOpen(true)}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
              />
            )}

            {/* Product Listing Section */}
            <div id="bag-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              {/* Category Title & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-ink-200 pb-4 mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">🎀</span>
                    <span className="text-[11px] font-mono-tag uppercase tracking-[0.25em] text-ink-500">
                      {showWishlistOnly ? 'Your Sweethearts' : 'SS26 Baggette Archive'}
                    </span>
                  </div>
                  <h2 className="font-editorial text-2xl sm:text-3xl text-ink-900 font-normal">
                    {showWishlistOnly
                      ? 'Saved Wishlist Favorites'
                      : selectedCategory === 'All'
                      ? 'All Downtown Baggettes'
                      : selectedCategory}
                  </h2>
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono-tag">
                  {/* In-Stock filter toggle */}
                  <label className="flex items-center gap-2 cursor-pointer text-ink-700 hover:text-ink-900">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="accent-ink-900 rounded-sm"
                    />
                    <span>In Stock Only</span>
                  </label>

                  {/* Wishlist toggle pill */}
                  {wishlistIds.length > 0 && (
                    <button
                      onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                      className={`px-2.5 py-1 rounded-sm border transition-colors ${
                        showWishlistOnly
                          ? 'bg-rosebud-100 text-rosebud-800 border-rosebud-300'
                          : 'border-ink-200 text-ink-600 hover:border-ink-400'
                      }`}
                    >
                      🎀 Saved ({wishlistIds.length})
                    </button>
                  )}

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-1.5 border border-ink-200 rounded-sm px-2.5 py-1 bg-white/40">
                    <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-xs font-mono-tag focus:outline-none cursor-pointer"
                    >
                      <option value="featured">Featured First</option>
                      <option value="newest">Newest Arrivals</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="py-24 text-center">
                  <div className="inline-block animate-spin text-2xl mb-3">🎀</div>
                  <p className="font-editorial text-base text-ink-700">Arranging the bag shelf...</p>
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="py-20 text-center bg-cream-100/50 border border-dashed border-ink-200 rounded-sm p-8">
                  <p className="font-editorial text-xl text-ink-800">No bags match this selection</p>
                  <p className="text-xs font-mono-tag text-ink-500 mt-1 max-w-sm mx-auto">
                    Try unchecking the "In Stock Only" filter or selecting another category.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setOnlyInStock(false);
                      setShowWishlistOnly(false);
                    }}
                    className="mt-4 bg-ink-900 text-cream-50 px-5 py-2 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors"
                  >
                    View All Baggettes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetail={(p) => setDetailProduct(p)}
                    />
                  ))}
                </div>
              )}

              {/* Sandy Liang Editorial Interlude */}
              <div className="mt-20 p-8 sm:p-12 border border-ink-200 bg-cream-100/70 rounded-sm relative overflow-hidden">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-2 text-rosebud-600 text-xs font-mono-tag uppercase tracking-widest">
                    <span>🎀</span>
                    <span>Studio Dispatch • Lower East Side</span>
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-ink-900 font-normal leading-snug">
                    "Every bag is an emotional archive. You keep lip balm, a cinema ticket from last July, and a lucky safety pin in it."
                  </h3>
                  <p className="text-xs font-mono-tag text-ink-500 mt-3">
                    Hand-stitched satin ribbons • Polished nickel charms • Cotton candy dustbags
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 text-9xl opacity-5 select-none pointer-events-none">
                  🎀
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setDetailProduct(p)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(admin) => {
          if (admin) {
            setCurrentView('admin');
          } else {
            setCurrentView('account');
          }
        }}
      />

      <LookbookModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        products={products}
        onSelectProduct={(p) => setDetailProduct(p)}
      />

      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={(order) => {
          setOrders((prev) => [order, ...prev]);
        }}
      />
    </div>
  );
};
