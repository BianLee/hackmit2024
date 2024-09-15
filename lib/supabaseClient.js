import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPERBASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPERBASE_KEY;

console.log('Initializing Supabase client...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Anon Key is missing. Check your environment variables.');
}
// Set up Supabase client using environment variables
export const supabase = createClient(supabaseUrl, supabaseKey);

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseKey);
}