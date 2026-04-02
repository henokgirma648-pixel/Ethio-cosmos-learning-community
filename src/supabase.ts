import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const missingVars: string[] = [];
if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
  missingVars.push('VITE_SUPABASE_URL');
}
if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon')) {
  missingVars.push('VITE_SUPABASE_ANON_KEY');
}

if (missingVars.length > 0) {
  // Log clearly in development; in production this will surface as a visible error
  console.error(
    `[Supabase] Missing environment variable(s): ${missingVars.join(', ')}.\n` +
      'Create a .env file at the project root with:\n' +
      '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
      '  VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
      'Then restart the dev server.'
  );
}

// We still create a client so the module can be imported without crashing at
// build time. Every Supabase call will fail gracefully when env vars are wrong.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);

/** True only when real env vars are present */
export const isSupabaseConfigured =
  missingVars.length === 0 &&
  !!supabaseUrl &&
  !!supabaseAnonKey;

export default supabase;
