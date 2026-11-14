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
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0] || { name: 'Standard', hex: '#111111', inStock: true });
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
      className="group cursor-pointer flex flex-col relative w-full"
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
          loading="lazy"
        />

        {/* Secondary Editorial Image on Hover */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} editorial angle`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            loading="lazy"
          />
        )}

        {/* Tags / Badges (Offset so they never collide with the wishlist heart) */}
        <div className="absolute top-2 left-2 right-10 flex flex-wrap gap-1 items-start z-10 pointer-events-none">
          {product.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className={`text-[8px] sm:text-[9px] font-mono-tag tracking-wider uppercase px-1.5 py-0.5 rounded-sm line-clamp-1 ${
                tag.includes('RIBBON') || tag.includes('SWEETHEART')
                  ? 'bg-rosebud-100/90 text-rosebud-800 border border-rosebud-200'
                  : 'bg-ink-900/80 text-cream-50'
              }`}
            >
              {tag.includes('RIBBON') ? '🎀 ' : ''}
              {tag}
            </span>
          ))}
          {isSoldOut && (
            <span className="text-[8px] sm:text-[9px] font-mono-tag tracking-wider uppercase px-1.5 py-0.5 bg-ink-900 text-cream-50 rounded-sm">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-xs transition-all z-10 ${
            isFavorited
              ? 'bg-rosebud-50 text-rosebud-600 scale-105 shadow-xs'
              : 'bg-cream-50/80 text-ink-600 hover:text-rosebud-600 hover:bg-cream-50'
          }`}
          title="Add to Sweetheart Wishlist"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
              isFavorited ? 'fill-rosebud-500 text-rosebud-500 stroke-[1.5]' : 'stroke-[1.5]'
            }`}
          />
        </button>

        {/* Desktop Quick Actions Hover Bar */}
        <div
          className={`hidden sm:flex absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-ink-900/70 via-ink-900/30 to-transparent transition-all duration-300 items-center justify-between gap-2 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            className="flex-1 bg-cream-50 text-ink-900 py-1.5 text-[10px] font-mono-tag uppercase tracking-wider font-semibold rounded-sm hover:bg-rosebud-100 hover:text-rosebud-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>{isSoldOut ? 'Sold Out' : 'Quick Add'}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="p-1.5 bg-cream-50/90 text-ink-800 rounded-sm hover:bg-cream-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="pt-2 sm:pt-3 pb-1 flex flex-col flex-1">
        {/* Category & Stock */}
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono-tag text-ink-400 tracking-wider uppercase mb-0.5">
          <span className="truncate pr-1">{product.category}</span>
          {product.stock_quantity < 5 && !isSoldOut && (
            <span className="text-rosebud-600 font-medium whitespace-nowrap">Only {product.stock_quantity} left</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-editorial text-xs sm:text-sm font-medium text-ink-900 group-hover:text-rosebud-700 transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price & Compare */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
          <span className="font-mono-tag text-xs sm:text-sm font-bold text-ink-900">
            ${product.price}
          </span>
          {product.compare_at_price && (
            <span className="font-mono-tag text-[10px] sm:text-xs text-ink-400 line-through">
              ${product.compare_at_price}
            </span>
          )}
        </div>

        {/* Color Swatch Dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
            {product.colors.slice(0, 4).map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-all ${
                  selectedColor.name === color.name
                    ? 'ring-1 ring-ink-900 ring-offset-1 scale-110'
                    : 'border-ink-300 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] font-mono-tag text-ink-400">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Mobile Quick Add Button */}
        <div className="sm:hidden mt-2 pt-1 border-t border-ink-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            className="w-full py-1 text-[10px] font-mono-tag uppercase tracking-wider bg-cream-100 hover:bg-rosebud-100 text-ink-800 rounded-xs flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <ShoppingBag className="w-2.5 h-2.5" />
            <span>{isSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
