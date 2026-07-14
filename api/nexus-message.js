/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Nexus message persistence (server-side, bypasses RLS)
   POST /api/nexus-message   { id, channel, content, reactions?, authorMeta? }
   (requires Authorization: Bearer <clerk-session-jwt>)

   js/nexus-realtime.js used to insert straight into nexus_messages
   from the browser using the anon key. That path is permanently
   broken: nexus_messages.user_id is a uuid FK into public.users(id)
   (Supabase's own internal row id), but the client only ever has the
   raw Clerk id (e.g. "user_2NNXf...", never a valid UUID) — and the
   insert RLS policy requires user_id to match auth.uid(), which can't
   resolve correctly against a Clerk JWT without Supabase's Clerk
   Third-Party Auth being configured. Every insert failed silently
   (a console.warn), so live broadcast delivery worked (a separate,
   unrelated channel) but nothing ever actually persisted — meaning a
   message sent while the recipient wasn't already looking at that
   exact conversation was gone for good.

   This endpoint sidesteps the whole problem the same way
   api/ai-tutor-chat.js and api/forum-comments.js already do: verify
   the Clerk JWT server-side, resolve the real internal user id via a
   service-role query (which bypasses RLS entirely, so the broken
   auth.uid() mapping never comes into play), then write with the
   service role. Guests (no token) simply don't persist — matching
   prior behaviour for them, no regression.
   ═══════════════════════════════════════════════════════════════ */
import { requireAuth, AuthError } from '../lib/clerk-auth.js';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';

async function _resolveUserId(clerkId) {
  const res = await supabaseServiceRequest(`users?clerk_id=eq.${encodeURIComponent(clerkId)}&select=id`, 'GET');
  if (!res) return null;
  const rows = await res.json();
  return rows?.[0]?.id || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const { id, channel, content, reactions, authorMeta } = req.body || {};
  if (!id || !channel || !content?.trim()) {
    return res.status(400).json({ error: 'id, channel and content are required' });
  }
  /* Nexus channels and DM threads ('dm:<sortedIds>') share this same
     table/endpoint — see js/nexus-realtime.js's broadcast(). */
  if (typeof channel !== 'string' || channel.length > 120) {
    return res.status(400).json({ error: 'Invalid channel' });
  }

  const userId = await _resolveUserId(auth.clerkId);

  try {
    await supabaseServiceRequest('nexus_messages', 'POST', {
      id,
      user_id:     userId,
      channel,
      content:     content.slice(0, 4000),
      reactions:   reactions || {},
      author_meta: authorMeta || {},
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Persist failed' });
  }
}
