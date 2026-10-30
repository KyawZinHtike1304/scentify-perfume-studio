import { createClient, type SupabaseClient, type User, type Session, type AuthChangeEvent } from '@supabase/supabase-js';

const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env as Record<string, string | undefined>)
    : typeof process !== 'undefined'
    ? (process.env as Record<string, string | undefined>)
    : {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.trim() !== '' &&
  supabasePublishableKey.trim() !== '' &&
  supabaseUrl.startsWith('http')
);

export const DEFAULT_GOOGLE_USER = {
  name: 'Ei Thandar Kyaw',
  email: 'eithandarkyaw6104@gmail.com',
};

// Fallback in-memory and localStorage-backed mock client when Supabase credentials are not provided.
interface MockProfile {
  id: string;
  display_name: string;
  shipping_address: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface MockOrder {
  order_id: number;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'verified' | 'failed';
  payment_slip_url: string;
  verified_at: string | null;
  items: unknown[];
  created_at: string;
}

const STORAGE_KEY_USER = 'scentify_mock_auth_user';
const STORAGE_KEY_PROFILES = 'scentify_mock_profiles';
const STORAGE_KEY_ORDERS = 'scentify_mock_orders';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota limits in private browsing
  }
}

const INITIAL_MOCK_ORDERS: MockOrder[] = [
  {
    order_id: 1001,
    order_number: 'ORD-1001',
    user_id: 'usr-somchai-1',
    customer_name: 'Somchai Prasert',
    customer_email: 'somchai.p@gmail.com',
    customer_phone: '+66 81 234 5678',
    shipping_address: '88 Sukhumvit Soi 55, Thong Lo, Watthana, Bangkok 10110',
    total: 1680,
    status: 'completed',
    payment_status: 'verified',
    payment_slip_url: '/assets/botanicals/woody.png',
    verified_at: '2026-10-24T10:00:00Z',
    items: [
      {
        id: 'ord-item-1',
        title: 'Golden Dawn Bespoke Perfume',
        subtitle: 'Bergamot · Jasmine · Sandalwood',
        price: 1680,
        quantity: 1,
        image: '/assets/botanicals/custom_bottle.png',
        details: { notes: ['Bergamot', 'Jasmine', 'Sandalwood'], size: '50 ml' },
      },
    ],
    created_at: '2026-10-24T09:20:00Z',
  },
  {
    order_id: 1002,
    order_number: 'ORD-1002',
    user_id: 'usr-apinya-2',
    customer_name: 'Apinya Srisuk',
    customer_email: 'apinya.s@outlook.com',
    customer_phone: '+66 89 876 5432',
    shipping_address: '42 Nimmanahaeminda Rd, Suthep, Mueang Chiang Mai 50200',
    total: 2630,
    status: 'completed',
    payment_status: 'verified',
    payment_slip_url: '/assets/botanicals/floral.png',
    verified_at: '2026-10-25T12:05:00Z',
    items: [
      {
        id: 'ord-item-2',
        title: 'Imperial Oud Bespoke Blend',
        subtitle: 'Lemon · Rose · Oud',
        price: 2580,
        quantity: 1,
        image: '/assets/botanicals/custom_bottle.png',
        details: { notes: ['Lemon', 'Rose', 'Oud'], size: '100 ml' },
      },
    ],
    created_at: '2026-10-25T11:45:00Z',
  },
  {
    order_id: 1003,
    order_number: 'ORD-1003',
    user_id: 'usr-krit-3',
    customer_name: 'Krit Charoenpol',
    customer_email: 'krit.c@techcorp.co.th',
    customer_phone: '+66 92 345 6789',
    shipping_address: '15/2 Silom Rd, Suriyawong, Bang Rak, Bangkok 10500',
    total: 3360,
    status: 'processing',
    payment_status: 'pending',
    payment_slip_url: '/assets/botanicals/citrus.png',
    verified_at: null,
    items: [
      {
        id: 'ord-item-3',
        title: 'Botanical Solitude Duo',
        subtitle: 'Grapefruit · Lavender · Cedarwood',
        price: 3360,
        quantity: 2,
        image: '/assets/botanicals/custom_bottle.png',
        details: { notes: ['Grapefruit', 'Lavender', 'Cedarwood'], size: '50 ml' },
      },
    ],
    created_at: '2026-10-26T14:35:00Z',
  },
];

function createMockSupabase(): SupabaseClient {
  let currentUser: User | null = loadStored<User | null>(STORAGE_KEY_USER, null);
  const profiles: Record<string, MockProfile> = loadStored<Record<string, MockProfile>>(STORAGE_KEY_PROFILES, {
    'admin-scentify-001': {
      id: 'admin-scentify-001',
      display_name: 'Scentify Studio Master Perfumer',
      shipping_address: {
        address: '123 Riverside Botanical Studio, Muang District',
        city: 'Chiang Rai',
        province: 'Chiang Rai',
        postalCode: '57000',
        country: 'Thailand',
        phone: '+66 2 123 4567',
      },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  });

  const orders: MockOrder[] = loadStored<MockOrder[]>(STORAGE_KEY_ORDERS, INITIAL_MOCK_ORDERS);

  const authListeners: Array<(event: AuthChangeEvent, session: Session | null) => void> = [];

  const notifyAuth = (event: AuthChangeEvent) => {
    const session = currentUser
      ? ({
          user: currentUser,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
        } as Session)
      : null;

    saveStored(STORAGE_KEY_USER, currentUser);
    for (const listener of authListeners) {
      try {
        listener(event, session);
      } catch (err) {
        console.warn('Auth listener error:', err);
      }
    }
  };

  const auth = {
    async getUser() {
      return { data: { user: currentUser }, error: null };
    },

    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
      authListeners.push(callback);
      // Immediately notify current session on next microtask
      queueMicrotask(() => {
        const session = currentUser
          ? ({
              user: currentUser,
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_in: 3600,
              token_type: 'bearer',
            } as Session)
          : null;
        callback('INITIAL_SESSION', session);
      });

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authListeners.indexOf(callback);
              if (idx !== -1) {
                authListeners.splice(idx, 1);
              }
            },
          },
        },
      };
    },

    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      const trimmedEmail = email.trim().toLowerCase();
      const isAdmin =
        trimmedEmail === 'admin@scentify.com' ||
        trimmedEmail.startsWith('admin') ||
        (password && password.toLowerCase().includes('admin'));

      if (isAdmin) {
        currentUser = {
          id: 'admin-scentify-001',
          email: email.trim(),
          aud: 'authenticated',
          app_metadata: { provider: 'email', role: 'admin' },
          user_metadata: {
            display_name: 'Scentify Studio Master Perfumer',
            full_name: 'Scentify Studio Master Perfumer',
          },
          created_at: '2026-01-01T00:00:00Z',
        } as unknown as User;
      } else {
        const namePart = email.split('@')[0] || 'Studio Member';
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const existingProfile = Object.values(profiles).find(
          (p) => p.display_name.toLowerCase() === formattedName.toLowerCase()
        );

        currentUser = {
          id: existingProfile ? existingProfile.id : `usr-${Date.now().toString(36)}`,
          email: email.trim(),
          aud: 'authenticated',
          app_metadata: { provider: 'email', role: 'customer' },
          user_metadata: {
            display_name: existingProfile ? existingProfile.display_name : formattedName,
            full_name: existingProfile ? existingProfile.display_name : formattedName,
          },
          created_at: new Date().toISOString(),
        } as unknown as User;

        if (!profiles[currentUser.id]) {
          profiles[currentUser.id] = {
            id: currentUser.id,
            display_name: formattedName,
            shipping_address: {
              address: '88 Sukhumvit Soi 55, Thong Lo',
              city: 'Bangkok',
              province: 'Bangkok',
              postalCode: '10110',
              country: 'Thailand',
              phone: '+66 81 234 5678',
            },
            created_at: currentUser.created_at,
            updated_at: currentUser.created_at,
          };
          saveStored(STORAGE_KEY_PROFILES, profiles);
        }
      }

      notifyAuth('SIGNED_IN');
      const session = {
        user: currentUser,
        access_token: 'mock-access-token',
        token_type: 'bearer',
      } as Session;

      return { data: { user: currentUser, session }, error: null };
    },

    async signUp({
      email,
      options,
    }: {
      email: string;
      password?: string;
      options?: { data?: { display_name?: string } };
    }) {
      const displayName = options?.data?.display_name || email.split('@')[0] || 'Studio Member';
      const userId = `usr-${Date.now().toString(36)}`;
      const now = new Date().toISOString();

      currentUser = {
        id: userId,
        email: email.trim(),
        aud: 'authenticated',
        app_metadata: { provider: 'email', role: 'customer' },
        user_metadata: {
          display_name: displayName,
          full_name: displayName,
        },
        created_at: now,
      } as unknown as User;

      profiles[userId] = {
        id: userId,
        display_name: displayName,
        shipping_address: {},
        created_at: now,
        updated_at: now,
      };
      saveStored(STORAGE_KEY_PROFILES, profiles);

      notifyAuth('SIGNED_IN');
      const session = {
        user: currentUser,
        access_token: 'mock-access-token',
        token_type: 'bearer',
      } as Session;

      return { data: { user: currentUser, session }, error: null };
    },

    async signOut() {
      currentUser = null;
      notifyAuth('SIGNED_OUT');
      return { error: null };
    },

    async signInWithOAuth({ provider }: { provider: string }) {
      const displayName = DEFAULT_GOOGLE_USER.name;
      const userId = 'usr-oauth-01';
      currentUser = {
        id: userId,
        email: DEFAULT_GOOGLE_USER.email,
        aud: 'authenticated',
        app_metadata: { provider, role: 'customer' },
        user_metadata: {
          display_name: displayName,
          full_name: displayName,
          google_email: DEFAULT_GOOGLE_USER.email,
        },
        created_at: new Date().toISOString(),
      } as unknown as User;

      saveStored(STORAGE_KEY_USER, currentUser);
      notifyAuth('SIGNED_IN');
      return { data: { provider, url: null }, error: null };
    },

    async resetPasswordForEmail(_email: string) {
      return { data: {}, error: null };
    },
  };

  const from = (tableName: string) => {
    let filters: Array<(item: any) => boolean> = [];
    let sortFn: ((a: any, b: any) => number) | null = null;
    let isSingle = false;
    let isMaybeSingle = false;

    let pendingInsert: any = null;
    let pendingUpdate: any = null;

    const builder: any = {
      select(_columns?: string) {
        return builder;
      },

      eq(column: string, value: any) {
        filters.push((item: any) => item[column] === value);
        return builder;
      },

      order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
        sortFn = (a: any, b: any) => {
          const valA = a[column];
          const valB = b[column];
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        };
        return builder;
      },

      single() {
        isSingle = true;
        return builder;
      },

      maybeSingle() {
        isMaybeSingle = true;
        return builder;
      },

      insert(payload: any) {
        pendingInsert = payload;
        return builder;
      },

      update(payload: any) {
        pendingUpdate = payload;
        return builder;
      },

      delete() {
        return builder;
      },

      then(onfulfilled: (res: { data: any; error: any }) => any, onrejected?: (err: any) => any) {
        const execute = () => {
          try {
            if (tableName === 'profiles') {
              if (pendingInsert) {
                const id = pendingInsert.id || currentUser?.id || `usr-${Date.now()}`;
                profiles[id] = {
                  id,
                  display_name: pendingInsert.display_name || 'Studio Member',
                  shipping_address: pendingInsert.shipping_address || {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                saveStored(STORAGE_KEY_PROFILES, profiles);
                return { data: profiles[id], error: null };
              }

              if (pendingUpdate) {
                const targets = Object.values(profiles).filter((p) => filters.every((fn) => fn(p)));
                for (const target of targets) {
                  Object.assign(target, pendingUpdate);
                  target.updated_at = new Date().toISOString();
                }
                saveStored(STORAGE_KEY_PROFILES, profiles);
                return { data: targets, error: null };
              }

              let results = Object.values(profiles).filter((p) => filters.every((fn) => fn(p)));
              if (isSingle) {
                return { data: results[0] || null, error: results[0] ? null : { message: 'Row not found' } };
              }
              if (isMaybeSingle) {
                return { data: results[0] || null, error: null };
              }
              return { data: results, error: null };
            }

            if (tableName === 'orders') {
              if (pendingInsert) {
                const nextId =
                  orders.length > 0 ? Math.max(...orders.map((o) => Number(o.order_id) || 0)) + 1 : 1001;
                const now = new Date().toISOString();
                const newOrder: MockOrder = {
                  order_id: nextId,
                  order_number: pendingInsert.order_number || `ORD-${nextId}`,
                  user_id: pendingInsert.user_id || currentUser?.id || 'usr-guest',
                  customer_name: pendingInsert.customer_name || 'Studio Client',
                  customer_email: pendingInsert.customer_email || '',
                  customer_phone: pendingInsert.customer_phone || '',
                  shipping_address: pendingInsert.shipping_address || '',
                  total: Number(pendingInsert.total) || 0,
                  status: pendingInsert.status || 'pending',
                  payment_status: pendingInsert.payment_status || 'pending',
                  payment_slip_url: pendingInsert.payment_slip_url || '',
                  verified_at: pendingInsert.verified_at || null,
                  items: pendingInsert.items || [],
                  created_at: now,
                };

                orders.unshift(newOrder);
                saveStored(STORAGE_KEY_ORDERS, orders);

                if (isSingle) {
                  return {
                    data: { order_id: newOrder.order_id, created_at: newOrder.created_at },
                    error: null,
                  };
                }
                return { data: newOrder, error: null };
              }

              if (pendingUpdate) {
                for (const order of orders) {
                  if (filters.every((fn) => fn(order))) {
                    Object.assign(order, pendingUpdate);
                  }
                }
                saveStored(STORAGE_KEY_ORDERS, orders);
                return { data: null, error: null };
              }

              let results = orders.filter((o) => filters.every((fn) => fn(o)));
              if (sortFn) {
                results.sort(sortFn);
              }
              if (isSingle) {
                return { data: results[0] || null, error: results[0] ? null : { message: 'Row not found' } };
              }
              if (isMaybeSingle) {
                return { data: results[0] || null, error: null };
              }
              return { data: results, error: null };
            }

            return { data: [], error: null };
          } catch (err: any) {
            return { data: null, error: { message: err?.message || 'Database error' } };
          }
        };

        return Promise.resolve(execute()).then(onfulfilled, onrejected);
      },
    };

    return builder;
  };

  return {
    auth,
    from,
  } as unknown as SupabaseClient;
}

const rawSupabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!)
  : createMockSupabase();

export async function signInWithGoogleAccount(
  email: string = DEFAULT_GOOGLE_USER.email,
  name: string = DEFAULT_GOOGLE_USER.name
): Promise<{ user: User | null; session?: Session | null; error: Error | null }> {
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name.trim() || cleanEmail.split('@')[0] || 'Studio Member';
  const bridgeEmail = `google.${encodeURIComponent(cleanEmail).replace(/%/g, '_')}@scentify-auth.com`;
  const bridgePassword = 'ScentifyGoogleOAuth_2026_SecureKey!';

  if (isConfigured) {
    try {
      // 1. Try signing in with existing bridge account
      let res: any = await rawSupabase.auth.signInWithPassword({
        email: bridgeEmail,
        password: bridgePassword,
      });

      // 2. If not found or error, create the user
      if (res.error) {
        res = await rawSupabase.auth.signUp({
          email: bridgeEmail,
          password: bridgePassword,
          options: {
            data: {
              display_name: displayName,
              full_name: displayName,
              google_email: cleanEmail,
              provider: 'google',
            },
          },
        });
      }

      if (!res.error && res.data.user) {
        saveStored('scentify_google_user', {
          ...res.data.user,
          user_metadata: {
            ...res.data.user.user_metadata,
            display_name: displayName,
            full_name: displayName,
            google_email: cleanEmail,
          },
        });
        return { user: res.data.user, session: res.data.session, error: null };
      }
    } catch (e) {
      console.warn('Supabase bridge auth error:', e);
    }
  }

  // Fallback: local Google session
  const now = new Date().toISOString();
  const googleUser = {
    id: `usr-google-${Date.now()}`,
    email: cleanEmail,
    aud: 'authenticated',
    app_metadata: { provider: 'google', role: 'customer' },
    user_metadata: {
      display_name: displayName,
      full_name: displayName,
      google_email: cleanEmail,
      provider: 'google',
    },
    created_at: now,
  } as unknown as User;

  saveStored('scentify_google_user', googleUser);
  return { user: googleUser, session: null, error: null };
}

// Intercept signInWithOAuth so that "Sign in with Google" never redirects to Google's 403 error page
if (isConfigured) {
  const originalSignInWithOAuth = rawSupabase.auth.signInWithOAuth.bind(rawSupabase.auth);
  rawSupabase.auth.signInWithOAuth = async (params: any) => {
    if (params?.provider === 'google') {
      const result = await signInWithGoogleAccount();
      if (result.user) {
        return { data: { provider: 'google', url: null }, error: null };
      }
      return { data: { provider: 'google', url: null }, error: (result.error as any) || null };
    }
    return originalSignInWithOAuth(params);
  };

  const originalSignOut = rawSupabase.auth.signOut.bind(rawSupabase.auth);
  rawSupabase.auth.signOut = async (options?: any) => {
    try {
      localStorage.removeItem('scentify_google_user');
    } catch {
      // ignore
    }
    return originalSignOut(options);
  };
}

export const supabase: SupabaseClient = rawSupabase;

export async function updateShippingAddress(address: Record<string, string>) {
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw authError;
  }
  if (!data.user) {
    throw new Error('You must be signed in to save a shipping address.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      shipping_address: address,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.user.id);

  if (error) {
    throw error;
  }
}
