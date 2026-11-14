import React, { useState, useMemo } from 'react';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4">
      <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-cream-50 w-full max-w-2xl border border-ink-200 shadow-2xl rounded-sm overflow-hidden z-10 animate-fade-in max-h-[85vh] flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-ink-200 flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-ink-500 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bag name, bow, pleats..."
            className="flex-1 bg-transparent text-xs sm:text-sm font-mono-tag focus:outline-none placeholder:text-ink-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[10px] sm:text-xs font-mono-tag text-ink-400 hover:text-ink-800"
            >
              CLEAR
            </button>
          )}
          <button onClick={onClose} className="p-1 text-ink-400 hover:text-ink-900 flex-shrink-0">
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Results / Quick Suggestions */}
        <div className="overflow-y-auto p-3 sm:p-4 flex-1">
          {query.trim() === '' ? (
            <div>
              <p className="text-[10px] sm:text-[11px] font-mono-tag tracking-wider text-ink-400 uppercase mb-2">
                Suggested Searches
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5">
                {['Bacio Satin Bow', 'Pleated Baggette', 'Gingham Tote', 'Puffer Cloud'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-[11px] sm:text-xs font-mono-tag px-2.5 py-1 bg-cream-100 hover:bg-rosebud-100 border border-ink-200 text-ink-700 rounded-sm transition-colors"
                  >
                    🎀 {tag}
                  </button>
                ))}
              </div>

              <p className="text-[10px] sm:text-[11px] font-mono-tag tracking-wider text-ink-400 uppercase mb-2">
                Featured Baggettes
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {products.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex gap-2.5 p-2 border border-ink-100 hover:border-ink-300 rounded-sm cursor-pointer group bg-white/40"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-14 object-cover rounded-sm bg-cream-100 flex-shrink-0"
                    />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-xs font-editorial truncate group-hover:text-rosebud-600">
                        {product.name}
                      </h4>
                      <p className="text-[11px] font-mono-tag text-ink-500 mt-1">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="font-editorial text-ink-800 text-sm sm:text-base">No baggettes found</p>
              <p className="text-xs font-mono-tag text-ink-500 mt-1">
                Try searching for "satin", "bow", "leather", or "tote"
              </p>
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              <p className="text-[10px] sm:text-[11px] font-mono-tag tracking-wider text-ink-400 uppercase mb-2">
                {filteredProducts.length} results found
              </p>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="py-2.5 sm:py-3 flex items-center justify-between hover:bg-cream-100/60 px-2 rounded-sm cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-12 sm:w-12 sm:h-14 object-cover rounded-sm bg-cream-100 border border-ink-100 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs sm:text-sm font-editorial text-ink-900 group-hover:text-rosebud-600 transition-colors truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-[11px] font-mono-tag">
                        <span className="text-ink-500 truncate">{product.category}</span>
                        <span className="font-bold text-ink-900">${product.price}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
