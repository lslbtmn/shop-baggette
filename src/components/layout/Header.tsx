import React from 'react';
import { Search, Heart, ShoppingBag, User, ShieldCheck } from 'lucide-react';
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
  const { user, isAdmin } = useAuth();

  const categories: ProductCategory[] = [
    'All',
    'Baggettes',
    'Minis & Pouches',
    'Totes & Shoulders',
    'Ribbon & Bow Editions',
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-ink-100 transition-all">
      {/* Top Editorial Ticker */}
      <div className="bg-ink-900 text-cream-100 text-[11px] font-mono-tag tracking-wider py-1.5 overflow-hidden border-b border-ink-800">
        <div className="animate-ticker">
          <span className="mx-6">🎀 BAGGETTE SHOP • LOWER EAST SIDE NYC</span>
          <span className="mx-6">• COMPLIMENTARY MESSENGER SHIPPING OVER $250</span>
          <span className="mx-6">🎀 SS26 DELICATE UTILITY DROP AVAILABLE NOW</span>
          <span className="mx-6">• HANDCRAFTED DUCHESS SATIN & NAPPA LEATHERS</span>
          <span className="mx-6">🎀 BAGGETTE SHOP • LOWER EAST SIDE NYC</span>
          <span className="mx-6">• COMPLIMENTARY MESSENGER SHIPPING OVER $250</span>
          <span className="mx-6">🎀 SS26 DELICATE UTILITY DROP AVAILABLE NOW</span>
        </div>
      </div>

      {/* Main Brand & Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Action / Navigation */}
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

          {/* Center Brand Identity (Sandy Liang inspired logo) */}
          <div className="flex-1 lg:flex-initial text-center cursor-pointer" onClick={onNavigateHome}>
            <div className="inline-block group">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-rosebud-400 group-hover:rotate-12 transition-transform inline-block">🎀</span>
                <span className="text-2xl sm:text-3xl font-editorial tracking-[0.2em] font-normal uppercase text-ink-900">
                  BAGGETTE
                </span>
                <span className="text-xs text-rosebud-400 group-hover:-rotate-12 transition-transform inline-block">🎀</span>
              </div>
              <p className="text-[9px] font-mono-tag tracking-[0.35em] text-ink-500 uppercase mt-0.5">
                NEW YORK • SANDY LIANG INSPIRED
              </p>
            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 text-ink-700 hover:text-ink-900 transition-colors"
              title="Search collection"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-1.5 text-ink-700 hover:text-rosebud-600 transition-colors"
              title="Sweethearts Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rosebud-200 text-rosebud-700 text-[10px] font-mono-tag rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Account / Admin Switch */}
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin ? (
                  <button
                    onClick={onOpenAdmin}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono-tag tracking-wider border transition-all ${
                      currentView === 'admin'
                        ? 'bg-ink-900 text-cream-50 border-ink-900 shadow-sm'
                        : 'bg-rosebud-100 text-rosebud-700 border-rosebud-300 hover:bg-rosebud-200'
                    } rounded-sm`}
                    title="Open Admin Dashboard"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ADMIN</span>
                  </button>
                ) : null}

                <button
                  onClick={onOpenAccount}
                  className={`flex items-center gap-1.5 p-1.5 text-ink-700 hover:text-ink-900 transition-colors ${
                    currentView === 'account' ? 'text-rosebud-600 font-bold' : ''
                  }`}
                  title="My Account"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                  <span className="hidden sm:inline text-xs font-mono-tag truncate max-w-[90px]">
                    {user.full_name.split(' ')[0]}
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

            {/* Shopping Bag Drawer Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 bg-ink-900 text-cream-50 px-3.5 py-1.5 rounded-sm hover:bg-ink-800 transition-colors group"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span className="font-mono-tag text-xs tracking-wider">BAG</span>
              <span className="w-4 h-4 bg-rosebud-400 text-ink-900 rounded-full text-[10px] font-bold flex items-center justify-center font-mono-tag">
                {itemCount}
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Category Submenu (Mobile & Desktop quick filters) */}
        {currentView === 'shop' && (
          <div className="py-2.5 flex items-center space-x-4 sm:space-x-8 overflow-x-auto border-t border-ink-100/60 no-scrollbar text-xs font-mono-tag tracking-wider uppercase">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap pb-1 transition-all ${
                  selectedCategory === cat
                    ? 'text-ink-900 border-b border-ink-900 font-bold'
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
  );
};
