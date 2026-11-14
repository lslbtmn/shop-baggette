import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isSupabaseLive: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  demoAdminLogin: () => void;
  demoCustomerLogin: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'baggette_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isSupabaseLive = isSupabaseConfigured();

  const fetchProfileAndSetUser = async (sessionUser: any) => {
    const client = getSupabaseClient();
    try {
      // 1. Try to fetch existing profile
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      const userEmail = sessionUser.email || '';
      const fallbackRole: 'admin' | 'customer' = userEmail.toLowerCase().includes('admin') || sessionUser.user_metadata?.role === 'admin' ? 'admin' : 'customer';
      const role = profile?.role || fallbackRole;
      const fullName = profile?.full_name || sessionUser.user_metadata?.full_name || userEmail.split('@')[0] || 'Valued Shopper';

      // 2. If profile row is missing, create/upsert it so database stays synchronized
      if (!profile) {
        try {
          await client.from('profiles').upsert([
            {
              id: sessionUser.id,
              email: userEmail,
              full_name: fullName,
              role: role,
            },
          ]);
        } catch (insertErr) {
          console.warn('Profile upsert note:', insertErr);
        }
      }

      const loggedInUser: UserProfile = {
        id: sessionUser.id,
        email: userEmail,
        full_name: fullName,
        role: role,
        created_at: sessionUser.created_at || new Date().toISOString(),
      };

      setUser(loggedInUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      console.error('Error fetching/syncing user profile:', err);
      // Fallback
      const fallbackRole: 'admin' | 'customer' = sessionUser.email?.toLowerCase().includes('admin') ? 'admin' : 'customer';
      const fallback: UserProfile = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'Shopper',
        role: fallbackRole,
        created_at: sessionUser.created_at || new Date().toISOString(),
      };
      setUser(fallback);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallback));
      return fallback;
    }
  };

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // 1. Check if real Supabase session exists
      if (isSupabaseConfigured()) {
        try {
          const client = getSupabaseClient();
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            await fetchProfileAndSetUser(session.user);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session check note:', err);
        }
      }

      // 2. Check local storage session (fallback / demo login)
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

    // Setup Supabase auth listener
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchProfileAndSetUser(session.user);
        } else {
          // If explicitly signed out in Supabase, only clear if it was a Supabase user
          const stored = localStorage.getItem(LOCAL_USER_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (!parsed.id?.startsWith('usr_') && !parsed.id?.startsWith('admin-demo') && !parsed.id?.startsWith('cust-demo')) {
              setUser(null);
              localStorage.removeItem(LOCAL_USER_KEY);
            }
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isSupabaseLive]);

  // Sign In with email & password
  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured() && password) {
      const client = getSupabaseClient();
      try {
        const { error, data } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // If email confirmation is required or rate limited, inform the user clearly
          if (error.message.toLowerCase().includes('email not confirmed')) {
            return {
              error: 'Email confirmation required by your Supabase project. (You can turn off "Confirm email" in Supabase Auth -> Providers -> Email settings for instant sign-in).',
            };
          }
          return { error: error.message };
        }

        if (data.user) {
          await fetchProfileAndSetUser(data.user);
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
  const signUp = async (
    email: string,
    password?: string,
    fullName?: string
  ): Promise<{ error?: string; message?: string }> => {
    const cleanEmail = email.trim();
    const cleanName = fullName?.trim() || cleanEmail.split('@')[0];
    const role: 'admin' | 'customer' = cleanEmail.toLowerCase().includes('admin') ? 'admin' : 'customer';

    if (isSupabaseConfigured() && password) {
      const client = getSupabaseClient();
      try {
        const { error, data } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              role: role,
            },
          },
        });

        if (error) {
          // If Supabase rate limit occurs (free tier 3 emails/hr):
          if (error.message.toLowerCase().includes('rate limit')) {
            // Log them in locally so they are NOT blocked!
            const localUser: UserProfile = {
              id: 'usr_' + Math.random().toString(36).substr(2, 9),
              email: cleanEmail,
              full_name: cleanName,
              role,
              created_at: new Date().toISOString(),
            };
            setUser(localUser);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));

            return {
              message: 'Supabase email rate limit reached (free tier). We logged you in locally so you can continue testing! Tip: In Supabase Auth -> Providers -> Email, disable "Confirm email" to avoid email limits.',
            };
          }
          return { error: error.message };
        }

        if (data.user) {
          // If session is immediately available (Confirm Email is disabled in Supabase)
          if (data.session) {
            await fetchProfileAndSetUser(data.user);
            return {};
          } else {
            // Confirm Email is enabled in Supabase project:
            // Sync profile row anyway:
            try {
              await client.from('profiles').upsert([
                {
                  id: data.user.id,
                  email: cleanEmail,
                  full_name: cleanName,
                  role: role,
                },
              ]);
            } catch (pErr) {
              console.warn('Profile sync note:', pErr);
            }

            // Set user in local state so they can use the app immediately!
            const newUser: UserProfile = {
              id: data.user.id,
              email: cleanEmail,
              full_name: cleanName,
              role,
              created_at: data.user.created_at || new Date().toISOString(),
            };
            setUser(newUser);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));

            return {
              message: 'Account created! If Supabase email confirmation is required, please check your inbox or disable "Confirm email" in Supabase Auth settings.',
            };
          }
        }
        return {};
      } catch (e: any) {
        return { error: e.message || 'Registration failed' };
      }
    }

    // Local / Demo Sign Up
    const localUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      full_name: cleanName,
      role,
      created_at: new Date().toISOString(),
    };
    setUser(localUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    return {};
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client.auth.signOut();
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

  const refreshUser = async () => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data: { session } } = await client.auth.getSession();
      if (session?.user) {
        await fetchProfileAndSetUser(session.user);
      }
    }
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
        refreshUser,
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
