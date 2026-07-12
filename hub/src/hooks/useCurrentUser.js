import { useCallback, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { supabase, syncSupabaseSession } from '../lib/supabaseClient.js';

/* `email` has SELECT revoked for anon/authenticated in Postgres (see
   db/schema.sql) — select('*') would fail with a permission error for
   everyone, including reading your own row. Always list columns. */
const PROFILE_COLUMNS =
  'id,clerk_id,name,avatar_url,institution,country,role,plan,username,display_name,github_username,bio,is_public,created_at,updated_at';

/* Single source of truth for "who's signed in and what's their
   OmicsLab profile" across the Hub. A profile with username === null
   means onboarding hasn't been completed yet. */
export function useCurrentUser() {
  const { isLoaded: clerkLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn || !clerkUser) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const synced = await syncSupabaseSession(getToken);
      if (!synced) throw new Error('Could not establish a Supabase session — is the "supabase" JWT template configured in Clerk?');

      const { data, error: selErr } = await supabase
        .from('users')
        .select(PROFILE_COLUMNS)
        .eq('clerk_id', clerkUser.id)
        .maybeSingle();
      if (selErr) throw selErr;
      setProfile(data || null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, clerkUser, getToken]);

  useEffect(() => {
    if (!clerkLoaded) return;
    fetchProfile();
  }, [clerkLoaded, fetchProfile]);

  return {
    clerkUser,
    profile,
    loading: !clerkLoaded || loading,
    error,
    isSignedIn: !!isSignedIn,
    needsOnboarding: isSignedIn && !loading && (!profile || !profile.username),
    refetch: fetchProfile,
  };
}
