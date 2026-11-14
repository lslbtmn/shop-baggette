import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { LOOKBOOK_STORIES } from '../../lib/mockData';
import { Product } from '../../types';

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-ink-900/70 backdrop-blur-xs" onClick={onClose} />

      <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8 flex items-end sm:items-center justify-center">
        <div className="relative bg-cream-50 w-full max-w-5xl border border-ink-200 shadow-2xl rounded-t-lg sm:rounded-sm p-4 sm:p-8 lg:p-10 z-10 animate-fade-in my-auto max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-ink-200 pb-4 sm:pb-6 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-rosebud-500">🎀</span>
                <span className="text-[10px] sm:text-xs font-mono-tag uppercase tracking-[0.25em] text-ink-500">
                  SS26 Editorial Lookbook
                </span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-ink-900">
                Accra Atelier Roamings
              </h2>
              <p className="text-[11px] sm:text-xs font-mono-tag text-ink-600 mt-1 max-w-lg">
                Photographed on 35mm film across Osu, Jamestown, and Labone.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-400 hover:text-ink-900 rounded-full hover:bg-cream-100 transition-colors"
              aria-label="Close lookbook"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
            </button>
          </div>

          {/* Stories Grid */}
          <div className="space-y-10 sm:space-y-16">
            {LOOKBOOK_STORIES.map((story, index) => {
              const matchedProduct = products.find((p) => p.id === story.featuredProductId);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={story.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center ${
                    isEven ? '' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Photo with vintage polaroid border */}
                  <div
                    className={`md:col-span-7 bg-white p-2 sm:p-3 border border-ink-200 shadow-sm rounded-sm ${
                      isEven ? 'order-1' : 'order-1 md:order-2'
                    }`}
                  >
                    <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-cream-100 relative">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-ink-900/80 text-cream-50 text-[9px] sm:text-[10px] font-mono-tag px-2 py-0.5 rounded-sm">
                        📍 {story.location}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 text-[9px] sm:text-[10px] font-mono-tag text-ink-400 uppercase tracking-widest">
                      <span>{story.season}</span>
                      <span>35mm print</span>
                    </div>
                  </div>

                  {/* Editorial Text & Product Tag */}
                  <div
                    className={`md:col-span-5 space-y-3 sm:space-y-4 ${
                      isEven ? 'order-2' : 'order-2 md:order-1'
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-mono-tag text-rosebud-600 font-bold uppercase tracking-wider">
                      Look 0{index + 1}
                    </span>
                    <h3 className="font-editorial text-xl sm:text-2xl text-ink-900 leading-snug">
                      {story.title}
                    </h3>
                    <blockquote className="font-editorial italic text-ink-600 text-xs sm:text-sm leading-relaxed border-l-2 border-rosebud-300 pl-3 sm:pl-4">
                      {story.quote}
                    </blockquote>

                    {matchedProduct && (
                      <div className="pt-3 border-t border-ink-100">
                        <div className="text-[9px] sm:text-[10px] font-mono-tag text-ink-400 uppercase tracking-wider mb-1.5">
                          Featured in this look
                        </div>
                        <div
                          onClick={() => {
                            onSelectProduct(matchedProduct);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 sm:p-3 bg-cream-100/70 border border-ink-200 hover:border-ink-400 rounded-sm cursor-pointer group transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={matchedProduct.images[0]}
                              alt={matchedProduct.name}
                              className="w-10 h-12 sm:w-12 sm:h-14 object-cover rounded-sm bg-white border border-ink-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-editorial text-xs font-medium text-ink-900 group-hover:text-rosebud-600 transition-colors line-clamp-1">
                                {matchedProduct.name}
                              </p>
                              <p className="font-mono-tag text-xs font-bold text-ink-900 mt-0.5">
                                ${matchedProduct.price}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono-tag text-ink-500 group-hover:text-ink-900 flex items-center gap-1 flex-shrink-0">
                            <span>Shop</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer of modal */}
          <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-ink-200 text-center">
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-ink-900 text-cream-50 px-8 py-2.5 sm:py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:bg-rosebud-600 transition-colors"
            >
              Back to Bag Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
