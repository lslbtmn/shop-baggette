import React, { useState } from 'react';
import { Package, Heart, LogOut, ArrowRight, ShieldCheck, MapPin, Edit3, X, Check, Trash2, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Product, Order, ShippingAddress } from '../../types';
import { dbService } from '../../lib/supabase';

interface CustomerAccountProps {
  orders: Order[];
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onNavigateShop: () => void;
  onOpenAdmin: () => void;
  onRefreshOrders?: () => Promise<void>;
}

export const CustomerAccount: React.FC<CustomerAccountProps> = ({
  orders,
  products,
  onOpenProduct,
  onNavigateShop,
  onOpenAdmin,
  onRefreshOrders,
}) => {
  const { user, signOut, isAdmin, updateUserProfile } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [mobileTab, setMobileTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');

  // Edit Profile / Address Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(user?.full_name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || user?.shipping_address?.phone || '+233 24 123 4567');
  const [streetInput, setStreetInput] = useState(user?.shipping_address?.address || '14 Ring Road Central, Osu');
  const [cityInput, setCityInput] = useState(user?.shipping_address?.city || 'Accra');
  const [regionInput, setRegionInput] = useState(user?.shipping_address?.state || 'Greater Accra');
  const [digitalCodeInput, setDigitalCodeInput] = useState(user?.shipping_address?.zip || 'GA-042-8821');
  const [countryInput, setCountryInput] = useState(user?.shipping_address?.country || 'Ghana');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [orderActionMsg, setOrderActionMsg] = useState<string | null>(null);

  const userOrders = orders.filter(
    (o) => !user?.email || o.customer_email.toLowerCase() === user.email.toLowerCase() || orders.length <= 2
  );

  const favoritedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    const shippingAddress: ShippingAddress = {
      address: streetInput,
      city: cityInput,
      state: regionInput,
      zip: digitalCodeInput,
      country: countryInput,
      phone: phoneInput,
    };

    await updateUserProfile({
      full_name: fullNameInput,
      phone: phoneInput,
      shipping_address: shippingAddress,
    });

    setSavingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditProfileOpen(false);
    }, 1500);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order? The reserved baguettes will be restored to stock.')) {
      const res = await dbService.cancelOrder(orderId);
      if (res.success) {
        setOrderActionMsg(`Order #${orderId} has been cancelled.`);
        if (onRefreshOrders) await onRefreshOrders();
        setTimeout(() => setOrderActionMsg(null), 4000);
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to permanently delete this order record from your account?')) {
      const res = await dbService.deleteOrder(orderId);
      if (res.success) {
        setOrderActionMsg(`Order #${orderId} was removed from your history.`);
        if (onRefreshOrders) await onRefreshOrders();
        setTimeout(() => setOrderActionMsg(null), 4000);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Profile Banner */}
      <div className="bg-cream-100 border border-ink-200 rounded-sm p-4 sm:p-8 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-rosebud-100 border border-rosebud-300 flex items-center justify-center text-xl sm:text-2xl text-rosebud-700 font-editorial font-bold shadow-2xs flex-shrink-0">
            {user?.full_name?.charAt(0) || 'B'}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-xl sm:text-2xl lg:text-3xl text-ink-900 font-normal truncate">
                {user?.full_name || 'Sweetheart Member'}
              </h1>
              {isAdmin && (
                <span className="text-[9px] sm:text-[10px] font-mono-tag bg-ink-900 text-cream-50 px-2 py-0.5 rounded-sm">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs font-mono-tag text-ink-500 truncate mt-0.5">
              {user?.email || 'shopper@baggette.com.gh'} • Baggette Accra Circle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink-200">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 sm:py-2 border border-ink-300 text-xs font-mono-tag text-ink-800 hover:text-ink-900 hover:border-ink-500 rounded-sm transition-colors flex items-center justify-center gap-1.5 bg-white/70"
          >
            <Edit3 className="w-3.5 h-3.5 text-rosebud-600" />
            <span>Edit Details</span>
          </button>

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 sm:py-2 bg-ink-900 text-cream-50 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          )}

          <button
            onClick={() => {
              signOut();
              onNavigateShop();
            }}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 sm:py-2 border border-ink-300 text-xs font-mono-tag text-ink-700 hover:text-ink-900 hover:border-ink-500 rounded-sm transition-colors flex items-center justify-center gap-1.5 bg-white/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {orderActionMsg && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono-tag rounded-sm flex items-center justify-between">
          <span>🎀 {orderActionMsg}</span>
          <button onClick={() => setOrderActionMsg(null)} className="font-bold text-emerald-700">
            ×
          </button>
        </div>
      )}

      {/* Address Card Preview */}
      <div className="bg-white/80 border border-ink-200 p-4 sm:p-5 rounded-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-rosebud-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-mono-tag">
            <span className="font-bold text-ink-900 block mb-0.5">
              Default Delivery Address (Prefills at Checkout)
            </span>
            <p className="text-ink-700">
              {user?.shipping_address?.address || '14 Ring Road Central, Osu'},{' '}
              {user?.shipping_address?.city || 'Accra'},{' '}
              {user?.shipping_address?.state || 'Greater Accra'} •{' '}
              {user?.shipping_address?.zip || 'GA-042-8821'}, {user?.shipping_address?.country || 'Ghana'}
            </p>
            {user?.phone && (
              <p className="text-ink-500 mt-0.5">Contact Phone: {user.phone}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="text-xs font-mono-tag text-rosebud-600 hover:text-rosebud-800 underline self-start sm:self-auto"
        >
          Change Shipping Details
        </button>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden border-b border-ink-200 mb-6 text-xs font-mono-tag uppercase tracking-wider">
        <button
          onClick={() => setMobileTab('orders')}
          className={`flex-1 pb-2.5 text-center transition-colors ${
            mobileTab === 'orders'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-400'
          }`}
        >
          Orders ({userOrders.length})
        </button>
        <button
          onClick={() => setMobileTab('wishlist')}
          className={`flex-1 pb-2.5 text-center transition-colors ${
            mobileTab === 'wishlist'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-400'
          }`}
        >
          Wishlist ({favoritedProducts.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Recent Orders with Cancel & Delete actions */}
        <div className={`lg:col-span-7 space-y-4 sm:space-y-6 ${mobileTab === 'orders' ? 'block' : 'hidden sm:block'}`}>
          <div className="flex items-center justify-between border-b border-ink-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-ink-700" />
              <h2 className="font-editorial text-lg sm:text-xl text-ink-900">Your Orders & Deliveries</h2>
            </div>
            <span className="text-xs font-mono-tag text-ink-500">
              {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-cream-100/50 border border-dashed border-ink-300 p-6 sm:p-8 text-center rounded-sm space-y-2.5">
              <p className="font-editorial text-base text-ink-800">No orders placed yet</p>
              <p className="text-xs font-mono-tag text-ink-500 max-w-sm mx-auto">
                Once you select your favorite baggette, your tracking updates and packaging milestones will appear here.
              </p>
              <button
                onClick={onNavigateShop}
                className="mt-2 inline-flex items-center gap-1.5 bg-ink-900 text-cream-50 px-4 py-2 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors"
              >
                <span>Browse SS26 Bags</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            userOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white/70 border border-ink-200 rounded-sm p-4 sm:p-5 space-y-3.5 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-2.5">
                  <div>
                    <span className="font-mono-tag font-bold text-xs text-ink-900">{order.id}</span>
                    <span className="text-[10px] sm:text-[11px] font-mono-tag text-ink-400 ml-2">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono-tag uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Shipped'
                        ? 'bg-sky-100 text-sky-800'
                        : order.status === 'Cancelled'
                        ? 'bg-ink-200 text-ink-700'
                        : 'bg-rosebud-100 text-rosebud-800'
                    }`}
                  >
                    {order.status === 'Cancelled' ? 'Cancelled' : `${order.status} 🎀`}
                  </span>
                </div>

                {/* Tracking Milestones Tracker */}
                {order.status !== 'Cancelled' ? (
                  <div className="bg-cream-100/70 p-2.5 sm:p-3 rounded-sm">
                    <div className="text-[9px] sm:text-[10px] font-mono-tag uppercase tracking-wider text-ink-500 mb-2 flex justify-between">
                      <span>Fulfillment Status</span>
                      <span className="truncate max-w-[170px]">Rider Tracking: {order.tracking_number || 'Accra Dispatch Rider'}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-center text-[9px] sm:text-[10px] font-mono-tag">
                      <div className="bg-ink-900 text-cream-50 py-1 rounded-2xs">1. Placed</div>
                      <div className={`py-1 rounded-2xs ${order.status !== 'Pending' ? 'bg-ink-900 text-cream-50' : 'bg-ink-200 text-ink-600'}`}>
                        2. Pink Dustbag
                      </div>
                      <div className={`py-1 rounded-2xs ${['Shipped', 'Delivered'].includes(order.status) ? 'bg-ink-900 text-cream-50' : 'bg-ink-200 text-ink-600'}`}>
                        3. Dispatched
                      </div>
                      <div className={`py-1 rounded-2xs ${order.status === 'Delivered' ? 'bg-emerald-700 text-white' : 'bg-ink-200 text-ink-600'}`}>
                        4. Delivered
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-ink-100 p-2 rounded-sm text-[11px] font-mono-tag text-ink-600">
                    This order was cancelled. Reserved silhouettes were restored to catalog inventory.
                  </div>
                )}

                {/* Items */}
                <div className="divide-y divide-ink-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={item.image}
                          alt=""
                          className="w-9 h-11 object-cover rounded-sm bg-cream-100 border border-ink-100 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="font-editorial text-ink-900 truncate">{item.product_name}</p>
                          <p className="font-mono-tag text-[10px] text-ink-500">
                            {item.color_name} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono-tag font-bold text-ink-900 whitespace-nowrap">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total & Action Buttons (Cancel / Delete) */}
                <div className="border-t border-ink-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-tag">
                  <div>
                    <span className="text-ink-600">To: {order.shipping_address.address}, {order.shipping_address.city}</span>
                    <span className="font-bold text-ink-900 ml-2">Total: ${order.total} USD</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 sm:pt-0">
                    {/* Cancel Order Button */}
                    {['Pending', 'Processing'].includes(order.status) && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-2.5 py-1 text-[11px] font-mono-tag border border-rosebud-300 text-rosebud-700 hover:bg-rosebud-50 rounded-xs flex items-center gap-1 transition-colors"
                        title="Cancel this order"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    {/* Delete Order Record Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-2.5 py-1 text-[11px] font-mono-tag border border-ink-200 text-ink-500 hover:text-ink-900 hover:bg-cream-100 rounded-xs flex items-center gap-1 transition-colors"
                      title="Delete order record"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Wishlist */}
        <div className={`lg:col-span-5 space-y-4 sm:space-y-6 ${mobileTab === 'wishlist' ? 'block' : 'hidden sm:block'}`}>
          <div className="flex items-center justify-between border-b border-ink-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rosebud-600 fill-rosebud-500" />
              <h2 className="font-editorial text-lg sm:text-xl text-ink-900">Sweethearts Wishlist</h2>
            </div>
            <span className="text-xs font-mono-tag text-ink-500">
              {favoritedProducts.length} saved
            </span>
          </div>

          {favoritedProducts.length === 0 ? (
            <div className="bg-cream-100/50 border border-dashed border-ink-300 p-6 sm:p-8 text-center rounded-sm space-y-2">
              <p className="font-editorial text-base text-ink-800">Your wishlist is empty</p>
              <p className="text-xs font-mono-tag text-ink-500">
                Click the heart on any bag to save it here for later.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {favoritedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/70 border border-ink-200 p-2.5 sm:p-3 rounded-sm flex items-center justify-between gap-2.5 group hover:border-ink-400 transition-colors"
                >
                  <div
                    onClick={() => onOpenProduct(product)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1 overflow-hidden"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-12 object-cover rounded-sm bg-cream-100 border border-ink-100 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-editorial text-xs text-ink-900 truncate group-hover:text-rosebud-600">
                        {product.name}
                      </h4>
                      <p className="font-mono-tag text-xs font-bold text-ink-900 mt-0.5">
                        ${product.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => addItem(product, product.colors[0], 1)}
                      className="text-[9px] sm:text-[10px] font-mono-tag bg-ink-900 text-cream-50 px-2 py-1 rounded-xs hover:bg-rosebud-600 uppercase tracking-wider transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-1 text-ink-400 hover:text-rosebud-600 transition-colors"
                      title="Remove"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rosebud-500 text-rosebud-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE & SHIPPING ADDRESS MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs"
            onClick={() => setIsEditProfileOpen(false)}
          />

          <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8 flex items-end sm:items-center justify-center">
            <div className="relative bg-cream-50 w-full max-w-lg border border-ink-200 shadow-2xl rounded-t-lg sm:rounded-sm p-5 sm:p-8 z-10 animate-fade-in my-auto max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-ink-200 pb-3 mb-4">
                <div>
                  <h3 className="font-editorial text-xl text-ink-900">
                    Edit Account & Shipping Address
                  </h3>
                  <p className="text-[11px] font-mono-tag text-ink-500">
                    Saved details will prefill all your future checkouts
                  </p>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-1 text-ink-400 hover:text-ink-900"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono-tag rounded-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile and shipping details updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs font-mono-tag">
                <div>
                  <label className="block uppercase text-ink-600 mb-1 text-[10px]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="e.g. Ama Mensah"
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                  />
                </div>

                <div>
                  <label className="block uppercase text-ink-600 mb-1 text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. +233 24 123 4567"
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                  />
                </div>

                <div>
                  <label className="block uppercase text-ink-600 mb-1 text-[10px]">Street / House / Landmark Address</label>
                  <input
                    type="text"
                    required
                    value={streetInput}
                    onChange={(e) => setStreetInput(e.target.value)}
                    placeholder="e.g. 14 Ring Road Central, near Danquah Circle"
                    className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1 text-[10px]">City / Area</label>
                    <input
                      type="text"
                      required
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="e.g. Osu, Accra"
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-ink-600 mb-1 text-[10px]">Region</label>
                    <select
                      value={regionInput}
                      onChange={(e) => setRegionInput(e.target.value)}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    >
                      <option value="Greater Accra">Greater Accra</option>
                      <option value="Ashanti">Ashanti</option>
                      <option value="Central">Central</option>
                      <option value="Western">Western</option>
                      <option value="Eastern">Eastern</option>
                      <option value="Volta">Volta</option>
                      <option value="Northern">Northern</option>
                      <option value="Other">Other Region / International</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-ink-600 mb-1 text-[10px]">Ghana Post Digital Address</label>
                    <input
                      type="text"
                      value={digitalCodeInput}
                      onChange={(e) => setDigitalCodeInput(e.target.value)}
                      placeholder="e.g. GA-042-8821"
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-ink-600 mb-1 text-[10px]">Country</label>
                    <input
                      type="text"
                      required
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value)}
                      className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 rounded-sm focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-ink-200 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="px-4 py-2 border border-ink-300 rounded-sm hover:bg-cream-100 uppercase text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-ink-900 text-cream-50 px-5 py-2 rounded-sm hover:bg-rosebud-600 transition-colors uppercase tracking-wider text-xs disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving...' : 'Save Details'}
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
