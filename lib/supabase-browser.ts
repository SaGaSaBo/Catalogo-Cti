import { createClient } from "@supabase/supabase-js";
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (_supabase) return _supabase;
  _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "cti-admin-auth-v1" } }
  );
  return _supabase;
}