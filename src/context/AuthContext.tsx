import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ShippingAddress } from '../types';
import { getSupabaseClient, isSupabaseConfigured, dbService } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isSupabaseLive: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  updateUserProfile: (details: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
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
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      const userEmail = sessionUser.email || '';
      const fallbackRole: 'admin' | 'customer' = userEmail.toLowerCase().includes('admin') || sessionUser.user_metadata?.role === 'admin' ? 'admin' : 'customer';
      const role = profile?.role || fallbackRole;
      const fullName = profile?.full_name || sessionUser.user_metadata?.full_name || userEmail.split('@')[0] || 'Valued Shopper';
      const phone = profile?.phone || sessionUser.user_metadata?.phone;
      const shipping_address = profile?.shipping_address || sessionUser.user_metadata?.shipping_address;

      if (!profile) {
        try {
          await client.from('profiles').upsert([
            {
              id: sessionUser.id,
              email: userEmail,
              full_name: fullName,
              role: role,
              phone: phone,
              shipping_address: shipping_address,
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
        phone: phone,
        role: role,
        shipping_address: shipping_address,
        created_at: sessionUser.created_at || new Date().toISOString(),
      };

      setUser(loggedInUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      console.error('Error fetching/syncing user profile:', err);
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

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchProfileAndSetUser(session.user);
        } else {
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
          if (error.message.toLowerCase().includes('email not confirmed')) {
            return {
              error: 'Email confirmation required by your Supabase project. (Disable "Confirm email" in Supabase Auth -> Providers -> Email for instant sign-in).',
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
      email: email.trim(),
      full_name: email.split('@')[0].replace('.', ' '),
      role,
      shipping_address: {
        address: '14 Ring Road Central, Osu',
        city: 'Accra',
        state: 'Greater Accra',
        zip: 'GA-042-8821',
        country: 'Ghana',
        phone: '+233 24 123 4567'
      },
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
          if (error.message.toLowerCase().includes('rate limit')) {
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
              message: 'Supabase email limit reached. Logged in locally! (Disable "Confirm email" in Supabase to bypass email limits).',
            };
          }
          return { error: error.message };
        }

        if (data.user) {
          if (data.session) {
            await fetchProfileAndSetUser(data.user);
            return {};
          } else {
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
              message: 'Account created! Please check your email or disable "Confirm email" in Supabase Auth.',
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
      shipping_address: {
        address: '14 Ring Road Central, Osu',
        city: 'Accra',
        state: 'Greater Accra',
        zip: 'GA-042-8821',
        country: 'Ghana',
        phone: '+233 24 123 4567'
      },
      created_at: new Date().toISOString(),
    };
    setUser(localUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    return {};
  };

  // Update Profile Details (Full Name, Phone, Shipping Address)
  const updateUserProfile = async (details: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user signed in' };

    const updatedUser: UserProfile = {
      ...user,
      ...details,
      shipping_address: details.shipping_address ? { ...user.shipping_address, ...details.shipping_address } : user.shipping_address,
    };

    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));

    // Sync to Supabase
    const res = await dbService.updateProfile(user.id, details);
    return res;
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

  // 1-Click Demo Logins (Ghanaian Identity)
  const demoAdminLogin = () => {
    const adminUser: UserProfile = {
      id: 'admin-demo-99',
      email: 'admin@baggette.com.gh',
      full_name: 'Akua Mensah (Admin Director)',
      phone: '+233 24 555 0199',
      role: 'admin',
      shipping_address: {
        address: '8 Oxford Street, Osu',
        city: 'Accra',
        state: 'Greater Accra',
        zip: 'GA-031-1044',
        country: 'Ghana',
        phone: '+233 24 555 0199'
      },
      created_at: '2026-01-01T00:00:00Z',
    };
    setUser(adminUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(adminUser));
  };

  const demoCustomerLogin = () => {
    const customerUser: UserProfile = {
      id: 'cust-demo-12',
      email: 'ama.boateng@baggette.com',
      full_name: 'Ama Boateng',
      phone: '+233 50 123 9988',
      role: 'customer',
      shipping_address: {
        address: '22 Boundary Road, East Legon',
        city: 'Accra',
        state: 'Greater Accra',
        zip: 'GA-183-9021',
        country: 'Ghana',
        phone: '+233 50 123 9988'
      },
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
        updateUserProfile,
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
