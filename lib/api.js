import { createClient } from '@supabase/supabase-js';

// Set up Supabase client using environment variables
const supabaseUrl = process.env.SUPERBASE_ENDPOINT;
const supabaseKey = process.env.SUPERBASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);