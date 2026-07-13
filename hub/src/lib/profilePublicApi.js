import { supabase } from './supabaseClient.js';

const PUBLIC_PROFILE_COLUMNS =
  'id,username,display_name,name,avatar_url,role,institution,country,bio,github_username,is_public,created_at';

/* RLS (`users_public_read`) already scopes this to public profiles OR
   the row's own owner — a private profile viewed by anyone else comes
   back as zero rows, not an error, same shape as "doesn't exist". See
   profileExists() below for telling those two cases apart. */
export async function getPublicProfile(username) {
  const { data, error } = await supabase.from('users').select(PUBLIC_PROFILE_COLUMNS).eq('username', username).maybeSingle();
  return { data, error };
}

/* is_username_available() is SECURITY DEFINER (bypasses RLS) and
   already answers "does any row have this username", regardless of
   is_public — reusing it here avoids a second bypass-RLS function
   whose only job would be the same existence check. */
export async function profileExists(username) {
  const { data, error } = await supabase.rpc('is_username_available', { check_username: username });
  if (error) return { exists: null, error };
  return { exists: data === false, error: null };
}

export async function getPublicProfileStats(username) {
  const { data, error } = await supabase.rpc('public_profile_stats', { p_username: username });
  return { data: data?.[0] || null, error };
}

export async function getPublicProfileActivity(username, limit = 20) {
  const { data, error } = await supabase.rpc('public_profile_activity', { p_username: username, p_limit: limit });
  return { data: data || [], error };
}

/* Achievements tab — badge rows for the profile's own trophy case.
   `progress_public_read` RLS (added alongside these functions) scopes
   this the same way the stats/activity RPCs do: public profile, or
   the caller viewing their own. */
export async function getPublicBadges(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('key,value,earned_at')
    .eq('user_id', userId)
    .eq('type', 'badge')
    .order('earned_at', { ascending: false });
  return { data: data || [], error };
}

/* Datasets tab — plain table query, not a function: RLS already does
   the right thing (public datasets to anyone, +private ones too when
   the viewer IS the owner), no aggregation needed. */
export async function getUserDatasets(userId) {
  const { data, error } = await supabase
    .from('datasets_with_trending')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}
