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
import { Product, Order, ProductCategory, HeroConfig } from './types';
import { dbService } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { useWishlist } from './context/WishlistContext';
import { SlidersHorizontal, ArrowUpDown, ChevronDown, ChevronUp, X } from 'lucide-react';

export const App: React.FC = () => {
  const { user } = useAuth();
  const { wishlistIds } = useWishlist();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => dbService.getHeroConfig());
  const [loading, setLoading] = useState(true);

  // View state
  const [currentView, setCurrentView] = useState<'shop' | 'admin' | 'account'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Mobile Filter Drawer / Toggler
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
      setHeroConfig(dbService.getHeroConfig());
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

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            heroConfig={heroConfig}
            onUpdateHeroConfig={(cfg) => {
              setHeroConfig(cfg);
              dbService.saveHeroConfig(cfg);
            }}
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
            onRefreshOrders={loadData}
          />
        )}

        {/* VIEW 3: STOREFRONT */}
        {currentView === 'shop' && (
          <div>
            {/* Hero Banner (Shown when viewing all and not filtering wishlist) */}
            {selectedCategory === 'All' && !showWishlistOnly && (
              <HeroBanner
                heroConfig={heroConfig}
                products={products}
                onExplore={() => {
                  const el = document.getElementById('bag-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenLookbook={() => setIsLookbookOpen(true)}
                onOpenProduct={(p) => setDetailProduct(p)}
              />
            )}

            {/* Product Listing Section */}
            <div id="bag-grid" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
              {/* Category Header & Filter Bar */}
              <div className="border-b border-ink-200 pb-3 sm:pb-4 mb-6 sm:mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">🎀</span>
                      <span className="text-[10px] sm:text-[11px] font-mono-tag uppercase tracking-[0.25em] text-ink-500">
                        {showWishlistOnly ? 'Your Sweethearts' : 'SS26 Bag Archive'}
                      </span>
                    </div>
                    <h2 className="font-editorial text-xl sm:text-2xl lg:text-3xl text-ink-900 font-normal">
                      {showWishlistOnly
                        ? 'Saved Favorites'
                        : selectedCategory === 'All'
                        ? 'All Atelier Baggettes'
                        : selectedCategory}
                    </h2>
                  </div>

                  {/* Mobile Filter Toggler Button */}
                  <div className="sm:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tag border rounded-sm transition-colors ${
                        mobileFiltersOpen || onlyInStock || showWishlistOnly
                          ? 'bg-rosebud-100 text-rosebud-800 border-rosebud-300 font-bold'
                          : 'border-ink-300 text-ink-700 bg-white/70'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Filters</span>
                      {mobileFiltersOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Desktop Filter & Sort Controls */}
                  <div className="hidden sm:flex items-center gap-3 text-xs font-mono-tag">
                    {/* In-Stock filter toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-ink-700 hover:text-ink-900">
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(e) => setOnlyInStock(e.target.checked)}
                        className="accent-ink-900 rounded-sm"
                      />
                      <span>In Stock</span>
                    </label>

                    {/* Wishlist toggle pill */}
                    {wishlistIds.length > 0 && (
                      <button
                        onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                        className={`px-2.5 py-1 rounded-sm border transition-colors ${
                          showWishlistOnly
                            ? 'bg-rosebud-100 text-rosebud-800 border-rosebud-300 font-bold'
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
                        <option value="newest">Newest</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mobile Filter Expandable Drawer */}
                {mobileFiltersOpen && (
                  <div className="sm:hidden mt-3 pt-3 border-t border-ink-200 space-y-3 animate-fade-in bg-cream-100/60 p-3 rounded-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono-tag uppercase tracking-widest text-ink-500 font-bold">
                        Filter Options
                      </span>
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="text-ink-400 hover:text-ink-900 p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-mono-tag">
                      <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-ink-200 rounded-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlyInStock}
                          onChange={(e) => setOnlyInStock(e.target.checked)}
                          className="accent-ink-900"
                        />
                        <span>In Stock Only</span>
                      </label>

                      {wishlistIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                          className={`px-2.5 py-1.5 rounded-sm border transition-colors ${
                            showWishlistOnly
                              ? 'bg-rosebud-100 text-rosebud-800 border-rosebud-300 font-bold'
                              : 'bg-white border-ink-200 text-ink-700'
                          }`}
                        >
                          🎀 Saved ({wishlistIds.length})
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="block text-[10px] font-mono-tag uppercase tracking-wider text-ink-500 mb-1">
                        Sort Bags By
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-white border border-ink-200 px-3 py-1.5 rounded-sm text-xs font-mono-tag"
                      >
                        <option value="featured">Featured First</option>
                        <option value="newest">Newest Arrivals</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Grid (Responsive: 2 cols on mobile, 3 on md, 4 on lg) */}
              {loading ? (
                <div className="py-20 text-center">
                  <div className="inline-block animate-spin text-2xl mb-2">🎀</div>
                  <p className="font-editorial text-sm sm:text-base text-ink-700">Arranging the bag shelf...</p>
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="py-16 text-center bg-cream-100/50 border border-dashed border-ink-200 rounded-sm p-6">
                  <p className="font-editorial text-lg text-ink-800">No bags match this selection</p>
                  <p className="text-xs font-mono-tag text-ink-500 mt-1 max-w-sm mx-auto">
                    Try unchecking the "In Stock Only" filter or selecting another category.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setOnlyInStock(false);
                      setShowWishlistOnly(false);
                    }}
                    className="mt-3 bg-ink-900 text-cream-50 px-4 py-2 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors"
                  >
                    View All Baggettes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
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
              <div className="mt-14 sm:mt-20 p-5 sm:p-10 border border-ink-200 bg-cream-100/70 rounded-sm relative overflow-hidden">
                <div className="max-w-xl">
                  <div className="flex items-center gap-1.5 mb-1.5 text-rosebud-600 text-[10px] sm:text-xs font-mono-tag uppercase tracking-widest">
                    <span>🎀</span>
                    <span>Atelier Dispatch • Accra, Ghana</span>
                  </div>
                  <h3 className="font-editorial text-lg sm:text-2xl lg:text-3xl text-ink-900 font-normal leading-snug">
                    "Every bag is an emotional archive. You keep lip balm, a cinema ticket from last July, and a lucky safety pin in it."
                  </h3>
                  <p className="text-[11px] sm:text-xs font-mono-tag text-ink-500 mt-2 sm:mt-3">
                    Hand-stitched satin ribbons • Polished nickel charms • Cotton candy dustbags
                  </p>
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
