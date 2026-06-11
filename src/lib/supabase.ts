import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const isSupabaseClientConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseClientConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;
