import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {environment} from "../../environments/environment";

const SUPABASE_URL = environment.supabaseUrl;
const SUPABASE_ANON_KEY = environment.supabaseAnonKey;
const SUPABASE_SERVICE_KEY = environment.supabaseServiceKey;
// à utiliser côté serveur seulement

export function createBrowserClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

export function createServerClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
