import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isSupabaseLive: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  demoAdminLogin: () => void;
  demoCustomerLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'baggette_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isSupabaseLive = isSupabaseConfigured();

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Check if real Supabase is configured
      if (isSupabaseLive) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile for role
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const role = profile?.role || (session.user.email?.includes('admin') ? 'admin' : 'customer');

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Valued Shopper',
              role: role,
              created_at: session.user.created_at,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session check failed, checking local store:', err);
        }
      }

      // Check LocalStorage session (fallback or demo mode)
      try {
        const stored = localStorage.getItem(LOCAL_USER_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load local user:', err);
      }

      setLoading(false);
    };

    initAuth();

    // Setup Supabase auth listener if enabled
    if (isSupabaseLive) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const role = profile?.role || (session.user.email?.includes('admin') ? 'admin' : 'customer');

          const loggedInUser: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Valued Shopper',
            role: role,
            created_at: session.user.created_at,
          };
          setUser(loggedInUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(loggedInUser));
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_USER_KEY);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isSupabaseLive]);

  // Sign In with email & password
  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    if (isSupabaseLive && password) {
      try {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error: error.message };

        if (data.user) {
          const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
          const newUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role,
          };
          setUser(newUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
        }
        return {};
      } catch (e: any) {
        return { error: e.message || 'Supabase authentication failed' };
      }
    }

    // Local / Offline Sign In
    const role: 'admin' | 'customer' = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
    const fallbackUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      full_name: email.split('@')[0].replace('.', ' '),
      role,
      created_at: new Date().toISOString(),
    };
    setUser(fallbackUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));
    return {};
  };

  // Sign Up
  const signUp = async (email: string, password?: string, fullName?: string): Promise<{ error?: string }> => {
    if (isSupabaseLive && password) {
      try {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || 'Valued Shopper' },
          },
        });
        if (error) return { error: error.message };

        if (data.user) {
          const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
          // Try to create profile row in Supabase
          try {
            await supabase.from('profiles').insert([
              {
                id: data.user.id,
                email: email,
                full_name: fullName || email.split('@')[0],
                role: role,
              },
            ]);
          } catch (profileErr) {
            console.warn('Profile insert note:', profileErr);
          }

          const newUser: UserProfile = {
            id: data.user.id,
            email: email,
            full_name: fullName || email.split('@')[0],
            role,
          };
          setUser(newUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
        }
        return {};
      } catch (e: any) {
        return { error: e.message || 'Registration failed' };
      }
    }

    // Local / Demo Sign Up
    const role: 'admin' | 'customer' = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
    const localUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      full_name: fullName || email.split('@')[0],
      role,
      created_at: new Date().toISOString(),
    };
    setUser(localUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    return {};
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseLive) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase sign out error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  // 1-Click Demo Logins
  const demoAdminLogin = () => {
    const adminUser: UserProfile = {
      id: 'admin-demo-99',
      email: 'admin@baggetteshop.info',
      full_name: 'Sandy L. (Admin Director)',
      role: 'admin',
      created_at: '2026-01-01T00:00:00Z',
    };
    setUser(adminUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(adminUser));
  };

  const demoCustomerLogin = () => {
    const customerUser: UserProfile = {
      id: 'cust-demo-12',
      email: 'leslie.shopper@nyc.org',
      full_name: 'Leslie V.',
      role: 'customer',
      created_at: '2026-02-14T10:00:00Z',
    };
    setUser(customerUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(customerUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        loading,
        isSupabaseLive,
        signIn,
        signUp,
        signOut,
        demoAdminLogin,
        demoCustomerLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
