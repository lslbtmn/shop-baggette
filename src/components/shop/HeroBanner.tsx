import React, { useState } from 'react';
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductCategory } from '../../types';

interface HeroBannerProps {
  onExplore: () => void;
  onOpenLookbook: () => void;
  onSelectCategory: (cat: ProductCategory) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExplore,
  onOpenLookbook,
}) => {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-cream-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text / Editorial Intro */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 bg-rosebud-100 text-rosebud-800 text-[10px] sm:text-[11px] font-mono-tag tracking-widest uppercase rounded-full border border-rosebud-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spring/Summer 2026 Collection</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-ink-900 leading-[1.12] sm:leading-[1.08] tracking-tight">
              Bags that feel like ribbons tied in a hurry.
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-ink-600 leading-relaxed font-light max-w-xl">
              An homage to downtown Manhattan girlhood nostalgia. Heavyweight duchess satins, knife pleats, cloud puffers, and Chinatown gingham, finished with bows and keepsakes.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={onExplore}
                className="bg-ink-900 text-cream-50 px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:bg-rosebud-600 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Shop Baggettes</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLookbook}
                className="bg-cream-50 text-ink-900 border border-ink-300 px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:border-ink-900 hover:bg-cream-100 transition-colors text-center"
              >
                View SS26 Lookbook
              </button>
            </div>

            {/* Collapsible Studio Notes Toggler on Mobile */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setNotesOpen(!notesOpen)}
                className="text-[11px] font-mono-tag text-ink-500 hover:text-ink-900 flex items-center gap-1.5 transition-colors sm:hidden"
              >
                <span>{notesOpen ? 'Hide Studio Notes' : 'Read Curatorial Notes'}</span>
                {notesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <div className={`${notesOpen ? 'block' : 'hidden'} sm:block pt-3 border-t border-ink-200/80 mt-2`}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-[10px] sm:text-[11px] font-mono-tag text-ink-500">
                  <span className="flex items-center gap-1">
                    <span className="text-rosebud-500">🎀</span> Hand-finished ribbons
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>Small-batch NYC production</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Italian duchess satins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Collage */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Photo 1 */}
              <div className="relative group overflow-hidden rounded-sm border border-ink-200 bg-white shadow-sm p-1.5 sm:p-2">
                <div className="aspect-[3/4] overflow-hidden bg-cream-200 relative">
                  <img
                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
                    alt="Satin Baggette with Bow"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-cream-50/95 text-ink-900 text-[8px] sm:text-[9px] font-mono-tag px-1.5 py-0.5 rounded-sm">
                    🎀 BACIO SATIN
                  </div>
                </div>
                <p className="text-[9px] sm:text-[10px] font-mono-tag text-ink-500 mt-1.5 text-center uppercase tracking-wider truncate">
                  Fig. 01 — Orchard St
                </p>
              </div>

              {/* Photo 2 */}
              <div className="relative group overflow-hidden rounded-sm border border-ink-200 bg-white shadow-sm p-1.5 sm:p-2 sm:mt-6">
                <div className="aspect-[3/4] overflow-hidden bg-cream-200 relative">
                  <img
                    src="https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"
                    alt="Pleated Leather Baggette"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-cream-50/95 text-ink-900 text-[8px] sm:text-[9px] font-mono-tag px-1.5 py-0.5 rounded-sm">
                    KNIFE PLEATS
                  </div>
                </div>
                <p className="text-[9px] sm:text-[10px] font-mono-tag text-ink-500 mt-1.5 text-center uppercase tracking-wider truncate">
                  Fig. 02 — Bakery Walk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
