/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Resolve a Clerk id to the Supabase-internal users.id,
   auto-provisioning the row if it doesn't exist yet.

   The ONLY place a public.users row used to get created was a
   client-side upsert in js/auth-clerk.js's _syncUser(), gated behind
   a Supabase-templated Clerk JWT (OmicsLab.AuthClerk.getSupabaseToken()).
   That JWT template was never actually configured in Clerk (confirmed
   via a 404 on Clerk's own tokens/supabase endpoint), so getSupabaseToken()
   always returned null, the upsert never ran, and NO signed-in user —
   not just some — ever got a row in public.users. Every server route
   that resolves clerk_id -> users.id (checkout, forum posts, /api/me)
   was destined to fail with a "no account found"-shaped error the
   first time anyone actually tried it, which is exactly what surfaced
   once the separate token-shape and secret-key-mode bugs were fixed
   and requests started reaching this code at all.

   Provisioning here instead — server-side, on first authenticated API
   call, using the service role — doesn't depend on that broken JWT
   template or on RLS being able to resolve a Clerk session at all.
   ═══════════════════════════════════════════════════════════════ */
import { createClerkClient } from '@clerk/backend';
import { supabaseServiceRequest } from './supabase-admin.js';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
let _clerk = null;
function _clerkClient() {
  if (!_clerk && CLERK_SECRET_KEY) _clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
  return _clerk;
}

/* Returns { id, email } (Supabase-internal uuid + email) for this
   Clerk user, creating the row first if needed. Returns null if
   Supabase/Clerk aren't configured or the Clerk user can't be fetched
   (never throws — every existing caller already treats a null result
   as "no account"). Callers that only need the id can destructure
   just that; create-paystack-checkout.js needs email too, for Paystack's
   transaction/initialize. */
export async function resolveOrProvisionUser(clerkId) {
  const existing = await supabaseServiceRequest(
    `users?clerk_id=eq.${encodeURIComponent(clerkId)}&select=id,email`, 'GET'
  ).catch(() => null);
  if (existing) {
    const rows = await existing.json().catch(() => []);
    if (rows?.[0]?.id) return rows[0];
  }

  const clerk = _clerkClient();
  if (!clerk) return null;

  let clerkUser;
  try {
    clerkUser = await clerk.users.getUser(clerkId);
  } catch {
    return null;
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress
    || clerkUser.emailAddresses?.[0]?.emailAddress
    || null;
  if (!email) return null; /* users.email is NOT NULL — can't provision without one */

  const profile = {
    clerk_id:   clerkId,
    email,
    name:       [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'OmicsLab User',
    avatar_url: clerkUser.imageUrl || null,
  };

  const upsertRes = await supabaseServiceRequest(
    'users?on_conflict=clerk_id', 'POST', profile,
    { prefer: 'return=representation,resolution=merge-duplicates' }
  ).catch(() => null);
  if (!upsertRes) return null;

  const rows = await upsertRes.json().catch(() => []);
  return rows?.[0] || null;
}
