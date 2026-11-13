import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, ArrowRight, Truck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../lib/supabase';
import { Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderComplete,
}) => {
  const { items, subtotal, shipping, discount, total, clearCart } = useCart();
  const { user } = useAuth();

  const [email, setEmail] = useState(user?.email || 'shopper@downtown.nyc');
  const [name, setName] = useState(user?.full_name || 'Chloe S.');
  const [address, setAddress] = useState('142 Orchard St, Apt 4B');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [zip, setZip] = useState('10002');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('888');

  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderId = 'BGT-' + Math.floor(1000 + Math.random() * 9000);
      const tracking = 'BGT-USPS-' + Math.floor(100000000000 + Math.random() * 900000000000);

      const newOrder: Order = {
        id: orderId,
        user_id: user?.id,
        customer_email: email,
        customer_name: name,
        shipping_address: {
          address,
          city,
          state,
          zip,
          country: 'United States',
        },
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          color_name: i.selectedColor.name,
          image: i.product.images[0],
        })),
        subtotal,
        shipping,
        discount,
        total,
        status: 'Processing',
        tracking_number: tracking,
        created_at: new Date().toISOString(),
      };

      // Save to database
      await dbService.createOrder(newOrder);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F8D4D9', '#B0263B', '#141414', '#F4EEE1'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }

      setConfirmedOrder(newOrder);
      clearCart();
      onOrderComplete(newOrder);
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="relative bg-cream-50 w-full max-w-3xl border border-ink-200 shadow-2xl rounded-sm p-6 sm:p-10 z-10 animate-fade-in my-auto">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-ink-400 hover:text-ink-900 p-1"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>

          {confirmedOrder ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-rosebud-100 text-rosebud-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                🎀
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono-tag uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-sm">
                  Order Successfully Placed
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl text-ink-900 mt-2">
                  Thank you for your order, {confirmedOrder.customer_name}!
                </h2>
                <p className="text-xs font-mono-tag text-ink-600 max-w-md mx-auto">
                  We are preparing your bags in our signature candy-pink dustbags tied with double grosgrain ribbons.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="bg-cream-100/70 border border-ink-200 rounded-sm p-6 max-w-md mx-auto text-left text-xs font-mono-tag space-y-3">
                <div className="flex justify-between border-b border-ink-200 pb-2">
                  <span className="text-ink-500">Order Reference:</span>
                  <span className="font-bold text-ink-900">{confirmedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 pb-2">
                  <span className="text-ink-500">Fulfillment Status:</span>
                  <span className="text-rosebud-700 font-bold">{confirmedOrder.status} 🎀</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 pb-2">
                  <span className="text-ink-500">Tracking Code:</span>
                  <span className="text-ink-900">{confirmedOrder.tracking_number}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-ink-500">Total Charged:</span>
                  <span className="font-bold text-ink-900">${confirmedOrder.total} USD</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={onClose}
                  className="bg-ink-900 text-cream-50 px-8 py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:bg-rosebud-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <div>
              <div className="border-b border-ink-200 pb-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🎀</span>
                  <span className="text-xs font-mono-tag uppercase tracking-[0.25em] text-ink-500">
                    Secure Checkout
                  </span>
                </div>
                <h2 className="font-editorial text-2xl sm:text-3xl text-ink-900">
                  Deliver to Your Stoop
                </h2>
              </div>

              <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Form fields */}
                <div className="md:col-span-7 space-y-5">
                  <div>
                    <h3 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold mb-3">
                      1. Contact & Recipient
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-cream-100 border border-ink-300 px-3.5 py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                          Email for Delivery Updates
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-cream-100 border border-ink-300 px-3.5 py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-ink-100">
                    <h3 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold mb-3">
                      2. Delivery Address
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                          Street Address / Apt
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-cream-100 border border-ink-300 px-3.5 py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-cream-100 border border-ink-300 px-3 py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-cream-100 border border-ink-300 px-3 py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                            Zip Code
                          </label>
                          <input
                            type="text"
                            required
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            className="w-full bg-cream-100 border border-ink-300 px-3 py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-ink-100">
                    <h3 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold mb-3">
                      3. Payment Simulation
                    </h3>
                    <div className="bg-cream-100 p-3.5 border border-ink-200 rounded-sm space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono-tag text-ink-700">
                        <span>Card Number</span>
                        <span className="text-[10px] text-ink-400">Encrypted Demo Sandbox</span>
                      </div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-ink-300 px-3 py-1.5 text-xs font-mono-tag rounded-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-white border border-ink-300 px-3 py-1.5 text-xs font-mono-tag rounded-sm"
                        />
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          className="w-full bg-white border border-ink-300 px-3 py-1.5 text-xs font-mono-tag rounded-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Summary */}
                <div className="md:col-span-5 bg-cream-100/80 p-5 border border-ink-200 rounded-sm flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold mb-3 border-b border-ink-200 pb-2">
                      Order Breakdown ({items.length} items)
                    </h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="w-10 h-12 object-cover rounded-sm bg-white border border-ink-200"
                          />
                          <div className="flex-1 overflow-hidden">
                            <p className="font-editorial truncate text-ink-900">{item.product.name}</p>
                            <p className="font-mono-tag text-[10px] text-ink-500">
                              {item.selectedColor.name} • Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-mono-tag font-bold text-ink-900">
                            ${item.product.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-ink-200 mt-4 pt-3 space-y-1.5 text-xs font-mono-tag text-ink-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-ink-900">${subtotal}</span>
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
                      <div className="border-t border-ink-200 pt-2 flex justify-between font-bold text-sm text-ink-900">
                        <span>Total</span>
                        <span>${total} USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading || items.length === 0}
                      className="w-full bg-ink-900 text-cream-50 py-3.5 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:bg-rosebud-600 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <span>Place Baggette Order</span>
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] font-mono-tag text-ink-400 text-center">
                      *Includes custom dustbag, stickers, and ribbon wrapping.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
