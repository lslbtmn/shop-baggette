import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    discount,
    total,
    freeShippingThreshold,
    progressToFreeShipping,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (!promoInput.trim()) return;

    const res = applyPromoCode(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoInput('');
    }
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-cream-50 text-ink-900 shadow-2xl flex flex-col border-l border-ink-200">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎀</span>
              <h2 className="text-sm sm:text-base font-editorial uppercase tracking-widest text-ink-900 font-semibold">
                Shopping Bag
              </h2>
              <span className="text-xs font-mono-tag text-ink-500">
                ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-500 hover:text-ink-900 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-rosebud-50/70 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-rosebud-100">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono-tag mb-1.5 text-ink-700">
              {amountNeededForFreeShipping > 0 ? (
                <span className="truncate pr-1">
                  Add <strong className="text-rosebud-700 font-bold">${amountNeededForFreeShipping}</strong> for free delivery 🎀
                </span>
              ) : (
                <span className="text-rosebud-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Free Accra & worldwide delivery unlocked!</span>
                </span>
              )}
              <span className="flex-shrink-0">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-rosebud-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rosebud-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 divide-y divide-ink-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-cream-100 border border-ink-200 flex items-center justify-center text-xl">
                  🎀
                </div>
                <h3 className="font-editorial text-base text-ink-800">Your bag is empty</h3>
                <p className="text-xs text-ink-500 font-mono-tag max-w-xs">
                  Discover our downtown baggettes, satin bows, and soft utility pouches to fill your day.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-ink-900 text-cream-50 text-xs font-mono-tag uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-rosebud-600 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.product.id}-${item.selectedColor.name}-${index}`} className="py-3.5 flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover object-center bg-cream-100 border border-ink-200 rounded-sm flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-editorial text-xs sm:text-sm font-medium text-ink-900 leading-snug line-clamp-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.product.id, item.selectedColor.name)}
                          className="text-ink-400 hover:text-rosebud-600 p-0.5 transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Color indicator */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-ink-300 flex-shrink-0"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <span className="text-[10px] sm:text-[11px] font-mono-tag text-ink-500 truncate">
                          {item.selectedColor.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-ink-200 rounded-sm bg-cream-100">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor.name, -1)}
                          className="px-2 py-0.5 text-ink-600 hover:text-ink-900 text-xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono-tag font-bold text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor.name, 1)}
                          className="px-2 py-0.5 text-ink-600 hover:text-ink-900 text-xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-mono-tag text-xs font-bold text-ink-900">
                        ${item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="border-t border-ink-200 px-4 sm:px-6 py-4 bg-cream-100/70 space-y-3">
              {/* Promo Code Form */}
              <div>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-rosebud-50 border border-rosebud-200 px-3 py-1.5 rounded-sm text-xs font-mono-tag text-rosebud-800">
                    <span className="flex items-center gap-1.5 truncate">
                      <Tag className="w-3.5 h-3.5 text-rosebud-500 flex-shrink-0" />
                      <span>{appliedPromo} (-${discount})</span>
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-ink-400 hover:text-ink-800 text-xs underline ml-2 flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (SANDY10)"
                      className="flex-1 bg-cream-50 border border-ink-300 px-2.5 py-1.5 text-xs font-mono-tag tracking-wider focus:outline-none focus:border-ink-900 uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-ink-800 text-cream-50 px-3 py-1.5 text-xs font-mono-tag hover:bg-ink-900 transition-colors uppercase tracking-wider"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] font-mono-tag text-rosebud-600 mt-1">
                    {promoError}
                  </p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-1 text-xs font-mono-tag text-ink-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-ink-900 font-medium">${subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rosebud-600">
                    <span>Discount</span>
                    <span>-${discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Complimentary 🎀' : `$${shipping}`}</span>
                </div>
                <div className="border-t border-ink-200 pt-1.5 flex justify-between text-xs sm:text-sm font-bold text-ink-900">
                  <span>Estimated Total</span>
                  <span>${total} USD</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="w-full bg-ink-900 text-cream-50 py-3 text-xs font-mono-tag uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-rosebud-600 transition-colors rounded-sm shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-ink-500 font-mono-tag px-1">
                  <span>Includes pink bow dustbag 🎀</span>
                  <button onClick={clearCart} className="hover:text-rosebud-600 underline">
                    Empty Bag
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
