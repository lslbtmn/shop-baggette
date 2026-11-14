import React, { useState } from 'react';
import { X, ShieldAlert, Sparkles, KeyRound, UserCheck, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
  onLoginSuccess?: (isAdmin: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signin',
  onLoginSuccess,
}) => {
  const { signIn, signUp, demoAdminLogin, demoCustomerLogin, isSupabaseLive } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          const isAdmin = email.toLowerCase().includes('admin');
          if (onLoginSuccess) onLoginSuccess(isAdmin);
          onClose();
        }
      } else {
        const res = await signUp(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.message) {
          setInfoMsg(res.message);
          const isAdmin = email.toLowerCase().includes('admin');
          if (onLoginSuccess) onLoginSuccess(isAdmin);
        } else {
          const isAdmin = email.toLowerCase().includes('admin');
          if (onLoginSuccess) onLoginSuccess(isAdmin);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    demoAdminLogin();
    if (onLoginSuccess) onLoginSuccess(true);
    onClose();
  };

  const handleDemoCustomer = () => {
    demoCustomerLogin();
    if (onLoginSuccess) onLoginSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-cream-50 w-full max-w-md border border-ink-200 shadow-2xl rounded-sm p-5 sm:p-8 z-10 animate-fade-in my-auto max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-400 hover:text-ink-900 p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">🎀</span>
            <span className="font-editorial text-xl sm:text-2xl tracking-[0.15em] font-normal uppercase text-ink-900">
              BAGGETTE
            </span>
            <span className="text-sm">🎀</span>
          </div>
          <p className="text-[11px] sm:text-xs font-mono-tag text-ink-500 tracking-wider">
            {tab === 'signin' ? 'Sign into your sweetheart account' : 'Join our downtown collective'}
          </p>

          {/* Database mode pill */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tag border bg-cream-100">
            {isSupabaseLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-emerald-700 font-medium">Supabase Database Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-amber-800">Local Sandbox Mode</span>
              </>
            )}
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-ink-200 mb-5 text-xs font-mono-tag tracking-wider uppercase">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 pb-2.5 text-center transition-colors ${
              tab === 'signin'
                ? 'border-b-2 border-ink-900 text-ink-900 font-bold'
                : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 pb-2.5 text-center transition-colors ${
              tab === 'signup'
                ? 'border-b-2 border-ink-900 text-ink-900 font-bold'
                : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rosebud-50 border border-rosebud-200 text-rosebud-800 text-xs font-mono-tag rounded-sm flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rosebud-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Info message */}
        {infoMsg && (
          <div className="mb-4 p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono-tag rounded-sm flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase tracking-wider text-ink-600 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chloe Sevigny"
                className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 text-xs font-mono-tag focus:outline-none focus:border-ink-900 rounded-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase tracking-wider text-ink-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 text-xs font-mono-tag focus:outline-none focus:border-ink-900 rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-[11px] font-mono-tag uppercase tracking-wider text-ink-600 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-cream-100 border border-ink-300 px-3 py-1.5 sm:py-2 text-xs font-mono-tag focus:outline-none focus:border-ink-900 rounded-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-900 text-cream-50 py-2.5 text-xs font-mono-tag uppercase tracking-[0.2em] rounded-sm hover:bg-rosebud-600 transition-colors shadow-2xs disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Quick Instant Test Logins */}
        <div className="mt-5 pt-4 border-t border-ink-200">
          <p className="text-[10px] font-mono-tag uppercase tracking-widest text-ink-400 text-center mb-2.5">
            1-Click Instant Evaluation
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="flex items-center justify-center gap-1.5 p-2 bg-cream-100 hover:bg-rosebud-100 border border-ink-200 hover:border-rosebud-300 rounded-sm text-xs font-mono-tag text-ink-800 transition-colors text-left"
            >
              <KeyRound className="w-3.5 h-3.5 text-rosebud-600 flex-shrink-0" />
              <span>Admin Director</span>
            </button>
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="flex items-center justify-center gap-1.5 p-2 bg-cream-100 hover:bg-cream-200 border border-ink-200 rounded-sm text-xs font-mono-tag text-ink-800 transition-colors text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-ink-600 flex-shrink-0" />
              <span>Shopper Account</span>
            </button>
          </div>
          <p className="text-[10px] font-mono-tag text-ink-400 text-center mt-2">
            *Tip: Any email containing "admin" automatically gets admin dashboard access!
          </p>
        </div>
      </div>
    </div>
  );
};
