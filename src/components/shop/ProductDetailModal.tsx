import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ShieldCheck, Truck, ChevronDown, ChevronUp, Sparkles, Check } from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const isSoldOut = product.stock_quantity === 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem(product, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
        <div className="relative bg-cream-50 w-full max-w-4xl border border-ink-200 shadow-2xl rounded-sm p-6 sm:p-10 text-left z-10 animate-fade-in my-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-ink-500 hover:text-ink-900 p-1.5 rounded-full hover:bg-cream-100 transition-colors"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[3/4] w-full bg-cream-100 border border-ink-200 rounded-sm overflow-hidden relative">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />

                {/* Badge */}
                {product.tags.length > 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono-tag tracking-wider uppercase px-2.5 py-1 bg-ink-900/80 text-cream-50 rounded-sm backdrop-blur-xs">
                      🎀 {product.tags[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-20 flex-shrink-0 border rounded-sm overflow-hidden transition-all ${
                        selectedImage === idx
                          ? 'border-ink-900 ring-1 ring-ink-900 scale-95'
                          : 'border-ink-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info & Actions */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category & Serial */}
                <div className="flex items-center justify-between text-[11px] font-mono-tag text-ink-500 tracking-wider uppercase mb-2">
                  <span>{product.category}</span>
                  <span>ID: {product.id}</span>
                </div>

                {/* Title */}
                <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-ink-900 leading-tight">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="font-mono-tag text-lg font-bold text-ink-900">
                    ${product.price} USD
                  </span>
                  {product.compare_at_price && (
                    <span className="font-mono-tag text-sm text-ink-400 line-through">
                      ${product.compare_at_price}
                    </span>
                  )}
                  {product.stock_quantity > 0 && product.stock_quantity < 5 && (
                    <span className="text-xs font-mono-tag text-rosebud-600 bg-rosebud-50 border border-rosebud-200 px-2 py-0.5 rounded-sm">
                      Low stock: {product.stock_quantity} left
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-light mt-4">
                  {product.description}
                </p>

                {/* Color Selector */}
                <div className="mt-6 pt-5 border-t border-ink-100">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-mono-tag uppercase tracking-wider text-ink-600">
                      Colorway: <strong>{selectedColor.name}</strong>
                    </span>
                    {!selectedColor.inStock && (
                      <span className="text-[11px] font-mono-tag text-rosebud-600">Backorder</span>
                    )}
                  </div>
                  <div className="flex gap-2.5">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all text-xs font-mono-tag ${
                          selectedColor.name === color.name
                            ? 'border-ink-900 bg-cream-100 font-bold'
                            : 'border-ink-200 hover:border-ink-400 bg-white/40'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-ink-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-ink-300 rounded-sm bg-cream-100 w-28 justify-between px-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 text-ink-600 hover:text-ink-900 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono-tag font-bold text-ink-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 text-ink-600 hover:text-ink-900 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className={`flex-1 py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                      addedAnimation
                        ? 'bg-emerald-600 text-white'
                        : isSoldOut
                        ? 'bg-ink-200 text-ink-400 cursor-not-allowed'
                        : 'bg-ink-900 text-cream-50 hover:bg-rosebud-600'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag! 🎀</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
                      </>
                    )}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 border rounded-sm transition-colors flex items-center justify-center ${
                      isFavorited
                        ? 'border-rosebud-300 bg-rosebud-50 text-rosebud-600'
                        : 'border-ink-300 hover:border-ink-500 text-ink-700'
                    }`}
                    title="Save to Sweethearts"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorited ? 'fill-rosebud-500 text-rosebud-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Perks Bar */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-ink-100 text-[11px] font-mono-tag text-ink-600">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-ink-400" />
                    <span>Free messenger delivery $250+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rosebud-400" />
                    <span>Signature pink bow dustbag</span>
                  </div>
                </div>
              </div>

              {/* Accordions */}
              <div className="mt-8 border-t border-ink-200 divide-y divide-ink-100 text-xs font-mono-tag">
                {/* Details Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('details')}
                    className="w-full py-3 flex justify-between items-center text-ink-800 hover:text-ink-900 uppercase tracking-wider font-semibold"
                  >
                    <span>Details & Dimensions</span>
                    {activeAccordion === 'details' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {activeAccordion === 'details' && (
                    <div className="pb-4 text-ink-600 space-y-2 leading-relaxed">
                      <p>
                        <strong>Dimensions:</strong> {product.dimensions}
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        {product.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Materials & Care Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('materials')}
                    className="w-full py-3 flex justify-between items-center text-ink-800 hover:text-ink-900 uppercase tracking-wider font-semibold"
                  >
                    <span>Materials & Care</span>
                    {activeAccordion === 'materials' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {activeAccordion === 'materials' && (
                    <div className="pb-4 text-ink-600 space-y-2 leading-relaxed">
                      <p>
                        <strong>Composition:</strong> {product.materials}
                      </p>
                      <p>
                        <strong>Care:</strong> {product.care}
                      </p>
                    </div>
                  )}
                </div>

                {/* Packaging Note */}
                <div>
                  <button
                    onClick={() => toggleAccordion('packaging')}
                    className="w-full py-3 flex justify-between items-center text-ink-800 hover:text-ink-900 uppercase tracking-wider font-semibold"
                  >
                    <span>Packaging & Gift Notes 🎀</span>
                    {activeAccordion === 'packaging' && (
                      <ChevronUp className="w-4 h-4" />
                    )}
                    {activeAccordion !== 'packaging' && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {activeAccordion === 'packaging' && (
                    <div className="pb-4 text-ink-600 leading-relaxed">
                      Every bag arrives in our collectible candy-pink cotton dustbag tied with an oversized hand-finished satin bow, accompanied by an archival postcard from our Lower East Side studio.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
