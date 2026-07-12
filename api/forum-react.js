/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Toggle a reaction ("Upvote") on a topic or comment
   POST /api/forum-react   { targetType: 'topic'|'comment', targetId }
   Requires auth. Toggles the caller's clerk_id in the target's
   reacted_by array and returns the new count + whether they reacted.
   ═══════════════════════════════════════════════════════════════ */
import { requireAuth, AuthError } from '../lib/clerk-auth.js';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const { targetType, targetId } = req.body || {};
  if (!['topic', 'comment'].includes(targetType) || !targetId) {
    return res.status(400).json({ error: 'targetType (topic|comment) and targetId are required' });
  }
  const table = targetType === 'topic' ? 'forum_topics' : 'forum_comments';

  const curRes = await supabaseServiceRequest(`${table}?id=eq.${encodeURIComponent(targetId)}&select=reacted_by`, 'GET').catch(() => null);
  if (!curRes) return res.status(503).json({ error: 'Backend not configured' });
  const row = (await curRes.json())?.[0];
  if (!row) return res.status(404).json({ error: 'Not found' });

  const reacted = Array.isArray(row.reacted_by) ? row.reacted_by : [];
  const already = reacted.includes(auth.clerkId);
  const next = already ? reacted.filter(id => id !== auth.clerkId) : [...reacted, auth.clerkId];

  await supabaseServiceRequest(`${table}?id=eq.${encodeURIComponent(targetId)}`, 'PATCH', { reacted_by: next });

  return res.status(200).json({ count: next.length, reacted: !already });
}
