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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-cream-50 w-full max-w-2xl border border-ink-200 shadow-2xl rounded-sm overflow-hidden z-10 animate-fade-in">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-ink-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-ink-500" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by bag name, satin bow, leather pleats, tags..."
            className="flex-1 bg-transparent text-sm font-mono-tag focus:outline-none placeholder:text-ink-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-mono-tag text-ink-400 hover:text-ink-800"
            >
              CLEAR
            </button>
          )}
          <button onClick={onClose} className="p-1 text-ink-400 hover:text-ink-900">
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Results / Quick Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div>
              <p className="text-[11px] font-mono-tag tracking-wider text-ink-400 uppercase mb-3">
                Suggested Searches
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Bacio Satin Bow', 'Pleated Baggette', 'Gingham Tote', 'Puffer Cloud', 'Patent Leather'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs font-mono-tag px-3 py-1 bg-cream-100 hover:bg-rosebud-100 border border-ink-200 text-ink-700 rounded-sm transition-colors"
                  >
                    🎀 {tag}
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-mono-tag tracking-wider text-ink-400 uppercase mb-3">
                Featured Baggettes
              </p>
              <div className="grid grid-cols-2 gap-3">
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
                      className="w-12 h-14 object-cover rounded-sm bg-cream-100"
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
            <div className="text-center py-12">
              <p className="font-editorial text-ink-800 text-base">No baggettes found</p>
              <p className="text-xs font-mono-tag text-ink-500 mt-1">
                Try searching for "satin", "bow", "leather", or "tote"
              </p>
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              <p className="text-[11px] font-mono-tag tracking-wider text-ink-400 uppercase mb-2">
                {filteredProducts.length} results found
              </p>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="py-3 flex items-center justify-between hover:bg-cream-100/60 px-2 rounded-sm cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-14 object-cover rounded-sm bg-cream-100 border border-ink-100"
                    />
                    <div>
                      <h4 className="text-sm font-editorial text-ink-900 group-hover:text-rosebud-600 transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono-tag text-ink-500">{product.category}</span>
                        <span className="text-[11px] font-mono-tag font-bold text-ink-900">
                          ${product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
