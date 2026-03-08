import { createClient } from '@supabase/supabase-js';

// Create a .env.local file in the project root with:
//   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
