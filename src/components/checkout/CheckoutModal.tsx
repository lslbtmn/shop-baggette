import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, MapPin, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../lib/supabase';
import { Order, ShippingAddress } from '../../types';

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
  const { user, updateUserProfile } = useAuth();

  const [email, setEmail] = useState(user?.email || 'shopper@baggette.com.gh');
  const [name, setName] = useState(user?.full_name || 'Ama Mensah');
  const [phone, setPhone] = useState(user?.phone || user?.shipping_address?.phone || '+233 24 123 4567');
  const [address, setAddress] = useState(user?.shipping_address?.address || '14 Ring Road Central, Osu');
  const [city, setCity] = useState(user?.shipping_address?.city || 'Accra');
  const [region, setRegion] = useState(user?.shipping_address?.state || 'Greater Accra');
  const [digitalCode, setDigitalCode] = useState(user?.shipping_address?.zip || 'GA-042-8821');
  const [country, setCountry] = useState(user?.shipping_address?.country || 'Ghana');
  const [saveToProfile, setSaveToProfile] = useState(true);

  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('888');

  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      if (user.full_name) setName(user.full_name);
      if (user.phone) setPhone(user.phone);
      if (user.shipping_address) {
        setAddress(user.shipping_address.address);
        setCity(user.shipping_address.city);
        setRegion(user.shipping_address.state);
        setDigitalCode(user.shipping_address.zip);
        setCountry(user.shipping_address.country);
        if (user.shipping_address.phone) setPhone(user.shipping_address.phone);
      }
    }
  }, [user]);

  if (!isOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderId = 'BGT-' + Math.floor(1000 + Math.random() * 9000);
      const tracking = 'BGT-ACCRA-' + Math.floor(100000 + Math.random() * 900000);

      const shippingObj: ShippingAddress = {
        address,
        city,
        state: region,
        zip: digitalCode,
        country,
        phone,
      };

      const newOrder: Order = {
        id: orderId,
        user_id: user?.id,
        customer_email: email,
        customer_name: name,
        shipping_address: shippingObj,
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

      // If requested, save this address to profile
      if (saveToProfile && user) {
        updateUserProfile({
          full_name: name,
          phone,
          shipping_address: shippingObj,
        });
      }

      // Confetti celebration
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
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8 flex items-end sm:items-center justify-center">
        <div className="relative bg-cream-50 w-full max-w-3xl border border-ink-200 shadow-2xl rounded-t-lg sm:rounded-sm p-5 sm:p-10 z-10 animate-fade-in my-auto max-h-[92vh] overflow-y-auto">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-ink-400 hover:text-ink-900 p-1"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>

          {confirmedOrder ? (
            /* Order Success View */
            <div className="text-center py-4 sm:py-6 space-y-4 sm:space-y-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rosebud-100 text-rosebud-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                🎀
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[10px] sm:text-xs font-mono-tag uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-sm">
                  Order Successfully Placed
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-ink-900 mt-2">
                  Medaase, {confirmedOrder.customer_name}!
                </h2>
                <p className="text-xs font-mono-tag text-ink-600 max-w-md mx-auto">
                  We are hand-wrapping your baguettes in our signature candy-pink dustbag tied with double grosgrain ribbons at our Accra atelier.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="bg-cream-100/70 border border-ink-200 rounded-sm p-4 sm:p-6 max-w-md mx-auto text-left text-xs font-mono-tag space-y-2.5">
                <div className="flex justify-between border-b border-ink-200 pb-2">
                  <span className="text-ink-500">Order Reference:</span>
                  <span className="font-bold text-ink-900">{confirmedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 pb-2">
                  <span className="text-ink-500">Fulfillment Status:</span>
                  <span className="text-rosebud-700 font-bold">{confirmedOrder.status} 🎀</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 pb-2">
                  <span className="text-ink-500">Rider / Tracking Code:</span>
                  <span className="text-ink-900 truncate max-w-[170px]">{confirmedOrder.tracking_number}</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 pb-2">
                  <span className="text-ink-500">Delivery Destination:</span>
                  <span className="text-ink-900 font-medium">{confirmedOrder.shipping_address.city}, {confirmedOrder.shipping_address.state}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-ink-500">Total Charged:</span>
                  <span className="font-bold text-ink-900">${confirmedOrder.total} USD</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-4">
                <button
                  onClick={onClose}
                  className="bg-ink-900 text-cream-50 px-6 sm:px-8 py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:bg-rosebud-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <div>
              <div className="border-b border-ink-200 pb-3 mb-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">🎀</span>
                  <span className="text-[10px] sm:text-xs font-mono-tag uppercase tracking-[0.25em] text-ink-500">
                    Secure Checkout • Accra Dispatch
                  </span>
                </div>
                <h2 className="font-editorial text-xl sm:text-2xl text-ink-900">
                  Deliver to Your Doorstep
                </h2>
              </div>

              <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
                {/* Form fields */}
                <div className="md:col-span-7 space-y-4 sm:space-y-5">
                  <div>
                    <h3 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold mb-2">
                      1. Contact & Recipient
                    </h3>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                            Phone (Dispatch Rider Updates)
                          </label>
                          <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+233 24 123 4567"
                            className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-ink-100">
                    <h3 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold mb-2">
                      2. Delivery Address (Ghana or Worldwide)
                    </h3>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                          Street / House / Landmark Address
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 14 Ring Road Central, near Danquah Circle"
                          className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                            City / Area
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Osu, Accra"
                            className="w-full bg-cream-100 border border-ink-300 px-2.5 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                            Region
                          </label>
                          <input
                            type="text"
                            required
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            placeholder="e.g. Greater Accra"
                            className="w-full bg-cream-100 border border-ink-300 px-2.5 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase text-ink-500 mb-1">
                            Digital Address
                          </label>
                          <input
                            type="text"
                            value={digitalCode}
                            onChange={(e) => setDigitalCode(e.target.value)}
                            placeholder="GA-042-8821"
                            className="w-full bg-cream-100 border border-ink-300 px-2.5 py-1.5 sm:py-2 text-xs font-mono-tag rounded-sm focus:outline-none focus:border-ink-900 uppercase"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveToProfile}
                          onChange={(e) => setSaveToProfile(e.target.checked)}
                          className="accent-ink-900 rounded-sm"
                        />
                        <label htmlFor="saveAddress" className="text-[11px] font-mono-tag text-ink-600 cursor-pointer">
                          Save this shipping address to my profile
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-ink-100">
                    <h3 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold mb-2">
                      3. Payment Simulation (Cards & Mobile Money)
                    </h3>
                    <div className="bg-cream-100 p-3 border border-ink-200 rounded-sm space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono-tag text-ink-700">
                        <span>Card / MoMo Simulator</span>
                        <span className="text-[10px] text-ink-400">Encrypted Sandbox</span>
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
                <div className="md:col-span-5 bg-cream-100/80 p-4 sm:p-5 border border-ink-200 rounded-sm flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="text-xs font-mono-tag uppercase tracking-wider text-ink-900 font-bold mb-2.5 border-b border-ink-200 pb-2">
                      Order Breakdown ({items.length} items)
                    </h4>
                    <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs">
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="w-9 h-11 object-cover rounded-sm bg-white border border-ink-200 flex-shrink-0"
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

                    <div className="border-t border-ink-200 mt-3 pt-2.5 space-y-1 text-xs font-mono-tag text-ink-600">
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
                      <div className="border-t border-ink-200 pt-1.5 flex justify-between font-bold text-sm text-ink-900">
                        <span>Total</span>
                        <span>${total} USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      disabled={loading || items.length === 0}
                      className="w-full bg-ink-900 text-cream-50 py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:bg-rosebud-600 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
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
                      *Hand-wrapped in our signature pink dustbag with bows in Accra.
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
