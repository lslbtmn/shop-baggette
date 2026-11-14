import React, { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-cream-100 border-t border-ink-200 mt-14 sm:mt-20 pt-10 sm:pt-16 pb-10 text-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Newsletter Box */}
          <div className="md:col-span-2 pr-0 md:pr-8">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <span className="text-sm">🎀</span>
              <span className="font-editorial text-lg sm:text-xl italic font-medium">Love Notes & Archive Dispatches</span>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 mb-3 sm:mb-4 font-light leading-relaxed">
              Sign up to receive sweet dispatches from our Accra atelier, private salon previews, restock alerts, and limited edition bow charms.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-700 bg-green-50 border border-green-200 px-3.5 py-2 sm:py-2.5 rounded-sm font-mono-tag">
                <Check className="w-4 h-4" />
                <span>You are on our secret sweetheart list! 🎀</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for secret drops..."
                  className="flex-1 bg-cream-50 border border-ink-300 px-3 py-2 text-xs font-mono-tag tracking-wider focus:outline-none focus:border-ink-900 transition-colors rounded-sm"
                />
                <button
                  type="submit"
                  className="bg-ink-900 text-cream-50 px-5 py-2 text-xs font-mono-tag tracking-widest hover:bg-rosebud-600 transition-colors whitespace-nowrap rounded-sm"
                >
                  JOIN
                </button>
              </form>
            )}
            <p className="text-[10px] sm:text-[11px] text-ink-400 mt-2 font-mono-tag">
              *Never spam. Unsubscribe with one click anytime.
            </p>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-[11px] sm:text-xs font-mono-tag uppercase tracking-widest text-ink-900 font-bold mb-3 sm:mb-4">
              Care & Inquiries
            </h4>
            <ul className="space-y-2 text-xs text-ink-600 font-mono-tag">
              <li>
                <a href="#shipping" className="hover:text-rosebud-600 transition-colors">
                  Messenger & Worldwide Shipping
                </a>
              </li>
              <li>
                <a href="#care" className="hover:text-rosebud-600 transition-colors">
                  Duchess Satin & Leather Care
                </a>
              </li>
              <li>
                <a href="#repairs" className="hover:text-rosebud-600 transition-colors">
                  Ribbon Re-Tying & Hardware
                </a>
              </li>
              <li>
                <a href="#stockists" className="hover:text-rosebud-600 transition-colors">
                  Accra Atelier & Stockists
                </a>
              </li>
              <li>
                <a href="#returns" className="hover:text-rosebud-600 transition-colors">
                  14-Day Exchanges
                </a>
              </li>
            </ul>
          </div>

          {/* Studio & Info */}
          <div>
            <h4 className="text-[11px] sm:text-xs font-mono-tag uppercase tracking-widest text-ink-900 font-bold mb-3 sm:mb-4">
              Baggette Studio
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed font-light mb-3">
              Designed on Oxford Street in Osu, Accra. Built for city walkers, gallery loafers, and sweet souls who keep mints, lip gloss and poetry in small satin bags.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-tag text-ink-500">
              <Sparkles className="w-3.5 h-3.5 text-rosebud-400" />
              <span>Crafted in limited small-batch editions</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-6 sm:pt-8 border-t border-ink-200 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] font-mono-tag text-ink-500 gap-3">
          <div className="flex items-center gap-2 text-center">
            <span>© 2026 BAGGETTE SHOP ACCRA.</span>
            <span>•</span>
            <span>Built By <a href="https://instagram.com/lslbtmn">Leslie</a></span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hover:text-ink-800 transition-colors cursor-pointer">PRIVACY</span>
            <span className="hover:text-ink-800 transition-colors cursor-pointer">TERMS</span>
            <span className="hover:text-ink-800 transition-colors cursor-pointer">ACCESSIBILITY</span>
            <span className="text-rosebud-500">🎀</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
