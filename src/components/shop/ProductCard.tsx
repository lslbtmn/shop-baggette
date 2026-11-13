import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const isSoldOut = product.stock_quantity === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSoldOut) {
      addItem(product, selectedColor, 1);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col relative"
    >
      {/* Image Container with Hover Crossfade */}
      <div className="relative aspect-[3/4] w-full bg-cream-100 overflow-hidden border border-ink-200/80 rounded-sm">
        {/* Primary Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            isHovered && product.images[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />

        {/* Secondary Editorial Image on Hover */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} editorial look`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Tags / Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className={`text-[9px] font-mono-tag tracking-wider uppercase px-2 py-0.5 rounded-sm ${
                tag.includes('RIBBON') || tag.includes('SWEETHEART')
                  ? 'bg-rosebud-100/90 text-rosebud-800 border border-rosebud-200 backdrop-blur-xs'
                  : 'bg-ink-900/80 text-cream-50 backdrop-blur-xs'
              }`}
            >
              {tag.includes('RIBBON') ? '🎀 ' : ''}
              {tag}
            </span>
          ))}
          {isSoldOut && (
            <span className="text-[9px] font-mono-tag tracking-wider uppercase px-2 py-0.5 bg-ink-900 text-cream-50">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleHeartClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorited
              ? 'bg-rosebud-50 text-rosebud-600 scale-110 shadow-sm'
              : 'bg-cream-50/70 text-ink-600 hover:text-rosebud-600 hover:bg-cream-50'
          }`}
          title="Add to Sweetheart Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isFavorited ? 'fill-rosebud-500 text-rosebud-500 stroke-[1.5]' : 'stroke-[1.5]'
            }`}
          />
        </button>

        {/* Quick Actions Hover Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-ink-900/60 via-ink-900/30 to-transparent transition-all duration-300 flex items-center justify-between gap-2 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            className="flex-1 bg-cream-50 text-ink-900 py-2 text-[11px] font-mono-tag uppercase tracking-wider font-semibold rounded-sm hover:bg-rosebud-100 hover:text-rosebud-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isSoldOut ? 'Sold Out' : 'Quick Add'}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="p-2 bg-cream-50/90 text-ink-800 rounded-sm hover:bg-cream-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="pt-3 pb-1 flex flex-col flex-1">
        {/* Category & Stock */}
        <div className="flex justify-between items-center text-[10px] font-mono-tag text-ink-400 tracking-wider uppercase mb-1">
          <span>{product.category}</span>
          {product.stock_quantity < 5 && !isSoldOut && (
            <span className="text-rosebud-600 font-medium">Only {product.stock_quantity} left</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-editorial text-sm font-medium text-ink-900 group-hover:text-rosebud-700 transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price & Compare */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-mono-tag text-xs font-bold text-ink-900">
            ${product.price}
          </span>
          {product.compare_at_price && (
            <span className="font-mono-tag text-xs text-ink-400 line-through">
              ${product.compare_at_price}
            </span>
          )}
        </div>

        {/* Color Swatch Dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  selectedColor.name === color.name
                    ? 'ring-1 ring-ink-900 ring-offset-1 scale-110'
                    : 'border-ink-300 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={`${color.name} ${!color.inStock ? '(Waitlist)' : ''}`}
              />
            ))}
            <span className="text-[10px] font-mono-tag text-ink-400 ml-1">
              {product.colors.length} {product.colors.length === 1 ? 'color' : 'colors'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
