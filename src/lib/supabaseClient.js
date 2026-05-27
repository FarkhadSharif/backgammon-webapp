import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigError = getConfigError(supabaseUrl, supabaseAnonKey);

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

function getConfigError(url, key) {
  if (!url || !key) {
    return 'Missing Supabase environment variables.';
  }

  if (!url.startsWith('https://')) {
    return 'Supabase URL must look like https://your-project-ref.supabase.co.';
  }

  if (key.startsWith('sb_secret_')) {
    return 'Use a public anon/publishable key in the browser, not an sb_secret key.';
  }

  return null;
}
