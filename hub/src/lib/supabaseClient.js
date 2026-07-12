import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Supabase's session is externally managed by Clerk, same pattern as
   js/db.js's setSession() on the main site — Clerk owns refresh, we
   just hand Supabase the current JWT (from the "supabase" JWT
   template configured in the Clerk dashboard) before each query batch. */
export async function syncSupabaseSession(getToken) {
  const jwt = await getToken({ template: 'supabase' });
  if (!jwt) return false;
  await supabase.auth.setSession({ access_token: jwt, refresh_token: 'clerk-managed' });
  return true;
}
