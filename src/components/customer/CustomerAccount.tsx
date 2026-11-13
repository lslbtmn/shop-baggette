import React from 'react';
import { User, Package, Heart, LogOut, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Product, Order } from '../../types';

interface CustomerAccountProps {
  orders: Order[];
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onNavigateShop: () => void;
  onOpenAdmin: () => void;
}

export const CustomerAccount: React.FC<CustomerAccountProps> = ({
  orders,
  products,
  onOpenProduct,
  onNavigateShop,
  onOpenAdmin,
}) => {
  const { user, signOut, isAdmin } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const userOrders = orders.filter(
    (o) => !user?.email || o.customer_email.toLowerCase() === user.email.toLowerCase() || orders.length <= 2
  );

  const favoritedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Profile Banner */}
      <div className="bg-cream-100 border border-ink-200 rounded-sm p-6 sm:p-8 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rosebud-100 border border-rosebud-300 flex items-center justify-center text-2xl text-rosebud-700 font-editorial font-bold shadow-sm">
            {user?.full_name?.charAt(0) || 'B'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl sm:text-3xl text-ink-900 font-normal">
                {user?.full_name || 'Sweetheart Member'}
              </h1>
              {isAdmin && (
                <span className="text-[10px] font-mono-tag bg-ink-900 text-cream-50 px-2 py-0.5 rounded-sm">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs font-mono-tag text-ink-500 mt-1">
              {user?.email || 'shopper@downtown.nyc'} • Joined 2026 Collector Circle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2 bg-ink-900 text-cream-50 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={() => {
              signOut();
              onNavigateShop();
            }}
            className="px-4 py-2 border border-ink-300 text-xs font-mono-tag text-ink-700 hover:text-ink-900 hover:border-ink-500 rounded-sm transition-colors flex items-center gap-1.5 bg-white/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-ink-200 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-ink-700" />
              <h2 className="font-editorial text-xl text-ink-900">Your Orders & Deliveries</h2>
            </div>
            <span className="text-xs font-mono-tag text-ink-500">
              {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-cream-100/50 border border-dashed border-ink-300 p-8 text-center rounded-sm space-y-3">
              <p className="font-editorial text-base text-ink-800">No orders yet</p>
              <p className="text-xs font-mono-tag text-ink-500 max-w-sm mx-auto">
                Once you select your favorite baggette, your tracking updates and ribbon packaging milestones will appear here.
              </p>
              <button
                onClick={onNavigateShop}
                className="mt-2 inline-flex items-center gap-1.5 bg-ink-900 text-cream-50 px-4 py-2 text-xs font-mono-tag uppercase tracking-wider rounded-sm hover:bg-rosebud-600 transition-colors"
              >
                <span>Browse SS26 Drops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            userOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white/60 border border-ink-200 rounded-sm p-5 space-y-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3">
                  <div>
                    <span className="font-mono-tag font-bold text-xs text-ink-900">{order.id}</span>
                    <span className="text-[11px] font-mono-tag text-ink-400 ml-2">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono-tag uppercase tracking-wider px-2.5 py-0.5 rounded-sm font-semibold ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Shipped'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-rosebud-100 text-rosebud-800'
                    }`}
                  >
                    {order.status === 'Delivered' ? 'Delivered 🎀' : `${order.status} 🎀`}
                  </span>
                </div>

                {/* Tracking Milestones Tracker */}
                <div className="bg-cream-100/70 p-3 rounded-sm">
                  <div className="text-[10px] font-mono-tag uppercase tracking-wider text-ink-500 mb-2 flex justify-between">
                    <span>Fulfillment Status</span>
                    <span>Tracking: {order.tracking_number || 'USPS Priority'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono-tag">
                    <div className="bg-ink-900 text-cream-50 py-1 rounded-xs">1. Placed</div>
                    <div className={`py-1 rounded-xs ${order.status !== 'Pending' ? 'bg-ink-900 text-cream-50' : 'bg-ink-200 text-ink-600'}`}>
                      2. Pink Dustbag
                    </div>
                    <div className={`py-1 rounded-xs ${['Shipped', 'Delivered'].includes(order.status) ? 'bg-ink-900 text-cream-50' : 'bg-ink-200 text-ink-600'}`}>
                      3. Dispatched
                    </div>
                    <div className={`py-1 rounded-xs ${order.status === 'Delivered' ? 'bg-emerald-700 text-white' : 'bg-ink-200 text-ink-600'}`}>
                      4. At Stoop
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-ink-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt=""
                          className="w-10 h-12 object-cover rounded-sm bg-cream-100 border border-ink-100"
                        />
                        <div>
                          <p className="font-editorial text-ink-900">{item.product_name}</p>
                          <p className="font-mono-tag text-[10px] text-ink-500">
                            Color: {item.color_name} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono-tag font-bold text-ink-900">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-ink-100 pt-2 flex justify-between text-xs font-mono-tag text-ink-700">
                  <span>Shipping: {order.shipping_address.address}, {order.shipping_address.city}</span>
                  <span className="font-bold text-ink-900">Total: ${order.total} USD</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Wishlist / Sweethearts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-ink-200 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rosebud-600 fill-rosebud-500" />
              <h2 className="font-editorial text-xl text-ink-900">Sweethearts Wishlist</h2>
            </div>
            <span className="text-xs font-mono-tag text-ink-500">
              {favoritedProducts.length} saved
            </span>
          </div>

          {favoritedProducts.length === 0 ? (
            <div className="bg-cream-100/50 border border-dashed border-ink-300 p-8 text-center rounded-sm space-y-2">
              <p className="font-editorial text-base text-ink-800">Your wishlist is empty</p>
              <p className="text-xs font-mono-tag text-ink-500">
                Click the heart on any bag to save it here for later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoritedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/60 border border-ink-200 p-3 rounded-sm flex items-center justify-between gap-3 group hover:border-ink-400 transition-colors"
                >
                  <div
                    onClick={() => onOpenProduct(product)}
                    className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-14 object-cover rounded-sm bg-cream-100 border border-ink-100"
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addItem(product, product.colors[0], 1)}
                      className="text-[10px] font-mono-tag bg-ink-900 text-cream-50 px-2.5 py-1.5 rounded-sm hover:bg-rosebud-600 uppercase tracking-wider transition-colors"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-1.5 text-ink-400 hover:text-rosebud-600 transition-colors"
                      title="Remove from wishlist"
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
    </div>
  );
};
