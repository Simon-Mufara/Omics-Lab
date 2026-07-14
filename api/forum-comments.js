/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Community discussion comments (1-level threaded)
   GET  /api/forum-comments?topic_id=<id>          (public, no auth)
   POST /api/forum-comments  { topic_id, body, parent_comment_id? }  (requires auth)

   Also handles Nexus channel/DM message persistence — see
   _handleNexusMessage below. Not a natural fit for this file, but the
   Vercel Hobby plan caps a deployment at 12 Serverless Functions and
   this project was already sitting at exactly that limit; adding a
   13th (api/nexus-message.js) failed the deploy outright with no
   application-level error to show for it (build succeeded, "Deploying
   outputs..." then silently errored). Dispatched by shape: a POST
   body with `channel` is a Nexus message, one with `topic_id` is a
   forum comment — see js/nexus-realtime.js's broadcast(), which posts
   here with { type: 'nexus-message', ... }.
   ═══════════════════════════════════════════════════════════════ */
import { requireAuth, AuthError } from '../lib/clerk-auth.js';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';

async function _resolveUserId(clerkId) {
  const res = await supabaseServiceRequest(`users?clerk_id=eq.${encodeURIComponent(clerkId)}&select=id`, 'GET');
  if (!res) return null;
  const rows = await res.json();
  return rows?.[0]?.id || null;
}

/* See api/nexus-message.js's original doc comment for why this needs
   to verify the Clerk session and resolve the internal user id
   server-side rather than let the client insert directly: the client
   only ever has the raw Clerk id, nexus_messages.user_id is a uuid FK
   into public.users(id), and the RLS policy that would otherwise
   enforce this can't resolve a Clerk JWT to auth.uid() correctly. */
async function _handleNexusMessage(req, res) {
  let auth;
  try {
    auth = await requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const { id, channel, content, reactions, authorMeta } = req.body || {};
  if (!id || !channel || !content?.trim() || typeof channel !== 'string' || channel.length > 120) {
    return res.status(400).json({ error: 'id, channel and content are required' });
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

export default async function handler(req, res) {
  if (req.method === 'POST' && req.body?.type === 'nexus-message') {
    return _handleNexusMessage(req, res);
  }

  if (req.method === 'GET') {
    const topicId = req.query.topic_id;
    if (!topicId) return res.status(400).json({ error: 'topic_id is required' });

    const listRes = await supabaseServiceRequest(
      `forum_comments?topic_id=eq.${encodeURIComponent(topicId)}&select=id,topic_id,parent_comment_id,body,reacted_by,created_at,user_id,users(name,avatar_url,institution)&order=created_at.asc&limit=500`,
      'GET'
    ).catch(() => null);

    if (!listRes) return res.status(200).json({ comments: [] });
    const comments = await listRes.json();
    return res.status(200).json({ comments });
  }

  if (req.method === 'POST') {
    let auth;
    try {
      auth = await requireAuth(req);
    } catch (err) {
      if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
      throw err;
    }

    const { topic_id, body, parent_comment_id } = req.body || {};
    if (!topic_id || !body?.trim()) return res.status(400).json({ error: 'topic_id and body are required' });

    const userId = await _resolveUserId(auth.clerkId);
    if (!userId) return res.status(503).json({ error: 'Account not provisioned yet — try again in a moment' });

    const insertRes = await supabaseServiceRequest(
      'forum_comments', 'POST',
      { topic_id, user_id: userId, parent_comment_id: parent_comment_id || null, body: body.trim().slice(0, 3000) },
      { prefer: 'return=representation' }
    );
    const rows = await insertRes.json();

    /* Bump the topic's comment_count (best-effort — not transactional, fine for a counter) */
    const curRes = await supabaseServiceRequest(`forum_topics?id=eq.${encodeURIComponent(topic_id)}&select=comment_count`, 'GET').catch(() => null);
    if (curRes) {
      const cur = (await curRes.json())?.[0]?.comment_count || 0;
      await supabaseServiceRequest(`forum_topics?id=eq.${encodeURIComponent(topic_id)}`, 'PATCH', { comment_count: cur + 1 }).catch(() => {});
    }

    return res.status(201).json({ comment: rows?.[0] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
