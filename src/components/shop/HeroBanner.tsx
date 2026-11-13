import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCategory } from '../../types';

interface HeroBannerProps {
  onExplore: () => void;
  onOpenLookbook: () => void;
  onSelectCategory: (cat: ProductCategory) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExplore,
  onOpenLookbook,
  onSelectCategory,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-cream-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text / Editorial Intro */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rosebud-100 text-rosebud-800 text-[11px] font-mono-tag tracking-widest uppercase rounded-full border border-rosebud-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spring/Summer 2026 Collection</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-ink-900 leading-[1.08] tracking-tight">
              Bags that feel like ribbons tied in a hurry.
            </h1>

            <p className="text-sm sm:text-base text-ink-600 leading-relaxed font-light max-w-xl">
              An homage to downtown Manhattan girlhood nostalgia. Heavyweight duchess satins, knife pleats, cloud puffers, and Chinatown gingham, finished with bows and keepsakes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="bg-ink-900 text-cream-50 px-6 py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:bg-rosebud-600 transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Shop Baggettes</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLookbook}
                className="bg-cream-50 text-ink-900 border border-ink-300 px-6 py-3 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:border-ink-900 hover:bg-cream-100 transition-colors"
              >
                View SS26 Lookbook
              </button>
            </div>

            {/* Micro badges */}
            <div className="pt-4 flex items-center gap-6 text-[11px] font-mono-tag text-ink-500 border-t border-ink-200/80">
              <span className="flex items-center gap-1.5">
                <span className="text-rosebud-500">🎀</span> Hand-finished ribbons
              </span>
              <span>•</span>
              <span>Small-batch NYC production</span>
              <span>•</span>
              <span>Supple nappa leathers</span>
            </div>
          </div>

          {/* Right Visual Collage (Sandy Liang style polaroids/editorial cards) */}
          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Photo 1 */}
              <div className="relative group overflow-hidden rounded-sm border border-ink-200 bg-white shadow-md p-2">
                <div className="aspect-[3/4] overflow-hidden bg-cream-200 relative">
                  <img
                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
                    alt="Satin Baggette with Bow"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-2 left-2 bg-cream-50/90 text-ink-900 text-[9px] font-mono-tag px-2 py-0.5 rounded-sm">
                    🎀 BACIO SATIN
                  </div>
                </div>
                <p className="text-[10px] font-mono-tag text-ink-500 mt-2 text-center uppercase tracking-wider">
                  Fig. 01 — Orchard Street
                </p>
              </div>

              {/* Photo 2 (Offset polaroid style) */}
              <div className="relative group overflow-hidden rounded-sm border border-ink-200 bg-white shadow-md p-2 mt-6 sm:mt-8">
                <div className="aspect-[3/4] overflow-hidden bg-cream-200 relative">
                  <img
                    src="https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"
                    alt="Pleated Leather Baggette"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-2 left-2 bg-cream-50/90 text-ink-900 text-[9px] font-mono-tag px-2 py-0.5 rounded-sm">
                    KNIFE PLEATS
                  </div>
                </div>
                <p className="text-[10px] font-mono-tag text-ink-500 mt-2 text-center uppercase tracking-wider">
                  Fig. 02 — Bakery Sidewalk
                </p>
              </div>
            </div>

            {/* Decorative ribbon stamp */}
            <div className="absolute -bottom-4 -left-4 bg-rosebud-50 border border-rosebud-200 p-3 rounded-full shadow-lg hidden sm:block rotate-[-8deg]">
              <span className="text-xl">🎀</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
