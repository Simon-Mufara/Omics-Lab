import { supabase } from './supabaseClient.js';

/* One upsert used by both onboarding and edit-profile. Keyed on
   clerk_id so it works whether or not a `users` row already exists
   for this person (e.g. someone signing up straight into the Hub,
   who never touched the main site's own sync-on-sign-in flow). */
export async function saveProfile(clerkUser, fields) {
  const githubAccount = clerkUser.externalAccounts?.find((a) => a.provider === 'oauth_github');

  const payload = {
    clerk_id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'OmicsLab User',
    avatar_url: clerkUser.imageUrl || '',
    /* Only ever set, never clear — same reasoning as auth-clerk.js's
       upsert on the main site: no linked GitHub account this session
       shouldn't wipe out a previously-linked one. */
    ...(githubAccount?.username ? { github_username: githubAccount.username } : {}),
    ...fields,
  };
  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'clerk_id' })
    .select('id,clerk_id,name,avatar_url,institution,country,role,plan,username,display_name,github_username,bio,is_public,created_at,updated_at')
    .single();
  return { data, error };
}
