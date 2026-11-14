import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User, ShieldCheck, Menu, X, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { ProductCategory } from '../../types';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenLookbook: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onOpenAccount: () => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  currentView: 'shop' | 'admin' | 'account';
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenSearch,
  onOpenAuth,
  onOpenLookbook,
  onOpenWishlist,
  onOpenAdmin,
  onOpenAccount,
  selectedCategory,
  onSelectCategory,
  currentView,
  onNavigateHome,
}) => {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: ProductCategory[] = [
    'All',
    'Baggettes',
    'Minis & Pouches',
    'Totes & Shoulders',
    'Ribbon & Bow Editions',
  ];

  const handleSelectCatMobile = (cat: ProductCategory) => {
    onNavigateHome();
    onSelectCategory(cat);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-ink-100 transition-all">
        {/* Top Ticker (Collapsible / Compact on mobile) */}
        <div className="bg-ink-900 text-cream-100 text-[10px] sm:text-[11px] font-mono-tag tracking-wider py-1 sm:py-1.5 overflow-hidden border-b border-ink-800">
          <div className="animate-ticker">
            <span className="mx-4 sm:mx-6">🎀 BAGGETTE SHOP • ACCRA, GHANA</span>
            <span className="mx-4 sm:mx-6">• COMPLIMENTARY MESSENGER SHIPPING OVER $250</span>
            <span className="mx-4 sm:mx-6">🎀 SS26 DELICATE UTILITY DROP AVAILABLE NOW</span>
            <span className="mx-4 sm:mx-6">• SIGNATURE CANDY-PINK BOW PACKAGING</span>
            <span className="mx-4 sm:mx-6">🎀 BAGGETTE SHOP • ACCRA, GHANA</span>
            <span className="mx-4 sm:mx-6">• COMPLIMENTARY MESSENGER SHIPPING OVER $250</span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Menu Toggler (Left on mobile) */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-ink-700 hover:text-ink-900 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[1.5]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[1.5]" />
                )}
              </button>
            </div>

            {/* Desktop Left Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6 text-[13px] tracking-widest font-mono-tag uppercase">
              <button
                onClick={() => {
                  onNavigateHome();
                  onSelectCategory('All');
                }}
                className={`hover:text-rosebud-600 transition-colors pb-1 ${
                  currentView === 'shop' && selectedCategory === 'All'
                    ? 'border-b-2 border-ink-900 font-bold'
                    : 'text-ink-700'
                }`}
              >
                Shop All
              </button>
              <button
                onClick={() => {
                  onNavigateHome();
                  onSelectCategory('Baggettes');
                }}
                className={`hover:text-rosebud-600 transition-colors pb-1 ${
                  currentView === 'shop' && selectedCategory === 'Baggettes'
                    ? 'border-b-2 border-ink-900 font-bold'
                    : 'text-ink-700'
                }`}
              >
                Baggettes
              </button>
              <button
                onClick={() => {
                  onNavigateHome();
                  onSelectCategory('Ribbon & Bow Editions');
                }}
                className={`hover:text-rosebud-600 transition-colors pb-1 flex items-center gap-1 ${
                  currentView === 'shop' && selectedCategory === 'Ribbon & Bow Editions'
                    ? 'border-b-2 border-ink-900 font-bold text-rosebud-600'
                    : 'text-ink-700'
                }`}
              >
                <span>Ribbons</span>
                <span className="text-[10px]">🎀</span>
              </button>
              <button
                onClick={onOpenLookbook}
                className="text-ink-700 hover:text-rosebud-600 transition-colors pb-1"
              >
                Lookbook
              </button>
            </div>

            {/* Center Brand Logo (Sandy Liang style) */}
            <div
              className="text-center cursor-pointer select-none flex-1 lg:flex-initial"
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
            >
              <div className="inline-block group">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <span className="text-xs text-rosebud-400 group-hover:rotate-12 transition-transform inline-block">
                    🎀
                  </span>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-editorial tracking-[0.18em] font-normal uppercase text-ink-900">
                    BAGGETTE
                  </span>
                  <span className="text-xs text-rosebud-400 group-hover:-rotate-12 transition-transform inline-block">
                    🎀
                  </span>
                </div>
                <p className="hidden sm:block text-[9px] font-mono-tag tracking-[0.3em] text-ink-500 uppercase mt-0.5">
                  ACCRA, GHANA • ATELIER DELICATES
                </p>
              </div>
            </div>

            {/* Right Utilities Bar */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Icon */}
              <button
                onClick={onOpenSearch}
                className="p-1.5 text-ink-700 hover:text-ink-900 transition-colors"
                title="Search collection"
                aria-label="Search collection"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Wishlist Icon (Visible on sm+ screens; kept in menu on mobile) */}
              <button
                onClick={onOpenWishlist}
                className="hidden sm:flex relative p-1.5 text-ink-700 hover:text-rosebud-600 transition-colors"
                title="Sweethearts Wishlist"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rosebud-200 text-rosebud-700 text-[10px] font-mono-tag rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Desktop Account / Admin Buttons */}
              <div className="hidden lg:flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <button
                        onClick={onOpenAdmin}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono-tag tracking-wider border transition-all ${
                          currentView === 'admin'
                            ? 'bg-ink-900 text-cream-50 border-ink-900 shadow-sm'
                            : 'bg-rosebud-100 text-rosebud-700 border-rosebud-300 hover:bg-rosebud-200'
                        } rounded-sm`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ADMIN</span>
                      </button>
                    )}
                    <button
                      onClick={onOpenAccount}
                      className={`flex items-center gap-1.5 p-1.5 text-ink-700 hover:text-ink-900 transition-colors ${
                        currentView === 'account' ? 'text-rosebud-600 font-bold' : ''
                      }`}
                    >
                      <User className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-xs font-mono-tag truncate max-w-[85px]">
                        {user.full_name?.split(' ')[0] || 'Account'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="text-xs font-mono-tag tracking-wider text-ink-700 hover:text-ink-900 border border-ink-200 px-3 py-1 rounded-sm hover:border-ink-400 transition-all"
                  >
                    SIGN IN
                  </button>
                )}
              </div>

              {/* Shopping Bag Drawer Button */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-1 sm:gap-1.5 bg-ink-900 text-cream-50 px-2.5 sm:px-3.5 py-1.5 rounded-sm hover:bg-ink-800 transition-colors"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                <span className="font-mono-tag text-xs tracking-wider hidden xs:inline">BAG</span>
                <span className="w-4 h-4 bg-rosebud-400 text-ink-900 rounded-full text-[10px] font-bold flex items-center justify-center font-mono-tag">
                  {itemCount}
                </span>
              </button>
            </div>
          </div>

          {/* Secondary Category Submenu (Horizontal swipeable on mobile) */}
          {currentView === 'shop' && (
            <div className="py-2 flex items-center space-x-3 sm:space-x-8 overflow-x-auto border-t border-ink-100/60 no-scrollbar text-[11px] sm:text-xs font-mono-tag tracking-wider uppercase">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`whitespace-nowrap pb-1 transition-all flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'text-ink-900 border-b-2 border-ink-900 font-bold'
                      : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  {cat === 'Ribbon & Bow Editions' ? '🎀 Ribbons & Bows' : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* MOBILE SLIDING MENU DRAWER (Sleek Sandy Liang inspired drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-cream-50 shadow-2xl border-r border-ink-200 flex flex-col justify-between overflow-y-auto animate-fade-in z-10">
            <div>
              {/* Drawer Top */}
              <div className="p-5 border-b border-ink-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎀</span>
                  <span className="font-editorial text-lg tracking-widest text-ink-900 uppercase">
                    BAGGETTE SHOP
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-ink-500 hover:text-ink-900"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* User / Auth Card inside Mobile Menu */}
              <div className="p-4 bg-cream-100/70 border-b border-ink-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rosebud-100 border border-rosebud-300 flex items-center justify-center font-editorial font-bold text-rosebud-700 text-sm">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink-900 line-clamp-1">{user.full_name}</p>
                          <p className="text-[10px] font-mono-tag text-ink-500 line-clamp-1">{user.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <span className="text-[9px] font-mono-tag bg-ink-900 text-cream-50 px-2 py-0.5 rounded-sm">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            onOpenAdmin();
                            setMobileMenuOpen(false);
                          }}
                          className="flex-1 py-1.5 bg-ink-900 text-cream-50 text-[11px] font-mono-tag uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Portal</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onOpenAccount();
                          setMobileMenuOpen(false);
                        }}
                        className="flex-1 py-1.5 border border-ink-300 bg-white text-ink-800 text-[11px] font-mono-tag uppercase tracking-wider rounded-sm hover:border-ink-500"
                      >
                        My Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-mono-tag text-ink-600">
                      Welcome to Baggette Shop 🎀
                    </p>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2 bg-ink-900 text-cream-50 text-xs font-mono-tag uppercase tracking-widest rounded-sm hover:bg-rosebud-600 transition-colors"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <div className="py-4 px-5 space-y-1 text-xs font-mono-tag tracking-wider uppercase">
                <div className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2 px-1">
                  Catalog Silhouettes
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleSelectCatMobile(cat)}
                    className={`w-full text-left py-2 px-2.5 rounded-sm flex items-center justify-between transition-colors ${
                      currentView === 'shop' && selectedCategory === cat
                        ? 'bg-rosebud-100 text-rosebud-800 font-bold'
                        : 'text-ink-700 hover:bg-cream-100'
                    }`}
                  >
                    <span>{cat === 'Ribbon & Bow Editions' ? '🎀 Ribbons & Bows' : cat}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                ))}

                <div className="pt-4 mt-3 border-t border-ink-200">
                  <div className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2 px-1">
                    Editorial & Collections
                  </div>
                  <button
                    onClick={() => {
                      onOpenLookbook();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-2.5 rounded-sm text-ink-700 hover:bg-cream-100 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>SS26 Lookbook</span>
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-rosebud-400" />
                  </button>

                  <button
                    onClick={() => {
                      onOpenWishlist();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-2.5 rounded-sm text-ink-700 hover:bg-cream-100 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>Sweethearts Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="bg-rosebud-200 text-rosebud-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                          {wishlistCount}
                        </span>
                      )}
                    </span>
                    <Heart className="w-3.5 h-3.5 text-rosebud-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Info */}
            <div className="p-5 border-t border-ink-200 bg-cream-100/50 text-[11px] font-mono-tag text-ink-500 space-y-2">
              <div className="flex items-center justify-between">
                <span>Osu Atelier, Accra, Ghana</span>
                <span>🎀 SS26</span>
              </div>
              {user && (
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-1.5 text-left text-ink-500 hover:text-rosebud-700 underline"
                >
                  Sign Out ({user.email})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
