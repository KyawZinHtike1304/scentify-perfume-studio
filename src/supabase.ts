import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

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
